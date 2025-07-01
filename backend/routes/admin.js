// backend/routes/admin.js - FIXED Admin Panel Routes
const express = require('express');
const { supabase } = require('../config/supabase');
const { requireRole } = require('../middleware/auth');
const router = express.Router();

// Admin authentication middleware
const requireAdmin = (req, res, next) => {
  if (req.profile.user_type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get platform overview metrics
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    // Get user counts
    const { data: userStats } = await supabase
      .from('profiles')
      .select('user_type');

    const userCounts = userStats.reduce((acc, user) => {
      acc[user.user_type] = (acc[user.user_type] || 0) + 1;
      return acc;
    }, {});

    // Get campaign stats
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('status, created_at');

    const campaignStats = campaigns.reduce((acc, campaign) => {
      acc[campaign.status] = (acc[campaign.status] || 0) + 1;
      return acc;
    }, {});

    // Get transaction stats
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, platform_fee, status, created_at');

    const totalRevenue = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.platform_fee || 0), 0);

    const totalVolume = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    // Monthly revenue trend
    const monthlyRevenue = transactions
      .filter(t => t.status === 'completed')
      .reduce((acc, transaction) => {
        const month = new Date(transaction.created_at).toISOString().substring(0, 7);
        if (!acc[month]) {
          acc[month] = { revenue: 0, volume: 0, count: 0 };
        }
        acc[month].revenue += transaction.platform_fee || 0;
        acc[month].volume += transaction.amount || 0;
        acc[month].count += 1;
        return acc;
      }, {});

    res.json({
      users: {
        total: userStats.length,
        breakdown: userCounts
      },
      campaigns: {
        total: campaigns.length,
        breakdown: campaignStats
      },
      revenue: {
        total: totalRevenue,
        volume: totalVolume,
        monthly: monthlyRevenue
      },
      transactions: {
        total: transactions.length,
        completed: transactions.filter(t => t.status === 'completed').length
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get all users with pagination and filters
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { 
      user_type, 
      status, 
      search, 
      page = 1, 
      limit = 50 
    } = req.query;
    
    const offset = (page - 1) * limit;

    let query = supabase
      .from('profiles')
      .select(`
        *,
        social_connections (count),
        campaigns (count),
        transactions (count)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (user_type) {
      query = query.eq('user_type', user_type);
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error } = await query;

    if (error) throw error;

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: users.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get detailed user information
router.get('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('profiles')
      .select(`
        *,
        social_connections (*),
        influencer_analytics (*),
        brand_profiles (*),
        campaigns (*),
        campaign_applications (*),
        transactions (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json(user);
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Update user status
router.patch('/users/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const { data: user, error } = await supabase
      .from('profiles')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Create notification for user
    if (status === 'suspended' || status === 'banned') {
      await supabase
        .from('notifications')
        .insert({
          user_id: id,
          type: 'account_status',
          title: `Account ${status}`,
          message: reason || `Your account has been ${status}`,
          data: { status, reason }
        });
    }

    res.json(user);
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Get all transactions with filters
router.get('/transactions', requireAdmin, async (req, res) => {
  try {
    const { 
      status, 
      start_date, 
      end_date, 
      min_amount, 
      max_amount,
      page = 1, 
      limit = 50 
    } = req.query;
    
    const offset = (page - 1) * limit;

    let query = supabase
      .from('transactions')
      .select(`
        *,
        campaigns (title),
        brand_profiles:brand_id (company_name),
        influencer_profiles:influencer_id (first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (start_date) {
      query = query.gte('created_at', start_date);
    }

    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    if (min_amount) {
      query = query.gte('amount', parseInt(min_amount) * 100);
    }

    if (max_amount) {
      query = query.lte('amount', parseInt(max_amount) * 100);
    }

    const { data: transactions, error } = await query;

    if (error) throw error;

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: transactions.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Export data for reporting
router.get('/export/:type', requireAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const { start_date, end_date, format = 'json' } = req.query;

    let data;
    let filename;

    switch (type) {
      case 'users':
        const { data: users } = await supabase
          .from('profiles')
          .select('*')
          .gte('created_at', start_date || '2020-01-01')
          .lte('created_at', end_date || new Date().toISOString());
        data = users;
        filename = 'users_export';
        break;

      case 'transactions':
        const { data: transactions } = await supabase
          .from('transactions')
          .select(`
            *,
            campaigns (title),
            brand_profiles:brand_id (company_name),
            influencer_profiles:influencer_id (first_name, last_name)
          `)
          .gte('created_at', start_date || '2020-01-01')
          .lte('created_at', end_date || new Date().toISOString());
        data = transactions;
        filename = 'transactions_export';
        break;

      case 'campaigns':
        const { data: campaigns } = await supabase
          .from('campaigns')
          .select(`
            *,
            profiles:brand_id (first_name, last_name),
            brand_profiles:brand_id (company_name)
          `)
          .gte('created_at', start_date || '2020-01-01')
          .lte('created_at', end_date || new Date().toISOString());
        data = campaigns;
        filename = 'campaigns_export';
        break;

      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
      res.json({ message: 'CSV export not implemented yet', data });
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.json`);
      res.json(data);
    }
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

module.exports = router;