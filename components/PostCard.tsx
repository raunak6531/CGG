'use client';

import React, { useState } from 'react';
import { Post, Comment } from '../types';
import { Clock, Keyboard, Share2, Flame, MessageSquare, Send, CheckCircle2, Copy, Facebook, Twitter, Instagram } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../contexts/AuthContext';

interface PostCardProps {
  post: Post;
  onAuthorClick?: (author: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onAuthorClick }) => {
  const { user, openAuthModal } = useAuth();

  // --- Local State ---
  const [localPost, setLocalPost] = useState<Post>(post);
  const [showComments, setShowComments] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  // Enhanced Particle State
  const [fParticles, setFParticles] = useState<{ id: string; left: number; color: string; rotation: number }[]>([]);
  const [isAnimateF, setIsAnimateF] = useState(false);
  const [buttonGlowColor, setButtonGlowColor] = useState<string>('');
  
  // Voting State
  const [voteValue, setVoteValue] = useState(post.score || 50);
  const [hasInteracted, setHasInteracted] = useState(false);

  // --- Checks for Auth ---
  const requireAuth = (action: () => void) => {
    if (!user) {
      openAuthModal();
    } else {
      action();
    }
  };

  // --- Animation Logic for "Press F" ---
  const handleRespect = () => {
    requireAuth(() => {
        setLocalPost(prev => ({
            ...prev,
            reactions: { ...prev.reactions, respects: prev.reactions.respects + 1 }
        }));

        setIsAnimateF(true);
        setTimeout(() => setIsAnimateF(false), 200);

        const colors = ['#ef4444', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomRotation = Math.floor(Math.random() * 60) - 30; 
        const randomLeft = Math.random() * 80 + 10; 
        
        setButtonGlowColor(randomColor);
        setTimeout(() => setButtonGlowColor(''), 300);

        const id = uuidv4();
        setFParticles(prev => [...prev, { id, left: randomLeft, color: randomColor, rotation: randomRotation }]);

        setTimeout(() => {
            setFParticles(prev => prev.filter(p => p.id !== id));
        }, 1000);
    });
  };

  // --- Logic for Constant Metrics ("W" or "L") ---
  const handleW = () => {
    requireAuth(() => {
        setLocalPost(prev => {
        const isRemoving = prev.userHasW;
        return {
            ...prev,
            userHasW: !isRemoving,
            reactions: {
            ...prev.reactions,
            wins: prev.reactions.wins + (isRemoving ? -1 : 1)
            }
        };
        });
    });
  };

  const handleL = () => {
    requireAuth(() => {
        setLocalPost(prev => {
        const isRemoving = prev.userHasL;
        return {
            ...prev,
            userHasL: !isRemoving,
            reactions: {
            ...prev.reactions,
            l_s: prev.reactions.l_s + (isRemoving ? -1 : 1)
            }
        };
        });
    });
  };

  // --- Voting Logic ---
  const handleVoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // We allow sliding but block confirmation without auth (handled by confirmVote)
    setVoteValue(parseInt(e.target.value));
    setHasInteracted(true);
  };

  const confirmVote = () => {
    requireAuth(() => {
        if (localPost.userHasVoted) return;

        const newCount = localPost.userVotes.count + 1;
        const newTotal = localPost.userVotes.totalScore + voteValue;
        
        // Weighted Average Calculation
        const aiWeight = 1;
        const finalScore = Math.round((newTotal + (localPost.aiScore || 0) * aiWeight) / (newCount + aiWeight));

        setLocalPost(prev => ({
        ...prev,
        score: finalScore,
        userVotes: { count: newCount, totalScore: newTotal },
        userHasVoted: true
        }));
        setHasInteracted(false);
    });
  };

  // --- Share Logic ---
  const handleShareClick = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `CGG - Am I Cooked?`,
          text: `Verdict: ${localPost.score}% Cooked. "${localPost.story.substring(0, 40)}..."`,
          url: window.location.href,
        });
        return; 
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
    setShowShareMenu(!showShareMenu);
  };

  const copyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShowShareMenu(false);
      alert("Link copied to clipboard!"); 
    }
  };

  // --- Comment Logic ---
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    requireAuth(() => {
        const comment: Comment = {
            id: uuidv4(),
            author: user!.username, 
            authorId: user!.id,
            text: newComment,
            timestamp: Date.now()
        };

        setLocalPost(prev => ({
            ...prev,
            comments: [...prev.comments, comment]
        }));
        setNewComment('');
    });
  };

  // --- Render Helpers ---
  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const currentScore = localPost.userHasVoted ? (localPost.score || 0) : voteValue;
  const isCritical = (localPost.score || 0) > 85;
  const isCost = localPost.type === 'cost';

  // --- Metrics Color & Label Logic ---
  let colorClass = '';
  let barColor = '';
  let glowClass = '';
  let label = '';
  let borderColor = '';
  
  if (isCost) {
    if (currentScore <= 30) {
      colorClass = 'text-green-300';
      barColor = 'bg-green-400';
      glowClass = 'shadow-[0_0_10px_rgba(74,222,128,0.3)]';
      label = 'WORTH IT';
    } else if (currentScore <= 60) {
      colorClass = 'text-green-500';
      barColor = 'bg-green-600';
      glowClass = 'shadow-[0_0_10px_rgba(34,197,94,0.3)]';
      label = 'CALCULATED RISK';
    } else if (currentScore <= 85) {
      colorClass = 'text-emerald-500';
      barColor = 'bg-emerald-600';
      glowClass = 'shadow-[0_0_10px_rgba(16,185,129,0.3)]';
      label = 'HEAVY TOLL';
    } else {
      colorClass = 'text-green-500'; 
      barColor = 'bg-green-500';
      glowClass = 'shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-pulse';
      label = 'PYRRHIC VICTORY';
    }
    borderColor = isCritical ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.15)]' : 'border-cook-border hover:border-green-800';
    
  } else {
    if (currentScore <= 30) {
        colorClass = 'text-cook-safe';
        barColor = 'bg-cook-safe';
        glowClass = 'shadow-[0_0_10px_rgba(16,185,129,0.4)]';
        label = 'BARELY SCATHED';
    } else if (currentScore <= 60) {
        colorClass = 'text-cook-warning';
        barColor = 'bg-cook-warning';
        glowClass = 'shadow-[0_0_10px_rgba(245,158,11,0.4)]';
        label = 'MEDIUM RARE';
    } else if (currentScore <= 85) {
        colorClass = 'text-orange-500';
        barColor = 'bg-orange-600';
        glowClass = 'shadow-[0_0_10px_rgba(234,88,12,0.4)]';
        label = 'WELL DONE';
    } else {
        colorClass = 'text-cook-accent';
        barColor = 'bg-cook-accent';
        glowClass = 'shadow-[0_0_15px_rgba(255,62,62,0.8)] animate-pulse';
        label = 'CRITICALLY COOKED';
    }
    borderColor = isCritical ? 'border-cook-accent shadow-[0_0_20px_rgba(255,62,62,0.15)]' : 'border-cook-border hover:border-neutral-600';
  }

  const segments = 20;

  return (
    <div className={`
      relative bg-cook-card rounded-xl overflow-hidden transition-all duration-300
      border ${borderColor}
      group
    `}>
      {isCritical && !localPost.isAnalyzing && (
        <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent ${isCost ? 'via-green-500' : 'via-cook-accent'} to-transparent opacity-75`} />
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div 
             className={`flex items-center gap-3 ${onAuthorClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
             onClick={() => onAuthorClick && onAuthorClick(localPost.author)}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${isCritical ? (isCost ? 'bg-green-950/30 border-green-900' : 'bg-red-950/30 border-red-900') : 'bg-neutral-800 border-neutral-700'}`}>
              <div className={`font-black text-lg ${isCritical ? (isCost ? 'text-green-500' : 'text-cook-accent') : 'text-neutral-400'}`}>
                {localPost.author.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-200 text-base underline-offset-2 hover:underline decoration-neutral-600">{localPost.author}</h3>
                {localPost.type === 'cost' && (
                  <span className="text-[10px] bg-green-500/10 text-green-500 border border-green-500/20 px-1.5 rounded uppercase font-bold">
                    At What Cost?
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                <Clock size={10} />
                <span>{timeAgo(localPost.timestamp)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Story */}
        <div className="mb-4 pl-2 border-l-2 border-neutral-800">
          <p className="text-gray-200 text-lg leading-relaxed font-medium whitespace-pre-wrap">
            {localPost.story}
          </p>
        </div>

        {/* Image */}
        {localPost.imageUrl && (
          <div className="mb-6 rounded-lg overflow-hidden border border-neutral-800">
            <img 
              src={localPost.imageUrl} 
              alt="Evidence of failure" 
              className="w-full h-auto max-h-96 object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        {/* Verdict & Battery Section */}
        <div className={`
          rounded-xl p-5 border relative overflow-hidden transition-all mb-4
          ${isCritical 
            ? (isCost ? 'bg-green-950/10 border-green-500/30' : 'bg-red-950/10 border-red-500/30') 
            : 'bg-neutral-950/50 border-neutral-800'}
        `}>
          {localPost.isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <Flame className="w-8 h-8 text-cook-accent animate-bounce" />
              <span className="text-xs font-mono text-cook-accent animate-pulse tracking-[0.2em]">CALCULATING DAMAGE...</span>
            </div>
          ) : (
            <div className="space-y-4 relative z-10">
              
              {/* Header Texts */}
              <div className="flex justify-between items-end">
                <span className={`text-[10px] font-black tracking-widest uppercase ${colorClass}`}>
                  {label}
                </span>
                <div className="text-right">
                    <span className={`text-3xl font-black ${colorClass}`}>
                    {currentScore}%
                    </span>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider">
                      {localPost.userHasVoted ? "Community Average" : "Your Verdict"}
                    </p>
                </div>
              </div>

              {/* The Battery Bar Container */}
              <div className="relative h-5 w-full">
                 <div className="absolute inset-0 flex gap-1">
                    {Array.from({ length: segments }).map((_, i) => {
                      const threshold = ((i + 1) / segments) * 100;
                      const isFilled = currentScore >= (threshold - (100/segments) + 1); 
                      
                      return (
                        <div 
                          key={i}
                          className={`flex-1 rounded-sm transition-all duration-150 ${
                            isFilled ? `${barColor} ${glowClass} opacity-100` : 'bg-neutral-800 opacity-40'
                          }`}
                        />
                      );
                    })}
                 </div>

                 {!localPost.userHasVoted && (
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={voteValue}
                        onChange={handleVoteChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        title={user ? "Slide to rate!" : "Login to rate!"}
                    />
                 )}
              </div>

              {!localPost.userHasVoted && (
                 <div className="h-8 flex items-center justify-center mt-2">
                    {hasInteracted ? (
                       <button 
                         onClick={confirmVote}
                         className={`
                           flex items-center gap-2 px-6 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all
                           ${barColor} text-white hover:brightness-110 active:scale-95 shadow-lg
                         `}
                       >
                         Lock In {voteValue}% <CheckCircle2 size={14} />
                       </button>
                    ) : (
                      <div className="h-2"></div>
                    )}
                 </div>
              )}

              <div className="mt-2 pt-3 border-t border-dashed border-white/10">
                <div className="flex gap-3">
                   <div className="text-2xl pt-1">🤖</div>
                   <div>
                      <span className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                        AI Prosecutor
                      </span>
                      <p className={`font-mono text-sm italic leading-tight ${isCritical ? (isCost ? 'text-green-500 font-bold' : 'text-cook-accent font-bold') : 'text-gray-400'}`}>
                        "{localPost.verdict}"
                      </p>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions (Interactive Buttons) */}
        {!localPost.isAnalyzing && (
          <div className="flex items-center justify-between pt-2 relative">
            <div className="flex gap-2">
              
              {/* Spammable F Button */}
              <button 
                 onClick={handleRespect}
                 className={`
                   relative overflow-visible flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-100
                   ${buttonGlowColor ? 'text-white' : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800 hover:text-white'}
                   active:scale-95
                 `}
                 style={{
                   backgroundColor: buttonGlowColor ? `${buttonGlowColor}20` : undefined, 
                   borderColor: buttonGlowColor || 'transparent',
                   borderWidth: '1px',
                   boxShadow: buttonGlowColor ? `0 0 15px ${buttonGlowColor}40` : undefined
                 }}
              >
                <Keyboard size={16} />
                <span className={`text-xs font-bold transition-transform duration-200 ${isAnimateF ? '-translate-y-1' : ''}`}>F</span>
                <span>{localPost.reactions.respects}</span>
                {fParticles.map(p => (
                    <div
                      key={p.id}
                      className="absolute bottom-full pointer-events-none animate-float-up z-50"
                      style={{ left: `${p.left}%` }}
                    >
                      <span 
                          className="block font-black text-sm"
                          style={{ 
                            color: p.color, 
                            transform: `rotate(${p.rotation}deg)`,
                            textShadow: `0 0 10px ${p.color}`
                          }}
                      >
                          F
                      </span>
                    </div>
                ))}
              </button>

              {/* Dynamic Third Button: W (Cost) or L (Shame) */}
              {post.type === 'cost' ? (
                // W Button for Pyrrhic Victories
                <button 
                  onClick={handleW}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                    ${localPost.userHasW 
                      ? 'bg-green-500/10 text-green-500 border border-green-500/40 shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                      : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800 hover:text-white'}
                  `}
                >
                  <div className="w-4 h-4 flex items-center justify-center font-black border border-current rounded text-[9px] pt-[1px]">W</div>
                  <span className="text-xs font-bold hidden sm:inline">W</span>
                  <span>{localPost.reactions.wins}</span>
                </button>
              ) : (
                // L Button for Shame/Cooked
                <button 
                  onClick={handleL}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                    ${localPost.userHasL 
                      ? 'bg-cook-accent/10 text-cook-accent border border-cook-accent/40 shadow-[0_0_10px_rgba(255,62,62,0.2)]' 
                      : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800 hover:text-white'}
                  `}
                >
                  <div className="w-4 h-4 flex items-center justify-center font-black border border-current rounded text-[10px]">L</div>
                  <span className="text-xs font-bold hidden sm:inline">L</span>
                  <span>{localPost.reactions.l_s}</span>
                </button>
              )}

              {/* Comments Toggle */}
              <button 
                onClick={() => setShowComments(!showComments)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${showComments ? 'bg-neutral-700 text-white' : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
              >
                <MessageSquare size={16} />
                <span>{localPost.comments.length}</span>
              </button>
            </div>

            {/* Share Button & Menu */}
            <div className="relative">
                <button 
                  onClick={handleShareClick}
                  className={`flex items-center gap-2 text-neutral-500 hover:text-white transition-colors p-1.5 rounded-md ${showShareMenu ? 'bg-neutral-800 text-white' : ''}`}
                >
                   <Share2 size={18} />
                </button>
                
                {showShareMenu && (
                    <div className="absolute right-0 bottom-full mb-2 w-56 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-50">
                        <div className="p-1">
                            <button onClick={copyLink} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-neutral-800 rounded-lg transition-colors text-left">
                                <Copy size={14} /> Copy Link
                            </button>
                            {typeof window !== 'undefined' && (
                              <>
                                <a 
                                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} 
                                  target="_blank" rel="noopener noreferrer"
                                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-neutral-800 rounded-lg transition-colors text-left"
                                >
                                    <Facebook size={14} /> Facebook
                                </a>
                                <a 
                                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Am I Cooked? Verdict: ${localPost.score}%`)}&url=${encodeURIComponent(window.location.href)}`} 
                                  target="_blank" rel="noopener noreferrer"
                                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-neutral-800 rounded-lg transition-colors text-left"
                                >
                                    <Twitter size={14} /> Twitter / X
                                </a>
                              </>
                            )}
                        </div>
                    </div>
                )}
            </div>
          </div>
        )}

        {/* Comments Section */}
        {showComments && (
            <div className="mt-4 pt-4 border-t border-neutral-800 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {localPost.comments.length === 0 ? (
                        <p className="text-center text-xs text-neutral-600 italic py-2">No roasting yet. Be the first.</p>
                    ) : (
                        localPost.comments.map(comment => (
                            <div key={comment.id} className="bg-neutral-900/50 p-3 rounded-lg border border-neutral-800">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="text-xs font-bold text-gray-300">{comment.author}</span>
                                    <span className="text-[10px] text-neutral-600">{timeAgo(comment.timestamp)}</span>
                                </div>
                                <p className="text-sm text-gray-400">{comment.text}</p>
                            </div>
                        ))
                    )}
                </div>
                
                <form onSubmit={handlePostComment} className="relative">
                    <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={user ? "Add a roast..." : "Login to roast..."}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-4 pr-10 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-cook-border focus:ring-1 focus:ring-cook-border"
                    />
                    <button 
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-cook-accent disabled:opacity-30 hover:scale-110 transition-transform"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        )}
      </div>
    </div>
  );
};
