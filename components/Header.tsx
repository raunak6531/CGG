'use client';

import React from 'react';
import { Flame, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useClerk } from '@clerk/nextjs';

export const Header: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const { signOut } = useClerk();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-cook-border bg-cook-dark/80 backdrop-blur-md">
      {/* Changed max-w-3xl to max-w-7xl to support the wide grid layout */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="relative">
            <Flame className="w-8 h-8 text-cook-neon text-cook-accent group-hover:animate-bounce" />
            <div className="absolute inset-0 bg-cook-accent blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-white">
            CGG
          </h1>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-right">
                <div className="hidden sm:block">
                  <span className="block text-xs font-bold text-white">{user.username}</span>
                  <span className="block text-[10px] text-neutral-500 font-mono">STATUS: COOKED</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 flex items-center justify-center font-black text-white overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-full text-xs font-bold uppercase tracking-wider text-white transition-all hover:scale-105"
            >
              <LogIn size={14} />
              Login
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
