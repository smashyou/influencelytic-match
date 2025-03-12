
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import NavLinks from './NavLinks';
import { User } from '@supabase/supabase-js';

interface MobileMenuProps {
  isOpen: boolean;
  user: User | null;
  onSignOut: () => Promise<void>;
  scrollToSection: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, user, onSignOut, scrollToSection, onClose }: MobileMenuProps) => {
  return (
    <div className={cn(
      "fixed inset-0 bg-background/95 backdrop-blur-sm pt-20 px-4 md:px-6 z-40 transition-transform duration-300 ease-in-out md:hidden overflow-y-auto",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      <div className="flex flex-col h-full">
        <div className="flex flex-col gap-6 items-start mb-8">
          <NavLinks mobile onClick={onClose} scrollToSection={scrollToSection} />
        </div>
        
        <div className="flex flex-col gap-4 mt-auto mb-8">
          {user ? (
            <>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link to="/dashboard" onClick={onClose}>Dashboard</Link>
              </Button>
              <Button onClick={() => { onSignOut(); onClose(); }} className="w-full" size="sm">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link to="/signin" onClick={onClose}>Sign In</Link>
              </Button>
              <Button asChild className="w-full" size="sm">
                <Link to="/signup" onClick={onClose}>Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
