import { GoogleGenAI } from "@google/genai";
import { MENU_CONTEXT } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getChefResponse = async (userMessage: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
      config: {
        systemInstruction: MENU_CONTEXT,
        thinkingConfig: { thinkingBudget: 0 }, // Minimize latency for chat
      },
    });
    
    return response.text || "Mamma mia! I cannot speak right now. Please try again.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Scusi, the kitchen is very busy (AI Error). Let's focus on booking your table.";
  }
};
