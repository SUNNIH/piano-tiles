
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCppCode = async (
  bgmName: string,
  bgmVolume: number,
  additionalContext: string
): Promise<{ code: string; explanation: string }> => {
  const model = "gemini-3-pro-preview";
  
  const safeBgmName = bgmName.replace(/[^a-zA-Z0-9._-]/g, '_');

  const prompt = `
    You are an expert C++ Game Developer.
    Create a complete, single-file C++ game source code using the **SFML** (Simple and Fast Multimedia Library).
    
    The program is a "Piano Tiles" clone.
    
    **Project Requirements:**
    1. Uses sf::RenderWindow for graphics.
    2. Uses sf::Music for background music.
    3. Load audio from: "assets/${safeBgmName}"
    4. Background music volume should be set to ${Math.floor(bgmVolume * 100)} (SFML uses 0-100).
    5. Implement 4 lanes where black tiles fall.
    6. If the user clicks a tile, it disappears and score increases.
    7. If a tile reaches the bottom, the game ends.
    
    **General Requirements:**
    - Provide the full source code (main.cpp).
    - Include comments explaining how to compile it (e.g., g++ main.cpp -lsfml-graphics -lsfml-window -lsfml-system -lsfml-audio).
    - ${additionalContext}

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
      code: "// Error generating C++ code.\n// Please check your API key.",
      explanation: "Failed to contact Gemini API."
    };
  }
};
