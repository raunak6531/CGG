export interface JudgmentResult {
  cooked_score: number;
  verdict: string;
}

export interface User {
  id: string;
  username: string;
  displayName?: string; // New: Display name (e.g. "The Chef")
  bio?: string;         // New: User bio
  avatar?: string;      // URL or Base64 string
  joinedAt: number;
}

export interface Comment {
  id: string;
  author: string;
  authorId?: string; // Link to user
  text: string;
  timestamp: number;
}

export type PostType = 'shame' | 'cost';
export type ViewState = 'home' | 'trending' | 'videos' | 'profile';

export interface Post {
  id: string;
  type: PostType; // 'shame' = Pure Disaster, 'cost' = Won but at what cost
  author: string;
  authorId?: string; // Link to user
  story: string;
  imageUrl?: string; // Base64 string for the image
  videoUrl?: string; // URL for video content
  timestamp: number;
  
  // Scoring
  score?: number; // The display score (weighted average)
  aiScore?: number; // The original AI score
  userVotes: {
    count: number;
    totalScore: number;
  };
  userHasVoted: boolean;
  
  // Constant Metric (Single vote) - mutually exclusive visually based on type
  userHasW: boolean; 
  userHasL: boolean;

  verdict?: string;
  isAnalyzing: boolean;
  
  reactions: {
    skulls: number; // Laughs (Spammable)
    respects: number; // 'F's (Spammable)
    wins: number; // 'W's (Constant/Single vote - for Cost posts)
    l_s: number; // 'L's (Constant/Single vote - for Shame posts)
  };
  
  comments: Comment[];
}
