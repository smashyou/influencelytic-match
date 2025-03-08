
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { initiateSocialAuth } from '@/services/social-auth';
import ProfileInfo from '@/components/dashboard/ProfileInfo';
import DashboardTabs from '@/components/dashboard/DashboardTabs';

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

    const fetchConnectedPlatforms = async () => {
      setConnectedPlatforms(['instagram', 'youtube']);
    };

    getProfile();
    fetchConnectedPlatforms();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleConnectPlatform = async (platform: string) => {
    toast({
      title: "Connecting to " + platform,
      description: "Initiating the OAuth flow for " + platform,
    });
    
    try {
      const result = await initiateSocialAuth(platform as any);
      if (result) {
        if (!connectedPlatforms.includes(platform)) {
          setConnectedPlatforms([...connectedPlatforms, platform]);
        }
      }
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      toast({
        title: `Failed to connect to ${platform}`,
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const navigateToPlatforms = () => {
    const platformsTab = document.querySelector('[data-value="platforms"]');
    if (platformsTab instanceof HTMLElement) {
      platformsTab.click();
    }
  };

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
                <ProfileInfo user={user} profile={profile} />
                <DashboardTabs 
                  connectedPlatforms={connectedPlatforms}
                  handleConnectPlatform={handleConnectPlatform}
                  navigateToPlatforms={navigateToPlatforms}
                />
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
