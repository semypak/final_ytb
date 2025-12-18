import { GoogleGenAI } from "@google/genai";

// NOTE: In a real app, this should be in an environment variable. 
// Since we are running in a client-side environment for this demo, we assume process.env.API_KEY is available.
// However, the prompt provided a specific YouTube key but NOT a specific Gemini key.
// I will attempt to use the process.env.API_KEY as per standard instruction. 
// If specific instructions for Gemini key were missing, I'll rely on the standard pattern.

const getSystemInstruction = () => {
  return "You are a helpful translator. Your only task is to translate the given keyword into the target language suitable for a YouTube search query. Only return the translated string, nothing else.";
};

export const translateKeyword = async (keyword: string, targetCountry: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key missing. Returning original keyword.");
    return keyword; 
  }

  // Language mapping
  const langMap: Record<string, string> = {
    '한국': 'Korean',
    '미국': 'English',
    '일본': 'Japanese',
    '인도네시아': 'Indonesian',
    '베트남': 'Vietnamese',
    '인도': 'Hindi',
    '러시아': 'Russian',
  };

  const targetLang = langMap[targetCountry] || 'Korean';

  // If the input is already likely in the target language (simple heuristic or assumption), 
  // checking that is complex. We will just ask Gemini to ensure it's in the target language.

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Translate the keyword "${keyword}" to ${targetLang}. If it is already in that language, return it as is.`,
      config: {
        systemInstruction: getSystemInstruction(),
        temperature: 0.1, // Low temperature for deterministic output
      }
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Translation Failed:", error);
    return keyword; // Fallback to original
  }
};