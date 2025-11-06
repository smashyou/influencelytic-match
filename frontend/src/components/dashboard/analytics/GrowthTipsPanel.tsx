import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  Target,
  Users,
  Zap,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Rocket,
  BarChart3,
  MessageCircle
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface GrowthTip {
  category: 'consistency' | 'engagement' | 'content' | 'growth' | 'optimization';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

const GrowthTipsPanel = () => {
  const [tips, setTips] = useState<GrowthTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMockData, setIsMockData] = useState(false);

  useEffect(() => {
    fetchGrowthTips();
  }, []);

  const fetchGrowthTips = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/content/growth-tips', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      const data = await response.json();
      setTips(data.tips || []);
      setIsMockData(data.isMockData || false);
    } catch (error) {
      console.error('Failed to fetch growth tips:', error);
      toast({
        title: 'Error',
        description: 'Failed to load growth tips',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'consistency':
        return <Target className="h-5 w-5" />;
      case 'engagement':
        return <MessageCircle className="h-5 w-5" />;
      case 'content':
        return <BarChart3 className="h-5 w-5" />;
      case 'growth':
        return <TrendingUp className="h-5 w-5" />;
      case 'optimization':
        return <Zap className="h-5 w-5" />;
      default:
        return <Rocket className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'consistency':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200';
      case 'engagement':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200';
      case 'content':
        return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200';
      case 'growth':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200';
      case 'optimization':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return { label: 'High Impact', className: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200' };
      case 'medium':
        return { label: 'Medium Impact', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200' };
      case 'low':
        return { label: 'Low Impact', className: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' };
      default:
        return { label: 'Impact', className: 'bg-gray-100 text-gray-800' };
    }
  };

  const getImpactProgress = (impact: string) => {
    switch (impact) {
      case 'high':
        return 90;
      case 'medium':
        return 60;
      case 'low':
        return 30;
      default:
        return 50;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <Rocket className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Analyzing your growth potential...</p>
        </CardContent>
      </Card>
    );
  }

  const highImpactTips = tips.filter(tip => tip.impact === 'high');
  const otherTips = tips.filter(tip => tip.impact !== 'high');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            Growth Tips & Strategies
          </h2>
          <p className="text-muted-foreground">
            Personalized recommendations to accelerate your growth
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchGrowthTips}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Tips
        </Button>
      </div>

      {/* Mock data alert */}
      {isMockData && (
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-amber-900 dark:text-amber-100">
                Showing example growth strategies. Connect your platforms to get personalized tips based on your actual performance.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* High Impact Tips */}
      {highImpactTips.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-red-500" />
            High Priority Actions
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {highImpactTips.map((tip, index) => (
              <Card
                key={index}
                className="border-l-4 border-red-500 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/20"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${getCategoryColor(tip.category)}`}>
                      {getCategoryIcon(tip.category)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-lg">{tip.title}</h4>
                            <Badge className="capitalize">
                              {tip.category}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mb-3">
                            {tip.description}
                          </p>
                        </div>
                      </div>

                      {/* Impact Indicator */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Potential Impact</span>
                          <Badge className={getImpactBadge(tip.impact).className}>
                            {getImpactBadge(tip.impact).label}
                          </Badge>
                        </div>
                        <Progress value={getImpactProgress(tip.impact)} className="h-2" />
                      </div>

                      {tip.actionable && (
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-red-600 hover:bg-red-700">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Take Action
                          </Button>
                          <Button size="sm" variant="ghost">
                            <ArrowRight className="h-4 w-4 mr-1" />
                            Learn How
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Other Tips */}
      {otherTips.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Additional Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherTips.map((tip, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(tip.category)}`}>
                      {getCategoryIcon(tip.category)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{tip.title}</h4>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">
                        {tip.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getImpactBadge(tip.impact).className}`}
                        >
                          {getImpactBadge(tip.impact).label}
                        </Badge>
                        {tip.actionable && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs">
                            View Details
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tips.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Rocket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">
              No growth tips available yet
            </p>
            <p className="text-sm text-muted-foreground">
              Connect your platforms and post content to get personalized growth strategies
            </p>
          </CardContent>
        </Card>
      )}

      {/* Growth Scorecard */}
      <Card className="bg-gradient-to-br from-primary/5 to-purple/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Your Growth Potential
          </CardTitle>
          <CardDescription>
            Based on your current performance and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {highImpactTips.length}
              </div>
              <div className="text-sm text-muted-foreground">
                High Priority Actions
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {tips.filter(t => t.actionable).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Actionable Tips
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {tips.length > 0 ? '75%' : '0%'}
              </div>
              <div className="text-sm text-muted-foreground">
                Growth Potential
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GrowthTipsPanel;
