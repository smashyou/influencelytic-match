
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuthLayout from '@/components/layout/AuthLayout';
import { Facebook, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const SignUp = () => {
  const [userType, setUserType] = useState('influencer');
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Will implement actual registration in future updates
    console.log('Sign up form submitted');
  };

  return (
    <AuthLayout
      title="Create an account"
      description="Choose your account type to get started"
      showSignIn={true}
    >
      <Tabs defaultValue="influencer" className="w-full" onValueChange={setUserType}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="influencer">Influencer</TabsTrigger>
          <TabsTrigger value="brand">Brand</TabsTrigger>
        </TabsList>
        
        <TabsContent value="influencer" className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First name</Label>
                <Input id="first-name" required className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input id="last-name" required className="h-12" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-influencer">Email</Label>
              <Input id="email-influencer" type="email" required className="h-12" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password-influencer">Password</Label>
              <Input id="password-influencer" type="password" required className="h-12" />
            </div>
            
            <Button type="submit" className="w-full h-12 button-hover-effect">
              Create Influencer Account
            </Button>
          </form>
          
          <div className="relative my-6">
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
        </TabsContent>
        
        <TabsContent value="brand" className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company name</Label>
              <Input id="company-name" required className="h-12" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-brand">Work email</Label>
              <Input id="email-brand" type="email" required className="h-12" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password-brand">Password</Label>
              <Input id="password-brand" type="password" required className="h-12" />
            </div>
            
            <Button type="submit" className="w-full h-12 button-hover-effect">
              Create Brand Account
            </Button>
          </form>
          
          <div className="relative my-6">
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
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 text-center text-xs text-muted-foreground">
        By clicking continue, you agree to our{' '}
        <Link to="/terms" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="/privacy" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </Link>
        .
      </div>
    </AuthLayout>
  );
};

export default SignUp;
