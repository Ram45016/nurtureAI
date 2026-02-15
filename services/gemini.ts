
import { GoogleGenAI, Type, Modality } from "@google/genai";

/**
 * GEMINI REASONING ENGINE
 */
const callGemini = async (prompt: string, model: string = 'gemini-3-flash-preview', systemInstruction: string = "You are a helpful assistant.") => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });
    return response.text || "";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("Requested entity was not found")) {
      window.dispatchEvent(new CustomEvent('gemini-key-error'));
    }
    return "Error: Intelligence core unavailable. Please check system connectivity.";
  }
};

export const generateMealPlan = async (childName: string, ageDisplay: string) => {
  const prompt = `Generate a 3-day, nutrition-rich meal plan for ${childName} who is ${ageDisplay}.
  Include breakfast, lunch, dinner, and 2 snacks. 
  Ensure the food textures and nutrient profiles are developmentally appropriate for this exact age (0-10 years).
  Format the output as clean Markdown with bold headers for each day.`;
  
  return await callGemini(prompt, 'gemini-3-flash-preview', "You are a pediatric nutritionist specialized in child development.");
};

export const forecastVaccinations = async (childName: string, ageDisplay: string) => {
  const prompt = `Based on a child named ${childName} who is ${ageDisplay}, provide a list of the NEXT 3 most important vaccinations or health boosters recommended by international health standards (WHO/CDC) for this specific age.
  Return the information as a concise Markdown list. Include the purpose of each vaccine briefly.`;

  return await callGemini(prompt, 'gemini-3-pro-preview', "You are a specialized pediatric nurse.");
};

export const analyzeDiet = async (entries: string[], childAge: string) => {
  const prompt = `Analyze these food entries for a child aged ${childAge}: ${entries.join(', ')}. Provide a nutritional assessment and suggest 3 healthy additions. Return as Markdown.`;
  return await callGemini(prompt, 'gemini-3-flash-preview', "You are a pediatric nutritionist.");
};

export const generateProactiveRecommendations = async (childName: string, age: string, lastMealTime: string | null, lastWaterTime: string | null, lastSleepTime: string | null) => {
  const prompt = `Child: ${childName}, Age: ${age}. Last Meal: ${lastMealTime || 'None'}. Last Water: ${lastWaterTime || 'None'}. Last Sleep: ${lastSleepTime || 'None'}.
  Provide a short "AI Smart Notification". Keep it under 20 words.`;

  return await callGemini(prompt, 'gemini-3-flash-preview', "You are a proactive AI parenting assistant.");
};

export const summarizeMedicalNote = async (note: string) => {
  const prompt = `Summarize this medical note clearly: ${note}`;
  return await callGemini(prompt, 'gemini-3-pro-preview', "You are a pediatrician.");
};

export const getParentingAdvice = async (query: string, childAge: string) => {
  const sysInstr = `You are a world-class pediatrician for a child aged ${childAge}.`;
  return await callGemini(query, 'gemini-3-pro-preview', sysInstr);
};

export const analyzeAudioBuffer = async (audioBase64: string, mimeType: string = 'audio/webm') => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: audioBase64, mimeType: mimeType } },
          { text: "Analyze the audio signature. Identify if it's a cry (and why) or laughter. Return JSON only." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedActivity: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            isAlert: { type: Type.BOOLEAN },
            details: { type: Type.STRING },
            actionableAdvice: { type: Type.STRING }
          },
          required: ["detectedActivity", "confidence", "isAlert", "details", "actionableAdvice"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (err) {
    console.error("Audio Analysis Error:", err);
    throw err;
  }
};

export const generateSmartStory = async (childName: string, theme: string, age: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Write a soothing bedtime story for ${childName} (${age} years old) about ${theme}. Under 150 words.`;
  const res = await ai.models.generateContent({ 
    model: 'gemini-3-pro-preview', 
    contents: [{ role: 'user', parts: [{ text: prompt }] }] 
  });
  const storyText = res.text || '';

  const tts = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: storyText }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }
        },
      },
    },
  });
  
  const audioPart = tts.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  
  return { 
    storyText, 
    audioData: audioPart?.inlineData?.data 
  };
};

export const decodeAudio = async (base64: string, ctx: AudioContext) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const dataInt16 = new Int16Array(bytes.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
};
