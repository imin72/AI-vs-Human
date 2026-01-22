
import React, { useState, useEffect } from 'react';
import { EvaluationResult, Language, TOPIC_IDS } from '../types';
import { Button } from './Button';
import { Share2, RefreshCw, Brain, CheckCircle, XCircle, Users, Home, ArrowRight, Activity, Terminal, Award, BarChart3, 
  History, FlaskConical, Palette, Zap, Map, Film, Music, Gamepad2, Trophy, Cpu, Scroll, Book, Leaf, Utensils, Orbit, Lightbulb } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { LanguageSwitcher } from './LanguageSwitcher';
import { TRANSLATIONS } from '../utils/translations';

interface StageResultsProps {
  data: EvaluationResult;
  sessionResults?: EvaluationResult[];
  onRestart: () => void;
  onHome: () => void;
  onNextTopic?: () => void;
  remainingTopics?: number;
  nextTopicName?: string;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const getTopicIcon = (id: string | undefined) => {
  if (!id) return <Zap size={16} />;
  // Naive matching based on ID string inclusion
  const up = id.toUpperCase();
  if (up.includes(TOPIC_IDS.HISTORY.toUpperCase())) return <History size={16} />;
  if (up.includes(TOPIC_IDS.SCIENCE.toUpperCase())) return <FlaskConical size={16} />;
  if (up.includes(TOPIC_IDS.ARTS.toUpperCase())) return <Palette size={16} />;
  if (up.includes(TOPIC_IDS.GEOGRAPHY.toUpperCase())) return <Map size={16} />;
  if (up.includes(TOPIC_IDS.MOVIES.toUpperCase())) return <Film size={16} />;
  if (up.includes(TOPIC_IDS.MUSIC.toUpperCase())) return <Music size={16} />;
  if (up.includes(TOPIC_IDS.GAMING.toUpperCase())) return <Gamepad2 size={16} />;
  if (up.includes(TOPIC_IDS.SPORTS.toUpperCase())) return <Trophy size={16} />;
  if (up.includes(TOPIC_IDS.TECH.toUpperCase())) return <Cpu size={16} />;
  if (up.includes(TOPIC_IDS.MYTHOLOGY.toUpperCase())) return <Scroll size={16} />;
  if (up.includes(TOPIC_IDS.LITERATURE.toUpperCase())) return <Book size={16} />;
  if (up.includes(TOPIC_IDS.NATURE.toUpperCase())) return <Leaf size={16} />;
  if (up.includes(TOPIC_IDS.FOOD.toUpperCase())) return <Utensils size={16} />;
  if (up.includes(TOPIC_IDS.SPACE.toUpperCase())) return <Orbit size={16} />;
  if (up.includes(TOPIC_IDS.PHILOSOPHY.toUpperCase())) return <Lightbulb size={16} />;
  return <Zap size={16} />;
};

export const StageResults: React.FC<StageResultsProps> = ({ 
  data, 
  sessionResults = [], 
  onRestart, 
  onHome, 
  onNextTopic, 
  remainingTopics = 0, 
  nextTopicName, 
  language, 
  setLanguage 
}) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'details'>('analysis');
  const [chartReady, setChartReady] = useState(false);
  const t = TRANSLATIONS[language].results;

  // Determine if this is the Final Summary view
  const isFinalSummary = remainingTopics === 0 && sessionResults.length > 1;

