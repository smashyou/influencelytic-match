
import React from 'react';
import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Bell,
  UserCircle,
  Settings,
  LogOut
} from 'lucide-react';

interface DashboardSidebarProps {
  user: User | null;
  signOut: () => Promise<void>;
  type: 'influencer' | 'brand';
}

const DashboardSidebar = ({ user, signOut, type }: DashboardSidebarProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const sidebarLinks = type === 'influencer' 
    ? [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', section: 'overview' },
        { icon: Users, label: 'Platforms', path: '/dashboard', section: 'platforms' },
        { icon: BarChart3, label: 'Opportunities', path: '/dashboard', section: 'opportunities' },
        { icon: Users, label: 'Business Match', path: '/dashboard', section: 'business-match' },
        { icon: BarChart3, label: 'Analytics', path: '/dashboard', section: 'followers-analytics' },
      ]
    : [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/brand-dashboard', section: 'campaigns' },
        { icon: Users, label: 'Find Influencers', path: '/brand-dashboard', section: 'influencers' },
        { icon: BarChart3, label: 'Analytics', path: '/brand-dashboard', section: 'analytics' },
      ];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-purple-600 to-purple-700 text-white w-64 min-w-64 py-4 shadow-xl">
      <div className="px-4 mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wide">
          {type === 'influencer' ? 'Influencer' : 'Business'} Dashboard
        </h2>
      </div>

      <nav className="flex-grow overflow-y-auto">
        <ul className="space-y-2 px-2">
          {sidebarLinks.map((link) => (
            <li key={link.section}>
              <NavLink
                to={`${link.path}?tab=${link.section}`}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-white/10",
                    isActive ? "bg-white/20" : "transparent"
                  )
                }
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto pt-4 px-4 border-t border-white/10">
        <ul className="space-y-2">
          <li>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10 hover:text-white px-3"
              onClick={() => navigate('/settings')}
            >
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10 hover:text-white px-3"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sign Out
            </Button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardSidebar;
