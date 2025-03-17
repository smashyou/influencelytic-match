
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import NavLinks from './NavLinks';
import { User } from '@supabase/supabase-js';
import { X } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  user: User | null;
  onSignOut: () => Promise<void>;
  scrollToSection: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, user, onSignOut, scrollToSection, onClose }: MobileMenuProps) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
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
          "fixed top-0 right-0 h-full w-[280px] bg-background border-l shadow-lg p-4 transition-transform duration-300 ease-in-out overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex justify-end mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="h-8 w-8"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-col h-[calc(100%-40px)]">
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
    </div>
  );
};

export default MobileMenu;
