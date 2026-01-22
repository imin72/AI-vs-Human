
import React, { useState, useEffect } from 'react';
import { EvaluationResult, Language } from '../types';
import { Button } from './Button';
import { Share2, RefreshCw, Brain, CheckCircle, XCircle, Users, Home, ArrowRight, Activity, Terminal, Award, BarChart3 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { LanguageSwitcher } from './LanguageSwitcher';
import { TRANSLATIONS } from '../utils/translations';

interface StageResultsProps {
  data: EvaluationResult;
  onRestart: () => void;
  onHome: () => void;
  onNextTopic?: () => void;
  remainingTopics?: number;
  nextTopicName?: string;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const StageResults: React.FC<StageResultsProps> = ({ data, onRestart, onHome, onNextTopic, remainingTopics = 0, nextTopicName, language, setLanguage }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'details'>('analysis');
  const [chartReady, setChartReady] = useState(false);
  const t = TRANSLATIONS[language].results;

  // Delay chart rendering to ensure DOM is ready (Fixes Recharts ESM issues)
  useEffect(() => {
    const timer = setTimeout(() => setChartReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!data) return null; // Safety check

  const getGrade = (score: number) => {
    if (score >= 90) return { label: 'SSS', color: 'text-yellow-400 shadow-yellow-500/50' };
    if (score >= 80) return { label: 'A+', color: 'text-cyan-400 shadow-cyan-500/50' };
    if (score >= 70) return { label: 'A', color: 'text-cyan-500 shadow-cyan-500/30' };
    if (score >= 60) return { label: 'B', color: 'text-emerald-400 shadow-emerald-500/30' };
    if (score >= 40) return { label: 'C', color: 'text-amber-400 shadow-amber-500/30' };
    return { label: 'F', color: 'text-rose-500 shadow-rose-500/30' };
  };

  const gradeInfo = getGrade(data.totalScore);
  
  const chartData = [
    { subject: t.chart.accuracy, A: data.totalScore, fullMark: 100 },
    { subject: t.chart.speed, A: Math.min(100, data.totalScore + 10), fullMark: 100 },
    { subject: t.chart.cohort, A: data.demographicPercentile, fullMark: 100 }, 
    { subject: t.chart.logic, A: data.totalScore > 50 ? 85 : 45, fullMark: 100 },
    { subject: t.chart.intuition, A: data.humanPercentile, fullMark: 100 },
  ];

  const handleShare = async () => {
    const shareText = `Cognito Protocol Analysis 🧠\nTopic: ${data.title}\nScore: ${data.totalScore}/100 [Rank ${gradeInfo.label}]\nPercentile: Top ${100 - data.humanPercentile}%\n\nProve your humanity here:`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cognito: Human vs AI',
          text: shareText,
          url: url
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${url}`);
        alert('Copied to clipboard!');
      } catch (err) {
        alert('Failed to copy');
      }
    }
  };

  const btnStyle = "text-white bg-slate-800/80 backdrop-blur-md p-2 rounded-full hover:bg-slate-700 transition-all border border-white/10 shadow-lg";

  return (
    <div className="w-full max-w-2xl relative pt-16 pb-12 animate-fade-in">
      {/* Navbar */}
      <div className="absolute top-4 right-0 md:-right-12 z-20 flex gap-2">
        <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
        <button onClick={onHome} className={btnStyle} aria-label="Home">
          <Home size={20} />
        </button>
      </div>

      {/* Main Container */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl relative">
        {/* Background Grid Effect */}
        <div className="absolute inset-0 z-0 opacity-10" 
             style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
        />
        
        {/* Header Section */}
        <div className="relative z-10 p-6 md:p-8 pb-0">
          <div className="flex justify-between items-start mb-4">
             <div>
               <div className="flex items-center gap-2 mb-1">
                 <Terminal size={14} className="text-cyan-500" />
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-500/80">{t.badge_complete}</span>
               </div>
               <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none mb-1">{data.title}</h1>
               <p className="text-xs text-slate-400 font-mono">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
             </div>
             
             {/* Grade Badge */}
             <div className={`relative group cursor-default`}>
                <div className={`absolute inset-0 bg-current blur-xl opacity-20 group-hover:opacity-40 transition-opacity ${gradeInfo.color}`}></div>
                <div className={`text-4xl md:text-5xl font-black italic tracking-tighter drop-shadow-lg ${gradeInfo.color}`}>
                  {gradeInfo.label}
                </div>
             </div>
          </div>

          {/* AI Message Bubble */}
          <div className="bg-slate-900/60 border-l-4 border-cyan-500 p-4 rounded-r-xl mb-6 backdrop-blur-sm">
             <div className="flex items-center gap-2 mb-1">
               <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
               <span className="text-[10px] font-bold text-cyan-400 uppercase">AI Observer</span>
             </div>
             <p className="text-sm text-slate-200 italic leading-relaxed">"{data.aiComparison}"</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="relative z-10 flex border-b border-slate-800 px-6">
           <button 
             onClick={() => setActiveTab('analysis')}
             className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'analysis' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
           >
             <div className="flex items-center gap-2"><Activity size={14} /> Analysis</div>
           </button>
           <button 
             onClick={() => setActiveTab('details')}
             className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'details' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
           >
             <div className="flex items-center gap-2"><BarChart3 size={14} /> Details</div>
           </button>
        </div>

        {/* Content Area */}
        <div className="relative z-10 p-6 md:p-8 bg-slate-950/30 min-h-[300px]">
           {activeTab === 'analysis' ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Radar Chart - Render only when ready */}
                <div className="h-56 relative flex items-center justify-center bg-slate-900/50 rounded-xl">
                   {chartReady ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="User" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
                        </RadarChart>
                     </ResponsiveContainer>
                   ) : (
                     <div className="animate-pulse text-cyan-900"><Activity size={48} /></div>
                   )}
                </div>

                {/* Stats Cards */}
                <div className="space-y-3">
                   <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400"><Award size={18} /></div>
                         <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">{t.label_correct}</div>
                            <div className="text-lg font-bold text-white">{data.details.filter(d => d.isCorrect).length} / {data.details.length}</div>
                         </div>
                      </div>
                      <div className="text-2xl font-black text-slate-700">/ 5</div>
                   </div>

                   <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><Users size={18} /></div>
                         <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">{t.label_percentile}</div>
                            <div className="text-lg font-bold text-white">Top {100 - data.humanPercentile}%</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] text-emerald-500 font-mono">+{data.humanPercentile > 50 ? 'High' : 'Low'}</div>
                      </div>
                   </div>

                   <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Brain size={18} /></div>
                         <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">{t.label_cohort}</div>
                            <div className="text-lg font-bold text-white">{data.demographicPercentile}th <span className="text-xs text-slate-500 font-normal">Percentile</span></div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           ) : (
             <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {data.details.map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border transition-all ${item.isCorrect ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'}`}>
                     <div className="flex gap-3">
                        <div className={`mt-1 shrink-0 ${item.isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                           {item.isCorrect ? <CheckCircle size={18} /> : <XCircle size={18} />}
                        </div>
                        <div className="flex-1 space-y-2">
                           <div className="flex justify-between items-start">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Q{idx + 1} Analysis</span>
                              {!item.isCorrect && <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded">Missed</span>}
                           </div>
                           <p className="text-sm text-slate-200 leading-relaxed">{item.aiComment}</p>
                           {!item.isCorrect && (
                             <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded border-l-2 border-slate-600">
                               <span className="font-bold text-slate-300">Fact:</span> {item.correctFact}
                             </div>
                           )}
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md sticky bottom-0 z-20">
           {remainingTopics > 0 ? (
             <Button onClick={onNextTopic} fullWidth className="py-4 text-base shadow-xl shadow-cyan-500/20 animate-pulse">
                {t.btn_next_topic} {nextTopicName} <span className="bg-white/20 px-2 py-0.5 rounded text-xs ml-2">{remainingTopics} Left</span> <ArrowRight size={18} />
             </Button>
           ) : (
             <div className="grid grid-cols-2 gap-3">
                <Button onClick={onRestart} variant="outline" className="text-sm">
                   <RefreshCw size={16} /> {t.btn_retry}
                </Button>
                <Button onClick={handleShare} variant="primary" className="text-sm shadow-cyan-500/20">
                   <Share2 size={16} /> {t.btn_share}
                </Button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
