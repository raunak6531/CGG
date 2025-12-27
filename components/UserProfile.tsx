import React, { useState, useRef, useEffect } from 'react';
import { Post } from '../types';
import { PostCard } from './PostCard';
import { ArrowLeft, Calendar, Flame, Trophy, Skull, Edit2, Camera, X, Save, TrendingUp, ThumbsDown, Vote, BarChart3, PieChart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileProps {
  username: string;
  posts: Post[];
  onBack: () => void;
  onPostClick?: (post: Post) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ username, posts, onBack }) => {
  const { user, updateProfile } = useAuth();
  
  // View State
  const [activeTab, setActiveTab] = useState<'history' | 'stats'>('history');
  
  // Check if viewing own profile
  const isOwner = user?.username === username;
  
  // Determine display data
  const displayAvatar = isOwner ? user?.avatar : undefined;
  const displayBio = isOwner ? user?.bio : "Just another cooked soul trying to survive.";
  const displayName = isOwner ? (user?.displayName || user?.username) : username;

  // Edit Mode State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter posts for this user
  const userPosts = posts.filter(p => p.author === username).sort((a, b) => b.timestamp - a.timestamp);

  // Calculate Stats
  const totalPosts = userPosts.length;
  const totalRespects = userPosts.reduce((acc, curr) => acc + curr.reactions.respects, 0);
  const totalCostlyWs = userPosts.reduce((acc, curr) => acc + curr.reactions.wins, 0); // Renamed variable logic
  const totalLs = userPosts.reduce((acc, curr) => acc + curr.reactions.l_s, 0);
  const totalVotes = userPosts.reduce((acc, curr) => acc + curr.userVotes.count, 0);
  
  // Average "Cooked" score
  const avgScore = totalPosts > 0 
    ? Math.round(userPosts.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalPosts) 
    : 0;

  // Distribution Stats
  const distribution = {
    safe: userPosts.filter(p => (p.score || 0) <= 30).length,
    medium: userPosts.filter(p => (p.score || 0) > 30 && (p.score || 0) <= 60).length,
    wellDone: userPosts.filter(p => (p.score || 0) > 60 && (p.score || 0) <= 85).length,
    burnt: userPosts.filter(p => (p.score || 0) > 85).length,
  };
  const maxDistValue = Math.max(distribution.safe, distribution.medium, distribution.wellDone, distribution.burnt, 1);

  // Determine "Rank"
  let rankTitle = "Raw (Uncooked)";
  let rankColor = "text-neutral-400";
  if (totalPosts > 0) {
      if (avgScore > 85) { rankTitle = "Burnt to a Crisp"; rankColor = "text-cook-accent"; }
      else if (avgScore > 60) { rankTitle = "Well Done"; rankColor = "text-orange-500"; }
      else if (avgScore > 30) { rankTitle = "Medium Rare"; rankColor = "text-yellow-500"; }
      else { rankTitle = "Lightly Seared"; rankColor = "text-green-500"; }
  }

  // --- Edit Handlers ---
  useEffect(() => {
    if (isEditOpen && user) {
        setEditDisplayName(user.displayName || user.username);
        setEditBio(user.bio || '');
        setEditAvatar(user.avatar || null);
    }
  }, [isEditOpen, user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
        displayName: editDisplayName,
        bio: editBio,
        avatar: editAvatar || undefined
    });
    setIsEditOpen(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header / Nav */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <button 
            onClick={onBack}
            className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 text-white transition-colors"
            >
            <ArrowLeft size={20} />
            </button>
            <span className="text-sm font-bold text-neutral-400 uppercase tracking-wider">User Profile</span>
        </div>
        
        {isOwner && (
            <button 
                onClick={() => setIsEditOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
            >
                <Edit2 size={14} /> Edit Profile
            </button>
        )}
      </div>

      {/* Identity Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden mb-8 relative">
        <div className="h-32 bg-gradient-to-r from-neutral-800 via-neutral-900 to-black relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        </div>
        <div className="px-6 pb-6 -mt-16">
            <div className="flex justify-between items-end">
                <div className="w-32 h-32 rounded-full bg-neutral-950 p-1 border-4 border-neutral-900 relative group">
                    <div className="w-full h-full rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
                        {displayAvatar ? (
                             <img src={displayAvatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-5xl font-black text-white">{username.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                </div>
                <div className="mb-2 hidden sm:block">
                     <span className={`text-xs font-black uppercase px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 ${rankColor}`}>
                        Rank: {rankTitle}
                     </span>
                </div>
            </div>
            
            <div className="mt-4">
                <h1 className="text-3xl font-black text-white tracking-tight">{displayName}</h1>
                <p className="text-neutral-500 font-medium text-sm">@{username}</p>
                
                {displayBio && (
                    <p className="mt-3 text-gray-300 text-sm max-w-lg leading-relaxed">{displayBio}</p>
                )}

                <div className="flex items-center gap-4 mt-4 text-xs text-neutral-500 font-mono border-t border-neutral-800 pt-4">
                    <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>Joined recently</span>
                    </div>
                    <div className="sm:hidden block">
                        <span className={rankColor}>{rankTitle}</span>
                    </div>
                </div>
            </div>

            {/* Stats Summary (High Level) */}
            <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="bg-neutral-800/50 rounded-xl p-3 text-center border border-neutral-800 flex flex-col items-center justify-center gap-1">
                    <div className="text-2xl font-black text-white">{totalPosts}</div>
                    <div className="text-[10px] uppercase text-neutral-500 font-bold">Incidents</div>
                </div>
                <div className="bg-neutral-800/50 rounded-xl p-3 text-center border border-neutral-800 flex flex-col items-center justify-center gap-1">
                    <div className={`text-2xl font-black ${rankColor}`}>{avgScore}%</div>
                    <div className="text-[10px] uppercase text-neutral-500 font-bold">Avg Cooked</div>
                </div>
                 <div className="bg-neutral-800/50 rounded-xl p-3 text-center border border-neutral-800 flex flex-col items-center justify-center gap-1">
                    <div className="text-2xl font-black text-white flex items-center justify-center gap-1">
                        {totalRespects} <span className="text-xs text-neutral-600">F</span>
                    </div>
                    <div className="text-[10px] uppercase text-neutral-500 font-bold">Respects</div>
                </div>
            </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="border-b border-neutral-800 mb-6 flex gap-6 px-2">
          <button 
            onClick={() => setActiveTab('history')}
            className={`pb-3 border-b-2 font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'history' ? 'border-cook-accent text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
          >
              History
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`pb-3 border-b-2 font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'stats' ? 'border-cook-accent text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
          >
              Stats
          </button>
      </div>

      {/* --- TAB CONTENT --- */}
      
      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-2">
            {userPosts.length > 0 ? (
                userPosts.map(post => (
                    <PostCard key={post.id} post={post} onAuthorClick={() => {}} /> 
                ))
            ) : (
                <div className="text-center py-20 border-2 border-dashed border-neutral-800 rounded-xl">
                    <Flame className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                    <p className="text-neutral-500 font-mono">This user has a clean record... for now.</p>
                </div>
            )}
        </div>
      )}

      {/* STATS TAB */}
      {activeTab === 'stats' && (
        <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-2">
            
            {/* Detailed Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Total Votes</div>
                        <div className="text-3xl font-black text-white">{totalVotes}</div>
                    </div>
                    <div className="p-3 bg-neutral-800 rounded-full text-neutral-400">
                        <Vote size={24} />
                    </div>
                </div>
                
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">F (Respects)</div>
                        <div className="text-3xl font-black text-white">{totalRespects}</div>
                    </div>
                    <div className="p-3 bg-neutral-800 rounded-full text-neutral-400">
                        <Skull size={24} />
                    </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group">
                     <div className="absolute inset-0 bg-green-950/20 group-hover:bg-green-950/30 transition-colors"></div>
                    <div className="relative z-10">
                        <div className="text-[10px] font-bold text-green-500 uppercase tracking-wider mb-1">Pyrrhic Ws</div>
                        <div className="text-3xl font-black text-white">{totalCostlyWs}</div>
                        <div className="text-[9px] text-green-400/70 mt-1">Won but hurt</div>
                    </div>
                    <div className="relative z-10 p-3 bg-green-950/50 border border-green-900/50 rounded-full text-green-500">
                        <Trophy size={24} />
                    </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-950/20 group-hover:bg-red-950/30 transition-colors"></div>
                    <div className="relative z-10">
                        <div className="text-[10px] font-bold text-cook-accent uppercase tracking-wider mb-1">Major Ls</div>
                        <div className="text-3xl font-black text-white">{totalLs}</div>
                        <div className="text-[9px] text-red-400/70 mt-1">Pure Pain</div>
                    </div>
                    <div className="relative z-10 p-3 bg-red-950/50 border border-red-900/50 rounded-full text-cook-accent">
                        <ThumbsDown size={24} />
                    </div>
                </div>
            </div>

            {/* Distribution Chart */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="text-neutral-400" size={20} />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cooked Level Distribution</h3>
                </div>
                
                <div className="space-y-4">
                    <div className="relative">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-green-500">Safe (0-30%)</span>
                            <span className="text-neutral-500">{distribution.safe} Posts</span>
                        </div>
                        <div className="h-4 bg-neutral-800 rounded-full overflow-hidden">
                            <div 
                                style={{ width: `${(distribution.safe / maxDistValue) * 100}%` }}
                                className="h-full bg-green-500 rounded-full min-w-[4px] transition-all duration-500"
                            ></div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-yellow-500">Medium Rare (31-60%)</span>
                            <span className="text-neutral-500">{distribution.medium} Posts</span>
                        </div>
                        <div className="h-4 bg-neutral-800 rounded-full overflow-hidden">
                            <div 
                                style={{ width: `${(distribution.medium / maxDistValue) * 100}%` }}
                                className="h-full bg-yellow-500 rounded-full min-w-[4px] transition-all duration-500"
                            ></div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-orange-500">Well Done (61-85%)</span>
                            <span className="text-neutral-500">{distribution.wellDone} Posts</span>
                        </div>
                        <div className="h-4 bg-neutral-800 rounded-full overflow-hidden">
                            <div 
                                style={{ width: `${(distribution.wellDone / maxDistValue) * 100}%` }}
                                className="h-full bg-orange-500 rounded-full min-w-[4px] transition-all duration-500"
                            ></div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-cook-accent">Burnt (86-100%)</span>
                            <span className="text-neutral-500">{distribution.burnt} Posts</span>
                        </div>
                        <div className="h-4 bg-neutral-800 rounded-full overflow-hidden">
                            <div 
                                style={{ width: `${(distribution.burnt / maxDistValue) * 100}%` }}
                                className="h-full bg-cook-accent rounded-full min-w-[4px] transition-all duration-500"
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800 text-center">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                        Based on Community & AI Verdicts
                    </p>
                </div>
            </div>

        </div>
      )}


      {/* --- EDIT PROFILE MODAL --- */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => setIsEditOpen(false)}
            />
            <div className="relative bg-cook-card border border-cook-border w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                    <h2 className="text-xl font-black uppercase text-white tracking-tighter">Edit Profile</h2>
                    <button onClick={() => setIsEditOpen(false)} className="text-neutral-500 hover:text-white"><X size={24} /></button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="edit-profile-form" onSubmit={handleSaveProfile} className="space-y-6">
                        
                        {/* Avatar Upload */}
                        <div className="flex justify-center">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-24 h-24 rounded-full bg-neutral-800 border-2 border-neutral-700 overflow-hidden">
                                    {editAvatar ? (
                                        <img src={editAvatar} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl font-black text-neutral-600">
                                            {username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" size={24} />
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Display Name</label>
                            <input 
                                type="text" 
                                value={editDisplayName}
                                onChange={(e) => setEditDisplayName(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-cook-accent transition-all"
                                placeholder="What should we call you?"
                                maxLength={20}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Bio</label>
                            <textarea
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-cook-accent transition-all min-h-[100px] resize-none"
                                placeholder="Tell us about your bad luck..."
                                maxLength={160}
                            />
                            <div className="text-right text-[10px] text-neutral-600 mt-1">{editBio.length}/160</div>
                        </div>

                    </form>
                </div>

                <div className="p-6 border-t border-neutral-800 bg-neutral-900/50 rounded-b-2xl">
                    <button 
                        form="edit-profile-form"
                        type="submit"
                        className="w-full bg-white text-black font-black uppercase tracking-wider py-3 rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};