import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Linkedin, Facebook, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary/50 border-t">
      <div className="container mx-auto py-12 md:py-16 px-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                influencelytic
              </span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-md">
              AI-powered platform connecting influencers and brands for authentic collaborations.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="#" icon={<Instagram size={18} />} label="Instagram" />
              <SocialLink href="#" icon={<Facebook size={18} />} label="Facebook" />
              <SocialLink href="#" icon={<Twitter size={18} />} label="Twitter" />
              <SocialLink href="#" icon={<Linkedin size={18} />} label="LinkedIn" />
              <SocialLink href="#" icon={<Youtube size={18} />} label="YouTube" />
            </div>
          </div>

          <div className="col-span-1">
            <h3 className="font-semibold mb-3">Company</h3>
            <FooterLinks
              links={[
                { label: 'About', href: '/about' },
                { label: 'Careers', href: '/careers' },
                { label: 'Blog', href: '/blog' },
                { label: 'Press', href: '/press' },
              ]}
            />
          </div>

          <div className="col-span-1">
            <h3 className="font-semibold mb-3">Product</h3>
            <FooterLinks
              links={[
                { label: 'Features', href: '/#features' },
                { label: 'Pricing', href: '/#pricing' },
                { label: 'Testimonials', href: '/#testimonials' },
                { label: 'FAQ', href: '/faq' },
              ]}
            />
          </div>

          <div className="col-span-1">
            <h3 className="font-semibold mb-3">Resources</h3>
            <FooterLinks
              links={[
                { label: 'Documentation', href: '/docs' },
                { label: 'Help Center', href: '/help' },
                { label: 'API', href: '/api' },
                { label: 'Status', href: '/status' },
              ]}
            />
          </div>

          <div className="col-span-1">
            <h3 className="font-semibold mb-3">Legal</h3>
            <FooterLinks
              links={[
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
                { label: 'Security', href: '/security' },
                { label: 'Cookies', href: '/cookies' },
              ]}
            />
          </div>
        </div>

        <div className="border-t mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {new Date().getFullYear()} influencelytic. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLinks = ({ links }: { links: { label: string; href: string }[] }) => {
  return (
    <nav className="flex flex-col space-y-2">
      {links.map((link) => (
        <Link
          to={link.href}
          key={link.label}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

const SocialLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => {
  return (
    <a
      href={href}
      aria-label={label}
      className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
    >
      {icon}
    </a>
  );
};

export default Footer;
