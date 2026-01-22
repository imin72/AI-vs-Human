
import React, { useState, useEffect } from 'react';
import { EvaluationResult, Language, TOPIC_IDS } from '../types';
import { Button } from './Button';
import { Share2, RefreshCw, Brain, CheckCircle, XCircle, Home, ArrowRight, Activity, Terminal, History, FlaskConical, Palette, Zap, Map, Film, Music, Gamepad2, Trophy, Cpu, Scroll, Book, Leaf, Utensils, Orbit, Lightbulb, X } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
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
  // Page 0: Summary, Page 1: Details
  const [currentPage, setCurrentPage] = useState(0); 
  const [chartReady, setChartReady] = useState(false);
  const [selectedResultForPopup, setSelectedResultForPopup] = useState<EvaluationResult | null>(null);
  const t = TRANSLATIONS[language].results;
  const commonT = TRANSLATIONS[language].common;
  const categoriesT = TRANSLATIONS[language].topics.categories;

  // Determine if this is the Final Summary view (batch finished) or single topic
  const isFinalSummary = remainingTopics === 0 && sessionResults.length > 1;

  // If we are in "Final Summary", we show aggregated data in Page 0 and list of topics in Page 1.
  // If we are in "Single Result", we show single data in Page 0 and list of questions in Page 1.
  
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

  const currentScore = isFinalSummary 
    ? Math.round(sessionResults.reduce((a, b) => a + b.totalScore, 0) / sessionResults.length)
    : data.totalScore;
  
  const gradeInfo = getGrade(currentScore);

  // Chart Data Preparation
  const chartData = isFinalSummary ? [
      { subject: t.chart.logic, A: currentScore > 60 ? currentScore + 10 : currentScore, fullMark: 100 },
      { subject: t.chart.intuition, A: sessionResults.reduce((a, b) => a + b.humanPercentile, 0) / sessionResults.length, fullMark: 100 },
      { subject: t.chart.speed, A: Math.min(100, currentScore + 15), fullMark: 100 },
      { subject: t.chart.accuracy, A: currentScore, fullMark: 100 },
      { subject: t.chart.cohort, A: sessionResults.reduce((a, b) => a + b.demographicPercentile, 0) / sessionResults.length, fullMark: 100 },
  ] : [
    { subject: t.chart.accuracy, A: data.totalScore, fullMark: 100 },
    { subject: t.chart.speed, A: Math.min(100, data.totalScore + 10), fullMark: 100 },
    { subject: t.chart.cohort, A: data.demographicPercentile, fullMark: 100 }, 
    { subject: t.chart.logic, A: data.totalScore > 50 ? 85 : 45, fullMark: 100 },
    { subject: t.chart.intuition, A: data.humanPercentile, fullMark: 100 },
  ];

  const handleShare = async () => {
    const shareText = `Cognito Protocol 🧬\nScore: ${currentScore}/100 [${gradeInfo.label}]\n${isFinalSummary ? 'Aggregate Analysis' : `Topic: ${data.title}`}\n\nProve your humanity:`;
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: 'Cognito', text: shareText, url }); } catch (err) { console.error(err); }
    } else {
      try { await navigator.clipboard.writeText(`${shareText}\n${url}`); alert('Copied!'); } catch (err) { alert('Failed'); }
    }
  };

  const btnStyle = "text-white bg-slate-800/80 backdrop-blur-md p-2 rounded-full hover:bg-slate-700 transition-all border border-white/10 shadow-lg";

  // Handle clicking a list item
  const handleItemClick = (itemData: any) => {
    if (isFinalSummary) {
      // itemData is an EvaluationResult from sessionResults
      setSelectedResultForPopup(itemData);
    } else {
      setSelectedResultForPopup(data);
    }
  };

  // Helper to get localized category name
  const getLocalizedCategory = (id?: string) => {
    if (!id) return "";
    return categoriesT[id] || id;
  };

  return (
    <div className="w-full h-full relative flex flex-col animate-fade-in">
      
      {/* Top Controls */}
      <div className="flex justify-between items-center mb-3 shrink-0 z-20 px-4 pt-2">
         <div className="flex items-center gap-2">
            <Terminal size={16} className="text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              {isFinalSummary ? t.header_aggregate : t.badge_complete}
            </span>
         </div>
         <div className="flex gap-2">
           <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
           <button onClick={onHome} className={btnStyle} aria-label="Home">
             <Home size={20} />
           </button>
         </div>
      </div>

      {/* Main Content (Card Slider) */}
      <div className="glass-panel flex-grow h-0 rounded-3xl overflow-hidden shadow-2xl relative mx-auto w-full max-w-2xl flex flex-col">
        
        {/* Slider Container */}
        <div className="flex-grow relative overflow-hidden">
           <div 
             className="absolute inset-0 flex transition-transform duration-500 ease-out will-change-transform"
             style={{ transform: `translateX(-${currentPage * 100}%)` }}
           >
              {/* PAGE 1: SUMMARY CARD */}
              <div className="w-full h-full flex-shrink-0 p-6 md:p-8 overflow-y-auto custom-scrollbar flex flex-col items-center">
                 <div className="w-full bg-slate-900/50 rounded-2xl p-6 border border-slate-700 relative overflow-hidden mb-4 flex-grow flex flex-col justify-center">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Brain size={120} />
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center justify-center text-center">
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">{t.label_sync}</div>
                       <div className={`text-6xl md:text-8xl font-black italic tracking-tighter drop-shadow-2xl mb-4 ${gradeInfo.color}`}>
                          {gradeInfo.label}
                       </div>
                       <div className="text-2xl font-bold text-white mb-8">
                          {currentScore}<span className="text-sm text-slate-500 font-normal">/100 {t.unit_avg}</span>
                       </div>

                       <div className="w-full h-56 max-w-xs mx-auto">
                         {chartReady ? (
                           <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                <Radar name="User" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.4} />
                              </RadarChart>
                           </ResponsiveContainer>
                         ) : <div className="h-full flex items-center justify-center"><Activity className="animate-pulse text-cyan-900"/></div>}
                       </div>
                    </div>
                 </div>
                 
                 <div className="text-center text-xs text-slate-500 animate-pulse mt-2">
                   {/* Swipe hint */}
                   Swipe or click below for details
                 </div>
              </div>

              {/* PAGE 2: DETAILS LIST */}
              <div className="w-full h-full flex-shrink-0 p-6 md:p-8 overflow-y-auto custom-scrollbar">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-4 sticky top-0 bg-slate-950/80 backdrop-blur py-2 z-10">
                   {t.header_breakdown}
                 </h3>
                 
                 <div className="space-y-3">
                    {isFinalSummary ? (
                      // SESSION MODE: List of Topics
                      sessionResults.map((res, idx) => {
                        const g = getGrade(res.totalScore);
                        const categoryLabel = getLocalizedCategory(res.id);
                        return (
                          <button 
                            key={idx} 
                            onClick={() => handleItemClick(res)}
                            className="w-full bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between hover:border-cyan-500/50 hover:bg-slate-800 transition-all group text-left"
                          >
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 border border-slate-700 group-hover:border-cyan-500/30 transition-colors shrink-0">
                                  {getTopicIcon(res.id)}
                                </div>
                                <div className="min-w-0 flex-1">
                                   {/* Hierarchical Display: Category > Subtopic */}
                                   <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                                      {categoryLabel}
                                   </div>
                                   <div className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors truncate leading-tight mb-1.5">
                                      {res.title}
                                   </div>
                                   
                                   {/* Stats Badges inline */}
                                   <div className="flex flex-wrap gap-1.5">
                                      <span className="text-[10px] font-medium text-cyan-