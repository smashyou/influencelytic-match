import React, { useRef, useEffect, useState } from "react";
import { ArrowDown, Users, Briefcase } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [userType, setUserType] = useState<"influencer" | "brand">(
    "influencer"
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-up");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll(".reveal");
      elements.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, []);

  const influencerSteps = [
    {
      title: "Connect Social Accounts",
      description:
        "Influencers securely connect their social media accounts with OAuth for data analysis.",
      color: "from-blue-500 to-cyan-400",
      delay: 0,
    },
    {
      title: "AI Analyzes Your Audience",
      description:
        "Our AI examines audience demographics, engagement patterns, and authenticity of followers.",
      color: "from-indigo-500 to-violet-500",
      delay: 100,
    },
    {
      title: "Match with Businesses",
      description:
        "Get matched with businesses looking for your exact audience profile and content style.",
      color: "from-purple-500 to-pink-500",
      delay: 200,
    },
    {
      title: "Collaborate & Get Paid",
      description:
        "Accept offers, create content, and receive secure payments through our platform.",
      color: "from-rose-500 to-orange-500",
      delay: 300,
    },
  ];

  const brandSteps = [
    {
      title: "Define Your Target Audience",
      description:
        "Specify the demographics, interests, and engagement metrics you're looking for in an influencer's audience.",
      color: "from-emerald-500 to-teal-400",
      delay: 0,
    },
    {
      title: "AI Matches Perfect Influencers",
      description:
        "Our algorithm finds verified influencers with authentic followers that match your target audience criteria.",
      color: "from-cyan-500 to-blue-500",
      delay: 100,
    },
    {
      title: "Review Analytics & Proposals",
      description:
        "Examine detailed analytics about each influencer's audience and review campaign proposals.",
      color: "from-blue-500 to-indigo-500",
      delay: 200,
    },
    {
      title: "Manage Campaigns & Track ROI",
      description:
        "Launch campaigns, approve content, and measure performance with real-time analytics and reporting.",
      color: "from-violet-500 to-purple-500",
      delay: 300,
    },
  ];

  const steps = userType === "influencer" ? influencerSteps : brandSteps;

  return (
    <div
      ref={containerRef}
      id="how-it-works"
      className="py-24 md:py-32 bg-background"
    >
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-8 reveal">
          <h2 className="heading-2 mb-4">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our platform makes influencer marketing simple, transparent, and
            effective.
          </p>

          {/* Toggle between Influencer and Brand views */}
          <Tabs
            defaultValue="influencer"
            className="w-full max-w-md mx-auto"
            onValueChange={(value) =>
              setUserType(value as "influencer" | "brand")
            }
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger
                value="influencer"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                <span>For Influencers</span>
              </TabsTrigger>
              <TabsTrigger value="brand" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>For Businesses</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-1/2 md:-ml-0.5 w-1 h-full bg-border" />

          <div className="space-y-12 relative">
            {steps.map((step, index) => (
              <div
                key={`${userType}-step-${index}`}
                className="reveal"
                style={{ animationDelay: `${step.delay}ms` }}
              >
                <TimelineStep
                  title={step.title}
                  description={step.description}
                  index={index + 1}
                  isLeft={index % 2 === 0}
                  color={step.color}
                  isLast={index === steps.length - 1}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface TimelineStepProps {
  title: string;
  description: string;
  index: number;
  isLeft: boolean;
  color: string;
  isLast: boolean;
}

const TimelineStep = ({
  title,
  description,
  index,
  isLeft,
  color,
  isLast,
}: TimelineStepProps) => {
  return (
    <div
      className={`flex items-center ${
        isLeft ? "md:flex-row" : "md:flex-row-reverse"
      } flex-col`}
    >
      {/* Mobile dot */}
      <div className="md:hidden absolute left-4 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r bg-background border-4 border-muted z-10">
        <span className="text-sm font-bold">{index}</span>
      </div>

      {/* Desktop content */}
      <div className="ml-12 md:ml-0 md:w-1/2 pt-1 md:pt-0 md:px-8">
        <div
          className={`bg-white dark:bg-card shadow-subtle rounded-xl p-6 border ${
            isLeft ? "md:mr-4" : "md:ml-4"
          }`}
        >
          <div
            className={`text-sm font-semibold mb-2 bg-gradient-to-r ${color} bg-clip-text text-transparent`}
          >
            Step {index}
          </div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Desktop dot */}
      <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full items-center justify-center bg-background border-4 border-muted z-10">
        <span
          className={`text-base font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}
        >
          {index}
        </span>
      </div>

      {/* Mobile content */}
      <div className="md:w-1/2 md:px-8 hidden"></div>

      {/* Arrow down */}
      {!isLast && (
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 mt-20 z-10">
          <ArrowDown className="text-muted-foreground animate-bounce" />
        </div>
      )}
    </div>
  );
};

export default HowItWorks;
