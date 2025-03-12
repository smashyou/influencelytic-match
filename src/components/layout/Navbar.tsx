
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import NavLinks from './navbar/NavLinks';
import MobileMenu from './navbar/MobileMenu';
import DesktopMenu from './navbar/DesktopMenu';
import Logo from './navbar/Logo';

interface NavbarProps {
  transparent?: boolean;
}

const Navbar = ({ transparent = false }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navbarClasses = cn(
    'fixed w-full z-50 transition-all duration-300 py-3 md:py-4 px-4 md:px-6',
    scrolled || !transparent 
      ? 'bg-background/80 backdrop-blur-md border-b shadow-subtle' 
      : 'bg-transparent'
  );

  const handleSignOut = async () => {
    await signOut();
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  // When the menu is open, prevent scrolling of the body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto flex items-center justify-between">
        <Logo />

        {/* Desktop Menu */}
        <DesktopMenu 
          user={user} 
          signOut={handleSignOut} 
          scrollToSection={scrollToSection} 
        />

        {/* Mobile Menu Button */}
        <button 
          className="flex md:hidden p-2"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isOpen} 
        user={user} 
        onSignOut={handleSignOut}
        scrollToSection={scrollToSection}
        onClose={() => setIsOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
