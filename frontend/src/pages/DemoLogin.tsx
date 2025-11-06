import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Briefcase } from 'lucide-react';

const DemoLogin = () => {
  const navigate = useNavigate();

  const loginAsDemo = (type: 'influencer' | 'brand') => {
    // Create mock user data
    const mockUser = {
      id: `demo-${type}-${Date.now()}`,
      email: type === 'influencer' ? 'fitness@test.com' : 'nike@test.com',
      user_metadata: {
        first_name: type === 'influencer' ? 'Fitness' : 'Nike',
        last_name: type === 'influencer' ? 'Guru' : 'Brand',
        user_type: type
      }
    };

    const mockSession = {
      access_token: `demo-token-${Date.now()}`,
      refresh_token: `demo-refresh-${Date.now()}`,
      expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      user: mockUser
    };

    // Store in localStorage
    localStorage.setItem('demo-mode', 'true');
    localStorage.setItem('demo-user', JSON.stringify(mockUser));
    localStorage.setItem('demo-session', JSON.stringify(mockSession));
    localStorage.setItem('token', mockSession.access_token);

    // Navigate to dashboard
    const dashboardPath = type === 'brand' ? '/brand-dashboard' : '/dashboard';
    window.location.href = dashboardPath;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-2">
            🎭 Development Demo Access
          </CardTitle>
          <CardDescription className="text-lg">
            Skip authentication and access the dashboard directly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              <strong>Development Mode:</strong> This page bypasses authentication entirely.
              In production, users would need to sign up/login normally.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Influencer Demo */}
            <Card className="border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 transition-colors">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
                    <User className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Influencer Dashboard</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Access as: Fitness Guru
                    </p>
                  </div>
                  <Button
                    onClick={() => loginAsDemo('influencer')}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    Enter as Influencer
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    <p className="font-mono">fitness@test.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Brand Demo */}
            <Card className="border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 transition-colors">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                    <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Brand Dashboard</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Access as: Nike Brand
                    </p>
                  </div>
                  <Button
                    onClick={() => loginAsDemo('brand')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    Enter as Brand
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    <p className="font-mono">nike@test.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-semibold mb-3">What You'll Get Access To:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Post Performance Analysis</strong> - AI-powered insights into your best content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Content Recommendations</strong> - Personalized suggestions based on performance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Growth Tips</strong> - Dynamic strategies to grow your following</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Analytics Dashboard</strong> - Comprehensive metrics and insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Mock Data</strong> - Rich sample data showing all features</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoLogin;
