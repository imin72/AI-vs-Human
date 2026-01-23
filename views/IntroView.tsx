
import React, { useState, useEffect } from 'react';
import { Brain, Cpu, ArrowRight, UserCheck, Bug, Eye, Loader, Database } from 'lucide-react';
import { Button } from '../components/Button';
import { Language } from '../types';

interface IntroViewProps {
  t: any;
  onStart: () => void;
  onHome: () => void;
  onResetProfile: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  // Debug props
  onDebugBypass?: () => void;
  onDebugPreview?: () => void;
  onDebugLoading?: () => void;
  onDebugSeed?: () => void;
}

const PROFILE_KEY = 'cognito_user_profile_v1';

const LANGUAGES: { id: Language; flag: string }[] = [
  { id: 'en', flag: '🇺🇸' },
  { id: 'ko', flag: '🇰🇷' },
  { id: 'ja', flag: '🇯🇵' },
  { id: 'zh', flag: '🇨🇳' },
  { id: 'es', flag: '🇪🇸' },
  { id: 'fr', flag: '🇫🇷' },
];

// Robust helper to check if we are in a Debug/Preview environment
const isDebugMode = () => {
  // 1. Runtime Domain Check (Priority 1: Block Production)
  if (typeof window !== 'undefined') {
    const h = window.location.hostname;
    // Explicitly DISABLE on Vercel production domains
    if (h.includes('vercel.app')) return false;
  }

  try {
    // 2. Check Vite's DEV flag (covers npm run dev)
    // @ts-ignore
    if (import.meta.env.DEV) return true;
  } catch {}

  // 3. Runtime Domain Check (Priority 2: Allow Preview/Localhost)
  if (typeof window !== 'undefined') {
    const h = window.location.hostname;

    // ENABLE for Localhost
    if (h === 'localhost' || h === '127.0.0.1') return true;

    // ENABLE for AIStudio / Project IDX / Cloud Shell Previews
    // These typically run on googleusercontent.com or similar subdomains
    if (h.includes('googleusercontent.com') || h.includes('webcontainer.io') || h.includes('idx.google')) {
      return true;
    }
  }

  // Default to false for production
  return false;
};

export const IntroView: React.FC<IntroViewProps> = ({ 
  t, 
  onStart, 
  onResetProfile, 
  language, 
  setLanguage,
  onDebugBypass,
  onDebugPreview,
  onDebugLoading,
  onDebugSeed
}) => {
  const [hasProfile, setHasProfile] = useState(false);
  // Default debug check
  const isEnvDebug = isDebugMode();
  // Manual override state for production
  const [showDebugOverride, setShowDebugOverride] = useState(false);
  const [, setTapCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      const p = JSON.parse(saved);
      if (p.nationality && p.gender) {
        setHasProfile(true);
      }
    }
  }, []);

  const handleSecretTap = () => {
    setTapCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setShowDebugOverride(true);
        return 0;
      }
      return newCount;
    });
  };

  const showDebug = isEnvDebug || showDebugOverride;

  return (
    <div className="w-full max-w-2xl relative flex flex-col items-center animate-fade-in h-full">
      
      {/* New Language Selection Header */}
      <div className="w-full flex justify-center gap-3 py-6 z-20 shrink-0">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            onClick={() => setLanguage(lang.id)}
            className={`text-2xl w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${
              language === lang.id 
                ? 'bg-slate-800 border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-110 opacity-100' 
                : 'bg-slate-900/50 border border-slate-700 opacity-40 hover:opacity-100 hover:bg-slate-800 hover:scale-105'
            }`}
            aria-label={`Select ${lang.id}`}
          >
            {lang.flag}
          </button>
        ))}
      </div>
      
      {/* Main Content */}
      <div className="glass-panel p-8 rounded-3xl text-center w-full flex flex-col items-center justify-center flex-grow mb-8">
        <div className="flex justify-center gap-6 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400 mb-2 border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
              <Brain size={32} />
            </div>
            <span className="text-sm font-bold tracking-widest text-rose-400">{t.human_label}</span>
          </div>
          <div className="h-16 w-px bg-slate-700 self-center"></div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400 mb-2 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Cpu size={32} />
            </div>
            <span className="text-sm font-bold tracking-widest text-cyan-400">{t.ai_label}</span>
          </div>
        </div>
        
        <div className="space-y-6 mb-10 max-w-lg select-none">
          <h2 
            onClick={handleSecretTap}
            className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] tracking-tight leading-tight cursor-default active:scale-95 transition-transform duration-100"
          >
            {t.title}
          </h2>
          <p className="text-base md:text-lg text-slate-400 leading-relaxed font-medium">
            {t.desc}
          </p>
        </div>

        <div className="w-full max-w-md space-y-4">
          <Button onClick={onStart} fullWidth className="text-lg py-4 group shadow-cyan-500/20">
            {hasProfile ? (
              <span className="flex items-center justify-center gap-2">
                <UserCheck size={20} /> {t.btn_continue}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {t.btn_start} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
          
          {hasProfile && (
             <button 
               className="text-sm font-bold text-slate-600 hover:text-rose-400 transition-colors py-2" 
               onClick={onResetProfile}
             >
               {t.btn_reset}
             </button>
          )}
        </div>

        {/* Debug Controls (Visible in Local/Preview OR via Secret Tap) */}
        {showDebug && (
          <div className="mt-8 pt-4 border-t border-slate-800/50 w-full flex justify-center gap-2 animate-fade-in flex-wrap">
             {onDebugBypass && (
              <button onClick={onDebugBypass} className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-1 px-2 py-1 bg-slate-900 rounded border border-slate-800 hover:border-rose-500/50 transition-all">
                <Bug size={10} /> BYPASS
              </button>
             )}
             {onDebugPreview && (
              <button onClick={onDebugPreview} className="text-[10px] text-slate-500 hover:text-cyan-400 flex items-center gap-1 px-2 py-1 bg-slate-900 rounded border border-slate-800 hover:border-cyan-500/50 transition-all">
                <Eye size={10} /> PREVIEW
              </button>
             )}
             {onDebugLoading && (
              <button onClick={onDebugLoading} className="text-[10px] text-slate-500 hover:text-yellow-400 flex items-center gap-1 px-2 py-1 bg-slate-900 rounded border border-slate-800 hover:border-yellow-500/50 transition-all">
                <Loader size={10} /> LOADING
              </button>
             )}
             {onDebugSeed && (
              <button onClick={onDebugSeed} className="text-[10px] text-slate-500 hover:text-green-400 flex items-center gap-1 px-2 py-1 bg-slate-900 rounded border border-slate-800 hover:border-green-500/50 transition-all">
                <Database size={10} /> SEED DB
              </button>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
