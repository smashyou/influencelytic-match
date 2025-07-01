// backend/routes/influencers.js - Influencer Management Routes
const express = require('express');
const { supabase } = require('../config/supabase');
const { requireRole } = require('../middleware/auth');
const router = express.Router();

// Get influencer profile
router.get('/profile', requireRole(['influencer']), async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        social_connections (*),
        influencer_analytics (*)
      `)
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.json(profile);
  } catch (error) {
    console.error('Get influencer profile error:', error);
    res.status(500).json({ error: 'Failed to update brand profile' });
  }
});

// Get brand dashboard analytics
router.get('/dashboard', requireRole(['brand']), async (req, res) => {
  try {
    // Get brand's campaigns
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, title, status, budget_min, budget_max, created_at')
      .eq('brand_id', req.user.id);

    // Get campaign applications
    const campaignIds = campaigns.map(c => c.id);
    const { data: applications } = await supabase
      .from('campaign_applications')
      .select('*')
      .in('campaign_id', campaignIds);

    // Get transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, status, created_at')
      .eq('brand_id', req.user.id);

    // Calculate metrics
    const totalSpent = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalApplications = applications.length;
    const acceptedApplications = applications.filter(a => a.status === 'accepted').length;

    res.json({
      campaigns: {
        total: campaigns.length,
        active: activeCampaigns,
        completed: campaigns.filter(c => c.status === 'completed').length
      },
      applications: {
        total: totalApplications,
        pending: applications.filter(a => a.status === 'pending').length,
        accepted: acceptedApplications,
        rejected: applications.filter(a => a.status === 'rejected').length
      },
      spending: {
        total: totalSpent,
        this_month: transactions
          .filter(t => {
            const transactionDate = new Date(t.created_at);
            const now = new Date();
            return transactionDate.getMonth() === now.getMonth() && 
                   transactionDate.getFullYear() === now.getFullYear();
          })
          .reduce((sum, t) => sum + (t.amount || 0), 0)
      }
    });
  } catch (error) {
    console.error('Get brand dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Search influencers
router.get('/search/influencers', requireRole(['brand']), async (req, res) => {
  try {
    const {
      platform,
      min_followers,
      max_followers,
      min_engagement,
      interests,
      location,
      verified_only,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from('influencer_analytics')
      .select(`
        *,
        profiles:user_id (first_name, last_name, avatar_url),
        social_connections:user_id (platform, follower_count, username, is_verified)
      `)
      .range(offset, offset + limit - 1);

    if (platform) {
      query = query.eq('platform', platform);
    }

    if (min_engagement) {
      query = query.gte('engagement_rate', parseFloat(min_engagement));
    }

    const { data: influencers, error } = await query;

    if (error) throw error;

    // Filter based on social connections
    let filteredInfluencers = influencers.filter(influencer => {
      const connections = influencer.social_connections || [];
      
      // Apply follower filters
      if (min_followers || max_followers) {
        const totalFollowers = connections.reduce((sum, conn) => sum + (conn.follower_count || 0), 0);
        if (min_followers && totalFollowers < parseInt(min_followers)) return false;
        if (max_followers && totalFollowers > parseInt(max_followers)) return false;
      }

      // Apply verified filter
      if (verified_only === 'true') {
        const hasVerified = connections.some(conn => conn.is_verified);
        if (!hasVerified) return false;
      }

      return true;
    });

    // Calculate match scores and format response
    const influencersWithScores = filteredInfluencers.map(influencer => {
      const connections = influencer.social_connections || [];
      const totalFollowers = connections.reduce((sum, conn) => sum + (conn.follower_count || 0), 0);
      
      return {
        user_id: influencer.user_id,
        name: `${influencer.profiles.first_name} ${influencer.profiles.last_name}`,
        avatar_url: influencer.profiles.avatar_url,
        platforms: connections.map(conn => ({
          platform: conn.platform,
          username: conn.username,
          followers: conn.follower_count,
          verified: conn.is_verified
        })),
        engagement_rate: influencer.engagement_rate,
        total_followers: totalFollowers,
        interests: influencer.interests || [],
        fake_follower_percentage: influencer.fake_follower_percentage,
        sentiment_score: influencer.sentiment_score,
        match_score: Math.random() * 100 // Placeholder for actual matching algorithm
      };
    });

    // Sort by match score
    influencersWithScores.sort((a, b) => b.match_score - a.match_score);

    res.json({
      influencers: influencersWithScores,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredInfluencers.length,
        hasMore: filteredInfluencers.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Search influencers error:', error);
    res.status(500).json({ error: 'Failed to search influencers' });
  }
});

// Get influencer details for brand
router.get('/influencer/:id', requireRole(['brand']), async (req, res) => {
  try {
    const { id } = req.params;

    const { data: influencer, error } = await supabase
      .from('profiles')
      .select(`
        *,
        social_connections (*),
        influencer_analytics (*),
        campaign_applications (
          id,
          status,
          campaigns (title, brand_id)
        )
      `)
      .eq('id', id)
      .eq('user_type', 'influencer')
      .single();

    if (error) throw error;

    // Filter applications to only show this brand's campaigns
    const brandApplications = influencer.campaign_applications.filter(
      app => app.campaigns.brand_id === req.user.id
    );

    res.json({
      ...influencer,
      brand_applications: brandApplications,
      campaign_applications: undefined // Remove full applications for privacy
    });
  } catch (error) {
    console.error('Get influencer details error:', error);
    res.status(500).json({ error: 'Failed to fetch influencer details' });
  }
});

// Invite influencer to campaign
router.post('/invite/:influencerId/campaign/:campaignId', requireRole(['brand']), async (req, res) => {
  try {
    const { influencerId, campaignId } = req.params;
    const { message, proposed_rate } = req.body;

    // Verify campaign belongs to brand
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, brand_id')
      .eq('id', campaignId)
      .eq('brand_id', req.user.id)
      .single();

    if (campaignError || !campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Create invitation (as a special type of application)
    const { data: invitation, error } = await supabase
      .from('campaign_applications')
      .insert({
        campaign_id: campaignId,
        influencer_id: influencerId,
        status: 'invited',
        proposed_rate,
        application_message: message,
        applied_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Create notification for influencer
    await supabase
      .from('notifications')
      .insert({
        user_id: influencerId,
        type: 'campaign_invitation',
        title: 'Campaign Invitation',
        message: `You've been invited to participate in a campaign`,
        data: { campaign_id: campaignId, invitation_id: invitation.id }
      });

    res.json(invitation);
  } catch (error) {
    console.error('Invite influencer error:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

module.exports = router;