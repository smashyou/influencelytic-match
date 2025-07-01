import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  LineChart,
  Sparkles,
  ShieldCheck,
  BarChartHorizontalIcon,
  Network,
  Link,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const Features = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const featureRefs = Array(4)
    .fill(0)
    .map(() => useRef<HTMLDivElement>(null));

  const features = [
    {
      title: "AI-Powered Matching",
      description:
        "Our intelligent algorithm matches businesses with the perfect influencers based on audience demographics, engagement rates, and content style.",
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    },
    {
      title: "Fraud Detection",
      description:
        "Detect fake followers and engagement with our sophisticated AI tools to ensure authentic partnerships and maximize ROI.",
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      image:
        "https://images.unsplash.com/photo-1589561084283-930aa7b1ce50?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80",
    },
    {
      title: "Performance Analytics",
      description:
        "Track campaign performance with real-time analytics and insights to understand ROI and optimize future collaborations.",
      icon: <BarChart className="h-6 w-6 text-primary" />,
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    },
    {
      title: "Social Media Integration",
      description:
        "Seamlessly connect all major social platforms to analyze engagement, audience demographics, and content performance.",
      icon: <Network className="h-6 w-6 text-primary" />,
      image:
        "https://images.unsplash.com/photo-1554177255-61502b352de3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    },
  ];

  const scrollToFeature = (index: number) => {
    setActiveFeature(index);
    featureRefs[index].current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <div id="features" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background elements - reduced opacity and adjusted background */}
      <div className="absolute inset-0 bg-secondary/20" />
      <div className="absolute inset-0 backdrop-blur-[50px]" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="heading-2 mb-4 text-foreground font-bold">
            Powered by{" "}
            <span className="animated-gradient-text font-bold">
              Advanced AI
            </span>
          </h2>
          <p className="text-lg text-foreground">
            Our platform combines cutting-edge AI technology with deep industry
            expertise to create perfect matches between businesses and
            influencers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Feature list */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} ref={featureRefs[index]} className="relative">
                <Card
                  className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-md ${
                    activeFeature === index
                      ? "border-primary shadow-md bg-background"
                      : "bg-background shadow-sm"
                  }`}
                  onClick={() => scrollToFeature(index)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-lg p-2 ${
                        activeFeature === index
                          ? "bg-primary/10"
                          : "bg-secondary"
                      }`}
                    >
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
                {activeFeature === index && (
                  <div className="absolute left-0 top-1/2 w-1 h-12 bg-primary -translate-y-1/2 rounded-r-full" />
                )}
              </div>
            ))}
          </div>

          {/* Feature image/preview */}
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-elevated">
            <img
              src={features[activeFeature].image}
              alt={features[activeFeature].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium mb-2 inline-block">
                {features[activeFeature].title}
              </span>
              <h3 className="text-white text-xl md:text-2xl font-semibold">
                {features[activeFeature].title === "AI-Powered Matching"
                  ? "Find the perfect match for your business"
                  : features[activeFeature].title === "Fraud Detection"
                  ? "Ensure authentic partnerships"
                  : features[activeFeature].title === "Performance Analytics"
                  ? "Track and optimize your campaigns"
                  : "Connect all your social profiles"}
              </h3>
            </div>
          </div>
        </div>

        {/* Additional feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <FeatureHighlight
            icon={<Users className="h-8 w-8" />}
            title="For Influencers"
            description="Connect your social accounts, get discovered by businesses, and receive fair compensation for your content."
          />
          <FeatureHighlight
            icon={<BarChartHorizontalIcon className="h-8 w-8" />}
            title="For Businesses"
            description="Find authenticated influencers whose audience matches your target demographics and track campaign ROI."
          />
          <FeatureHighlight
            icon={<Link className="h-8 w-8" />}
            title="Easy Integration"
            description="Connect all major social platforms in minutes with our secure OAuth integration."
          />
        </div>
      </div>
    </div>
  );
};

const FeatureHighlight = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <Card className="p-6 text-center h-full bg-background shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-4 bg-muted rounded-full inline-flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  );
};

export default Features;
