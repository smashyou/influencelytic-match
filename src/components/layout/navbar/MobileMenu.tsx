
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import NavLinks from './NavLinks';
import { User } from '@supabase/supabase-js';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileMenuProps {
  isOpen: boolean;
  user: User | null;
  onSignOut: () => Promise<void>;
  scrollToSection: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, user, onSignOut, scrollToSection, onClose }: MobileMenuProps) => {
  const isMobile = useIsMobile();
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSignOut = async () => {
    try {
      await onSignOut();
      onClose();
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300 ease-in-out md:hidden",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      onClick={handleBackdropClick}
    >
      <div 
        className={cn(
          "fixed top-0 right-0 h-[100dvh] w-[85%] max-w-[350px] bg-background border-l shadow-lg transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex justify-end p-6 border-b">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="h-10 w-10"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex flex-col flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col gap-8 items-start mb-auto">
            <NavLinks mobile onClick={onClose} scrollToSection={scrollToSection} />
          </div>
          
          <div className="flex flex-col gap-4 mt-8 pt-8 border-t">
            {user ? (
              <>
                <Button asChild variant="outline" className="w-full" size="sm">
                  <Link to="/dashboard" onClick={onClose}>Dashboard</Link>
                </Button>
                <Button onClick={handleSignOut} className="w-full" size="sm">
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
    </div>
  );
};

export default MobileMenu;
