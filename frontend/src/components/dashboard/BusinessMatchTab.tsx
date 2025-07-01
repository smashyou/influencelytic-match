
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Info, Star, Sparkles, Zap, PieChart, DollarSign } from 'lucide-react';

// Mock data for AI-suggested business matches
const MOCK_BUSINESS_MATCHES = [
  {
    id: 1,
    name: "SportFit Athletic Wear",
    matchScore: 95,
    description: "Luxury athletic wear brand looking for fitness influencers with an engaged audience.",
    category: "Fitness",
    estimatedValue: "$2,000-$3,500",
    preferredPlatforms: ["instagram", "tiktok"],
    matchReasons: [
      "Your fitness content aligns with their brand image",
      "Your audience demographics match their target market",
      "Your engagement rate is above their minimum threshold",
      "You've had success with similar brands in the past"
    ]
  },
  {
    id: 2,
    name: "NutriBlend Supplements",
    matchScore: 88,
    description: "Organic supplements brand seeking fitness and wellness creators for long-term partnerships.",
    category: "Health & Wellness",
    estimatedValue: "$1,500-$2,800",
    preferredPlatforms: ["instagram", "youtube"],
    matchReasons: [
      "Your content focuses on health and fitness",
      "Your audience is interested in wellness products",
      "You have history promoting similar products with good conversion"
    ]
  },
  {
    id: 3,
    name: "TechGadget Pro",
    matchScore: 72,
    description: "Innovative tech accessories company looking for lifestyle creators to showcase their products.",
    category: "Technology",
    estimatedValue: "$800-$1,200",
    preferredPlatforms: ["youtube", "instagram"],
    matchReasons: [
      "You occasionally feature tech products in your content",
      "A segment of your audience aligns with their target market",
      "Your production quality meets their standards"
    ]
  },
];

const BusinessMatchTab = () => {
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-500";
    if (score >= 70) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI-Powered Business Matches
              </CardTitle>
              <CardDescription>
                Personalized brand partnership suggestions based on your content and audience
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 text-xs bg-muted p-2 rounded-md">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span>Updated daily based on AI analysis</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {MOCK_BUSINESS_MATCHES.map(business => (
              <Card key={business.id} className="overflow-hidden border border-muted">
                <div className="p-4">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{business.name}</h3>
                      <p className="text-sm text-muted-foreground">{business.description}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className={`text-2xl font-bold ${getMatchScoreColor(business.matchScore)}`}>
                        {business.matchScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">Match Score</div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Match Strength</span>
                      <span className={getMatchScoreColor(business.matchScore)}>{business.matchScore}% compatible</span>
                    </div>
                    <Progress value={business.matchScore} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <PieChart className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Category: </span>
                      <Badge variant="outline" className="bg-primary/10">
                        {business.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">AI-Estimated Value: </span>
                      <span className="font-medium text-green-600">{business.estimatedValue}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Why This Matches You:
                    </div>
                    <ul className="list-disc list-inside text-sm space-y-1 pl-1">
                      {business.matchReasons.map((reason, index) => (
                        <li key={index} className="text-muted-foreground">{reason}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button>Contact Business</Button>
                    <Button variant="outline">View Details</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessMatchTab;
