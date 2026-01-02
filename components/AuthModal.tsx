'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, Flame } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, signup } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // Visual only for mock

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    if (isLoginView) {
      login(username);
    } else {
      signup(username);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closeAuthModal}
      />
      
      <div className="relative bg-cook-card border border-cook-border w-full max-w-sm rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 p-8">
        <button 
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="bg-neutral-800 p-3 rounded-full mb-3">
             <Flame className="w-8 h-8 text-cook-accent" />
          </div>
          <h2 className="text-2xl font-black uppercase text-white tracking-tighter">
            {isLoginView ? 'Welcome Back' : 'Join the Roast'}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            {isLoginView ? 'Login to judge others.' : 'Create an account to get cooked.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-cook-accent transition-all"
              placeholder="e.g. CookedMaster69"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-cook-accent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-cook-accent hover:bg-cook-accentHover text-white font-black uppercase tracking-wider py-3 rounded-lg shadow-lg shadow-red-900/20 transition-all active:scale-[0.98] mt-2"
          >
            {isLoginView ? 'Enter' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLoginView(!isLoginView)}
            className="text-xs text-neutral-400 hover:text-white underline underline-offset-2"
          >
            {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};
