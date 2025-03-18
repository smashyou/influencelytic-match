
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { initiateSocialAuth, getUserSocialConnections } from '@/services/social-auth';
import { toast } from '@/components/ui/use-toast';
import ProfileInfo from '@/components/dashboard/ProfileInfo';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import { useLocation } from 'react-router-dom';

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  user_type: string;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'overview';

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
      }
    };

    const fetchConnectedPlatforms = async () => {
      // Try to get connected platforms from the database
      const platforms = await getUserSocialConnections();
      setConnectedPlatforms(platforms);
      setLoading(false);
    };

    getProfile();
    fetchConnectedPlatforms();
  }, [user]);

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
    // This is handled by the sidebar navigation now
  };

  return (
    <DashboardLayout type="influencer">
      {loading ? (
        <div className="py-10 text-center">Loading profile...</div>
      ) : (
        <div className="space-y-6">
          <ProfileInfo user={user} profile={profile} />
          <DashboardTabs 
            connectedPlatforms={connectedPlatforms}
            handleConnectPlatform={handleConnectPlatform}
            navigateToPlatforms={navigateToPlatforms}
            activeTab={activeTab}
          />
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
