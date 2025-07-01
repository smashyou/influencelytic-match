
import React, { ReactNode, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  type: 'influencer' | 'brand';
}

const DashboardLayout = ({ children, type }: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the active tab from URL query params
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab');
  
  // Set default tab if none is specified
  useEffect(() => {
    if (!activeTab) {
      const defaultTab = type === 'influencer' ? 'overview' : 'campaigns';
      navigate(`${location.pathname}?tab=${defaultTab}`, { replace: true });
    }
  }, [activeTab, location.pathname, navigate, type]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar 
        user={user} 
        signOut={signOut} 
        type={type}
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
