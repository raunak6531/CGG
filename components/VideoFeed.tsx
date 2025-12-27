import React, { useRef, useState } from 'react';
import { Post } from '../types';
import { Heart, MessageSquare, Share2, Play, Volume2, VolumeX } from 'lucide-react';

interface VideoFeedProps {
  // In a real app, this would fetch video posts
}

const MOCK_VIDEOS: Post[] = [
  {
    id: 'v1',
    type: 'shame',
    author: 'SkaterBoy_Fail',
    story: 'Tried to impress my crush with a kickflip. Currently in ER.',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // Safe sample video
    timestamp: Date.now() - 10000,
    score: 92,
    aiScore: 92,
    userVotes: { count: 120, totalScore: 11000 },
    userHasVoted: false,
    userHasW: false,
    userHasL: false,
    isAnalyzing: false,
    reactions: { skulls: 200, respects: 50, wins: 0, l_s: 10 },
    comments: []
  },
  {
    id: 'v2',
    type: 'cost',
    author: 'Chef_Mike',
    story: 'Made the perfect soufflé. Dropped it immediately after this video.',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    timestamp: Date.now() - 50000,
    score: 100,
    aiScore: 100,
    userVotes: { count: 50, totalScore: 5000 },
    userHasVoted: false,
    userHasW: true,
    userHasL: false,
    isAnalyzing: false,
    reactions: { skulls: 10, respects: 500, wins: 20, l_s: 0 },
    comments: []
  }
];

export const VideoFeed: React.FC<VideoFeedProps> = () => {
  return (
    <div className="space-y-8 pb-20">
      {MOCK_VIDEOS.map((video) => (
        <VideoCard key={video.id} post={video} />
      ))}
       <div className="text-center py-10 text-neutral-600 italic text-sm">
         No more fails to load. You've seen it all.
       </div>
    </div>
  );
};

const VideoCard: React.FC<{ post: Post }> = ({ post }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden aspect-[9/16] max-h-[75vh] group shadow-2xl border border-neutral-800 mx-auto w-full max-w-md">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={post.videoUrl}
        className="w-full h-full object-cover cursor-pointer"
        loop
        playsInline
        muted={isMuted}
        onClick={togglePlay}
      />

      {/* Play Overlay */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none"
        >
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
            <Play fill="white" className="text-white ml-1" size={32} />
          </div>
        </div>
      )}

      {/* Top Controls */}
      <div className="absolute top-4 right-4 z-20">
        <button onClick={toggleMute} className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60">
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Overlay Info (Bottom) */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-6 pt-20">
        
        <div className="flex items-end justify-between">
          <div className="flex-1 mr-4">
             <div className="flex items-center gap-2 mb-2">
               <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center font-bold text-white border border-white/20">
                 {post.author.charAt(0)}
               </div>
               <span className="font-bold text-white shadow-black drop-shadow-md">{post.author}</span>
               {post.score && (
                 <span className={`text-xs font-black px-2 py-0.5 rounded ${post.score > 80 ? 'bg-red-600 text-white' : 'bg-yellow-500 text-black'}`}>
                   {post.score}%
                 </span>
               )}
             </div>
             <p className="text-white text-sm line-clamp-2 drop-shadow-md mb-2">
               {post.story}
             </p>
          </div>

          {/* Side Actions (Reels Style) */}
          <div className="flex flex-col gap-4 items-center">
            <button className="flex flex-col items-center gap-1 group">
               <div className="p-3 bg-neutral-800/80 backdrop-blur-sm rounded-full group-hover:bg-red-500/80 transition-colors">
                 <Heart className="text-white w-6 h-6" />
               </div>
               <span className="text-xs font-bold text-white">{post.reactions.skulls}</span>
            </button>
            <button className="flex flex-col items-center gap-1 group">
               <div className="p-3 bg-neutral-800/80 backdrop-blur-sm rounded-full group-hover:bg-blue-500/80 transition-colors">
                 <MessageSquare className="text-white w-6 h-6" />
               </div>
               <span className="text-xs font-bold text-white">0</span>
            </button>
            <button className="flex flex-col items-center gap-1 group">
               <div className="p-3 bg-neutral-800/80 backdrop-blur-sm rounded-full group-hover:bg-green-500/80 transition-colors">
                 <Share2 className="text-white w-6 h-6" />
               </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};