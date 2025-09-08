import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Instagram, 
  Youtube, 
  Twitter, 
  Linkedin,
  Facebook,
  Music2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SocialConnection {
  id: string;
  platform: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  follower_count: number;
  following_count: number;
  post_count: number;
  is_verified: boolean;
  is_active: boolean;
  last_sync_at: string;
}

interface Analytics {
  platform: string;
  engagement_rate: number;
  avg_likes: number;
  avg_comments: number;
  fake_follower_percentage: number;
}

const platformConfig = {
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    textColor: 'text-pink-600'
  },
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600',
    textColor: 'text-blue-600'
  },
  tiktok: {
    name: 'TikTok',
    icon: Music2,
    color: 'bg-black',
    textColor: 'text-black'
  },
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    color: 'bg-red-600',
    textColor: 'text-red-600'
  },
  twitter: {
    name: 'Twitter',
    icon: Twitter,
    color: 'bg-sky-500',
    textColor: 'text-sky-500'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-700',
    textColor: 'text-blue-700'
  }
};

export function SocialConnectionsManager() {
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, Analytics>>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    fetchConnections();
    fetchAnalytics();
  }, []);

  const fetchConnections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load social connections');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('influencer_analytics')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const analyticsMap: Record<string, Analytics> = {};
      data?.forEach(item => {
        analyticsMap[item.platform] = item;
      });
      setAnalytics(analyticsMap);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const connectPlatform = async (platform: string) => {
    try {
      // Call backend to get OAuth URL
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social/auth/${platform}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      const { authUrl } = await response.json();
      
      // Open OAuth window
      const authWindow = window.open(authUrl, '_blank', 'width=600,height=700');
      
      // Listen for OAuth callback
      const checkInterval = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkInterval);
          fetchConnections();
          fetchAnalytics();
        }
      }, 1000);
    } catch (error) {
      console.error('Error connecting platform:', error);
      toast.error(`Failed to connect ${platform}`);
    }
  };

  const syncPlatform = async (platform: string) => {
    setSyncing(platform);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social/sync/${platform}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (!response.ok) throw new Error('Sync failed');

      toast.success(`${platformConfig[platform as keyof typeof platformConfig].name} synced successfully`);
      fetchConnections();
      fetchAnalytics();
    } catch (error) {
      console.error('Error syncing platform:', error);
      toast.error(`Failed to sync ${platform}`);
    } finally {
      setSyncing(null);
    }
  };

  const disconnectPlatform = async (connectionId: string, platform: string) => {
    try {
      const { error } = await supabase
        .from('social_connections')
        .update({ is_active: false })
        .eq('id', connectionId);

      if (error) throw error;

      toast.success(`${platformConfig[platform as keyof typeof platformConfig].name} disconnected`);
      fetchConnections();
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      toast.error('Failed to disconnect platform');
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getConnectionForPlatform = (platform: string) => {
    return connections.find(c => c.platform === platform);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(platformConfig).map(([platform]) => (
          <Card key={platform} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Social Media Connections</h2>
        <Badge variant="outline" className="text-sm">
          {connections.length} Connected
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(platformConfig).map(([platform, config]) => {
          const connection = getConnectionForPlatform(platform);
          const platformAnalytics = analytics[platform];
          const Icon = config.icon;

          return (
            <Card key={platform} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-base">{config.name}</CardTitle>
                  </div>
                  {connection?.is_verified && (
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {connection ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {connection.avatar_url && (
                          <img 
                            src={connection.avatar_url} 
                            alt={connection.username}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-medium">@{connection.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {connection.display_name}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Followers</p>
                          <p className="font-semibold">{formatNumber(connection.follower_count)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Following</p>
                          <p className="font-semibold">{formatNumber(connection.following_count)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Posts</p>
                          <p className="font-semibold">{formatNumber(connection.post_count)}</p>
                        </div>
                      </div>

                      {platformAnalytics && (
                        <div className="pt-2 border-t space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Engagement
                            </span>
                            <span className="font-medium">
                              {platformAnalytics.engagement_rate.toFixed(2)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Fake Followers
                            </span>
                            <span className={`font-medium ${
                              platformAnalytics.fake_follower_percentage > 20 
                                ? 'text-red-500' 
                                : 'text-green-500'
                            }`}>
                              {platformAnalytics.fake_follower_percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => syncPlatform(platform)}
                          disabled={syncing === platform}
                        >
                          {syncing === platform ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                          Sync
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => disconnectPlatform(connection.id, platform)}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      Last synced: {new Date(connection.last_sync_at).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Not connected
                    </p>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => connectPlatform(platform)}
                    >
                      Connect {config.name}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Connection Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Connect multiple platforms to increase your visibility to brands</p>
          <p>• Sync regularly to keep your analytics up-to-date</p>
          <p>• Platforms with verified badges get priority in search results</p>
          <p>• Keep your engagement rate above 2% for better matches</p>
        </CardContent>
      </Card>
    </div>
  );
}