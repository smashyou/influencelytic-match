
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

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

    getProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  const userTypeName = profile?.user_type === 'influencer' ? 'Influencer' : 'Brand';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar transparent={false} />
      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-card border rounded-lg shadow-subtle p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Dashboard</h1>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold mb-3">Quick Stats</h3>
                    <div className="text-muted-foreground">
                      {profile?.user_type === 'influencer' ? (
                        <p>No campaigns yet. Start exploring opportunities!</p>
                      ) : (
                        <p>No active campaigns. Create your first campaign!</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold mb-3">Getting Started</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Complete your profile</li>
                      <li>• Connect your social accounts</li>
                      <li>• Browse {profile?.user_type === 'influencer' ? 'opportunities' : 'influencers'}</li>
                    </ul>
                  </div>
                </div>
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
