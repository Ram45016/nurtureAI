
import { GoogleGenAI, Type, Modality } from "@google/genai";

/**
 * GEMINI TEXT REASONING ENGINE
 * Optimized for high-fidelity pediatric advice and reasoning.
 * Always creates a new instance right before making an API call to ensure it uses the most up-to-date key from process.env.API_KEY.
 */
const callGemini = async (prompt: string, model: string = 'gemini-3-flash-preview', systemInstruction: string = "You are a helpful assistant.") => {
  try {
    // Creating a new instance right before call as per guidelines
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
    console.error("Gemini API Error Detail:", error);
    
    // Handle the specific error that requires key re-selection
    if (error.message?.includes("Requested entity was not found")) {
      window.dispatchEvent(new CustomEvent('gemini-key-error'));
      return "ERROR: There was an issue with your selected API key project. Please select a valid project with billing enabled.";
    }

    if (error.message?.includes("API key not valid")) {
      return "ERROR: The Gemini API Key is invalid. Please ensure you have selected a valid key.";
    }
    
    return "Connection to Gemini intelligence lost. Check your network or project billing status.";
  }
};

export const analyzeDiet = async (entries: string[], childAge: string) => {
  const prompt = `Analyze these food entries for a child aged ${childAge}: ${entries.join(', ')}. Provide a nutritional assessment and suggest 3 healthy additions. Return as Markdown.`;
  return await callGemini(prompt, 'gemini-3-flash-preview', "You are a pediatric nutritionist.");
};

export const analyzeMood = async (events: any[], childAge: string) => {
  const eventDescriptions = events.map(e => `${new Date(e.timestamp).toLocaleTimeString()}: ${e.description} (${e.type})`).join('\n');
  const prompt = `Based on these logs for a ${childAge} child:\n${eventDescriptions}\n\nAnalyze their emotional trend. Provide 2 specific tips. Markdown only.`;
  return await callGemini(prompt, 'gemini-3-pro-preview', "You are a child psychologist.");
};

export const generateProactiveRecommendations = async (childName: string, age: string, lastMealTime: string | null, lastWaterTime: string | null, lastSleepTime: string | null) => {
  const prompt = `Child: ${childName}, Age: ${age}. Last Meal: ${lastMealTime || 'None'}. Last Water: ${lastWaterTime || 'None'}. Last Sleep: ${lastSleepTime || 'None'}.
  Provide a short "AI Smart Notification". Keep it under 20 words.`;

  return await callGemini(prompt, 'gemini-3-flash-preview', "You are a proactive AI parenting assistant.");
};

export const analyzeEnvironment = async (temp: number, humidity: number, noise: number, childAge: string) => {
  const prompt = `Room: Temp: ${temp}°C, Humidity: ${humidity}%, Noise: ${noise}dB. Child Age: ${childAge}. 1 safety recommendation.`;
  return await callGemini(prompt, 'gemini-3-flash-preview', "You are an expert in infant sleep safety.");
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
    // Use .text property as per guidelines
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
  
  // Iterate through parts to find audio as per guidelines for multi-part responses
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
  
  // Audio bytes returned by the API is raw PCM data (Int16)
  const dataInt16 = new Int16Array(bytes.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, 24000);
  const channelData = buffer.getChannelData(0);
  
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
};
