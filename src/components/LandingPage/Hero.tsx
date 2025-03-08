
import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      
      const glowElems = containerRef.current.querySelectorAll('.glow-effect');
      glowElems.forEach((elem) => {
        const el = elem as HTMLElement;
        el.style.setProperty('--mouse-x', x.toString());
        el.style.setProperty('--mouse-y', y.toString());
      });
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/30 pointer-events-none" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50 pointer-events-none" />
      
      {/* Animated dot grid - subtle background element */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-[0.03] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]">
          <div className="absolute h-[200%] w-[200%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-primary animate-pulse-light"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 4 + 1}px`,
                  height: `${Math.random() * 4 + 1}px`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${Math.random() * 10 + 5}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pt-32 pb-24 md:pt-40 md:pb-32 relative">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Eyebrow text with subtle animation */}
          <div className="inline-block animate-fade-in mb-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              AI-Powered Influencer Marketplace
            </span>
          </div>
          
          {/* Main heading with animated gradient and staggered reveal */}
          <h1 className="heading-1 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <span className="block">Connect Brands with</span>
            <span className="animated-gradient-text">Perfect Influencers</span>
          </h1>
          
          {/* Subtitle with staggered animation */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Leverage AI to match brands with influencers based on audience demographics, 
            detect fake followers, and optimize pricing for successful partnerships.
          </p>
          
          {/* CTA buttons with hover effects */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button asChild size="lg" className="button-hover-effect">
              <Link to="/signup">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="button-hover-effect">
              <Link to="/#features">See How It Works</Link>
            </Button>
          </div>
          
          {/* Trust badges */}
          <div className="mt-16 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <p className="text-sm text-muted-foreground mb-4">Trusted by top brands and influencers</p>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 w-24 rounded-md bg-muted/50 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Abstract shape decorations */}
      <div className="absolute top-1/4 -left-64 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" 
           style={{ animationDelay: '0s' }} />
      <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" 
           style={{ animationDelay: '2s' }} />
    </div>
  );
};

export default Hero;
