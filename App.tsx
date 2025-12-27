import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Header } from './components/Header';
import { SubmissionModal } from './components/SubmissionModal';
import { PostCard } from './components/PostCard';
import { Post, PostType } from './types';
import { judgeStory } from './services/geminiService';
import { Flame, Trophy, AlertTriangle } from 'lucide-react';

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
    verdict: 'Double kill. Flush yourself next time, it’s safer.',
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

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<PostType>('shame');

  // Filter and Sort posts
  const filteredPosts = posts.filter(p => p.type === activeTab);
  
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    // If one is analyzing, prioritize it to show activity
    if (a.isAnalyzing && !b.isAnalyzing) return -1;
    if (!a.isAnalyzing && b.isAnalyzing) return 1;
    
    // Default sort by score descending
    return (b.score || 0) - (a.score || 0);
  });

  const handleNewSubmission = async (author: string, story: string, type: PostType, image?: string) => {
    setIsSubmitting(true);
    
    // Switch to the tab where the new post will appear
    setActiveTab(type);
    
    const newPostId = uuidv4();
    const tempPost: Post = {
      id: newPostId,
      type,
      author,
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

    // Add to feed immediately and close modal
    setPosts((prev) => [tempPost, ...prev]);
    setIsModalOpen(false);

    try {
      // Call Gemini API (now with image support)
      const result = await judgeStory(story, image);

      // Update the post with real results
      // Initially, the score is just the AI score
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
      // Fallback update in case of total failure
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

  return (
    <div className="min-h-screen pb-20 font-sans text-gray-100">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-8 relative">
        
        {/* Floating Action Button (FAB) - The "CGG" Button */}
        <div className="fixed bottom-8 right-6 z-40 md:right-[calc(50%-350px)]">
            <button
                onClick={() => setIsModalOpen(true)}
                className="group relative flex items-center justify-center gap-2 bg-cook-accent hover:bg-red-600 text-white font-black uppercase text-xl px-6 py-4 rounded-full shadow-[0_0_20px_rgba(255,62,62,0.4)] hover:shadow-[0_0_40px_rgba(255,62,62,0.6)] hover:scale-105 transition-all duration-300"
            >
                <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:animate-ping" />
                <Flame className="w-6 h-6 animate-pulse" fill="currentColor" />
                <span className="tracking-tighter">CGG POST</span>
            </button>
        </div>

        <SubmissionModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSubmit={handleNewSubmission}
            isGlobalLoading={isSubmitting}
        />
        
        <div className="space-y-6 mt-2">
          
          {/* Section Toggles */}
          <div className="flex p-1 bg-neutral-900 rounded-xl border border-neutral-800">
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

          <div className="flex items-center justify-between mb-4 px-2">
             <span className="text-xs text-neutral-500 font-mono">
               {activeTab === 'shame' ? 'PURE FAILURES ONLY' : 'I WON, BUT IT HURTS'}
             </span>
             <div className="h-px flex-1 mx-4 bg-gradient-to-r from-neutral-800 to-transparent" />
             <div className="flex gap-2">
                <span className="text-[10px] bg-red-950/30 border border-red-900/30 text-red-500/70 px-2 py-1 rounded">LIVE FEED</span>
             </div>
          </div>

          <div className="grid gap-6">
            {sortedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {sortedPosts.length === 0 && (
             <div className="text-center py-20 border-2 border-dashed border-neutral-800 rounded-xl">
               <p className="text-neutral-500 font-mono">
                 {activeTab === 'shame' ? 'No shameful moments yet.' : 'No messy victories yet.'}
               </p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;