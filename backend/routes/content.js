// backend/routes/content.js - Content Performance & Analysis Routes
const express = require("express");
const { supabase } = require("../config/supabase");
const { requireAuth } = require("../middleware/auth");
const router = express.Router();

/**
 * GET /api/content/best-posts
 * Get best performing posts with AI analysis
 */
router.get("/best-posts", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { platform, limit = 10, timeframe = '30' } = req.query;

    // Calculate date threshold
    const daysAgo = parseInt(timeframe);
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysAgo);

    // Build query
    let query = supabase
      .from("content_performance")
      .select("*")
      .eq("user_id", userId)
      .gte("posted_at", dateThreshold.toISOString())
      .order("engagement_rate", { ascending: false });

    // Filter by platform if specified
    if (platform && platform !== 'all') {
      query = query.eq("platform", platform);
    }

    const { data: posts, error } = await query.limit(parseInt(limit));

    if (error) throw error;

    // If no real data, return mock data for development
    if (!posts || posts.length === 0) {
      return res.json({
        posts: generateMockBestPosts(platform),
        insights: generateMockInsights(),
        isMockData: true,
        message: "Using mock data - connect social platforms to see real performance"
      });
    }

    // Analyze posts and generate insights
    const insights = analyzePostPerformance(posts);

    res.json({
      posts: posts.map(post => ({
        ...post,
        performance_score: calculatePerformanceScore(post),
        insights: generatePostInsights(post)
      })),
      insights,
      isMockData: false
    });
  } catch (error) {
    console.error("Get best posts error:", error);
    res.status(500).json({ error: "Failed to fetch best posts" });
  }
});

/**
 * GET /api/content/performance
 * Get all post performance data with pagination
 */
router.get("/performance", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      platform,
      content_type,
      page = 1,
      limit = 20,
      sort_by = 'posted_at',
      order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = supabase
      .from("content_performance")
      .select("*", { count: 'exact' })
      .eq("user_id", userId);

    if (platform && platform !== 'all') {
      query = query.eq("platform", platform);
    }

    if (content_type) {
      query = query.eq("content_type", content_type);
    }

    query = query.order(sort_by, { ascending: order === 'asc' })
      .range(offset, offset + parseInt(limit) - 1);

    const { data: posts, error, count } = await query;

    if (error) throw error;

    // If no real data, return mock data
    if (!posts || posts.length === 0) {
      const mockPosts = generateMockContentPerformance(platform);
      return res.json({
        posts: mockPosts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mockPosts.length,
          pages: 1
        },
        isMockData: true
      });
    }

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      },
      isMockData: false
    });
  } catch (error) {
    console.error("Get content performance error:", error);
    res.status(500).json({ error: "Failed to fetch content performance" });
  }
});

/**
 * POST /api/content/performance
 * Log new post performance metrics
 */
router.post("/performance", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      platform,
      content_id,
      content_type,
      posted_at,
      likes,
      comments,
      shares,
      saves,
      views,
      hashtags,
      mentions,
      is_sponsored,
      campaign_id
    } = req.body;

    // Calculate engagement rate
    const engagement_rate = calculateEngagementRate({
      likes,
      comments,
      shares,
      saves,
      views
    });

    const { data, error } = await supabase
      .from("content_performance")
      .insert({
        user_id: userId,
        platform,
        content_id,
        content_type,
        posted_at,
        likes: likes || 0,
        comments: comments || 0,
        shares: shares || 0,
        saves: saves || 0,
        views: views || 0,
        engagement_rate,
        hashtags: hashtags || [],
        mentions: mentions || [],
        is_sponsored: is_sponsored || false,
        campaign_id: campaign_id || null
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      post: data,
      message: "Post performance logged successfully"
    });
  } catch (error) {
    console.error("Log content performance error:", error);
    res.status(500).json({ error: "Failed to log post performance" });
  }
});

/**
 * GET /api/content/post/:postId/performance
 * Get detailed performance for a specific post
 */
