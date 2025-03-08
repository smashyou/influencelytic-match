
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/layout/AuthLayout';
import { Facebook, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const SignIn = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Will implement actual authentication in future updates
    console.log('Sign in form submitted');
  };

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your account to continue"
      showSignUp={true}
    >
      <div className="space-y-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              required
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              required
              className="h-12"
            />
          </div>
        </div>
        
        <Button type="submit" className="w-full h-12 button-hover-effect">
          Sign In
        </Button>
        
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-12">
            <Facebook className="mr-2 h-5 w-5" />
            Facebook
          </Button>
          <Button variant="outline" className="h-12">
            <Mail className="mr-2 h-5 w-5" />
            Google
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignIn;
