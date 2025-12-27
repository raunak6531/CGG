import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  login: (username: string) => void;
  signup: (username: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Check local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('cgg_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username: string) => {
    // Mock login - in a real app, verify password here
    // For now, we simulate finding the user or creating a session
    const mockUser: User = {
      id: uuidv4(),
      username,
      displayName: username,
      joinedAt: Date.now(),
    };
    setUser(mockUser);
    localStorage.setItem('cgg_user', JSON.stringify(mockUser));
    closeAuthModal();
  };

  const signup = (username: string) => {
    // Mock signup
    const newUser: User = {
      id: uuidv4(),
      username,
      displayName: username,
      joinedAt: Date.now(),
    };
    setUser(newUser);
    localStorage.setItem('cgg_user', JSON.stringify(newUser));
    closeAuthModal();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cgg_user');
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('cgg_user', JSON.stringify(updatedUser));
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, isAuthModalOpen, openAuthModal, closeAuthModal }}>
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