
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

const FakeDetectionTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          Fake Follower Detection
        </CardTitle>
        <CardDescription>
          AI-powered analysis of your follower authenticity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-emerald-50 dark:bg-emerald-950/20">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Overall Authenticity Score</h4>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">93%</div>
              <p className="text-xs text-muted-foreground mt-1">Excellent score - well above average</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Suspected Fake Followers</h4>
              <div className="text-3xl font-bold">7%</div>
              <p className="text-xs text-muted-foreground mt-1">Industry average: 12%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Bot Activity Score</h4>
              <div className="text-3xl font-bold">Low</div>
              <p className="text-xs text-muted-foreground mt-1">Minimal suspicious activity detected</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Platform Breakdown</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Instagram</span>
                  <span className="text-sm font-medium">95% Authentic</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '95%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">YouTube</span>
                  <span className="text-sm font-medium">92% Authentic</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">TikTok</span>
                  <span className="text-sm font-medium">88% Authentic</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-medium mb-2">AI-Powered Authenticity Insights:</h4>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span>•</span> 
                <span className="text-sm text-muted-foreground">Your overall follower authenticity is excellent at 93%, above the industry average of 88%</span>
              </li>
              <li className="flex gap-2">
                <span>•</span> 
                <span className="text-sm text-muted-foreground">TikTok has slightly more suspicious accounts than your other platforms, but still within normal range</span>
              </li>
              <li className="flex gap-2">
                <span>•</span> 
                <span className="text-sm text-muted-foreground">Your engagement to follower ratio confirms genuine audience interest in your content</span>
              </li>
              <li className="flex gap-2">
                <span>•</span> 
                <span className="text-sm text-muted-foreground">Natural follower growth patterns suggest organic reach rather than artificial inflation</span>
              </li>
            </ul>
          </div>

          <div className="bg-primary/5 p-4 rounded-md border border-primary/20">
            <h4 className="font-medium text-primary mb-2">Why This Matters to Businesses:</h4>
            <p className="text-sm text-muted-foreground">
              Brands value authentic audiences that drive real engagement and conversions. Your high authenticity score makes you more attractive for partnerships and typically results in higher collaboration rates. We highlight this score to potential business partners to showcase your genuine influence.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FakeDetectionTab;
