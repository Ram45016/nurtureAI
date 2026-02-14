
import React, { useState, useRef } from 'react';
import { Child } from '../types';
import { generateSmartStory, decodeAudio } from '../services/gemini';

const AIStoryTime: React.FC<{ child: Child }> = ({ child }) => {
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleGenerateStory = async () => {
    if (!theme) return;
    setLoading(true);
    try {
      // Calculate age
      const age = new Date().getFullYear() - new Date(child.birthDate).getFullYear();
      const { storyText, audioData } = await generateSmartStory(child.name, theme, age);
      setStory(storyText);

      if (audioData) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const buffer = await decodeAudio(audioData, ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center">
        <h2 className="text-3xl font-bold text-slate-800">Bedtime Story Maker 🌙</h2>
        <p className="text-slate-500">Personalized AI stories narrated for {child.name}</p>
      </header>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">What should the story be about?</label>
          <div className="flex gap-4">
            <input 
              type="text" 
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. A friendly dragon, space adventure, talking cats..." 
              className="flex-1 px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900"
            />
            <button
              onClick={handleGenerateStory}
              disabled={loading || !theme}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100 whitespace-nowrap"
            >
              {loading ? 'Creating Magic...' : 'Generate Story'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {['Dinosaurs', 'Underwater World', 'Superheroes', 'Enchanted Forest'].map(tag => (
            <button 
              key={tag}
              onClick={() => setTheme(tag)}
              className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition-all"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {story && (
        <div className="bg-indigo-50 p-10 rounded-[2.5rem] border border-indigo-100 shadow-inner relative">
          <div className="absolute top-8 right-8 text-4xl opacity-20 animate-bounce">✨</div>
          <div className="prose prose-indigo max-w-none">
            <p className="text-xl leading-relaxed text-indigo-900 font-medium italic">
              "{story}"
            </p>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-indigo-200 pt-6">
             <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl">🔊</div>
                <div>
                   <p className="text-indigo-900 font-bold text-sm">Now Narrating</p>
                   <p className="text-indigo-600 text-xs">Calm Narrator voice</p>
                </div>
             </div>
             <button className="text-indigo-600 font-bold hover:underline">Replay Audio</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIStoryTime;
