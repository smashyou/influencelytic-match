
import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  showSignUp?: boolean;
  showSignIn?: boolean;
}

const AuthLayout = ({
  children,
  title,
  description,
  showSignUp = false,
  showSignIn = false,
}: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                influencelytic
              </span>
            </Link>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          
          <div className="bg-card border rounded-lg shadow-subtle p-8">
            {children}
          </div>
          
          <div className="text-center text-sm">
            {showSignUp && (
              <p>
                Don't have an account?{' '}
                <Link to="/signup" className="font-semibold text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            )}
            {showSignIn && (
              <p>
                Already have an account?{' '}
                <Link to="/signin" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
