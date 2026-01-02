'use client';

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Header } from '../components/Header';
import { SubmissionModal } from '../components/SubmissionModal';
import { PostCard } from '../components/PostCard';
import { AuthModal } from '../components/AuthModal';
import { BottomNav } from '../components/BottomNav';
import { UserProfile } from '../components/UserProfile';
import { LeaderboardWidget, TrendingTagsWidget } from '../components/Widgets';
import { VideoFeed } from '../components/VideoFeed';
import { Post, PostType, ViewState } from '../types';
import { judgeStory } from '../services/geminiService';
import { Flame, Trophy, AlertTriangle, TrendingUp, User as UserIcon, Settings, Plus, Play, Home } from 'lucide-react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Initial dummy data to make the feed look populated
const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    type: 'shame',
    author: 'UnluckyDave',
    story: 'Dropped my phone in the toilet. While fishing it out, my glasses fell in too. Flushed out of panic.',
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    score: 95,
    aiScore: 95,
    userVotes: { count: 20, totalScore: 1900 }, // Avg 95
    userHasVoted: false,
    userHasW: false,
    userHasL: false,
    verdict: "Double kill. Flush yourself next time, it's safer.",
    isAnalyzing: false,
    reactions: { skulls: 42, respects: 12, wins: 0, l_s: 85 },
    comments: [
        { id: 'c1', author: 'ToiletSurfer', text: 'Bro needs a leash for his glasses', timestamp: Date.now() - 1000 * 60 * 30 }
    ]
  },
  {
    id: '2',
    type: 'cost',
    author: 'Sarah_Codes',
    story: 'Finally fixed the production bug that was keeping us awake for 48 hours. I accidentally deleted the entire user table in the process, but the bug IS gone.',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 mins ago
    score: 100,
    aiScore: 100,
    userVotes: { count: 50, totalScore: 5000 },
    userHasVoted: false,
    userHasW: true,
    userHasL: false,
    verdict: 'Task failed successfully. You won the battle but nuked the war.',
    isAnalyzing: false,
    reactions: { skulls: 128, respects: 85, wins: 240, l_s: 0 },
    comments: []
  },
  {
    id: '3',
    type: 'shame',
    author: 'InternJim',
    story: 'Replied "Love you too" to my boss\'s email about the quarterly report.',
    timestamp: Date.now() - 1000 * 60 * 10, 
    score: 65,
    aiScore: 65,
    userVotes: { count: 5, totalScore: 325 },
    userHasVoted: false,
    userHasW: false,
    userHasL: false,
    verdict: 'HR is already typing the termination letter. Cringe.',
    isAnalyzing: false,
    reactions: { skulls: 8, respects: 2, wins: 0, l_s: 15 },
    comments: []
  },
];