  useEffect(() => {
    const timer = setTimeout(() => setChartReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!data) return null;

  const getGrade = (score: number) => {
    if (score >= 90) return { label: 'SSS', color: 'text-yellow-400 shadow-yellow-500/50' };
    if (score >= 80) return { label: 'A+', color: 'text-cyan-400 shadow-cyan-500/50' };
    if (score >= 70) return { label: 'A', color: 'text-cyan-500 shadow-cyan-500/30' };
    if (score >= 60) return { label: 'B', color: 'text-emerald-400 shadow-emerald-500/30' };
    if (score >= 40) return { label: 'C', color: 'text-amber-400 shadow-amber-500/30' };
    return { label: 'F', color: 'text-rose-500 shadow-rose-500/30' };
  };

  const handleShare = async () => {
    let shareText = "";
    if (isFinalSummary) {
      const avgScore = Math.round(sessionResults.reduce((a, b) => a + b.totalScore, 0) / sessionResults.length);
      const grade = getGrade(avgScore);
      shareText = `Cognito Human Verified 🧬\nOverall Rank: ${grade.label} (${avgScore}%)\n\nBreakdown:\n${sessionResults.map(r => `• ${r.title}: ${r.totalScore}`).join('\n')}\n\nProve your humanity:`;
    } else {
      const grade = getGrade(data.totalScore);
      shareText = `Cognito Protocol Analysis 🧠\nTopic: ${data.title}\nScore: ${data.totalScore}/100 [Rank ${grade.label}]\nPercentile: Top ${100 - data.humanPercentile}%\n\nProve your humanity here:`;
    }
    
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
        alert(language === 'ko' ? '클립보드에 복사되었습니다!' : 'Copied to clipboard!');
      } catch (err) {
        alert('Failed to copy');
      }
    }
  };

  const btnStyle = "text-white bg-slate-800/80 backdrop-blur-md p-2 rounded-full hover:bg-slate-700 transition-all border border-white/10 shadow-lg";

