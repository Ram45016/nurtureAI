
import React, { useState, useRef, useEffect } from 'react';
import { Child } from '../types';
import { getParentingAdvice } from '../services/gemini';

const AIAssistant: React.FC<{ child: Child }> = ({ child }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: `Hi there! I'm your NurtureAI assistant. I've been monitoring ${child.name}'s trends. How can I help you today?` }
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
      const age = new Date().getFullYear() - birthDate.getFullYear();
      const response = await getParentingAdvice(userMsg, `${age} years old`);
      setMessages(prev => [...prev, { role: 'ai', text: response || "I'm sorry, I couldn't process that. Please try again." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error connecting to AI. Please check your connectivity." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <header className="mb-8 text-center md:text-left">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center md:justify-start gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-100">✨</div>
          Gemini Pediatric Support
        </h2>
        <p className="text-slate-500 font-medium mt-2">Personalized guidance based on {child.name}'s development stage.</p>
      </header>

      <div className="flex-1 bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col relative">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-6 rounded-[2rem] shadow-sm relative ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-100' 
                  : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
              }`}>
                {msg.role === 'ai' && <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">NurtureAI Expert</div>}
                <p className="text-base font-bold leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="bg-slate-50 p-6 rounded-[2rem] rounded-tl-none border border-slate-100 flex items-center gap-3">
                 <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce"></div>
                 <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                 <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
               </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-white">
          <div className="flex gap-4 items-center bg-slate-50 p-2 rounded-[2rem] border-2 border-slate-100 focus-within:border-indigo-400 focus-within:bg-white transition-all">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about teething, milestones, or feeding routines..."
              className="flex-1 px-6 py-4 bg-transparent outline-none font-bold text-slate-900 placeholder:text-slate-300"
            />
            <button 
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:scale-100"
            >
              <span className="text-xl">🚀</span>
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-widest mt-4">Powered by Gemini Multi-modal Intelligence</p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
