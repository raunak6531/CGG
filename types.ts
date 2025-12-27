export interface JudgmentResult {
  cooked_score: number;
  verdict: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

export type PostType = 'shame' | 'cost';

export interface Post {
  id: string;
  type: PostType; // 'shame' = Pure Disaster, 'cost' = Won but at what cost
  author: string;
  story: string;
  imageUrl?: string; // Base64 string for the image
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