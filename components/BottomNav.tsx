'use client';

import React from 'react';
import { Home, Flame, Play, User } from 'lucide-react';
import { ViewState } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface BottomNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onOpenSubmit: () => void;
  onNavigateProfile: (username: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView, onOpenSubmit, onNavigateProfile }) => {
  const { user, openAuthModal } = useAuth();

  const handleProfileClick = () => {
    if (user) {
      onNavigateProfile(user.username);
    } else {
      openAuthModal();
    }
  };

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-neutral-950 border-t border-neutral-800 z-50 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        
        <button 
          onClick={() => setView('home')}
          className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${currentView === 'home' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          <Home size={24} strokeWidth={currentView === 'home' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase">Home</span>
        </button>

        <button 
          onClick={() => setView('trending')}
          className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${currentView === 'trending' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          <Flame size={24} strokeWidth={currentView === 'trending' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase">Trends</span>
        </button>

        {/* Central Create Button - Floats slightly */}
        <div className="relative -top-6">
           <button 
             onClick={onOpenSubmit}
             className="w-16 h-16 bg-cook-accent rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,62,62,0.6)] hover:scale-105 transition-transform active:scale-95 border-4 border-neutral-950"
           >
             <span className="font-black italic text-xl tracking-tighter">CGG</span>
           </button>
        </div>

        <button 
          onClick={() => setView('videos')}
          className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${currentView === 'videos' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          <Play size={24} strokeWidth={currentView === 'videos' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase">Clips</span>
        </button>

        <button
          onClick={handleProfileClick}
          className={`w-16 flex flex-col items-center gap-1 p-2 transition-colors ${currentView === 'profile' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
           <User size={24} strokeWidth={currentView === 'profile' ? 2.5 : 2} />
           <span className="text-[10px] font-bold uppercase">Profile</span>
        </button>

      </div>
    </div>
  );
};
