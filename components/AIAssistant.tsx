
import React, { useState, useRef, useEffect } from 'react';
import { Child } from '../types';
import { getParentingAdvice } from '../services/gemini';

const AIAssistant: React.FC<{ child: Child }> = ({ child }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: `Hi! I'm your NurtureAI expert, powered by Google Gemini 3. I have deep multimodal understanding of ${child.name}'s development. How can I help you?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const birthDate = new Date(child.birthDate);
      const now = new Date();
      const ageYears = now.getFullYear() - birthDate.getFullYear();
      const response = await getParentingAdvice(userMsg, `${ageYears} years old`);
      setMessages(prev => [...prev, { role: 'ai', text: response || "Gemini is busy dreaming. Please try again." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Connection to Gemini intelligence lost. Check your network." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500">
      <header className="mb-6 flex items-center justify-between px-2">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <span className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-100">✨</span>
            Gemini Intelligence
          </h2>
          <p className="text-slate-500 font-bold text-sm ml-1">Gemini 3 Pro • Multimodal Parenting Expert</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
           <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Neural Live</span>
        </div>
      </header>

      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col relative">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:20px_20px]">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] p-6 rounded-[2rem] shadow-sm relative ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-100' 
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
              }`}>
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Gemini Expert Analysis</span>
                  </div>
                )}
                <div className="text-base font-bold leading-relaxed whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="bg-white p-6 rounded-[2rem] rounded-tl-none border border-slate-100 flex items-center gap-3 shadow-sm">
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Gemini Thinking...</span>
               </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-50">
          <div className="flex gap-3 items-center bg-slate-50 p-2 rounded-[2rem] border-2 border-transparent focus-within:border-indigo-400 focus-within:bg-white transition-all shadow-inner">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={`Ask Gemini about ${child.name}...`}
              className="flex-1 px-6 py-4 bg-transparent outline-none font-bold text-slate-900 placeholder:text-slate-300"
            />
            <button 
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              <span className="text-xl">✨</span>
            </button>
          </div>
          <div className="flex justify-center items-center gap-2 mt-4 opacity-40">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Powered by Gemini Multimodal Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
