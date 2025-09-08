// Mock OAuth Routes for Development
const express = require('express');
const router = express.Router();
const MockAuthService = require('../../services/mockAuthService');
const jwt = require('jsonwebtoken');

const mockAuth = new MockAuthService();

// Check if mock mode is enabled
router.use((req, res, next) => {
  if (!MockAuthService.isEnabled()) {
    return res.status(404).json({ 
      error: 'Mock authentication is disabled. Set USE_MOCK_AUTH=true to enable.' 
    });
  }
  next();
});

// Mock sign in endpoint
router.post('/auth/mock/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check test credentials
    const testAccounts = [
      { email: 'nike@test.com', password: 'Test123!', type: 'brand', name: 'Nike' },
      { email: 'fitness@test.com', password: 'Test123!', type: 'influencer', name: 'Fitness Guru' }
    ];
    
    const account = testAccounts.find(acc => acc.email === email && acc.password === password);
    
    if (!account) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Create a mock JWT token
    const token = jwt.sign(
      { 
        id: `mock_${Date.now()}`,
        email: account.email,
        type: account.type,
        name: account.name
      },
      process.env.JWT_SECRET || 'mock-secret-key',
      { expiresIn: '24h' }
    );
    
    // Set session
    req.session.user = {
      id: `mock_${Date.now()}`,
      email: account.email,
      type: account.type,
      name: account.name
    };
    
    console.log(`[MOCK] User signed in: ${account.email}`);
    
    res.json({
      success: true,
      user: {
        id: req.session.user.id,
        email: account.email,
        type: account.type,
        name: account.name
      },
      token
    });
  } catch (error) {
    console.error('[MOCK] Sign in error:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

// Initiate mock OAuth flow for any platform
router.get('/auth/mock/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const { url, state } = mockAuth.getAuthorizationUrl(platform);
    
    // Store state in session for CSRF protection
    req.session.mockAuthState = state;
    req.session.mockPlatform = platform;
    
    console.log(`[MOCK] Initiating ${platform} OAuth flow`);
    
    // Redirect to mock authorization page
    res.json({
      message: 'Mock OAuth flow initiated',
      platform,
      authorization_url: url,
      state,
      instructions: 'In production, this would redirect to the platform\'s OAuth page',
    });
  } catch (error) {
    console.error('[MOCK] OAuth initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate mock OAuth' });
  }
});

// Handle mock OAuth callback
router.get('/auth/mock/:platform/callback', async (req, res) => {
  try {
    const { platform } = req.params;
    const { code = 'mock_auth_code', state, error } = req.query;

    if (error) {
      console.log(`[MOCK] OAuth error for ${platform}:`, error);
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?platform=${platform}&error=${error}`);
    }

    // Verify state (CSRF protection)
    if (state && state !== req.session.mockAuthState) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }

    // Exchange code for tokens
    const tokenData = await mockAuth.exchangeCodeForTokens(platform, code);
    
    // Get user info
    const userInfo = await mockAuth.getUserInfo(platform, tokenData.access_token);
    
    // Get or create user
    const userId = req.user?.id || req.session.userId || 'mock_user_' + Date.now();
    
    // Store connection in database
    await mockAuth.storeConnection(userId, platform, tokenData, userInfo);
    
    // Generate JWT for session
    const sessionToken = jwt.sign(
      { 
        userId, 
        platform, 
        mockAuth: true,
        platformUserId: userInfo.id,
      },
      process.env.JWT_SECRET || 'mock_jwt_secret',
      { expiresIn: '7d' }
    );
    
    console.log(`[MOCK] Successfully connected ${platform} for user ${userId}`);
    
    // Return success response
    res.json({
      success: true,
      platform,
      user: userInfo,
      token: sessionToken,
      message: `Mock ${platform} account connected successfully`,
    });
  } catch (error) {
    console.error('[MOCK] Callback error:', error);
    res.status(500).json({ error: 'Failed to complete mock OAuth flow' });
  }
});

// Get mock user data
router.get('/auth/mock/:platform/user', async (req, res) => {
  try {
    const { platform } = req.params;
    const accessToken = req.headers.authorization?.replace('Bearer ', '') || 'mock_token';
    
    const userInfo = await mockAuth.getUserInfo(platform, accessToken);
    
    res.json({
      success: true,
      platform,
      user: userInfo,
    });
  } catch (error) {
    console.error('[MOCK] Get user error:', error);
    res.status(500).json({ error: 'Failed to get mock user data' });
  }
});

// Get mock content/videos
router.get('/auth/mock/:platform/content', async (req, res) => {
  try {
    const { platform } = req.params;
    const { limit = 20, cursor } = req.query;
    const accessToken = req.headers.authorization?.replace('Bearer ', '') || 'mock_token';
    
    const content = await mockAuth.getUserContent(platform, accessToken, { limit, cursor });
    
    res.json({
      success: true,
      platform,
      ...content,
    });
  } catch (error) {
    console.error('[MOCK] Get content error:', error);
    res.status(500).json({ error: 'Failed to get mock content' });
  }
});

// Get mock analytics
router.get('/auth/mock/:platform/analytics', async (req, res) => {
  try {
    const { platform } = req.params;
    const accessToken = req.headers.authorization?.replace('Bearer ', '') || 'mock_token';
    
    const analytics = await mockAuth.getAnalytics(platform, accessToken);
    
    res.json({
      success: true,
      platform,
      analytics,
    });
  } catch (error) {
    console.error('[MOCK] Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get mock analytics' });
  }
});

// Refresh mock token
router.post('/auth/mock/:platform/refresh', async (req, res) => {
  try {
    const { platform } = req.params;
    const { refresh_token } = req.body;
    
    const newTokenData = await mockAuth.refreshAccessToken(platform, refresh_token || 'mock_refresh');
    
    res.json({
      success: true,
      platform,
      ...newTokenData,
    });
  } catch (error) {
    console.error('[MOCK] Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh mock token' });
  }
});

// Generate mock AI match score
router.post('/auth/mock/ai/match', async (req, res) => {
  try {
    const { influencer_id, campaign_id } = req.body;
    
    const matchData = await mockAuth.generateMockMatches(
      influencer_id || 'mock_influencer',
      campaign_id || 'mock_campaign'
    );
    
    res.json({
      success: true,
      match: matchData,
    });
  } catch (error) {
    console.error('[MOCK] AI match error:', error);
    res.status(500).json({ error: 'Failed to generate mock match' });
  }
});

// List all connected mock accounts
router.get('/auth/mock/connections', async (req, res) => {
  try {
    const userId = req.user?.id || req.session.userId || 'mock_user';
    
    // Get mock connections from database
    const { data: connections, error } = await require('../../config/supabase').supabase
      .from('social_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_mock', true);
    
    if (error) throw error;
    
    res.json({
      success: true,
      connections: connections || [],
      count: connections?.length || 0,
    });
  } catch (error) {
    console.error('[MOCK] Get connections error:', error);
    res.status(500).json({ error: 'Failed to get mock connections' });
  }
});

// Remove mock connection
router.delete('/auth/mock/:platform/disconnect', async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.user?.id || req.session.userId || 'mock_user';
    
    const { error } = await require('../../config/supabase').supabase
      .from('social_connections')
      .delete()
      .eq('user_id', userId)
      .eq('platform', platform)
      .eq('is_mock', true);
    
    if (error) throw error;
    
    console.log(`[MOCK] Disconnected ${platform} for user ${userId}`);
    
    res.json({
      success: true,
      message: `Mock ${platform} account disconnected`,
    });
  } catch (error) {
    console.error('[MOCK] Disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect mock account' });
  }
});

module.exports = router;