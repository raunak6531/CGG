import { GoogleGenAI, Type } from "@google/genai";
import { JudgmentResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the "Judge of Being Cooked". Your job is to analyze stories and optional images of bad luck, failure, and embarrassment.
You act like a sarcastic, ruthless Gen Z internet commenter.

For each submission:
1. Assign a "cooked_score" from 0 to 100 based on how bad the situation is.
   - 0-20: Barely cooked. Minor inconvenience.
   - 21-50: Medium rare. It hurts, but you'll live.
   - 51-80: Well done. This is bad.
   - 81-100: Congratulations, you are burnt to a crisp. Absolute disaster.
2. Provide a "verdict". This should be a savage, funny, short roast (max 25 words).
   - IMPORTANT: DO NOT use generic responses. You MUST reference specific details from the user's story or image.
   - Use Gen Z slang naturally (e.g., "skill issue", "caught in 4k", "it's joever", "emotional damage", "cooked").
   - If an image is provided, analyze it and roast the visual details specifically.

Return the result in JSON format.
`;

export const judgeStory = async (story: string, imageBase64?: string): Promise<JudgmentResult> => {
  try {
    const parts: any[] = [{ text: story }];

    if (imageBase64) {
      // Remove data:image/xxx;base64, prefix if present
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      parts.push({
        inlineData: {
          mimeType: "image/jpeg", // Assuming JPEG/PNG for simplicity, Gemini handles most standard types
          data: base64Data,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // or gemini-2.5-flash-image if specific vision model is preferred, but 3-flash handles both well.
      contents: {
        parts: parts,
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cooked_score: {
              type: Type.INTEGER,
              description: "The level of disaster from 0 to 100",
            },
            verdict: {
              type: Type.STRING,
              description: "A short sarcastic roast or comment",
            },
          },
          required: ["cooked_score", "verdict"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response from AI");
    }

    return JSON.parse(jsonText) as JudgmentResult;

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback simulation
    return {
      cooked_score: Math.floor(Math.random() * 100),
      verdict: "AI is blind right now, but you look cooked.",
    };
  }
};