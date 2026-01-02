'use client';

import React from 'react';

interface ScoreGaugeProps {
  score: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  // Determine color and label
  let colorClass = 'bg-cook-safe shadow-[0_0_10px_rgba(16,185,129,0.5)]';
  let label = 'BARELY SCATHED';
  let labelColor = 'text-cook-safe';
  
  if (score > 30) {
    colorClass = 'bg-cook-warning shadow-[0_0_10px_rgba(245,158,11,0.5)]';
    label = 'MEDIUM RARE';
    labelColor = 'text-cook-warning';
  }
  if (score > 60) {
    colorClass = 'bg-orange-600 shadow-[0_0_10px_rgba(234,88,12,0.5)]';
    label = 'WELL DONE';
    labelColor = 'text-orange-500';
  }
  if (score > 85) {
    colorClass = 'bg-cook-accent shadow-[0_0_15px_rgba(255,62,62,0.8)]';
    label = 'CRITICALLY COOKED';
    labelColor = 'text-cook-accent';
  }

  // Segmented bar logic (20 segments)
  const segments = 20;
  const filledSegments = Math.ceil((score / 100) * segments);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-end mb-1">
        <span className={`text-[10px] font-black tracking-widest uppercase ${labelColor}`}>
          {label}
        </span>
        <span className={`text-2xl font-black ${score > 85 ? 'text-cook-accent animate-pulse' : 'text-white'}`}>
          {score}%
        </span>
      </div>
      
      {/* Segmented Bar */}
      <div className="flex gap-[2px] h-3 w-full">
        {Array.from({ length: segments }).map((_, i) => (
          <div 
            key={i}
            className={`flex-1 rounded-sm transition-all duration-500 ${
              i < filledSegments 
                ? `${colorClass} opacity-100` 
                : 'bg-neutral-800 opacity-30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};