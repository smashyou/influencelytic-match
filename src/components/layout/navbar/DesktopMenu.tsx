
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import NavLinks from './NavLinks';
import { User } from '@supabase/supabase-js';

interface DesktopMenuProps {
  user: User | null;
  signOut: () => Promise<void>;
  scrollToSection: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}

const DesktopMenu = ({ user, signOut, scrollToSection }: DesktopMenuProps) => {
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  return (
    <div className="hidden md:flex items-center gap-6 md:gap-8">
      <NavLinks scrollToSection={scrollToSection} />
      <div className="flex items-center gap-2 md:gap-4">
        {user ? (
          <>
            <Button asChild variant="ghost" className="button-hover-effect text-sm" size="sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <Button onClick={handleSignOut} variant="outline" className="button-hover-effect text-sm" size="sm">
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="ghost" className="button-hover-effect text-sm" size="sm">
              <Link to="/signin">Sign In</Link>
            </Button>
            <Button asChild className="button-hover-effect text-sm" size="sm">
              <Link to="/signup">Get Started</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default DesktopMenu;
