
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import ProfileInfo from '@/components/dashboard/ProfileInfo';
import BrandDashboardTabs from '@/components/dashboard/brand/BrandDashboardTabs';

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  user_type: string;
};

const BrandDashboard = () => {
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar transparent={false} />
      <main className="flex-grow pt-20 md:pt-24 pb-10 md:pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="bg-card border rounded-lg shadow-subtle p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Brand Dashboard</h1>
                <p className="text-muted-foreground mt-1 text-sm md:text-base">
                  Create campaigns and find the perfect influencers for your brand
                </p>
              </div>
              <Button variant="outline" onClick={handleSignOut} size="sm" className="w-full md:w-auto">
                Sign Out
              </Button>
            </div>

            {loading ? (
              <div className="py-10 text-center">Loading profile...</div>
            ) : (
              <>
                <ProfileInfo user={user} profile={profile} />
                <BrandDashboardTabs />
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BrandDashboard;
