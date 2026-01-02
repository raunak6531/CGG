'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerkAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [localUser, setLocalUser] = useState<User | null>(null);

  // Map Clerk user to our User type
  useEffect(() => {
    if (isLoaded && clerkUser) {
      // Check if we have custom user data stored
      const storedUserData = localStorage.getItem(`cgg_user_${clerkUser.id}`);
      const customData = storedUserData ? JSON.parse(storedUserData) : {};

      const mappedUser: User = {
        id: clerkUser.id,
        username: clerkUser.username || clerkUser.firstName || clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] || 'user',
        displayName: customData.displayName || clerkUser.firstName || clerkUser.username || 'User',
        bio: customData.bio || '',
        avatar: customData.avatar || clerkUser.imageUrl,
        joinedAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).getTime() : Date.now(),
      };

      setLocalUser(mappedUser);
    } else if (isLoaded && !clerkUser) {
      setLocalUser(null);
    }
  }, [clerkUser, isLoaded]);

  const updateProfile = (data: Partial<User>) => {
    if (!localUser || !clerkUser) return;
    
    const updatedUser = { ...localUser, ...data };
    setLocalUser(updatedUser);
    
    // Store custom data in localStorage keyed by Clerk user ID
    localStorage.setItem(`cgg_user_${clerkUser.id}`, JSON.stringify({
      displayName: updatedUser.displayName,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
    }));
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider value={{ 
      user: localUser, 
      isAuthModalOpen, 
      openAuthModal, 
      closeAuthModal,
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
