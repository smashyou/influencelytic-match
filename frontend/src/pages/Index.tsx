
import React, { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/LandingPage/Hero';
import Features from '@/components/LandingPage/Features';
import HowItWorks from '@/components/LandingPage/HowItWorks';
import Pricing from '@/components/LandingPage/Pricing';
import Testimonials from '@/components/LandingPage/Testimonials';
import CTA from '@/components/LandingPage/CTA';

const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar transparent={true} />
      <main className="flex-grow">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
