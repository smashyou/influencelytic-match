import { supabase } from '@/integrations/supabase/client';

type SocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin' | 'snapchat';

export const initiateSocialAuth = async (platform: SocialPlatform): Promise<string | null> => {
  try {
    let authUrl: string | null = null;
    
    // Call the appropriate edge function based on the platform
    switch (platform) {
      case 'instagram':
        const { data, error } = await supabase.functions.invoke('instagram-auth');
        if (error) throw new Error(error.message);
        authUrl = data.authUrl;
        break;
      
      // Other platforms would have similar cases
      default:
        throw new Error(`Auth flow for ${platform} not implemented yet`);
    }
    
    if (!authUrl) {
      throw new Error('Failed to get authentication URL');
    }
    
    // Open the authentication URL in a popup
    const authWindow = window.open(authUrl, 'SocialAuthWindow', 'width=600,height=700');
    
    if (!authWindow) {
      throw new Error('Popup blocker may be enabled. Please allow popups for this site.');
    }
    
    // Return a promise that resolves when the auth flow completes
    return new Promise((resolve, reject) => {
      // Set up message listener
      const messageHandler = (event: MessageEvent) => {
        // Verify the message is from our auth flow
        if (event.data?.type === `${platform}-auth-success`) {
          window.removeEventListener('message', messageHandler);
          
          // Store the connection info in our database
          storeSocialConnection(platform, event.data.data)
            .then(() => resolve(platform))
            .catch(error => reject(error));
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Set a timeout in case the window is closed without completing auth
      setTimeout(() => {
        if (authWindow.closed) {
          window.removeEventListener('message', messageHandler);
          reject(new Error('Authentication window was closed before completing the process'));
        }
      }, 1000);
    });
  } catch (error) {
    console.error('Social auth error:', error);
    return null;
  }
};

const storeSocialConnection = async (platform: SocialPlatform, data: any) => {
  const { user } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    // Store the connection using our edge function
    const { error } = await supabase.functions.invoke('instagram-auth/store', {
      body: {
        userId: user.id,
        platform,
        accessToken: data.accessToken,
        platformUserId: data.userId,
        username: data.username
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error storing social connection:', error);
    throw error;
  }
};

// Mock function to get analytics data (to be replaced with actual API calls)
export const getSocialAnalytics = async (platform: SocialPlatform, metric: string) => {
  // This would be replaced with actual API calls to the respective platforms
  // For now, return mock data
  return {
    followers: Math.floor(Math.random() * 100000),
    engagement: Math.floor(Math.random() * 10000),
    posts: Math.floor(Math.random() * 100),
  };
};
