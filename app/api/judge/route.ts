import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";

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

export async function POST(request: NextRequest) {
  try {
    const { story, imageBase64 } = await request.json();

    if (!story) {
      return NextResponse.json(
        { error: 'Story is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const parts: any[] = [{ text: story }];

    if (imageBase64) {
      // Remove data:image/xxx;base64, prefix if present
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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

    const result = JSON.parse(jsonText);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Fallback response
    return NextResponse.json({
      cooked_score: Math.floor(Math.random() * 100),
      verdict: "AI is blind right now, but you look cooked.",
    });
  }
}

