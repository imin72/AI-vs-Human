
import React, { useState, useEffect } from 'react';
import { Brain, Cpu, ArrowRight, ChevronLeft, Home, UserCheck } from 'lucide-react';
import { Button } from '../components/Button';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Language } from '../types';

interface IntroViewProps {
  t: any;
  onStart: () => void;
  onBack: () => void;
  onHome: () => void;
  onResetProfile: () => void;
  backLabel: string;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const PROFILE_KEY = 'cognito_user_profile_v1';

export const IntroView: React.FC<IntroViewProps> = ({ t, onStart, onBack, onHome, onResetProfile, backLabel, language, setLanguage }) => {
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      const p = JSON.parse(saved);
      if (p.nationality && p.gender) {
        setHasProfile(true);
      }
    }
  }, []);

  const btnStyle = "text-white bg-slate-800/80 backdrop-blur-md p-2 rounded-full hover:bg-slate-700 transition-all border border-white/10 shadow-lg";

  return (
    <div className="w-full max-w-2xl relative pt-16 animate-fade-in flex flex-col items-center">
      <div className="absolute top-4 left-0 md:-left-12 z-20">
        <button 
          onClick={onBack}
          className={btnStyle}
          aria-label={backLabel}
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="absolute top-4 right-0 md:-right-12 z-20 flex gap-2">
        <LanguageSwitcher 
          currentLanguage={language} 
          onLanguageChange={setLanguage} 
        />
        <button 
          onClick={onHome}
          className={btnStyle}
          aria-label="Home"
        >
          <Home size={20} />
        </button>
      </div>
      
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
            {t.title}
          </h2>
          <p className="text-base md:text-lg text-slate-400 leading-relaxed font-medium">
            {t.desc}
          </p>
        </div>

        <Button onClick={onStart} fullWidth className="text-lg py-4 group">
          {hasProfile ? (
            <span className="flex items-center gap-2">
              <UserCheck size={20} /> {t.btn_continue}
            </span>
          ) : (
            <>
              {t.btn_start} <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
        
        {hasProfile && (
           <p className="mt-4 text-sm font-bold text-slate-500 cursor-pointer hover:text-rose-400 transition-colors" onClick={onResetProfile}>
             {t.btn_reset}
           </p>
        )}
      </div>
    </div>
  );
};
