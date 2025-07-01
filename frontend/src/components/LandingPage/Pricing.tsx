
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, HelpCircle, Building, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const Pricing = () => {
  const [userType, setUserType] = useState<'influencer' | 'business'>('influencer');

  const influencerPlans = [
    {
      name: "Starter",
      description: "Perfect for influencers just getting started",
      price: 0,
      features: [
        "Connect up to 3 social accounts",
        "Basic audience analytics",
        "Up to 5 business connections per month",
        "Standard AI matching algorithm",
        "Community support"
      ],
      isPopular: false,
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
    },
    {
      name: "Pro",
      description: "For growing influencers seeking more opportunities",
      price: 29,
      features: [
        "Connect unlimited social accounts",
        "Advanced audience analytics",
        "Unlimited business connections",
        "Premium AI matching algorithm",
        "Fake follower detection",
        "Priority support",
        "Campaign performance tracking"
      ],
      isPopular: true,
      buttonText: "Start Free Trial",
      buttonVariant: "default" as const,
    },
    {
      name: "Premium",
      description: "For established influencers who want maximum exposure",
      price: 79,
      features: [
        "All Pro features",
        "First access to exclusive campaigns",
        "Brand relationship manager",
        "Personalized growth strategy",
        "Content performance analytics",
        "Dedicated support team",
        "Early access to new features"
      ],
      isPopular: false,
      buttonText: "Get Premium",
      buttonVariant: "outline" as const,
    }
  ];

  const businessPlans = [
    {
      name: "Basic",
      description: "For small businesses starting with influencer marketing",
      price: 49,
      features: [
        "Connect with up to 5 influencers",
        "Basic campaign analytics",
        "AI matching algorithm",
        "Campaign template library",
        "Community support"
      ],
      isPopular: false,
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
    },
    {
      name: "Business",
      description: "For businesses looking to find the perfect influencers",
      price: 99,
      features: [
        "Connect with unlimited influencers",
        "Advanced influencer search",
        "Campaign management tools",
        "ROI analytics dashboard",
        "Multiple team members",
        "Dedicated account manager",
        "API access"
      ],
      isPopular: true,
      buttonText: "Start Free Trial",
      buttonVariant: "default" as const,
    },
    {
      name: "Enterprise",
      description: "Custom solution for large brands and agencies",
      price: 299,
      features: [
        "All Business features",
        "Custom contracts",
        "White-label solution",
        "Advanced reporting & analytics",
        "Multiple brand management",
        "Custom integrations",
        "Executive strategy sessions",
        "24/7 priority support"
      ],
      isPopular: false,
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
    }
  ];

  const activePlans = userType === 'influencer' ? influencerPlans : businessPlans;

  return (
    <div id="pricing" className="py-24 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="heading-2 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Choose the plan that best fits your needs. All plans include AI matching and secure payments.
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-10">
            <ToggleGroup 
              type="single" 
              value={userType}
              onValueChange={(value) => value && setUserType(value as 'influencer' | 'business')}
              className="border rounded-lg p-1"
            >
              <ToggleGroupItem value="influencer" className="flex items-center gap-2 px-4">
                <User className="h-4 w-4" />
                <span>Influencers</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="business" className="flex items-center gap-2 px-4">
                <Building className="h-4 w-4" />
                <span>Businesses</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {activePlans.map((plan, index) => (
            <Card key={index} className={`relative overflow-hidden p-6 flex flex-col h-full ${plan.isPopular ? 'border-primary shadow-md' : ''}`}>
              {plan.isPopular && (
                <div className="absolute top-0 right-0 -m-1">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                <div className="flex items-baseline mb-2">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button asChild variant={plan.buttonVariant} className="w-full mt-auto">
                <Link to="/signup">{plan.buttonText}</Link>
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto bg-card border rounded-lg p-6 shadow-subtle">
          <div className="flex items-start gap-4">
            <HelpCircle className="h-6 w-6 text-primary mt-1 shrink-0" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Need a custom plan?</h3>
              <p className="text-muted-foreground mb-4">
                We offer custom enterprise solutions for large businesses and agencies. Contact our sales team to discuss your specific needs.
              </p>
              <Button asChild variant="outline">
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
