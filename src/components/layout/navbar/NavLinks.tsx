
import React from 'react';
import { cn } from '@/lib/utils';

interface NavLinksProps {
  mobile?: boolean;
  onClick?: () => void;
  scrollToSection?: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}

const NavLinks = ({ mobile = false, onClick = () => {}, scrollToSection }: NavLinksProps) => {
  const linkClass = cn(
    "transition-colors duration-200 hover:text-primary",
    mobile ? "text-lg md:text-xl py-2" : "text-xs md:text-sm font-medium"
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

export default NavLinks;
