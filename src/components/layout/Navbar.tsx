
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
    'fixed w-full z-50 transition-all duration-300 py-4 px-6',
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

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2"
        >
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            influencelytic
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <NavLinks scrollToSection={scrollToSection} />
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button asChild variant="ghost" className="button-hover-effect">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button onClick={handleSignOut} variant="outline" className="button-hover-effect">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="button-hover-effect">
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button asChild className="button-hover-effect">
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="flex md:hidden p-2"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "fixed inset-0 bg-background flex flex-col pt-24 px-6 z-40 transition-transform duration-300 ease-in-out md:hidden",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col gap-6 items-start">
          <NavLinks mobile onClick={() => setIsOpen(false)} scrollToSection={scrollToSection} />
        </div>
        <div className="flex flex-col gap-4 mt-6">
          {user ? (
            <>
              <Button asChild variant="outline" className="w-full">
                <Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
              </Button>
              <Button onClick={() => { handleSignOut(); setIsOpen(false); }} className="w-full">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" className="w-full">
                <Link to="/signin" onClick={() => setIsOpen(false)}>Sign In</Link>
              </Button>
              <Button asChild className="w-full">
                <Link to="/signup" onClick={() => setIsOpen(false)}>Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

interface NavLinksProps {
  mobile?: boolean;
  onClick?: () => void;
  scrollToSection?: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}

const NavLinks = ({ mobile = false, onClick = () => {}, scrollToSection }: NavLinksProps) => {
  const linkClass = cn(
    "transition-colors duration-200 hover:text-primary",
    mobile ? "text-xl py-2" : "text-sm font-medium"
  );

  return (
    <>
      <a 
        href="#features" 
        className={linkClass} 
        onClick={(e) => {
          if (scrollToSection) scrollToSection(e, 'features');
          onClick();
        }}
      >
        Features
      </a>
      <a 
        href="#pricing" 
        className={linkClass} 
        onClick={(e) => {
          if (scrollToSection) scrollToSection(e, 'pricing');
          onClick();
        }}
      >
        Pricing
      </a>
      <a 
        href="#how-it-works" 
        className={linkClass} 
        onClick={(e) => {
          if (scrollToSection) scrollToSection(e, 'how-it-works');
          onClick();
        }}
      >
        How It Works
      </a>
      <a 
        href="#contact" 
        className={linkClass} 
        onClick={(e) => {
          if (scrollToSection) scrollToSection(e, 'contact');
          onClick();
        }}
      >
        Contact
      </a>
    </>
  );
};

export default Navbar;
