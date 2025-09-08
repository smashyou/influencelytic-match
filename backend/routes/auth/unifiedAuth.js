// Unified Authentication Router - Switches between Mock and Real Auth
const express = require('express');
const router = express.Router();
const MockAuthService = require('../../services/mockAuthService');

// Import real auth services (when available)
// const TikTokAuthService = require('../../services/tiktokAuthService');
// const InstagramAuthService = require('../../services/instagramAuthService');
// ... etc

const mockAuth = new MockAuthService();

// Middleware to determine which auth service to use
const getAuthService = (platform) => {
  const useMockAuth = process.env.USE_MOCK_AUTH === 'true' || 
                      process.env.NODE_ENV === 'development' ||
                      !process.env[`${platform.toUpperCase()}_CLIENT_KEY`];

  if (useMockAuth) {
    console.log(`[AUTH] Using MOCK authentication for ${platform}`);
    return mockAuth;
  }

  // Return real auth service when available
  console.log(`[AUTH] Using REAL authentication for ${platform}`);
  
  // Uncomment when real services are implemented
  // switch(platform) {
  //   case 'tiktok': return tiktokAuth;
  //   case 'instagram': return instagramAuth;
  //   case 'youtube': return youtubeAuth;
  //   case 'twitter': return twitterAuth;
  //   case 'linkedin': return linkedinAuth;
  //   default: return mockAuth;
  // }
  
  return mockAuth; // Fallback to mock for now
};

// Universal OAuth initiation endpoint
router.get('/auth/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const validPlatforms = ['tiktok', 'instagram', 'facebook', 'youtube', 'twitter', 'linkedin'];
    
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: `Invalid platform: ${platform}` });
    }

    const authService = getAuthService(platform);
    
    // For mock auth, return JSON response
    if (authService === mockAuth) {
      const { url, state } = authService.getAuthorizationUrl(platform);
      req.session[`${platform}State`] = state;
      
      // In development, redirect to a mock OAuth page
      if (process.env.NODE_ENV === 'development') {
        return res.redirect(`${process.env.FRONTEND_URL}/mock-oauth?platform=${platform}&state=${state}`);
      }
      
      return res.json({
        mock: true,
        platform,
        message: 'Using mock authentication',
        authorization_url: url,
        instructions: 'Complete mock OAuth flow in frontend',
      });
    }

    // For real auth, redirect to platform
    const { url, state } = authService.getAuthorizationUrl();
    req.session[`${platform}State`] = state;
    res.redirect(url);
    
  } catch (error) {
    console.error(`[AUTH] ${req.params.platform} initiation error:`, error);
    res.status(500).json({ error: 'Failed to initiate authentication' });
  }
});

// Universal OAuth callback endpoint
router.get('/auth/:platform/callback', async (req, res) => {
  try {
    const { platform } = req.params;
    const { code, state, error, error_description } = req.query;

    // Handle OAuth errors
    if (error) {
      console.error(`[AUTH] ${platform} OAuth error:`, error, error_description);
      return res.redirect(
        `${process.env.FRONTEND_URL}/dashboard/connections?error=${error}&platform=${platform}`
      );
    }

    // Verify state for CSRF protection
    const sessionState = req.session[`${platform}State`];
    if (state && state !== sessionState) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/dashboard/connections?error=invalid_state&platform=${platform}`
      );
    }

    const authService = getAuthService(platform);
    const userId = req.user?.id || req.session.userId;

    if (!userId) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=not_authenticated&redirect=/dashboard/connections`
      );
    }

    // Handle mock auth
    if (authService === mockAuth) {
      const mockCode = code || 'mock_auth_code_' + Date.now();
      const tokenData = await authService.exchangeCodeForTokens(platform, mockCode);
      const userInfo = await authService.getUserInfo(platform, tokenData.access_token);
      await authService.storeConnection(userId, platform, tokenData, userInfo);
      
      return res.redirect(
        `${process.env.FRONTEND_URL}/dashboard/connections?success=${platform}&mock=true`
      );
    }

    // Handle real auth (when implemented)
    // const tokenData = await authService.exchangeCodeForTokens(code);
    // const userInfo = await authService.getUserInfo(tokenData.access_token);
    // await storeConnection(userId, platform, tokenData, userInfo);
    
    res.redirect(
      `${process.env.FRONTEND_URL}/dashboard/connections?success=${platform}`
    );
    
  } catch (error) {
    console.error(`[AUTH] ${req.params.platform} callback error:`, error);
    res.redirect(
      `${process.env.FRONTEND_URL}/dashboard/connections?error=callback_failed&platform=${req.params.platform}`
    );
  }
});

// Get connected accounts
router.get('/auth/connections', async (req, res) => {
  try {
    const userId = req.user?.id || req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { supabase } = require('../../config/supabase');
    const { data: connections, error } = await supabase
      .from('social_connections')
      .select('platform, username, profile_data, is_mock, created_at')
      .eq('user_id', userId);

    if (error) throw error;

    // Add connection status
    const connectionsWithStatus = connections?.map(conn => ({
      ...conn,
      status: conn.is_mock ? 'mock' : 'active',
      description: conn.is_mock ? 'Mock data for development' : 'Live connection',
    })) || [];

    res.json({
      success: true,
      connections: connectionsWithStatus,
      mock_mode: process.env.USE_MOCK_AUTH === 'true',
    });
  } catch (error) {
    console.error('[AUTH] Get connections error:', error);
    res.status(500).json({ error: 'Failed to get connections' });
  }
});

// Disconnect account
router.delete('/auth/:platform/disconnect', async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.user?.id || req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { supabase } = require('../../config/supabase');
    const { error } = await supabase
      .from('social_connections')
      .delete()
      .eq('user_id', userId)
      .eq('platform', platform);

    if (error) throw error;

    // Also remove analytics data
    await supabase
      .from('influencer_analytics')
      .delete()
      .eq('user_id', userId)
      .eq('platform', platform);

    res.json({
      success: true,
      message: `${platform} account disconnected`,
    });
  } catch (error) {
    console.error('[AUTH] Disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect account' });
  }
});

// Refresh token endpoint
router.post('/auth/:platform/refresh', async (req, res) => {
  try {
    const { platform } = req.params;
    const { refresh_token } = req.body;
    const userId = req.user?.id || req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const authService = getAuthService(platform);
    
    if (authService === mockAuth) {
      const newTokenData = await authService.refreshAccessToken(platform, refresh_token);
      return res.json({
        success: true,
        ...newTokenData,
        mock: true,
      });
    }

    // Handle real token refresh when implemented
    res.json({
      success: false,
      error: 'Real token refresh not yet implemented',
    });
  } catch (error) {
    console.error('[AUTH] Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

module.exports = router;