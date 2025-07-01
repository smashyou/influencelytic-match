
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ProfileInfo from '@/components/dashboard/ProfileInfo';
import BrandDashboardTabs from '@/components/dashboard/brand/BrandDashboardTabs';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import { useLocation } from 'react-router-dom';

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  user_type: string;
};

const BrandDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'campaigns';

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

  return (
    <DashboardLayout type="brand">
      {loading ? (
        <div className="py-10 text-center">Loading profile...</div>
      ) : (
        <div className="space-y-6">
          <ProfileInfo user={user} profile={profile} />
          <BrandDashboardTabs activeTab={activeTab} />
        </div>
      )}
    </DashboardLayout>
  );
};

export default BrandDashboard;
