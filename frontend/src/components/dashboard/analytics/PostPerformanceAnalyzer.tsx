import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Calendar,
  Award,
  AlertCircle,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { apiService } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

interface PostPerformance {
  id: string;
  platform: string;
  content_type: string;
  posted_at: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views: number;
  engagement_rate: number;
  hashtags: string[];
  performance_score: number;
  insights: string[];
}

interface PerformanceInsights {
  average_engagement: string;
  top_hashtags: string[];
  best_content_type: string;
  total_analyzed: number;
}

const PostPerformanceAnalyzer = () => {
  const [bestPosts, setBestPosts] = useState<PostPerformance[]>([]);
  const [insights, setInsights] = useState<PerformanceInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [timeframe, setTimeframe] = useState('30');
  const [isMockData, setIsMockData] = useState(false);

  useEffect(() => {
    fetchBestPosts();
  }, [selectedPlatform, timeframe]);

  const fetchBestPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/content/best-posts?platform=${selectedPlatform}&timeframe=${timeframe}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      const data = await response.json();
      setBestPosts(data.posts || []);
      setInsights(data.insights || null);
      setIsMockData(data.isMockData || false);
    } catch (error) {
      console.error('Failed to fetch best posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load post performance data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 85) return { label: 'Excellent', variant: 'default' as const };
    if (score >= 70) return { label: 'Good', variant: 'secondary' as const };
    return { label: 'Average', variant: 'outline' as const };
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading post performance...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Post Performance Analysis
          </h2>
          <p className="text-muted-foreground">
            AI-powered insights into your best performing content
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mock data alert */}
      {isMockData && (
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-amber-900 dark:text-amber-100">
                Showing sample data. Connect your social media platforms to see real post performance.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Insights */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {insights.average_engagement}%
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Avg Engagement Rate
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {insights.total_analyzed}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Posts Analyzed
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-lg font-bold text-primary capitalize">
                  {insights.best_content_type}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Best Content Type
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-sm font-medium text-primary">
                  #{insights.top_hashtags[0]}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Top Hashtag
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Best Posts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Top Performing Posts
          </CardTitle>
          <CardDescription>
            Your best content from the selected timeframe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bestPosts.map((post, index) => (
              <Card key={post.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          #{index + 1}
                        </Badge>
                        <Badge variant="secondary" className="capitalize">
                          {post.content_type}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {post.platform}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={getPerformanceBadge(post.performance_score).variant}
                          className="mb-1"
                        >
                          {getPerformanceBadge(post.performance_score).label}
                        </Badge>
                        <div className={`text-2xl font-bold ${getPerformanceColor(post.performance_score)}`}>
                          {post.performance_score}
                          <span className="text-sm text-muted-foreground">/100</span>
                        </div>
                      </div>
                    </div>

                    {/* Engagement Metrics */}
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                      <div className="text-center">
                        <Eye className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                        <div className="font-semibold text-sm">
                          {formatNumber(post.views)}
                        </div>
                        <div className="text-xs text-muted-foreground">Views</div>
                      </div>

                      <div className="text-center">
                        <Heart className="h-4 w-4 text-red-500 mx-auto mb-1" />
                        <div className="font-semibold text-sm">
                          {formatNumber(post.likes)}
                        </div>
                        <div className="text-xs text-muted-foreground">Likes</div>
                      </div>

                      <div className="text-center">
                        <MessageCircle className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                        <div className="font-semibold text-sm">
                          {formatNumber(post.comments)}
                        </div>
                        <div className="text-xs text-muted-foreground">Comments</div>
                      </div>

                      <div className="text-center">
                        <Share2 className="h-4 w-4 text-green-500 mx-auto mb-1" />
                        <div className="font-semibold text-sm">
                          {formatNumber(post.shares)}
                        </div>
                        <div className="text-xs text-muted-foreground">Shares</div>
                      </div>

                      <div className="text-center">
                        <Bookmark className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                        <div className="font-semibold text-sm">
                          {formatNumber(post.saves)}
                        </div>
                        <div className="text-xs text-muted-foreground">Saves</div>
                      </div>

                      <div className="text-center">
                        <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1" />
                        <div className="font-semibold text-sm">
                          {post.engagement_rate.toFixed(2)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Engagement</div>
                      </div>
                    </div>

                    {/* Engagement Rate Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Engagement Rate</span>
                        <span className="font-medium">{post.engagement_rate.toFixed(2)}%</span>
                      </div>
                      <Progress value={Math.min(post.engagement_rate * 10, 100)} className="h-2" />
                    </div>

                    {/* AI Insights */}
                    {post.insights && post.insights.length > 0 && (
                      <div className="bg-primary/5 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">AI Insights</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {post.insights.map((insight, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {insight}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-muted-foreground mb-1">Hashtags</div>
                        <div className="flex flex-wrap gap-1">
                          {post.hashtags.map((tag, idx) => (
                            <span key={idx} className="text-xs text-blue-600 dark:text-blue-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.posted_at)}
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {bestPosts.length === 0 && (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No posts found for the selected filters
                </p>
                <Button variant="outline" className="mt-4" onClick={fetchBestPosts}>
                  Refresh Data
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostPerformanceAnalyzer;
