import React from 'react';
import { TrendingUp, Hash } from 'lucide-react';

export const LeaderboardWidget: React.FC = () => {
  const leaderboard = [
    { name: 'Sarah_Codes', score: 100, type: 'cost' },
    { name: 'UnluckyDave', score: 95, type: 'shame' },
    { name: 'InternJim', score: 65, type: 'shame' },
    { name: 'CryptoChad', score: 99, type: 'shame' },
    { name: 'DeployFriday', score: 88, type: 'cost' },
  ];

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4 border-b border-neutral-800 pb-3">
        <TrendingUp size={16} className="text-cook-warning" />
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide">Top Victims</h3>
      </div>
      <div className="space-y-4">
        {leaderboard.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-neutral-800 text-neutral-500'}`}>
                {idx + 1}
              </div>
              <div>
                <div className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">{item.name}</div>
                <div className="text-[10px] text-neutral-600 uppercase">{item.type === 'cost' ? 'At What Cost' : 'Hall of Shame'}</div>
              </div>
            </div>
            <div className={`text-sm font-black ${item.score > 90 ? 'text-cook-accent' : 'text-gray-500'}`}>
              {item.score}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TrendingTagsWidget: React.FC = () => {
  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4 border-b border-neutral-800 pb-3">
        <Hash size={16} className="text-neutral-400" />
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide">Trending</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {['#ToiletDisasters', '#TechFail', '#FirstDate', '#InternLife', '#ProductionBug', '#CryptoCrash', '#GymFails'].map(tag => (
          <span key={tag} className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white px-2 py-1 rounded cursor-pointer transition-colors">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};