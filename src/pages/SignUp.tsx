
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuthLayout from '@/components/layout/AuthLayout';
import { Facebook, Mail } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const SignUp = () => {
  const [userType, setUserType] = useState('influencer');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, user } = useAuth();
  const { toast } = useToast();
  
  // Influencer form state
  const [influencerData, setInfluencerData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  
  // Brand form state
  const [brandData, setBrandData] = useState({
    companyName: '',
    email: '',
    password: '',
  });

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const handleInfluencerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signUp(
        influencerData.email, 
        influencerData.password,
        {
          first_name: influencerData.firstName,
          last_name: influencerData.lastName,
          user_type: 'influencer',
        }
      );
      
      if (error) {
        toast({
          title: "Error signing up",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration successful",
          description: "Please check your email to confirm your account",
        });
      }
    } catch (error: any) {
      toast({
        title: "An unexpected error occurred",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBrandSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signUp(
        brandData.email, 
        brandData.password,
        {
          first_name: brandData.companyName,
          user_type: 'brand',
        }
      );
      
      if (error) {
        toast({
          title: "Error signing up",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration successful",
          description: "Please check your email to confirm your account",
        });
      }
    } catch (error: any) {
      toast({
        title: "An unexpected error occurred",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
          <form onSubmit={handleInfluencerSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First name</Label>
                <Input 
                  id="first-name" 
                  required 
                  className="h-12"
                  value={influencerData.firstName}
                  onChange={(e) => setInfluencerData({...influencerData, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input 
                  id="last-name" 
                  required 
                  className="h-12"
                  value={influencerData.lastName}
                  onChange={(e) => setInfluencerData({...influencerData, lastName: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-influencer">Email</Label>
              <Input 
                id="email-influencer" 
                type="email" 
                required 
                className="h-12"
                value={influencerData.email}
                onChange={(e) => setInfluencerData({...influencerData, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password-influencer">Password</Label>
              <Input 
                id="password-influencer" 
                type="password" 
                required 
                className="h-12"
                value={influencerData.password}
                onChange={(e) => setInfluencerData({...influencerData, password: e.target.value})}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 button-hover-effect"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Influencer Account'}
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
            <Button variant="outline" className="h-12" type="button">
              <Facebook className="mr-2 h-5 w-5" />
              Facebook
            </Button>
            <Button variant="outline" className="h-12" type="button">
              <Mail className="mr-2 h-5 w-5" />
              Google
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="brand" className="space-y-4">
          <form onSubmit={handleBrandSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company name</Label>
              <Input 
                id="company-name" 
                required 
                className="h-12"
                value={brandData.companyName}
                onChange={(e) => setBrandData({...brandData, companyName: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-brand">Work email</Label>
              <Input 
                id="email-brand" 
                type="email" 
                required 
                className="h-12"
                value={brandData.email}
                onChange={(e) => setBrandData({...brandData, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password-brand">Password</Label>
              <Input 
                id="password-brand" 
                type="password" 
                required 
                className="h-12"
                value={brandData.password}
                onChange={(e) => setBrandData({...brandData, password: e.target.value})}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 button-hover-effect"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Brand Account'}
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
            <Button variant="outline" className="h-12" type="button">
              <Facebook className="mr-2 h-5 w-5" />
              Facebook
            </Button>
            <Button variant="outline" className="h-12" type="button">
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
