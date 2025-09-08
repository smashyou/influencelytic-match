// Social Media Connections Component with Mock Support
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Link2, 
  Unlink, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Settings,
  BarChart,
  Users,
  Eye
} from 'lucide-react';
import { FaTiktok, FaInstagram, FaYoutube, FaTwitter, FaLinkedin, FaFacebook } from 'react-icons/fa';
import { toast } from 'sonner';

interface Platform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  description: string;
  mockAvailable: boolean;
}

const platforms: Platform[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: FaTiktok,
    color: 'text-black dark:text-white',
    bgColor: 'bg-black dark:bg-gray-800',
    description: 'Connect your TikTok account to sync videos and analytics',
    mockAvailable: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: FaInstagram,
    color: 'text-pink-600',
    bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    description: 'Sync your Instagram posts, stories, and insights',
    mockAvailable: true,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: FaYoutube,
    color: 'text-red-600',
    bgColor: 'bg-red-600',
    description: 'Import your YouTube channel data and video analytics',
    mockAvailable: true,
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: FaTwitter,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400',
    description: 'Connect your Twitter account for tweet analytics',
    mockAvailable: true,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: FaLinkedin,
    color: 'text-blue-700',
    bgColor: 'bg-blue-700',
    description: 'Sync your professional network and content',
    mockAvailable: true,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: FaFacebook,
    color: 'text-blue-600',
    bgColor: 'bg-blue-600',
    description: 'Connect Facebook pages and insights',
    mockAvailable: true,
  },
];

interface Connection {
  platform: string;
  username: string;
  profile_data: any;
  is_mock: boolean;
  created_at: string;
  status: 'active' | 'mock' | 'expired';
}

export default function SocialConnections() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [mockMode, setMockMode] = useState(false);

  useEffect(() => {
    fetchConnections();
    checkMockMode();
  }, []);

  const checkMockMode = () => {
    // Check if we're in mock mode
    const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true' || 
                       import.meta.env.MODE === 'development';
    setMockMode(useMockAuth);
  };

  const fetchConnections = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/connections`, {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to fetch connections');
      
      const data = await response.json();
      setConnections(data.connections || []);
      setMockMode(data.mock_mode || false);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platformId: string) => {
    try {
      // Check if using mock auth
      if (mockMode) {
        // For mock auth, navigate to mock OAuth page
        navigate(`/mock-oauth?platform=${platformId}&state=${generateState()}`);
      } else {
        // For real auth, redirect to backend OAuth endpoint
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/${platformId}`;
      }
    } catch (error) {
      console.error('Error connecting platform:', error);
      toast.error('Failed to initiate connection');
    }
  };

  const handleDisconnect = async (platformId: string) => {
    setDisconnecting(platformId);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/${platformId}/disconnect`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) throw new Error('Failed to disconnect');
      
      toast.success(`${platformId} disconnected successfully`);
      await fetchConnections();
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      toast.error('Failed to disconnect platform');
    } finally {
      setDisconnecting(null);
    }
  };

  const handleRefresh = async (platformId: string) => {
    setRefreshing(platformId);
    
    try {
      // Simulate refresh for mock connections
      if (mockMode) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success(`${platformId} data refreshed (mock)`);
      } else {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/${platformId}/refresh`,
          {
            method: 'POST',
            credentials: 'include',
          }
        );

        if (!response.ok) throw new Error('Failed to refresh');
        toast.success(`${platformId} data refreshed`);
      }
      
      await fetchConnections();
    } catch (error) {
      console.error('Error refreshing platform:', error);
      toast.error('Failed to refresh platform data');
    } finally {
      setRefreshing(null);
    }
  };

  const generateState = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  const getConnectionForPlatform = (platformId: string) => {
    return connections.find(c => c.platform === platformId);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {mockMode && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <strong>Mock Mode Active:</strong> Using simulated data for development. 
            Real API keys not configured.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {platforms.map(platform => {
          const connection = getConnectionForPlatform(platform.id);
          const isConnected = !!connection;
          const isMock = connection?.is_mock;
          const Icon = platform.icon;

          return (
            <Card key={platform.id} className="relative overflow-hidden">
              {isConnected && (
                <div className="absolute top-2 right-2">
                  {isMock ? (
                    <Badge variant="secondary" className="text-xs">
                      MOCK
                    </Badge>
                  ) : (
                    <Badge variant="default" className="text-xs bg-green-500">
                      LIVE
                    </Badge>
                  )}
                </div>
              )}

              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg text-white ${platform.bgColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{platform.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {platform.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {isConnected ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Username:</span>
                        <span className="font-medium">
                          {connection.username || connection.profile_data?.username || 'N/A'}
                        </span>
                      </div>
                      
                      {connection.profile_data && (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Followers:</span>
                            <span className="font-medium">
                              {formatNumber(
                                connection.profile_data.follower_count ||
                                connection.profile_data.followers_count ||
                                connection.profile_data.subscriberCount ||
                                0
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Posts:</span>
                            <span className="font-medium">
                              {formatNumber(
                                connection.profile_data.video_count ||
                                connection.profile_data.media_count ||
                                connection.profile_data.videoCount ||
                                connection.profile_data.tweet_count ||
                                0
                              )}
                            </span>
                          </div>
                        </>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Connected:</span>
                        <span className="font-medium">
                          {new Date(connection.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleRefresh(platform.id)}
                        disabled={refreshing === platform.id}
                      >
                        {refreshing === platform.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Refresh
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDisconnect(platform.id)}
                        disabled={disconnecting === platform.id}
                      >
                        {disconnecting === platform.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Unlink className="h-4 w-4 mr-1" />
                            Disconnect
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleConnect(platform.id)}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Connect {platform.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Statistics</CardTitle>
          <CardDescription>
            Overview of your connected social media accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{connections.length}</div>
              <div className="text-sm text-gray-500">Connected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {connections.filter(c => c.is_mock).length}
              </div>
              <div className="text-sm text-gray-500">Mock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {connections.filter(c => !c.is_mock).length}
              </div>
              <div className="text-sm text-gray-500">Live</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {platforms.length - connections.length}
              </div>
              <div className="text-sm text-gray-500">Available</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}