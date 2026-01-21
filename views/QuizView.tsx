
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Cpu, Terminal, Zap } from 'lucide-react';
import { Button } from '../components/Button';
import { QuizQuestion } from '../types';

interface QuizViewProps {
  t: any;
  questions: QuizQuestion[];
  currentIndex: number;
  selectedOption: string | null;
  topicLabel: string;
  onSelectOption: (opt: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  backLabel: string;
}

export const QuizView: React.FC<QuizViewProps> = ({ 
  t, 
  questions, 
  currentIndex, 
  selectedOption, 
  topicLabel, 
  onSelectOption, 
  onConfirm,
  onBack,
  backLabel
}) => {
  const question = questions[currentIndex];
  const [aiLogs, setAiLogs] = useState<string[]>([]);
  const [aiComment, setAiComment] = useState("");
  const logContainerRef = useRef<HTMLDivElement>(null);

  // AI 사고 프로세스 로그 시뮬레이션
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
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setAiLogs(prev => [...prev, logs[i]].slice(-4));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 1200);

    setAiComment(currentIndex === 0 ? "인간, 당신의 지능을 증명해 보십시오." : "다음 단계는 더 어려울 것입니다.");

    return () => clearInterval(interval);
  }, [currentIndex, topicLabel]);

  // 보기를 선택할 때마다 AI의 도발
  useEffect(() => {
    if (selectedOption) {
      const taunts = [
        "그것이 최선의 선택입니까?",
        "데이터베이스에는 다른 결과가 있습니다.",
        "인간 특유의 편향이 보이는군요.",
        "흥미롭군요. 계속해 보십시오.",
        "시간은 흐르고 있습니다. 서두르세요."
      ];
      setAiComment(taunts[Math.floor(Math.random() * taunts.length)]);
    }
  }, [selectedOption]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [aiLogs]);

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl animate-fade-in">
      {/* AI 실시간 상태창 (Psychological Pressure) */}
      <div className="glass-panel p-3 rounded-2xl border-cyan-500/30 flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Cpu size={24} className="text-cyan-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-cyan-500 uppercase tracking-tighter">AI STATUS: ACTIVE</span>
            <div ref={logContainerRef} className="h-4 overflow-hidden">
               <p className="text-[9px] font-mono text-cyan-300/70 uppercase leading-tight">
                 {aiLogs[aiLogs.length - 1] || "WAITING..."}
               </p>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          {[1,2,3].map(i => <div key={i} className="w-1 h-3 bg-cyan-500/30 rounded-full overflow-hidden">
            <div className="w-full bg-cyan-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s`, height: `${30 + i * 20}%` }}></div>
          </div>)}
        </div>
      </div>

      {/* 메인 퀴즈 카드 */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl space-y-6 relative overflow-visible">
        {/* AI 도발 말풍선 (Interactivity) */}
        <div className="absolute -top-4 -right-2 md:-right-8 animate-bounce">
          <div className="relative bg-rose-600 text-white text-[10px] md:text-xs font-bold px-4 py-2 rounded-2xl shadow-xl border border-rose-400">
            {aiComment}
            <div className="absolute -bottom-1 left-4 w-3 h-3 bg-rose-600 rotate-45 border-r border-b border-rose-400"></div>
          </div>
        </div>

        <button 
          onClick={onBack}
          className="absolute top-6 left-6 text-slate-500 hover:text-white text-sm flex items-center gap-1 transition-colors"
        >
          <ChevronLeft size={16} /> {backLabel}
        </button>

        <div className="flex justify-between items-center text-sm text-slate-400 uppercase tracking-wider pl-16">
          <span className="bg-slate-800 px-3 py-1 rounded-full text-[10px] font-bold border border-slate-700 text-cyan-400">
              {topicLabel}
          </span>
          <span className="font-mono text-xs">{currentIndex + 1} / {questions.length}</span>
        </div>

        <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-500 transition-all duration-700 ease-out"
            style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
          ></div>
        </div>

        <div className="min-h-[100px] flex flex-col justify-center py-4">
          <h3 className="text-xl md:text-2xl font-black leading-tight text-white tracking-tight">
            {question.question}
          </h3>
          {question.context && (
            <div className="mt-4 flex gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <Zap size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-slate-400 text-xs italic leading-relaxed">
                  {question.context}
                </p>
            </div>
          )}
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
              {selectedOption === option && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
              )}
            </button>
          ))}
        </div>

        <Button 
          onClick={onConfirm} 
          disabled={!selectedOption}
          fullWidth
          className="mt-4 py-4 text-base font-black uppercase tracking-widest"
        >
          {currentIndex === questions.length - 1 ? "FINALIZE PROTOCOL" : "NEXT SEQUENCE"} <ChevronRight size={18} />
        </Button>
      </div>

      {/* 하단 터미널 로그 (Visual Metaphor) */}
      <div className="glass-panel p-3 rounded-xl bg-black/40 border-slate-800 flex items-start gap-2">
        <Terminal size={14} className="text-cyan-500 mt-0.5" />
        <div className="flex-1 font-mono text-[9px] text-slate-500 leading-tight">
          {aiLogs.map((log, i) => (
            <div key={i} className={i === aiLogs.length - 1 ? "text-cyan-400/80" : ""}>
              > {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
