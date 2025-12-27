import React from 'react';
import { Flame } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-cook-border bg-cook-dark/80 backdrop-blur-md">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="relative">
            <Flame className="w-8 h-8 text-cook-neon group-hover:animate-bounce" />
            <div className="absolute inset-0 bg-cook-neon blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-white">
            CGG
          </h1>
        </div>
        <div className="text-xs font-mono text-gray-500 border border-cook-border px-2 py-1 rounded">
          v1.0.0 // STATUS: COOKED
        </div>
      </div>
    </header>
  );
};
