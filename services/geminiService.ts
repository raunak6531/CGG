import { JudgmentResult } from "../types";

export const judgeStory = async (story: string, imageBase64?: string): Promise<JudgmentResult> => {
  try {
    const response = await fetch('/api/judge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ story, imageBase64 }),
    });

    if (!response.ok) {
      throw new Error('Failed to judge story');
    }

    return await response.json();
  } catch (error) {
    console.error("Judge API Error:", error);
    // Fallback simulation
    return {
      cooked_score: Math.floor(Math.random() * 100),
      verdict: "AI is blind right now, but you look cooked.",
    };
  }
};