  // --- FINAL SUMMARY VIEW ---
  if (isFinalSummary) {
    const avgScore = Math.round(sessionResults.reduce((a, b) => a + b.totalScore, 0) / sessionResults.length);
    const overallGrade = getGrade(avgScore);
    
    // Aggregated Chart Data
    const summaryChartData = [
      { subject: t.chart.logic, A: avgScore > 60 ? avgScore + 10 : avgScore, fullMark: 100 },
      { subject: t.chart.intuition, A: sessionResults.reduce((a, b) => a + b.humanPercentile, 0) / sessionResults.length, fullMark: 100 },
      { subject: t.chart.speed, A: Math.min(100, avgScore + 15), fullMark: 100 },
      { subject: t.chart.accuracy, A: avgScore, fullMark: 100 },
      { subject: t.chart.cohort, A: sessionResults.reduce((a, b) => a + b.demographicPercentile, 0) / sessionResults.length, fullMark: 100 },
    ];

    return (
      <div className="w-full h-full relative flex flex-col animate-fade-in">
        <div className="flex justify-between items-center mb-3 shrink-0 z-20 px-4 pt-2">
          <div className="flex items-center gap-2">
             <Terminal size={16} className="text-cyan-400" />
             <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Aggregate Report</span>
          </div>
          <div className="flex gap-2">
            <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
            <button onClick={onHome} className={btnStyle} aria-label="Home">
              <Home size={20} />
            </button>
          </div>
        </div>

        <div className="glass-panel flex flex-col flex-grow h-0 rounded-3xl overflow-hidden shadow-2xl relative mx-auto w-full max-w-2xl">
           <div className="p-6 md:p-8 flex-grow overflow-y-auto custom-scrollbar space-y-6">
              
              {/* Identity Card Header */}
              <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Brain size={120} />
                 </div>
                 
                 <div className="relative z-10 flex flex-col items-center justify-center text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">Total Synchronization</div>
                    <div className={`text-6xl md:text-7xl font-black italic tracking-tighter drop-shadow-2xl mb-2 ${overallGrade.color}`}>
                       {overallGrade.label}
                    </div>
                    <div className="text-2xl font-bold text-white mb-6">
                       {avgScore}<span className="text-sm text-slate-500 font-normal">/100 AVG</span>
                    </div>

                    <div className="w-full h-48 max-w-xs mx-auto">
                      {chartReady ? (
                        <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="70%" data={summaryChartData}>
                             <PolarGrid stroke="#334155" />
                             <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                             <Radar name="User" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.4} />
                           </RadarChart>
                        </ResponsiveContainer>
                      ) : <div className="h-full flex items-center justify-center"><Activity className="animate-pulse text-cyan-900"/></div>}
                    </div>
                 </div>
              </div>

              {/* Topic Grid */}
              <div className="grid grid-cols-1 gap-3">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Detailed Breakdown</h3>
                 {sessionResults.map((res, idx) => {
                   const g = getGrade(res.totalScore);
                   return (
                     <div key={idx} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between hover:border-cyan-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 border border-slate-700">
                             {getTopicIcon(res.id)}
                           </div>
                           <div>
                              <div className="font-bold text-white text-sm">{res.title}</div>
                              <div className="text-[10px] text-slate-400">Top {100 - res.humanPercentile}% Global</div>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className={`text-xl font-black italic ${g.color}`}>{g.label}</div>
                           <div className="text-[10px] font-mono text-slate-500">{res.totalScore} pts</div>
                        </div>
                     </div>
                   );
                 })}
              </div>
           </div>

           {/* Footer */}
           <div className="p-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md shrink-0">
              <div className="grid grid-cols-2 gap-3">
                 <Button onClick={onHome} variant="outline" className="text-sm">
                    <RefreshCw size={16} /> {t.btn_retry}
                 </Button>
                 <Button onClick={handleShare} variant="primary" className="text-sm shadow-cyan-500/20">
                    <Share2 size={16} /> {t.btn_share}
                 </Button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // --- SINGLE TOPIC RESULT VIEW (Existing + Next Button Logic) ---
  
  const gradeInfo = getGrade(data.totalScore);
  
  const chartData = [
    { subject: t.chart.accuracy, A: data.totalScore, fullMark: 100 },
    { subject: t.chart.speed, A: Math.min(100, data.totalScore + 10), fullMark: 100 },
    { subject: t.chart.cohort, A: data.demographicPercentile, fullMark: 100 }, 
    { subject: t.chart.logic, A: data.totalScore > 50 ? 85 : 45, fullMark: 100 },
    { subject: t.chart.intuition, A: data.humanPercentile, fullMark: 100 },
  ];

  return (
    <div className="w-full h-full relative flex flex-col animate-fade-in">
      <div className="flex justify-end items-center mb-3 shrink-0 z-20 gap-2">
        <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
        <button onClick={onHome} className={btnStyle} aria-label="Home">
          <Home size={20} />
        </button>
      </div>

      <div className="glass-panel flex flex-col flex-grow h-0 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Background Grid */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
        />
        
        {/* Header Section */}
        <div className="relative z-10 p-6 md:p-8 pb-0 shrink-0">
          <div className="flex justify-between items-start mb-4">
             <div>
               <div className="flex items-center gap-2 mb-1">
                 <Terminal size={14} className="text-cyan-500" />
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-500/80">{t.badge_complete}</span>
               </div>
               <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none mb-1">{data.title}</h1>
             </div>
             
             <div className={`relative group cursor-default`}>
                <div className={`absolute inset-0 bg-current blur-xl opacity-20 group-hover:opacity-40 transition-opacity ${gradeInfo.color}`}></div>
                <div className={`text-4xl md:text-5xl font-black italic tracking-tighter drop-shadow-lg ${gradeInfo.color}`}>
                  {gradeInfo.label}
                </div>
             </div>
          </div>

          <div className="bg-slate-900/60 border-l-4 border-cyan-500 p-4 rounded-r-xl mb-4 backdrop-blur-sm">
             <div className="flex items-center gap-2 mb-1">
               <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
               <span className="text-[10px] font-bold text-cyan-400 uppercase">AI Observer</span>
             </div>
             <p className="text-sm text-slate-200 italic leading-relaxed">"{data.aiComparison}"</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="relative z-10 flex border-b border-slate-800 px-6 shrink-0">
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
        <div className="relative z-10 p-6 md:p-8 bg-slate-950/30 flex-grow overflow-y-auto custom-scrollbar">
           {activeTab === 'analysis' ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
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
                </div>
             </div>
           ) : (
             <div className="space-y-3">
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
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md shrink-0 z-20">
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