router.get("/post/:postId/performance", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const { data: post, error } = await supabase
      .from("content_performance")
      .select("*")
      .eq("id", postId)
      .eq("user_id", userId)
      .single();

    if (error) throw error;

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Get average metrics for comparison
    const { data: allPosts } = await supabase
      .from("content_performance")
      .select("engagement_rate, likes, comments, shares, views")
      .eq("user_id", userId)
      .eq("platform", post.platform);

    const averages = calculateAverages(allPosts || []);
    const performance_score = calculatePerformanceScore(post);
    const insights = generateDetailedPostInsights(post, averages);

    res.json({
      post: {
        ...post,
        performance_score
      },
      averages,
      insights,
      comparison: {
        vs_average_engagement: post.engagement_rate - averages.engagement_rate,
        vs_average_likes: post.likes - averages.likes,
        vs_average_comments: post.comments - averages.comments
      }
    });
  } catch (error) {
    console.error("Get post performance error:", error);
    res.status(500).json({ error: "Failed to fetch post performance" });
  }
});

/**
 * GET /api/content/recommendations
 * Get AI-powered content recommendations based on past performance
 */
router.get("/recommendations", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { platform } = req.query;

    // Get best performing posts to analyze patterns
    const { data: bestPosts } = await supabase
      .from("content_performance")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", platform || 'instagram')
      .order("engagement_rate", { ascending: false })
      .limit(20);

    // If no real data, return mock recommendations
    if (!bestPosts || bestPosts.length === 0) {
      return res.json({
        recommendations: generateMockRecommendations(platform),
        isMockData: true
      });
    }

    // Analyze patterns
    const recommendations = generateContentRecommendations(bestPosts);

    res.json({
      recommendations,
      isMockData: false
    });
  } catch (error) {
    console.error("Get content recommendations error:", error);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

/**
 * GET /api/content/growth-tips
 * Get personalized growth tips based on analytics
 */
router.get("/growth-tips", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's analytics data
    const { data: analytics } = await supabase
      .from("influencer_analytics")
      .select("*")
      .eq("user_id", userId);

    // Get recent performance data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentPosts } = await supabase
      .from("content_performance")
      .select("*")
      .eq("user_id", userId)
      .gte("posted_at", thirtyDaysAgo.toISOString());

    // Get social connections for follower data
    const { data: connections } = await supabase
      .from("social_connections")
      .select("platform, follower_count")
      .eq("user_id", userId)
      .eq("is_active", true);

    // If no real data, return mock tips
    if (!analytics || analytics.length === 0) {
      return res.json({
        tips: generateMockGrowthTips(),
        isMockData: true
      });
    }

    // Generate personalized growth tips
    const tips = generateDynamicGrowthTips(analytics, recentPosts || [], connections || []);

    res.json({
      tips,
      isMockData: false
    });
  } catch (error) {
    console.error("Get growth tips error:", error);
    res.status(500).json({ error: "Failed to generate growth tips" });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate engagement rate from post metrics
 */
function calculateEngagementRate(metrics) {
  const { likes, comments, shares, saves, views } = metrics;

  if (!views || views === 0) {
    return 0;
  }

  const totalEngagement = (likes || 0) + (comments || 0) + (shares || 0) + (saves || 0);
  return parseFloat(((totalEngagement / views) * 100).toFixed(2));
}

/**
 * Calculate overall performance score (0-100)
 */
function calculatePerformanceScore(post) {
  const weights = {
    engagement_rate: 0.4,
    likes: 0.2,
    comments: 0.3,
    shares: 0.1
  };

  // Normalize values (you'd use platform averages in production)
  const normalized = {
    engagement_rate: Math.min(post.engagement_rate / 10, 1), // Cap at 10%
    likes: Math.min(post.likes / 1000, 1), // Cap at 1000
    comments: Math.min(post.comments / 100, 1), // Cap at 100
    shares: Math.min(post.shares / 50, 1) // Cap at 50
  };

  const score = Object.keys(weights).reduce((sum, key) => {
    return sum + (normalized[key] * weights[key] * 100);
  }, 0);

  return Math.round(score);
}

/**
 * Analyze post performance and generate insights
 */
function analyzePostPerformance(posts) {
  if (!posts || posts.length === 0) return {};

  const avgEngagement = posts.reduce((sum, p) => sum + p.engagement_rate, 0) / posts.length;

  // Find common hashtags in best posts
  const hashtagCounts = {};
  posts.forEach(post => {
    (post.hashtags || []).forEach(tag => {
      hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
    });
  });

  const topHashtags = Object.entries(hashtagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);

  // Analyze content types
  const contentTypes = posts.reduce((acc, post) => {
    acc[post.content_type] = (acc[post.content_type] || 0) + 1;
    return acc;
  }, {});

  const bestContentType = Object.entries(contentTypes)
    .sort(([, a], [, b]) => b - a)[0]?.[0];

  return {
    average_engagement: avgEngagement.toFixed(2),
    top_hashtags: topHashtags,
    best_content_type: bestContentType,
    total_analyzed: posts.length
  };
}

/**
 * Generate insights for a specific post
 */
function generatePostInsights(post) {
  const insights = [];

  if (post.engagement_rate > 5) {
    insights.push("🔥 Exceptional engagement rate!");
  } else if (post.engagement_rate > 3) {
    insights.push("✨ Above average engagement");
  }

  if (post.comments > post.likes * 0.1) {
    insights.push("💬 High comment ratio - great conversation");
  }

  if (post.shares > post.likes * 0.05) {
    insights.push("🔄 Highly shareable content");
  }

  if ((post.hashtags || []).length > 0) {
    insights.push(`#️⃣ ${post.hashtags.length} hashtags used`);
  }

  return insights;
}

/**
 * Generate detailed insights with comparisons
 */
function generateDetailedPostInsights(post, averages) {
  const insights = [];

  const engagementDiff = ((post.engagement_rate - averages.engagement_rate) / averages.engagement_rate * 100).toFixed(1);
  if (engagementDiff > 0) {
    insights.push({
      type: 'positive',
      message: `Engagement ${engagementDiff}% above your average`,
      icon: '📈'
    });
  } else {
    insights.push({
      type: 'warning',
      message: `Engagement ${Math.abs(engagementDiff)}% below your average`,
      icon: '📉'
    });
  }

  if (post.comments / post.likes > 0.1) {
    insights.push({
      type: 'positive',
      message: 'High comment-to-like ratio indicates strong audience connection',
      icon: '💬'
    });
  }

  if ((post.hashtags || []).length > 0) {
    insights.push({
      type: 'info',
      message: `Used ${post.hashtags.length} hashtags: ${post.hashtags.slice(0, 3).join(', ')}`,
      icon: '#️⃣'
    });
  }

  return insights;
}

/**
 * Calculate averages from posts array
 */
function calculateAverages(posts) {
  if (!posts || posts.length === 0) {
    return {
      engagement_rate: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0
    };
  }

  return {
    engagement_rate: posts.reduce((sum, p) => sum + p.engagement_rate, 0) / posts.length,
    likes: posts.reduce((sum, p) => sum + p.likes, 0) / posts.length,
    comments: posts.reduce((sum, p) => sum + p.comments, 0) / posts.length,
    shares: posts.reduce((sum, p) => sum + p.shares, 0) / posts.length,
    views: posts.reduce((sum, p) => sum + p.views, 0) / posts.length
  };
}

/**
 * Generate content recommendations based on best performing posts
 */
function generateContentRecommendations(bestPosts) {
  const recommendations = [];

  // Analyze content types
  const contentTypes = bestPosts.reduce((acc, post) => {
    acc[post.content_type] = (acc[post.content_type] || 0) + 1;
    return acc;
  }, {});

  const topContentType = Object.entries(contentTypes).sort(([, a], [, b]) => b - a)[0];
  if (topContentType) {
    recommendations.push({
      type: 'content_type',
      title: `Focus on ${topContentType[0]} content`,
      description: `Your ${topContentType[0]} posts perform ${(topContentType[1] / bestPosts.length * 100).toFixed(0)}% better than other formats`,
      priority: 'high'
    });
  }

  // Analyze hashtags
  const hashtagPerformance = {};
  bestPosts.forEach(post => {
    (post.hashtags || []).forEach(tag => {
      if (!hashtagPerformance[tag]) {
        hashtagPerformance[tag] = { count: 0, totalEngagement: 0 };
      }
      hashtagPerformance[tag].count++;
      hashtagPerformance[tag].totalEngagement += post.engagement_rate;
    });
  });

  const topHashtags = Object.entries(hashtagPerformance)
    .map(([tag, data]) => ({
      tag,
      avgEngagement: data.totalEngagement / data.count
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
    .slice(0, 5)
    .map(h => h.tag);

  if (topHashtags.length > 0) {
    recommendations.push({
      type: 'hashtags',
      title: 'Use these high-performing hashtags',
      description: topHashtags.join(', '),
      priority: 'medium'
    });
  }

  // Posting time analysis
  const postingHours = bestPosts.map(post => new Date(post.posted_at).getHours());
  const hourCounts = postingHours.reduce((acc, hour) => {
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  const bestHour = Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0];
  if (bestHour) {
    recommendations.push({
      type: 'timing',
      title: `Best posting time: ${bestHour[0]}:00`,
      description: `${(bestHour[1] / bestPosts.length * 100).toFixed(0)}% of your top posts were published around this time`,
      priority: 'medium'
    });
  }

  return recommendations;
}

/**
 * Generate dynamic growth tips based on real data
 */
function generateDynamicGrowthTips(analytics, recentPosts, connections) {
  const tips = [];

  // Analyze posting consistency
  if (recentPosts.length < 10) {
    tips.push({
      category: 'consistency',
      title: 'Increase posting frequency',
      description: `You've posted ${recentPosts.length} times in the last 30 days. Aim for 3-5 posts per week for better growth.`,
      impact: 'high',
      actionable: true
    });
  }

  // Analyze engagement rates
  analytics.forEach(analytic => {
    if (analytic.engagement_rate < 2.0) {
      tips.push({
        category: 'engagement',
        title: `Improve ${analytic.platform} engagement`,
        description: `Your ${analytic.platform} engagement rate (${analytic.engagement_rate}%) is below the industry average (3-4%). Try more interactive content like polls, questions, and calls-to-action.`,
        impact: 'high',
        actionable: true
      });
    }
  });

  // Analyze follower growth opportunities
  connections.forEach(connection => {
    if (connection.follower_count < 5000) {
      tips.push({
        category: 'growth',
        title: `Grow your ${connection.platform} following`,
        description: `With ${connection.follower_count} followers on ${connection.platform}, you're close to micro-influencer status (5K+). Collaborate with similar accounts and use trending hashtags.`,
        impact: 'medium',
        actionable: true
      });
    }
  });

  // Content diversity tip
  const contentTypes = recentPosts.reduce((acc, post) => {
    acc[post.content_type] = (acc[post.content_type] || 0) + 1;
    return acc;
  }, {});

  if (Object.keys(contentTypes).length < 3) {
    tips.push({
      category: 'content',
      title: 'Diversify your content types',
      description: 'Mix up your content with reels, carousels, and static posts to reach different audience segments.',
      impact: 'medium',
      actionable: true
    });
  }

  return tips;
}

// ============================================================================
// MOCK DATA GENERATORS (for development when no real data exists)
// ============================================================================

function generateMockBestPosts(platform = 'instagram') {
  return [
    {
      id: 'mock-1',
      platform: platform || 'instagram',
      content_type: 'reel',
      posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      likes: 1250,
      comments: 89,
      shares: 45,
      saves: 120,
      views: 15000,
      engagement_rate: 10.03,
      hashtags: ['fitness', 'workout', 'motivation', 'fitlife'],
      performance_score: 95,
      insights: ['🔥 Exceptional engagement rate!', '💬 High comment ratio - great conversation', '🔄 Highly shareable content']
    },
    {
      id: 'mock-2',
      platform: platform || 'instagram',
      content_type: 'carousel',
      posted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      likes: 980,
      comments: 67,
      shares: 23,
      saves: 156,
      views: 12000,
      engagement_rate: 10.22,
      hashtags: ['tutorial', 'howto', 'tips', 'education'],
      performance_score: 92,
      insights: ['🔥 Exceptional engagement rate!', '📚 Educational content performs well', '#️⃣ 4 hashtags used']
    },
    {
      id: 'mock-3',
      platform: platform || 'instagram',
      content_type: 'photo',
      posted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      likes: 756,
      comments: 45,
      shares: 12,
      saves: 89,
      views: 9500,
      engagement_rate: 9.49,
      hashtags: ['lifestyle', 'photooftheday', 'inspiration'],
      performance_score: 88,
      insights: ['✨ Above average engagement', '📸 High-quality visuals', '#️⃣ 3 hashtags used']
    }
  ];
}

function generateMockContentPerformance(platform) {
  const mockPosts = [];
  const contentTypes = ['reel', 'photo', 'carousel', 'story'];

  for (let i = 0; i < 15; i++) {
    const views = Math.floor(Math.random() * 20000) + 5000;
    const likes = Math.floor(views * (Math.random() * 0.1 + 0.02));
    const comments = Math.floor(likes * (Math.random() * 0.15 + 0.05));
    const shares = Math.floor(likes * (Math.random() * 0.05 + 0.01));
    const saves = Math.floor(likes * (Math.random() * 0.2 + 0.05));

    mockPosts.push({
      id: `mock-${i}`,
      platform: platform || 'instagram',
      content_type: contentTypes[Math.floor(Math.random() * contentTypes.length)],
      posted_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      likes,
      comments,
      shares,
      saves,
      views,
      engagement_rate: parseFloat(((likes + comments + shares + saves) / views * 100).toFixed(2)),
      hashtags: ['example', 'hashtag', 'test']
    });
  }

  return mockPosts;
}

function generateMockInsights() {
  return {
    average_engagement: '8.91',
    top_hashtags: ['fitness', 'motivation', 'tutorial', 'lifestyle', 'workout'],
    best_content_type: 'reel',
    total_analyzed: 3
  };
}

function generateMockRecommendations(platform) {
  return [
    {
      type: 'content_type',
      title: 'Focus on Reels',
      description: 'Your Reels perform 67% better than other formats',
      priority: 'high'
    },
    {
      type: 'hashtags',
      title: 'Use these high-performing hashtags',
      description: '#fitness, #motivation, #tutorial, #lifestyle, #workout',
      priority: 'medium'
    },
    {
      type: 'timing',
      title: 'Best posting time: 18:00',
      description: '60% of your top posts were published around this time',
      priority: 'medium'
    },
    {
      type: 'engagement',
      title: 'Include call-to-actions',
      description: 'Posts with questions or CTAs get 34% more comments',
      priority: 'medium'
    }
  ];
}

function generateMockGrowthTips() {
  return [
    {
      category: 'consistency',
      title: 'Post more consistently',
      description: 'Aim for 4-5 posts per week to maximize reach and engagement. Your current average is 2.3 posts/week.',
      impact: 'high',
      actionable: true
    },
    {
      category: 'engagement',
      title: 'Respond to comments faster',
      description: 'Replying within the first hour increases engagement by up to 40%. Your average response time is 4.2 hours.',
      impact: 'high',
      actionable: true
    },
    {
      category: 'content',
      title: 'Leverage trending audio',
      description: 'Reels with trending audio get 3x more reach. Check TikTok and Instagram trends weekly.',
      impact: 'high',
      actionable: true
    },
    {
      category: 'growth',
      title: 'Collaborate with micro-influencers',
      description: 'Partner with accounts in your niche (5K-50K followers) for shoutouts and collaborations.',
      impact: 'medium',
      actionable: true
    },
    {
      category: 'optimization',
      title: 'Optimize your posting times',
      description: 'Your audience is most active between 6-9 PM. Schedule important posts during these hours.',
      impact: 'medium',
      actionable: true
    }
  ];
}

module.exports = router;
