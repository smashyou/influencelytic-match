
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const [autoplay, setAutoplay] = useState(true);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Fashion Influencer, 500K+ followers",
      content: "This platform has completely transformed how I approach brand collaborations. The AI matching helps me find brands that align perfectly with my audience, and I've increased my earnings by 40% in just three months.",
      avatar: "https://i.pravatar.cc/150?img=32",
      rating: 5,
    },
    {
      name: "David Chen",
      role: "Marketing Director at StyleBrand",
      content: "We've tried several influencer platforms, but none provided the level of audience insights and fraud detection that this one does. We've seen a 3x ROI on our campaigns since switching.",
      avatar: "https://i.pravatar.cc/150?img=12",
      rating: 5,
    },
    {
      name: "Emma Wilson",
      role: "Travel Content Creator, 250K+ followers",
      content: "The pricing suggestions are spot-on. I was undercharging for years, and now I have data-backed rates that brands understand and respect. Plus, getting paid through the platform is always on time.",
      avatar: "https://i.pravatar.cc/150?img=29",
      rating: 4,
    },
    {
      name: "Marcus Taylor",
      role: "CEO of FitLife Products",
      content: "The fake follower detection feature alone is worth the subscription. We've avoided potentially wasteful partnerships and focused our budget on authentic influencers who deliver real results.",
      avatar: "https://i.pravatar.cc/150?img=13",
      rating: 5,
    },
  ];

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
    setAutoplay(false);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setAutoplay(false);
  };

  useEffect(() => {
    if (!autoplay) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoplay, testimonials.length]);

  return (
    <div id="testimonials" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="heading-2 mb-4">
            Loved by Influencers and Brands
          </h2>
          <p className="text-lg text-muted-foreground">
            See what our users are saying about the platform.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div ref={testimonialsRef} className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out" 
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <Card className="p-8 h-full">
                    <div className="flex items-center mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i}
                          className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`}
                        />
                      ))}
                    </div>
                    <p className="text-lg mb-6 italic">"{testimonial.content}"</p>
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback>{testimonial.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation controls */}
          <div className="flex justify-center mt-8 gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={prevTestimonial}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveIndex(index);
                    setAutoplay(false);
                  }}
                  className={`h-2.5 rounded-full transition-all ${activeIndex === index ? 'w-8 bg-primary' : 'w-2.5 bg-muted'}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={nextTestimonial}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
