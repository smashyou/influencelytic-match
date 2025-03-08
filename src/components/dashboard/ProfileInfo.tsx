
import React from 'react';

interface ProfileInfoProps {
  user: any;
  profile: {
    first_name?: string;
    user_type?: string;
  } | null;
}

const ProfileInfo = ({ user, profile }: ProfileInfoProps) => {
  const userTypeName = profile?.user_type === 'influencer' ? 'Influencer' : 'Brand';

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">
        Welcome{profile?.first_name ? `, ${profile.first_name}!` : '!'}
      </h2>
      <div className="p-4 bg-muted/50 rounded-md">
        <p className="text-muted-foreground">
          You are signed in with: <span className="font-medium text-foreground">{user?.email}</span>
        </p>
        <p className="text-muted-foreground mt-1">
          Account type: <span className="font-medium text-foreground">{userTypeName}</span>
        </p>
      </div>
    </div>
  );
};

export default ProfileInfo;
