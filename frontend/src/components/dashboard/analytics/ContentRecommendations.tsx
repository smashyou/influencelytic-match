import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sparkles,
  Hash,
  Clock,
  Video,
  Image,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Recommendation {
  type: 'content_type' | 'hashtags' | 'timing' | 'engagement' | 'strategy';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

const ContentRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [isMockData, setIsMockData] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [selectedPlatform]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/content/recommendations?platform=${selectedPlatform}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      setIsMockData(data.isMockData || false);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load content recommendations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'content_type':
        return <Video className="h-5 w-5" />;
      case 'hashtags':
        return <Hash className="h-5 w-5" />;
      case 'timing':
        return <Clock className="h-5 w-5" />;
      case 'engagement':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 dark:border-red-800';
      case 'medium':
        return 'border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'border-blue-200 dark:border-blue-800';
      default:
        return 'border-gray-200 dark:border-gray-700';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Generating AI recommendations...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            AI Content Recommendations
          </h2>
          <p className="text-muted-foreground">
            Personalized suggestions based on your best performing content
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={fetchRecommendations}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mock data alert */}
      {isMockData && (
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-amber-900 dark:text-amber-100">
                Showing sample recommendations. Connect your platforms and post content to get personalized AI recommendations.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 gap-4">
        {recommendations.map((rec, index) => (
          <Card
            key={index}
            className={`border-l-4 ${getPriorityBorderColor(rec.priority)}`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${getPriorityColor(rec.priority)}`}>
                  {getIcon(rec.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{rec.title}</h3>
                      <p className="text-muted-foreground text-sm">
                        {rec.description}
                      </p>
                    </div>
                    <Badge
                      className={`ml-4 ${getPriorityColor(rec.priority)} capitalize`}
                    >
                      {rec.priority} priority
                    </Badge>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="default">
                      Apply This
                    </Button>
                    <Button size="sm" variant="ghost">
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {recommendations.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No recommendations available yet
              </p>
              <p className="text-sm text-muted-foreground">
                Post more content to get AI-powered recommendations
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Tips Section */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Quick Optimization Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm">
              <span className="text-primary mt-0.5">•</span>
              <span>Post consistently at your optimal times (check timing recommendations above)</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="text-primary mt-0.5">•</span>
              <span>Use 5-10 relevant hashtags that your top posts have in common</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="text-primary mt-0.5">•</span>
              <span>Focus on content types that show the highest engagement rates</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="text-primary mt-0.5">•</span>
              <span>Respond to comments within the first hour to boost engagement</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="text-primary mt-0.5">•</span>
              <span>Analyze your top posts monthly and replicate successful patterns</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentRecommendations;
