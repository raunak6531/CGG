'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SignIn, SignUp } from '@clerk/nextjs';
import { X, Flame } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closeAuthModal}
      />
      
      <div className="relative bg-cook-card border border-cook-border w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <button 
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-10 text-neutral-500 hover:text-white bg-neutral-900/80 rounded-full p-2"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center pt-8 pb-4 px-6 border-b border-neutral-800">
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

        <div className="p-6">
          {isLoginView ? (
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "bg-transparent shadow-none",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700",
                  formButtonPrimary: "bg-cook-accent hover:bg-cook-accentHover text-white",
                  formFieldInput: "bg-neutral-900 border-neutral-700 text-white",
                  formFieldLabel: "text-neutral-400",
                  footerActionLink: "text-cook-accent hover:text-cook-accentHover",
                  identityPreviewText: "text-white",
                  identityPreviewEditButton: "text-cook-accent",
                },
              }}
              afterSignInUrl="/"
              routing="hash"
            />
          ) : (
            <SignUp 
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "bg-transparent shadow-none",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700",
                  formButtonPrimary: "bg-cook-accent hover:bg-cook-accentHover text-white",
                  formFieldInput: "bg-neutral-900 border-neutral-700 text-white",
                  formFieldLabel: "text-neutral-400",
                  footerActionLink: "text-cook-accent hover:text-cook-accentHover",
                },
              }}
              afterSignUpUrl="/"
              routing="hash"
            />
          )}
        </div>

        <div className="px-6 pb-6 text-center border-t border-neutral-800 pt-4">
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
