
import { GoogleGenAI, Type, Modality } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("NurtureAI: API_KEY is missing from environment variables.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

/**
 * GEMINI TEXT REASONING ENGINE
 * Optimized for high-fidelity pediatric advice and reasoning.
 */
const callGemini = async (prompt: string, model: string = 'gemini-3-flash-preview', systemInstruction: string = "You are a helpful assistant.") => {
  try {
    const ai = getAI();
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
    console.error("Gemini API Error Detail:", error);
    if (error.message?.includes("API key not valid")) {
      return "ERROR: The provided Gemini API Key is invalid. Please check your Vercel Environment Variables.";
    }
    if (error.message?.includes("User location is not supported")) {
      return "ERROR: Gemini is not yet available in your current region.";
    }
    return "The Gemini brain is currently processing. Please check your network and API configuration on Vercel.";
  }
};

export const analyzeDiet = async (entries: string[], childAge: string) => {
  const prompt = `Analyze these food entries for a child aged ${childAge}: ${entries.join(', ')}. Provide a nutritional assessment and suggest 3 healthy additions suitable for their developmental stage. Return as Markdown.`;
  return await callGemini(prompt, 'gemini-3-flash-preview', "You are a pediatric nutritionist.");
};

export const analyzeMood = async (events: any[], childAge: string) => {
  const eventDescriptions = events.map(e => `${new Date(e.timestamp).toLocaleTimeString()}: ${e.description} (${e.type})`).join('\n');
  const prompt = `Based on these logs for a ${childAge} child:\n${eventDescriptions}\n\nAnalyze their emotional trend. Is there a pattern of distress or joy? Provide 2 specific parenting tips. Markdown only.`;
  return await callGemini(prompt, 'gemini-3-pro-preview', "You are a child psychologist.");
};

export const generateProactiveRecommendations = async (childName: string, age: string, lastMealTime: string | null, lastWaterTime: string | null, lastSleepTime: string | null) => {
  const prompt = `Child: ${childName}, Age: ${age}.
  Last Meal: ${lastMealTime || 'None logged today'}.
  Last Water: ${lastWaterTime || 'None logged today'}.
  Last Sleep: ${lastSleepTime || 'None logged today'}.
  
  Based on this history and developmental stage, provide a short "AI Smart Notification". 
  What should the parent do next? Keep it under 25 words. Be direct.`;

  return await callGemini(prompt, 'gemini-3-flash-preview', "You are a proactive AI parenting assistant. Give short, punchy advice.");
};

export const analyzeEnvironment = async (temp: number, humidity: number, noise: number, childAge: string) => {
  const prompt = `The current room environment for a ${childAge} child is: Temperature: ${temp}°C, Humidity: ${humidity}%, Ambient Noise: ${noise}dB. 
  Analyze if this is optimal for sleep and safety. Provide 1 specific recommendation.`;
  return await callGemini(prompt, 'gemini-3-flash-preview', "You are an expert in infant sleep safety.");
};

export const summarizeMedicalNote = async (note: string) => {
  const prompt = `Summarize this pediatric medical note for a parent. Keep it clear, reassuring, and highlight the most important takeaways: ${note}`;
  return await callGemini(prompt, 'gemini-3-pro-preview', "You are a friendly pediatrician explaining notes to a parent.");
};

export const getParentingAdvice = async (query: string, childAge: string) => {
  const sysInstr = `You are a world-class pediatrician and child development expert providing advice for a child aged ${childAge}. Be supportive, scientific, and clear.`;
  return await callGemini(query, 'gemini-3-pro-preview', sysInstr);
};

/**
 * MULTIMODAL: Acoustic Signature Analysis
 */
export const analyzeAudioBuffer = async (audioBase64: string, mimeType: string = 'audio/webm') => {
  try {
    const ai = getAI();
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

/**
 * GEMINI STORY & SPEECH GENERATION
 */
export const generateSmartStory = async (childName: string, theme: string, age: number) => {
  const ai = getAI();
  const prompt = `Write a soothing bedtime story for ${childName} (${age} years old) about ${theme}. Keep it under 150 words.`;
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
  
  return { 
    storyText, 
    audioData: tts.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data 
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
