import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Trophy, AlertTriangle, Lock } from 'lucide-react';
import { PostType } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (author: string, story: string, type: PostType, image?: string) => void;
  isGlobalLoading: boolean;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({ isOpen, onClose, onSubmit, isGlobalLoading }) => {
  const { user, openAuthModal } = useAuth();
  const [story, setStory] = useState('');
  const [type, setType] = useState<PostType>('shame');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setStory('');
      setSelectedImage(null);
      setType('shame');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !story.trim()) return;
    
    // Pass user.username as author
    onSubmit(user.username, story, type, selectedImage || undefined);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-cook-card border border-cook-border w-full max-w-lg rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
            Admit Your Defeat
          </h2>
          <button 
            onClick={onClose}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar relative">
          
          {/* Auth Blocker Overlay if not logged in */}
          {!user && (
            <div className="absolute inset-0 z-10 bg-neutral-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 rounded-b-2xl">
              <div className="bg-neutral-800 p-4 rounded-full mb-4">
                <Lock className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Login Required</h3>
              <p className="text-neutral-400 text-sm mb-6 max-w-xs">
                You need to be logged in to post your shameful moments. We need to know who to roast.
              </p>
              <button
                onClick={() => {
                  onClose(); // Close this modal
                  openAuthModal(); // Open auth modal
                }}
                className="bg-cook-accent hover:bg-cook-accentHover text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider transition-all"
              >
                Login / Sign Up
              </button>
            </div>
          )}

          <form id="submission-form" onSubmit={handleSubmit} className={`space-y-6 ${!user ? 'opacity-20 pointer-events-none' : ''}`}>
            
            {/* Category Selection */}
            <div className="grid grid-cols-2 gap-3">
               <button
                 type="button"
                 onClick={() => setType('shame')}
                 className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                   type === 'shame' 
                     ? 'bg-red-950/20 border-cook-accent text-white' 
                     : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-700'
                 }`}
               >
                 <AlertTriangle size={24} className={type === 'shame' ? 'text-cook-accent' : 'text-neutral-600'} />
                 <span className="text-xs font-black uppercase tracking-wider">Total L</span>
               </button>

               <button
                 type="button"
                 onClick={() => setType('cost')}
                 className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                   type === 'cost' 
                     ? 'bg-green-950/20 border-green-500 text-white' 
                     : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-700'
                 }`}
               >
                 <Trophy size={24} className={type === 'cost' ? 'text-green-500' : 'text-neutral-600'} />
                 <span className="text-xs font-black uppercase tracking-wider">Won (But Costly)</span>
               </button>
            </div>

            {/* Author Display (Read Only) */}
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Posting As</label>
              <div className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-neutral-700 flex items-center justify-center text-[10px] font-black">
                   {user?.username.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{user?.username}</span>
              </div>
            </div>

            {/* Story Input */}
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">
                {type === 'shame' ? 'The Incident' : 'The Victory & The Cost'}
              </label>
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder={type === 'shame' ? "Spill the tea. What happened?" : "I won, but I lost my dignity..."}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-cook-accent focus:ring-1 focus:ring-cook-accent transition-all min-h-[150px] resize-none"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
               <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Evidence (Optional)</label>
               
               {!selectedImage ? (
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="border-2 border-dashed border-neutral-700 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-cook-accent hover:bg-neutral-900/50 transition-all group"
                 >
                   <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                     <ImageIcon className="text-neutral-400 group-hover:text-cook-accent" />
                   </div>
                   <span className="text-sm text-neutral-400 group-hover:text-white">Click to upload screenshot/photo</span>
                 </div>
               ) : (
                 <div className="relative rounded-lg overflow-hidden border border-neutral-700 group">
                   <img src={selectedImage} alt="Preview" className="w-full h-48 object-cover" />
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button"
                        onClick={() => setSelectedImage(null)}
                        className="bg-red-600 text-white px-4 py-2 rounded-full text-xs font-bold"
                      >
                        Remove Image
                      </button>
                   </div>
                 </div>
               )}
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*"
                 onChange={handleImageUpload}
               />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-900/50 rounded-b-2xl">
          <button
            form="submission-form"
            type="submit"
            disabled={isGlobalLoading || !story || !user}
            className={`w-full font-black uppercase tracking-wider py-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
              type === 'shame' 
                ? 'bg-cook-accent hover:bg-cook-accentHover shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] text-white' 
                : 'bg-green-600 hover:bg-green-700 shadow-[0_0_20px_rgba(22,163,74,0.2)] hover:shadow-[0_0_30px_rgba(22,163,74,0.4)] text-white'
            }`}
          >
            {isGlobalLoading ? (
               <span className="animate-pulse">Judging You...</span>
            ) : (
              <>
                Submit {type === 'shame' ? 'L' : 'W'} <Send size={18} />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};