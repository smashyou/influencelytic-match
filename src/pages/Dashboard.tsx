
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import SocialConnectCard from '@/components/dashboard/SocialConnectCard';
import AnalyticsOverview from '@/components/dashboard/AnalyticsOverview';

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  user_type: string;
};

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
    const getProfile = async () => {
      try {
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch mock connected platforms (to be replaced with actual API calls later)
    const fetchConnectedPlatforms = async () => {
      // This would be replaced with actual API calls to check connected platforms
      setConnectedPlatforms(['instagram', 'youtube']); // Mock data
    };

    getProfile();
    fetchConnectedPlatforms();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleConnectPlatform = (platform: string) => {
    // This would be replaced with actual OAuth flow
    toast({
      title: "Connecting to " + platform,
      description: "This would initiate the OAuth flow for " + platform,
    });
    
    // Mock successful connection (to be replaced with actual OAuth flow)
    if (!connectedPlatforms.includes(platform)) {
      setConnectedPlatforms([...connectedPlatforms, platform]);
    }
  };

  const userTypeName = profile?.user_type === 'influencer' ? 'Influencer' : 'Brand';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar transparent={false} />
      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="bg-card border rounded-lg shadow-subtle p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold">Influencer Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Connect your social platforms and track your performance
                </p>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>

            {loading ? (
              <div className="py-10 text-center">Loading profile...</div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">
                    Welcome{profile?.first_name ? `, ${profile.first_name}!` : '!'}
                  </h2>
                  <div className="p-4 bg-muted/50 rounded-md">
                    <p className="text-muted-foreground">
                      You are signed in with: <span className="font-medium text-foreground">{user?.email}</span>
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Account type: <span className="font-medium text-foreground">{userTypeName}</span>
                    </p>
                  </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="mb-8">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="platforms">Platforms</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview">
                    <AnalyticsOverview connectedPlatforms={connectedPlatforms} />
                  </TabsContent>
                  
                  <TabsContent value="platforms">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <SocialConnectCard 
                        platform="instagram" 
                        isConnected={connectedPlatforms.includes('instagram')} 
                        onConnect={() => handleConnectPlatform('instagram')} 
                      />
                      <SocialConnectCard 
                        platform="facebook" 
                        isConnected={connectedPlatforms.includes('facebook')} 
                        onConnect={() => handleConnectPlatform('facebook')} 
                      />
                      <SocialConnectCard 
                        platform="tiktok" 
                        isConnected={connectedPlatforms.includes('tiktok')} 
                        onConnect={() => handleConnectPlatform('tiktok')} 
                      />
                      <SocialConnectCard 
                        platform="youtube" 
                        isConnected={connectedPlatforms.includes('youtube')} 
                        onConnect={() => handleConnectPlatform('youtube')} 
                      />
                      <SocialConnectCard 
                        platform="twitter" 
                        isConnected={connectedPlatforms.includes('twitter')} 
                        onConnect={() => handleConnectPlatform('twitter')} 
                      />
                      <SocialConnectCard 
                        platform="linkedin" 
                        isConnected={connectedPlatforms.includes('linkedin')} 
                        onConnect={() => handleConnectPlatform('linkedin')} 
                      />
                      <SocialConnectCard 
                        platform="snapchat" 
                        isConnected={connectedPlatforms.includes('snapchat')} 
                        onConnect={() => handleConnectPlatform('snapchat')} 
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="analytics">
                    <Card>
                      <CardHeader>
                        <CardTitle>Social Media Analytics</CardTitle>
                        <CardDescription>
                          Connect your platforms to see detailed analytics
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {connectedPlatforms.length > 0 ? (
                          <div className="space-y-6">
                            {connectedPlatforms.map(platform => (
                              <div key={platform} className="p-4 border rounded-md">
                                <h3 className="text-lg font-medium capitalize mb-2">{platform} Analytics</h3>
                                <p className="text-muted-foreground">Detailed metrics will appear here after integration</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-8 text-center">
                            <p className="text-muted-foreground">No platforms connected yet</p>
                            <Button 
                              variant="outline" 
                              className="mt-4"
                              onClick={() => document.querySelector('[data-value="platforms"]')?.click()}
                            >
                              Connect Platforms
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
