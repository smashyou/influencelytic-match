// Mock OAuth Authorization Page for Development
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, User, Shield, Database, Link2 } from 'lucide-react';
import { FaTiktok, FaInstagram, FaYoutube, FaTwitter, FaLinkedin, FaFacebook } from 'react-icons/fa';

const platformIcons = {
  tiktok: FaTiktok,
  instagram: FaInstagram,
  youtube: FaYoutube,
  twitter: FaTwitter,
  linkedin: FaLinkedin,
  facebook: FaFacebook,
};

const platformColors = {
  tiktok: 'bg-black',
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  youtube: 'bg-red-600',
  twitter: 'bg-blue-400',
  linkedin: 'bg-blue-700',
  facebook: 'bg-blue-600',
};

const mockUserData = {
  tiktok: {
    name: 'Creative Creator',
    username: '@creative_creator',
    followers: '125K followers',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tiktok',
  },
  instagram: {
    name: 'Lifestyle Influencer',
    username: '@lifestyle_influencer',
    followers: '85K followers',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=instagram',
  },
  youtube: {
    name: 'Tech Reviews Plus',
    username: '@techreviewsplus',
    followers: '250K subscribers',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=youtube',
  },
  twitter: {
    name: 'Thought Leader',
    username: '@thought_leader',
    followers: '45K followers',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=twitter',
  },
  linkedin: {
    name: 'Professional Expert',
    username: 'professional-expert',
    followers: '12K followers',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=linkedin',
  },
  facebook: {
    name: 'Community Builder',
    username: 'communitybuilder',
    followers: '3.5K friends',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=facebook',
  },
};

export default function MockOAuth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const platform = searchParams.get('platform') || 'unknown';
  const state = searchParams.get('state') || '';
  const redirectUri = `${import.meta.env.VITE_BACKEND_URL}/api/auth/${platform}/callback`;
  
  const Icon = platformIcons[platform as keyof typeof platformIcons] || User;
  const bgColor = platformColors[platform as keyof typeof platformColors] || 'bg-gray-600';
  const userData = mockUserData[platform as keyof typeof mockUserData];

  useEffect(() => {
    // Auto-approve after 2 seconds for better UX in development
    const timer = setTimeout(() => {
      setAuthorized(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleAuthorize = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate authorization delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock authorization code
      const mockCode = `mock_${platform}_code_${Date.now()}`;
      
      // Redirect to callback URL with mock code
      const callbackUrl = new URL(redirectUri);
      callbackUrl.searchParams.set('code', mockCode);
      callbackUrl.searchParams.set('state', state);
      
      // For development, make a direct API call instead of redirect
      const response = await fetch(callbackUrl.toString(), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to complete authorization');
      }

      const data = await response.json();
      
      // Redirect to dashboard with success message
      navigate('/dashboard/connections?success=' + platform + '&mock=true');
    } catch (err) {
      console.error('Mock authorization error:', err);
      setError('Failed to complete mock authorization. Please try again.');
      setLoading(false);
    }
  };

  const handleDeny = () => {
    // Redirect with error
    const callbackUrl = new URL(redirectUri);
    callbackUrl.searchParams.set('error', 'access_denied');
    callbackUrl.searchParams.set('error_description', 'User denied access');
    callbackUrl.searchParams.set('state', state);
    
    navigate('/dashboard/connections?error=access_denied&platform=' + platform);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="text-xs">
              MOCK OAUTH - DEVELOPMENT MODE
            </Badge>
            <Badge variant="outline" className="text-xs">
              Platform: {platform}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full text-white ${bgColor}`}>
              <Icon size={24} />
            </div>
            <div>
              <CardTitle className="text-xl">Authorize Influencelytic</CardTitle>
              <CardDescription>
                Connect your {platform.charAt(0).toUpperCase() + platform.slice(1)} account
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {userData && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={userData.avatar} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold">{userData.name}</p>
                  <p className="text-sm text-gray-500">{userData.username}</p>
                  <p className="text-xs text-gray-400">{userData.followers}</p>
                </div>
              </div>
            </div>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This is a mock OAuth flow for development. In production, you would be redirected to {platform}'s actual authorization page.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Influencelytic will receive:</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Your public profile information</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Your follower and engagement metrics</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Your content and analytics data</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>We will NOT post on your behalf</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Shield className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Security Note</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Your data is encrypted and stored securely. You can revoke access at any time from your dashboard.
            </p>
          </div>

          {authorized && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Ready to authorize! Click below to complete the connection.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex space-x-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDeny}
            disabled={loading}
          >
            Deny
          </Button>
          <Button
            className="flex-1"
            onClick={handleAuthorize}
            disabled={loading || !authorized}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Authorizing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Authorize
              </>
            )}
          </Button>
        </CardFooter>

        <div className="px-6 pb-4">
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>State: {state.substring(0, 8)}...</p>
            <p>Redirect: {redirectUri}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}