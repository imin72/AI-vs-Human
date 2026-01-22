
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Cpu, Terminal, Zap, Lightbulb, Home, Timer, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/Button';
import { QuizQuestion, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface QuizViewProps {
  questions: QuizQuestion[];
  currentIndex: number;
  selectedOption: string | null;
  topicLabel: string;
  onSelectOption: (opt: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  onHome: () => void;
  backLabel: string;
  language: Language;
}

export const QuizView: React.FC<QuizViewProps> = ({ 
  questions, 
  currentIndex, 
  selectedOption, 
  topicLabel, 
  onSelectOption, 
  onConfirm,
  onBack,
  onHome,
  language
}) => {
  const question = questions[currentIndex];
  const [aiLogs, setAiLogs] = useState<string[]>([]);
  const [aiComment, setAiComment] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [aiProgress, setAiProgress] = useState(0); // 0 to 100
  const logContainerRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language].quiz;

  // AI 사고 프로세스 로그 및 타이머 시뮬레이션
  useEffect(() => {
    const logs = [
      "INITIALIZING NEURAL NETWORK...",
      `SCANNING DATABASE: ${topicLabel.toUpperCase()}`,
      "ANALYZING HUMAN COGNITIVE PATTERNS...",
      "AI PREDICTION CONFIDENCE: 98.4%",
      "AI STATUS: READY",
      "WAITING FOR HUMAN INPUT..."
    ];
    
    setAiLogs([]);
    setShowHint(false); 
    setAiProgress(0);

    // AI 문제 풀이 시간 시뮬레이션 (문제 길이에 비례)
    // 기본 2초 + 글자당 0.05초 (긴 문제는 더 오래 걸림)
    const thinkingTime = 2000 + (question.question.length * 50);
    const updateInterval = 50;
    const progressStep = 100 / (thinkingTime / updateInterval);

    let progressTimer = setInterval(() => {
      setAiProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + progressStep;
      });
    }, updateInterval);

    let i = 0;
    const logInterval = setInterval(() => {
      if (i < logs.length) {
        setAiLogs(prev => [...prev, logs[i]].slice(-4));
        i++;
      } else {
        clearInterval(logInterval);
      }
    }, 1200);

    setAiComment(currentIndex === 0 ? 
      (language === 'ko' ? "인간, 당신의 지능을 증명해 보십시오." : "Human, prove your intelligence.") : 
      (language === 'ko' ? "다음 단계는 더 어려울 것입니다." : "The next sequence will be more complex.")
    );

    return () => {
      clearInterval(logInterval);
      clearInterval(progressTimer);
    };
  }, [currentIndex, topicLabel, language, question.question]);

  // 보기를 선택할 때마다 AI의 도발
  useEffect(() => {
    if (selectedOption) {
      const taunts = language === 'ko' ? [
        "그것이 최선의 선택입니까?",
        "데이터베이스에는 다른 결과가 있습니다.",
        "인간 특유의 편향이 보이는군요.",
        "흥미롭군요. 계속해 보십시오.",
        "시간은 흐르고 있습니다. 서두르세요."
      ] : [
        "Is that your final logic?",
        "My database suggests otherwise.",
        "Typical human cognitive bias detected.",
        "Intriguing. Continue your attempt.",
        "Time is a finite resource for you."
      ];
      setAiComment(taunts[Math.floor(Math.random() * taunts.length)]);
    }
  }, [selectedOption, language]);

  const handleHintClick = () => {
    setShowHint(true);
    setAiComment(language === 'ko' ? 
      "힌트를 구걸하다니... 인간의 한계인가요? 점수 효율이 저하됩니다." : 
      "Begging for hints? Human limitations reached. Efficiency penalty applied."
    );
  };

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [aiLogs]);

  const navBtnStyle = "absolute top-4 text-white bg-slate-800/80 backdrop-blur-md p-2 rounded-full hover:bg-slate-700 transition-all z-20 border border-white/10 shadow-lg";
  const isAiDone = aiProgress >= 100;

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl animate-fade-in pb-8 relative pt-16">
      {/* Navigation Buttons */}
      <button 
        onClick={onBack}
        className={`${navBtnStyle} left-0 md:-left-12`}
        aria-label="Back"
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

      {/* 상단 AI 상태창 (Sticky 적용) */}
      <div className="sticky top-2 z-40 glass-panel p-3 rounded-2xl border-cyan-500/30 flex items-center justify-between overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Cpu size={24} className={`${isAiDone ? 'text-rose-500' : 'text-cyan-400'} animate-pulse transition-colors duration-500`} />
            <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full animate-ping ${isAiDone ? 'bg-rose-500' : 'bg-green-500'}`}></div>
          </div>
          <div className="flex flex-col">
            <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${isAiDone ? 'text-rose-500' : 'text-cyan-500'}`}>
              AI STATUS: {isAiDone ? 'ANSWER FOUND' : 'PROCESSING...'}
            </span>
            <div ref={logContainerRef} className="h-4 overflow-hidden">
               <p className={`text-[9px] font-mono uppercase leading-tight ${isAiDone ? 'text-rose-300' : 'text-cyan-300/70'}`}>
                 {aiLogs[aiLogs.length - 1] || "WAITING..."}
               </p>
            </div>
          </div>
        </div>
        
        {/* AI Progress Bar in Header */}
        <div className="flex flex-col items-end gap-1 w-24">
           <div className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
             {isAiDone ? <CheckCircle2 size={10} className="text-rose-500"/> : <Timer size={10} className="animate-spin" />}
             {Math.floor(aiProgress)}%
           </div>
           <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
             <div 
                className={`h-full transition-all duration-100 ease-linear ${isAiDone ? 'bg-rose-500' : 'bg-cyan-500'}`}
                style={{ width: `${aiProgress}%` }}
             ></div>
           </div>
        </div>
      </div>

      {/* 메인 퀴즈 카드 */}
      <div className={`glass-panel p-6 md:p-8 rounded-3xl space-y-6 relative overflow-visible transition-all duration-700 border ${
        isAiDone 
          ? 'border-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.2)] bg-rose-950/20' 
          : 'border-white/10'
      }`}>
        {/* AI 완료 표시 오버레이 효과 */}
        {isAiDone && (
           <div className="absolute top-0 right-0 p-2 pointer-events-none">
              <span className="inline-flex items-center gap-1 bg-rose-600 text-white text-[10px] font-black px-2 py-1 rounded-bl-xl rounded-tr-2xl shadow-lg animate-pulse">
                AI DONE
              </span>
           </div>
        )}

        {/* AI 도발 말풍선 */}
        <div className="absolute -top-4 -right-2 md:-right-8 animate-bounce z-20">
          <div className="relative bg-rose-600 text-white text-[10px] md:text-xs font-bold px-4 py-2 rounded-2xl shadow-xl border border-rose-400 max-w-[180px]">
            {aiComment}
            <div className="absolute -bottom-1 left-4 w-3 h-3 bg-rose-600 rotate-45 border-r border-b border-rose-400"></div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-slate-400 uppercase tracking-wider">
          <span className="bg-slate-800 px-3 py-1 rounded-full text-[10px] font-bold border border-slate-700 text-cyan-400">
              {topicLabel}
          </span>
          <span className="font-mono text-xs">{currentIndex + 1} / {questions.length}</span>
        </div>

        <div className="min-h-[100px] flex flex-col justify-center py-4">
          <h3 className="text-xl md:text-2xl font-black leading-tight text-white tracking-tight">
            {question.question}
          </h3>
          
          <div className="mt-4">
            {!showHint ? (
              <button 
                onClick={handleHintClick}
                className="flex items-center gap-2 text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-widest bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/20"
              >
                <Lightbulb size={12} /> {language === 'ko' ? "AI 힌트 요청 (점수 패널티)" : "Request AI Hint (Penalty)"}
              </button>
            ) : (
              <div className="flex gap-3 p-3 rounded-xl bg-slate-900/50 border border-amber-500/30 animate-fade-in">
                <Zap size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-slate-300 text-xs italic leading-relaxed">
                  {question.context}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => onSelectOption(option)}
              className={`p-4 rounded-2xl text-left transition-all duration-300 border relative group overflow-hidden ${
                selectedOption === option
                  ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_25px_rgba(8,145,178,0.5)] scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center font-black text-xs transition-colors ${
                  selectedOption === option ? 'border-white bg-white text-cyan-600' : 'border-slate-700 text-slate-600'
                }`}>
                  {['A','B','C','D'][idx]}
                </div>
                <span className={`font-bold text-sm md:text-base ${selectedOption === option ? 'text-white' : 'group-hover:text-slate-200'}`}>
                  {option}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 하단 제어 영역 (Progress & Navigation) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
             <span>Human Progress</span>
             <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/30">
            <div 
              className="h-full bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={onConfirm} 
            disabled={!selectedOption}
            fullWidth
            className="py-4 text-sm font-black uppercase tracking-widest flex-1"
          >
            {currentIndex === questions.length - 1 ? t.btn_finish : t.btn_next} <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      {/* 최하단 터미널 로그 */}
      <div className="glass-panel p-3 rounded-xl bg-black/40 border-slate-800 flex items-start gap-2 opacity-60 hover:opacity-100 transition-opacity">
        <Terminal size={14} className="text-cyan-500 mt-0.5" />
        <div className="flex-1 font-mono text-[9px] text-slate-500 leading-tight">
          {aiLogs.map((log, i) => (
            <div key={i} className={i === aiLogs.length - 1 ? "text-cyan-400/80" : ""}>
              &gt; {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
