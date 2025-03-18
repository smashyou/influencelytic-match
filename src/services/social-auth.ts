
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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
      
      case 'tiktok':
      case 'youtube':
      case 'facebook':
      case 'twitter':
      case 'linkedin':
      case 'snapchat':
        // For demo purposes, show a toast that these are coming soon
        toast({
          title: `${platform} integration coming soon`,
          description: "This integration is under development",
          variant: "default",
        });
        return null;
      
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
      const checkInterval = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(checkInterval);
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
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw new Error('User not authenticated');
  }
  
  try {
    // Store the connection in our database
    const { error } = await supabase
      .from('social_connections')
      .upsert({
        user_id: userData.user.id,
        platform,
        platform_user_id: data.userId,
        username: data.username,
        access_token: data.accessToken,
        connected_at: new Date().toISOString(),
      });
    
    if (error) {
      console.error('Error storing connection:', error);
      throw error;
    }
    
    toast({
      title: "Connection successful",
      description: `Your ${platform} account is now connected`,
      variant: "default",
    });
    
    return true;
  } catch (error) {
    console.error('Error storing social connection:', error);
    throw error;
  }
};

// Get social connections for the current user
export const getUserSocialConnections = async (): Promise<string[]> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('social_connections')
      .select('platform')
      .eq('user_id', userData.user.id);
    
    if (error) {
      console.error('Error fetching social connections:', error);
      return [];
    }
    
    return data.map(connection => connection.platform);
  } catch (error) {
    console.error('Error fetching user social connections:', error);
    return [];
  }
};

// Fetch analytics data from platforms based on connected accounts
export const getSocialMediaAnalytics = async (platform: SocialPlatform) => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }
    
    // In a real scenario, this would call a secure edge function to fetch the data 
    // using the stored access token without exposing it to the client
    const { data, error } = await supabase.functions.invoke(`${platform}-analytics`, {
      body: { platform }
    });
    
    if (error) {
      console.error(`Error fetching ${platform} analytics:`, error);
      // Fall back to mock data if the API call fails
      return getMockAnalyticsData(platform);
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${platform} analytics:`, error);
    // Fall back to mock data if anything fails
    return getMockAnalyticsData(platform);
  }
};

// Helper function to provide mock data for development
const getMockAnalyticsData = (platform: SocialPlatform) => {
  // This would be replaced with actual API calls in production
  return {
    followers: platform === 'instagram' ? 62400 : platform === 'youtube' ? 45700 : 15600,
    engagement: platform === 'instagram' ? 5.8 : platform === 'youtube' ? 7.9 : 9.5,
    posts: Math.floor(Math.random() * 100) + 50,
    views: Math.floor(Math.random() * 100000) + 10000,
  };
};
