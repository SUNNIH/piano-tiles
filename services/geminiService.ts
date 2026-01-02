
import { GoogleGenAI, Type } from "@google/genai";
import { CppFramework } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCppCode = async (
  framework: CppFramework,
  bgmName: string,
  bgmVolume: number,
  additionalContext: string
): Promise<{ code: string; explanation: string }> => {
  const model = "gemini-3-pro-preview";
  
  const safeBgmName = bgmName.replace(/[^a-zA-Z0-9._-]/g, '_');

  const prompt = `
    You are an expert C++ Game Developer specializing in ${framework}.
    Create a complete, single-file C++ header/source hybrid or main.cpp for a "Piano Tiles" game.
    
    **Project Requirements:**
    1. Language: C++17 or higher.
    2. Library: ${framework}.
    3. Background Music: Load "assets/${safeBgmName}" and play on loop at ${bgmVolume.toFixed(2)} volume.
    4. Implement a 4-lane rhythm game logic where tiles fall from top to bottom.
    5. Scoring system and Game Over state if a tile reaches the bottom without being clicked.
    
    **Context:**
    ${additionalContext}

    Return the response in JSON format with 'code' and 'explanation' fields.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            code: { type: Type.STRING, description: "The C++ source code" },
            explanation: { type: Type.STRING, description: "Brief explanation of the logic" }
          },
          required: ["code", "explanation"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Code Gen Error:", error);
    return {
      code: "// Error generating C++ code.\n// Check your API key or framework selection.",
      explanation: "Failed to contact Gemini API."
    };
  }
};
