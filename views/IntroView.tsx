
import React from 'react';
import { Brain, Cpu, ArrowRight, ChevronLeft, Home } from 'lucide-react';
import { Button } from '../components/Button';

interface IntroViewProps {
  t: any;
  onStart: () => void;
  onBack: () => void;
  onHome: () => void;
  backLabel: string;
}

export const IntroView: React.FC<IntroViewProps> = ({ t, onStart, onBack, onHome, backLabel }) => {
  // AI 또는 IA 단어를 찾아 스타일링을 적용하는 헬퍼 함수
  const renderStyledTitle = (text: string) => {
    const parts = text.split(/(AI|IA)/g);
    return parts.map((part, i) => {
      if (part === 'AI' || part === 'IA') {
        return (
          <span 
            key={i} 
            className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-blue-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] inline-block transform hover:scale-105 transition-transform duration-300 cursor-default"
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const navBtnStyle = "absolute top-4 text-white bg-slate-800/80 backdrop-blur-md p-2 rounded-full hover:bg-slate-700 transition-all z-20 border border-white/10 shadow-lg";

  return (
    <div className="w-full max-w-2xl relative pt-16 animate-fade-in flex flex-col items-center">
      <button 
        onClick={onBack}
        className={`${navBtnStyle} left-0 md:-left-12`}
        aria-label={backLabel}
      >
        <ChevronLeft size={20} />
      </button>

      <button 
        onClick={onHome}
        className={`${navBtnStyle} right-0 md:-right-12`}
        aria-label="Home"
      >
        <Home size={20} />
      </button>
      
      <div className="glass-panel p-8 rounded-3xl text-center w-full flex flex-col items-center">
        <div className="flex justify-center gap-6 mb-8 mt-4">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400 mb-2 border border-rose-500/50">
              <Brain size={32} />
            </div>
            <span className="text-sm font-bold tracking-widest text-rose-400">{t.human_label}</span>
          </div>
          <div className="h-16 w-px bg-slate-700 self-center"></div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400 mb-2 border border-cyan-500/50">
              <Cpu size={32} />
            </div>
            <span className="text-sm font-bold tracking-widest text-cyan-400">{t.ai_label}</span>
          </div>
        </div>
        
        <div className="space-y-4 mb-8 max-w-lg">
          <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] tracking-tight leading-tight">
            {renderStyledTitle(t.title)}
          </h2>
          <p className="text-base md:text-lg text-slate-400 leading-relaxed font-medium">
            {t.desc}
          </p>
        </div>

        <Button onClick={onStart} fullWidth className="text-lg py-4 group">
          {t.btn_start} <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
