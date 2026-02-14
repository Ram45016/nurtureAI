
import { GoogleGenAI, Type, Modality } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeDiet = async (entries: string[], childAge: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze these food entries for a child aged ${childAge}: ${entries.join(', ')}. Provide a nutritional assessment and suggest 3 healthy additions suitable for their developmental stage. Return as Markdown.`,
  });
  return response.text;
};

export const analyzeMood = async (events: any[], childAge: string) => {
  const ai = getAI();
  const eventDescriptions = events.map(e => `${new Date(e.timestamp).toLocaleTimeString()}: ${e.description} (${e.type})`).join('\n');
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on these logs for a ${childAge} child:\n${eventDescriptions}\n\nAnalyze their emotional trend. Is there a pattern of distress or joy? Provide 2 specific parenting tips. Markdown only.`,
  });
  return response.text;
};

export const generateProactiveRecommendations = async (childName: string, age: string, lastMealTime: string | null, lastWaterTime: string | null, lastSleepTime: string | null) => {
  const ai = getAI();
  const prompt = `Child: ${childName}, Age: ${age}.
  Last Meal: ${lastMealTime || 'None logged today'}.
  Last Water: ${lastWaterTime || 'None logged today'}.
  Last Sleep: ${lastSleepTime || 'None logged today'}.
  
  Based on this history and developmental stage, provide a short "AI Smart Notification". 
  What should the parent do next? (e.g., 'Time for a 100ml water top-up' or 'Recommend a high-protein snack in 30 mins'). 
  Keep it under 30 words. Be direct and helpful.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });
  return response.text;
};

export const analyzeEnvironment = async (temp: number, humidity: number, noise: number, childAge: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The current room environment for a ${childAge} child is: Temperature: ${temp}°C, Humidity: ${humidity}%, Ambient Noise: ${noise}dB. 
    Analyze if this is optimal for sleep and safety. Provide 1 specific recommendation for improvement if needed. Be concise. Return as a short paragraph.`,
  });
  return response.text;
};

export const analyzeAudioBuffer = async (audioBase64: string, mimeType: string = 'audio/webm') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: audioBase64, mimeType: mimeType } },
        { text: "Analyze the audio signature. If it sounds like a baby crying, identify the possible reason (hunger, tired, gas, etc). If it sounds like a child playing or laughing, identify the mood. Be specific about the emotional state detected. Return JSON only." }
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
};

export const summarizeMedicalNote = async (note: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Summarize this pediatric medical note for a parent. Keep it clear, reassuring, and highlight the most important takeaways: ${note}`,
  });
  return response.text;
};

export const getParentingAdvice = async (query: string, childAge: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: {
      systemInstruction: `You are a world-class pediatrician and child development expert. You are providing advice for a child aged ${childAge}. Be supportive, scientific, and clear.`
    }
  });
  return response.text;
};

export const generateSmartStory = async (childName: string, theme: string, age: number) => {
  const ai = getAI();
  const prompt = `Write a soothing bedtime story for ${childName} (${age} years old) about ${theme}. Keep it under 200 words and use child-friendly language.`;
  const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
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
