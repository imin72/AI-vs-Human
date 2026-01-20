import React from 'react';
import { Brain, Cpu, ArrowRight, ChevronLeft } from 'lucide-react';
import { Button } from '../components/Button';

interface IntroViewProps {
  t: any;
  onStart: () => void;
  onBack: () => void;
  backLabel: string;
}

export const IntroView: React.FC<IntroViewProps> = ({ t, onStart, onBack, backLabel }) => {
  return (
    <div className="glass-panel p-8 rounded-3xl text-center space-y-6 animate-fade-in relative">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
      >
        <ChevronLeft size={16} /> {backLabel}
      </button>
      
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
      <p className="text-lg text-slate-300">
        {t.desc}
      </p>
      <Button onClick={onStart} fullWidth className="text-lg py-4 group">
        {t.btn_start} <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
};