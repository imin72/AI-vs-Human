import React from 'react';
import { Globe } from 'lucide-react';
import { Language } from '../types';

interface LanguageViewProps {
  onSelect: (lang: Language) => void;
}

export const LanguageView: React.FC<LanguageViewProps> = ({ onSelect }) => {
  return (
    <div className="glass-panel p-8 rounded-3xl text-center space-y-8 animate-fade-in">
       <div className="flex justify-center mb-4 text-cyan-400">
         <Globe size={48} />
       </div>
       <h2 className="text-3xl font-bold text-white">Select Language</h2>
       <div className="grid grid-cols-2 gap-4">
          <button onClick={() => onSelect('en')} className="p-6 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-cyan-500 transition-all">
            <span className="text-4xl block mb-2">🇺🇸</span>
            <span className="font-bold text-lg">English</span>
          </button>
          <button onClick={() => onSelect('ko')} className="p-6 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-cyan-500 transition-all">
            <span className="text-4xl block mb-2">🇰🇷</span>
            <span className="font-bold text-lg">한국어</span>
          </button>
          <button onClick={() => onSelect('ja')} className="p-6 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-cyan-500 transition-all">
            <span className="text-4xl block mb-2">🇯🇵</span>
            <span className="font-bold text-lg">日本語</span>
          </button>
          <button onClick={() => onSelect('es')} className="p-6 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-cyan-500 transition-all">
            <span className="text-4xl block mb-2">🇪🇸</span>
            <span className="font-bold text-lg">Español</span>
          </button>
       </div>
    </div>
  );
};
