
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
    <div className="mb-6 md:mb-8">
      <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
        Welcome{profile?.first_name ? `, ${profile.first_name}!` : '!'}
      </h2>
      <div className="p-3 md:p-4 bg-muted/50 rounded-md">
        <p className="text-muted-foreground text-sm md:text-base">
          You are signed in with: <span className="font-medium text-foreground break-words">{user?.email}</span>
        </p>
        <p className="text-muted-foreground text-sm md:text-base mt-1">
          Account type: <span className="font-medium text-foreground">{userTypeName}</span>
        </p>
      </div>
    </div>
  );
};

export default ProfileInfo;