const MainApp: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, openAuthModal } = useAuth();
  
  // View State (Navigation)
  const [activeView, setActiveView] = useState<ViewState>('home');
  const [activeTab, setActiveTab] = useState<PostType>('shame'); // For Home feed filtering
  
  // Selected User Profile State
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  // Filter and Sort posts
  const filteredPosts = posts.filter(p => p.type === activeTab);
  
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    // If one is analyzing, prioritize it to show activity
    if (a.isAnalyzing && !b.isAnalyzing) return -1;
    if (!a.isAnalyzing && b.isAnalyzing) return 1;
    
    // Default sort by score descending
    return (b.score || 0) - (a.score || 0);
  });

  const handleOpenSubmission = () => {
    setIsModalOpen(true);
  };
  
  const handleNavigateToProfile = (username: string) => {
      setSelectedProfile(username);
      setActiveView('profile');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  const handleNewSubmission = async (author: string, story: string, type: PostType, image?: string) => {
    setIsSubmitting(true);
    setActiveView('home'); // Go back to home to see post
    setActiveTab(type);
    
    const newPostId = uuidv4();
    const tempPost: Post = {
      id: newPostId,
      type,
      author,
      authorId: user?.id,
      story,
      imageUrl: image,
      timestamp: Date.now(),
      score: 0,
      aiScore: 0,
      userVotes: { count: 0, totalScore: 0 },
      userHasVoted: false,
      userHasW: false,
      userHasL: false,
      verdict: '',
      isAnalyzing: true,
      reactions: { skulls: 0, respects: 0, wins: 0, l_s: 0 },
      comments: []
    };

    setPosts((prev) => [tempPost, ...prev]);
    setIsModalOpen(false);

    try {
      const result = await judgeStory(story, image);
      setPosts((prev) => 
        prev.map((p) => 
          p.id === newPostId 
            ? { 
                ...p, 
                score: result.cooked_score, 
                aiScore: result.cooked_score,
                verdict: result.verdict, 
                isAnalyzing: false 
              }
            : p
        )
      );
    } catch (e) {
      console.error("Failed to judge:", e);
      setPosts((prev) => 
        prev.map((p) => 
          p.id === newPostId 
            ? { 
                ...p, 
                score: 50, 
                aiScore: 50,
                verdict: "AI broke, but you're probably cooked.", 
                isAnalyzing: false 
              }
            : p
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Functions based on Active View ---

  const renderCenterContent = () => {
    if (activeView === 'profile' && selectedProfile) {
        return (
            <UserProfile 
                username={selectedProfile}
                posts={posts} // Pass all posts, component filters by username
                onBack={() => setActiveView('home')}
            />
        );
    }

    if (activeView === 'trending') {
        // Mobile Only View for Trending
        return (
            <div className="space-y-6 animate-in fade-in">
                <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 p-6 rounded-2xl border border-neutral-800 text-center">
                    <TrendingUp size={48} className="mx-auto text-cook-warning mb-2" />
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Global Trends</h2>
                    <p className="text-neutral-400 text-sm">See who is cooking the hardest right now.</p>
                </div>
                <LeaderboardWidget />
                <TrendingTagsWidget />
            </div>
        );
    }

    if (activeView === 'videos') {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4">
               <VideoFeed />
            </div>
        );
    }

    // Default: Home Feed
    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Tab Toggles */}
            <div className="flex p-1 bg-neutral-900 rounded-xl border border-neutral-800 shadow-sm sticky top-20 lg:static z-40">
                <button 
                onClick={() => setActiveTab('shame')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-black uppercase tracking-wider transition-all ${
                    activeTab === 'shame' 
                    ? 'bg-neutral-800 text-white shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
                >
                <AlertTriangle size={16} className={activeTab === 'shame' ? 'text-cook-accent' : ''} />
                Hall of Shame
                </button>
                <button 
                onClick={() => setActiveTab('cost')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-black uppercase tracking-wider transition-all ${
                    activeTab === 'cost' 
                    ? 'bg-neutral-800 text-white shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
                >
                <Trophy size={16} className={activeTab === 'cost' ? 'text-green-500' : ''} />
                At What Cost?
                </button>
            </div>

            {/* Mobile Feed Status Bar */}
            <div className="flex items-center justify-between px-2">
                <span className="text-xs text-neutral-500 font-mono">
                {activeTab === 'shame' ? 'PURE FAILURES ONLY' : 'I WON, BUT IT HURTS'}
                </span>
                <div className="h-px flex-1 mx-4 bg-gradient-to-r from-neutral-800 to-transparent" />
                <div className="flex gap-2">
                    <span className="text-[10px] bg-red-950/30 border border-red-900/30 text-red-500/70 px-2 py-1 rounded flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        LIVE
                    </span>
                </div>
            </div>

            {/* Posts List */}
            <div className="grid gap-6 pb-20 lg:pb-0">
                {sortedPosts.map((post) => (
                <PostCard 
                    key={post.id} 
                    post={post} 
                    onAuthorClick={handleNavigateToProfile}
                />
                ))}
                
                {sortedPosts.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-neutral-800 rounded-xl">
                        <p className="text-neutral-500 font-mono">
                            {activeTab === 'shame' ? 'No shameful moments yet.' : 'No messy victories yet.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen pb-20 font-sans text-gray-100 bg-[#050505]">
      <Header />
      <AuthModal />
      <SubmissionModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSubmit={handleNewSubmission}
            isGlobalLoading={isSubmitting}
        />
      
      {/* Main Grid Layout */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* --- LEFT SIDEBAR (Desktop Only) --- */}
            <div className="hidden lg:block lg:col-span-3">
                <div className="sticky top-24 space-y-6">
                    {/* Identity Card */}
                    <div className="bg-cook-card border border-cook-border rounded-2xl p-6 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cook-accent to-purple-600"></div>
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:border-cook-accent transition-colors">
                                {user ? (
                                    <span className="text-3xl font-black">{user.username.charAt(0).toUpperCase()}</span>
                                ) : (
                                    <UserIcon size={32} className="text-neutral-500" />
                                )}
                            </div>
                            <h2 className="text-lg font-bold text-white mb-1">
                                {user ? user.username : 'Anonymous Guest'}
                            </h2>
                            <span className="text-xs font-mono text-neutral-500 bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
                                {user ? 'LEVEL: BURNT' : 'NOT LOGGED IN'}
                            </span>
                        </div>
                        
                        {!user ? (
                            <button 
                                onClick={openAuthModal}
                                className="w-full mt-4 bg-neutral-800 hover:bg-neutral-700 text-white py-2 rounded-lg text-xs font-bold uppercase transition-colors"
                            >
                                Login
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleNavigateToProfile(user.username)}
                                className="w-full mt-4 bg-neutral-800 hover:bg-neutral-700 text-white py-2 rounded-lg text-xs font-bold uppercase transition-colors"
                            >
                                View My Profile
                            </button>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="bg-neutral-900/50 rounded-2xl p-2 border border-neutral-800">
                        <ul className="space-y-1">
                            <li>
                                <button 
                                    onClick={() => setActiveView('home')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold border transition-colors ${activeView === 'home' ? 'bg-neutral-800/50 text-white border-neutral-700/50' : 'text-neutral-400 border-transparent hover:bg-neutral-800 hover:text-white'}`}
                                >
                                    <Flame size={18} className={activeView === 'home' ? 'text-cook-accent' : ''} />
                                    Home Feed
                                </button>
                            </li>
                            <li>
                                <button 
                                     onClick={() => setActiveView('videos')}
                                     className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold border transition-colors ${activeView === 'videos' ? 'bg-neutral-800/50 text-white border-neutral-700/50' : 'text-neutral-400 border-transparent hover:bg-neutral-800 hover:text-white'}`}
                                >
                                    <Play size={18} className={activeView === 'videos' ? 'text-blue-500' : ''} />
                                    Epic Fails (Videos)
                                </button>
                            </li>
                            <li>
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-neutral-800 hover:text-white font-medium transition-colors border border-transparent">
                                    <Settings size={18} />
                                    Settings
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* --- CENTER COLUMN (Dynamic Content) --- */}
            <div className="lg:col-span-6">
                {renderCenterContent()}
            </div>

            {/* --- RIGHT SIDEBAR (Desktop Only) --- */}
            <div className="hidden lg:block lg:col-span-3">
                <div className="sticky top-24 space-y-6">
                    
                    {/* Desktop Submit CTA */}
                    <div 
                        onClick={handleOpenSubmission}
                        className="bg-gradient-to-br from-cook-accent to-red-700 rounded-2xl p-6 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
                        <h3 className="text-xl font-black italic text-white mb-2 leading-none uppercase">
                            Am I<br/>Cooked?
                        </h3>
                        <p className="text-red-100 text-xs font-medium mb-4 opacity-90">
                            Don't suffer in silence. Let the AI judge your mistakes.
                        </p>
                        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm w-fit px-4 py-2 rounded-lg text-xs font-bold text-white uppercase tracking-wider group-hover:bg-black/30 transition-colors">
                            <Plus size={16} /> Create Post
                        </div>
                    </div>

                    {/* Reusable Widgets */}
                    <LeaderboardWidget />
                    <TrendingTagsWidget />

                </div>
            </div>

        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNav 
            currentView={activeView} 
            setView={setActiveView} 
            onOpenSubmit={handleOpenSubmission} 
            onNavigateProfile={handleNavigateToProfile}
        />

      </main>
    </div>
  );
};

export default function Home() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

