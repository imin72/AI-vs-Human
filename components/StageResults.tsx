
import React, { useState, useEffect, useRef } from 'react';
import { EvaluationResult, Language, TOPIC_IDS } from '../types';
import { Button } from './Button';
import { Share2, RefreshCw, Brain, CheckCircle, XCircle, Home, ArrowRight, Activity, Terminal, History, FlaskConical, Palette, Zap, Map, Film, Music, Gamepad2, Trophy, Cpu, Scroll, Book, Leaf, Utensils, Orbit, Lightbulb, X, Link as LinkIcon, Download, Twitter, Smartphone } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
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
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  // Refs for capturing individual slides
  const summaryRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[language].results;
  const commonT = TRANSLATIONS[language].common;
  const categoriesT = TRANSLATIONS[language].topics.categories;

  // Determine if this is the Final Summary view (batch finished) or single topic
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

  // --- Share Functions ---
  const shareText = `Cognito Protocol 🧬\nScore: ${currentScore}/100 [${gradeInfo.label}]\n${isFinalSummary ? 'Aggregate Analysis' : `Topic: ${data.title}`}\n\nProve your humanity:`;
  const shareUrl = window.location.href;

  const handleSystemShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Cognito', text: shareText, url: shareUrl }); } catch (err) { console.error(err); }
    } else {
      handleCopyLink();
    }
    setShowShareMenu(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => alert('Link copied to clipboard!'));
    setShowShareMenu(false);
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    setShowShareMenu(false);
  };

  const handleSaveImage = async () => {
    // Capture the visible slide based on currentPage
    const targetRef = currentPage === 0 ? summaryRef : detailsRef;
    
    if (targetRef.current) {
      try {
        const dataUrl = await toPng(targetRef.current, { cacheBust: true, backgroundColor: '#020617' });
        const link = document.createElement('a');
        link.download = `cognito-result-${currentPage === 0 ? 'summary' : 'details'}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to save image', err);
        alert('Failed to generate image.');
      }
    }
    setShowShareMenu(false);
  };

  const btnStyle = "text-white bg-slate-800/80 backdrop-blur-md p-2 rounded-full hover:bg-slate-700 transition-all border border-white/10 shadow-lg";

  // Handle clicking a list item
  const handleItemClick = (itemData: any) => {
    if (isFinalSummary) {
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
              <div ref={summaryRef} className="w-full h-full flex-shrink-0 p-4 md:p-6 overflow-hidden flex flex-col items-center bg-[#020617]"> 
                 <div className="w-full bg-slate-900/50 rounded-2xl p-2 md:p-4 border border-slate-700 relative overflow-hidden flex-grow flex flex-col">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Brain size={120} />
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center h-full pt-4 md:pt-6">
                       {/* Header Section: Grade + Details Side-by-Side */}
                       <div className="flex items-center justify-center gap-4 md:gap-6 mb-2 shrink-0">
                           <div className={`text-6xl md:text-8xl font-black italic tracking-tighter drop-shadow-2xl ${gradeInfo.color}`}>
                              {gradeInfo.label}
                           </div>
                           <div className="flex flex-col justify-center border-l border-slate-700 pl-4 md:pl-6 py-1">
                              <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                 {t.label_sync}
                              </div>
                              <div className="text-2xl md:text-3xl font-bold text-white leading-none">
                                 {currentScore}<span className="text-sm text-slate-500 font-normal ml-1">/100</span>
                              </div>
                           </div>
                       </div>

                       {/* Chart Section - Expanded */}
                       <div className="w-full flex-grow min-h-0 relative mt-2 md:mt-4">
                         {chartReady ? (
                           <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                <Radar name="User" dataKey="A" stroke="#22d3ee" strokeWidth={3} fill="#22d3ee" fillOpacity={0.4} />
                              </RadarChart>
                           </ResponsiveContainer>
                         ) : <div className="h-full flex items-center justify-center"><Activity className="animate-pulse text-cyan-900"/></div>}
                       </div>
                    </div>
                 </div>
                 
                 <div className="text-center text-xs text-slate-500 animate-pulse mt-3 shrink-0">
                   {/* Swipe hint */}
                   Swipe or click below for details
                 </div>
              </div>

              {/* PAGE 2: DETAILS LIST */}
              <div ref={detailsRef} className="w-full h-full flex-shrink-0 p-6 md:p-8 overflow-y-auto custom-scrollbar bg-[#020617]">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-4 sticky top-0 bg-[#020617]/95 backdrop-blur py-2 z-10">
                   {t.header_breakdown}
                 </h3>
                 
                 <div className="space-y-3 pb-2">
                    {isFinalSummary ? (
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
                                   <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                                      {categoryLabel}
                                   </div>
                                   <div className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors truncate leading-tight mb-1.5">
                                      {res.title}
                                   </div>
                                   <div className="flex flex-wrap gap-1.5">
                                      <span className="text-[10px] font-medium text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20 whitespace-nowrap">
                                        {t.level_ai}: {res.totalScore}
                                      </span>
                                      <span className="text-[10px] font-medium text-purple-400 bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-500/20 whitespace-nowrap">
                                        {t.label_top} {100 - res.humanPercentile}%
                                      </span>
                                   </div>
                                </div>
                             </div>
                             <div className="text-right pl-2 shrink-0">
                                <div className={`text-xl font-black italic ${g.color}`}>{g.label}</div>
                                <div className="text-[10px] font-mono text-slate-500">{res.totalScore} {t.unit_pts}</div>
                             </div>
                          </button>
                        );
                      })
                    ) : (
                       data.details.map((item, idx) => (
                         <button 
                           key={idx} 
                           onClick={() => setSelectedResultForPopup(data)}
                           className={`w-full p-4 rounded-xl border transition-all text-left ${item.isCorrect ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'} hover:opacity-80`}
                         >
                            <div className="flex gap-3">
                               <div className={`mt-1 shrink-0 ${item.isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {item.isCorrect ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                </div>
                                <div>
                                   <div className="text-xs font-bold text-slate-400 uppercase mb-1">Q{idx + 1}</div>
                                   <div className="text-sm font-medium text-slate-200 line-clamp-2">{item.aiComment}</div>
                                </div>
                            </div>
                         </button>
                       ))
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md shrink-0 flex flex-col gap-3 z-20">
           <div className="flex justify-center mb-1">
              <div className="bg-slate-800 p-1 rounded-full flex gap-1">
                 <button 
                   onClick={() => setCurrentPage(0)}
                   className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${currentPage === 0 ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                 >
                   {t.page_summary}
                 </button>
                 <button 
                   onClick={() => setCurrentPage(1)}
                   className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${currentPage === 1 ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                 >
                   {t.page_details}
                 </button>
              </div>
           </div>

           {remainingTopics > 0 ? (
             <Button onClick={onNextTopic} fullWidth className="py-3 text-sm shadow-xl shadow-cyan-500/20 animate-pulse">
                {t.btn_next_topic} {nextTopicName} <span className="bg-white/20 px-2 py-0.5 rounded text-xs ml-2">{remainingTopics} Left</span> <ArrowRight size={16} />
             </Button>
           ) : (
             <div className="grid grid-cols-2 gap-3">
                <Button onClick={onRestart} variant="outline" className="text-sm py-3">
                   <RefreshCw size={16} /> {t.btn_retry}
                </Button>
                <Button onClick={() => setShowShareMenu(true)} variant="primary" className="text-sm py-3 shadow-cyan-500/20">
                   <Share2 size={16} /> {t.btn_share}
                </Button>
             </div>
           )}
        </div>
      </div>

      {/* SHARE MENU POPUP */}
      {showShareMenu && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-slate-950/80 backdrop-blur-sm">
           <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
              <h3 className="text-lg font-bold text-white text-center mb-4">{t.btn_share}</h3>
              
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={handleSystemShare} className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors gap-2">
                    <Smartphone size={24} className="text-purple-400" />
                    <span className="text-xs font-bold text-slate-300">System</span>
                 </button>
                 
                 <button onClick={handleTwitterShare} className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors gap-2">
                    <Twitter size={24} className="text-sky-400" />
                    <span className="text-xs font-bold text-slate-300">X / Twitter</span>
                 </button>

                 <button onClick={handleCopyLink} className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors gap-2">
                    <LinkIcon size={24} className="text-emerald-400" />
                    <span className="text-xs font-bold text-slate-300">Copy Link</span>
                 </button>

                 <button onClick={handleSaveImage} className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors gap-2">
                    <Download size={24} className="text-rose-400" />
                    <span className="text-xs font-bold text-slate-300">
                        Save Image
                        <span className="block text-[9px] font-normal opacity-60 mt-1">
                          {currentPage === 0 ? "(Summary)" : "(Details)"}
                        </span>
                    </span>
                 </button>
              </div>

              <Button onClick={() => setShowShareMenu(false)} fullWidth variant="secondary" className="py-2 text-sm mt-2">
                 {commonT.close}
              </Button>
           </div>
        </div>
      )}

      {/* DETAIL POPUP MODAL */}
      {selectedResultForPopup && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-slate-950/80 backdrop-blur-sm">
           <div className="bg-slate-900 border border-slate-700 w-full max-w-lg max-h-[90%] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
              
              {/* Popup Header - Removed X button */}
              <div className="p-4 border-b border-slate-700 bg-slate-900 flex justify-between items-center shrink-0">
                 <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                       {getTopicIcon(selectedResultForPopup.id)} 
                       <span className="flex flex-col">
                          <span className="text-[10px] text-slate-500 uppercase font-bold leading-none">
                            {getLocalizedCategory(selectedResultForPopup.id)}
                          </span>
                          <span>{selectedResultForPopup.title}</span>
                       </span>
                    </h3>
                    
                    <div className="flex gap-2 mt-2">
                      <div className="text-[10px] font-bold px-2 py-1 rounded bg-cyan-900/50 text-cyan-400 border border-cyan-500/30">
                         {t.level_ai}: {selectedResultForPopup.totalScore}/100
                      </div>
                      <div className="text-[10px] font-bold px-2 py-1 rounded bg-purple-900/50 text-purple-400 border border-purple-500/30">
                         {t.level_global}: {t.label_top} {100 - selectedResultForPopup.humanPercentile}%
                      </div>
                    </div>
                 </div>
              </div>

              {/* Popup Content */}
              <div className="overflow-y-auto custom-scrollbar p-4 space-y-4">
                 {selectedResultForPopup.details.map((item, idx) => (
                    <div key={idx} className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.popup_question} {idx + 1}</span>
                          {item.isCorrect ? (
                             <span className="text-xs font-bold text-emerald-500 flex items-center gap-1"><CheckCircle size={12}/> Correct</span>
                          ) : (
                             <span className="text-xs font-bold text-rose-500 flex items-center gap-1"><XCircle size={12}/> Missed</span>
                          )}
                       </div>
                       
                       <p className="text-sm font-medium text-white mb-3 leading-relaxed">
                          {item.aiComment} 
                       </p>

                       <div className="space-y-2 mt-3 pt-3 border-t border-slate-800/50">
                          {!item.isCorrect && (
                             <div className="text-xs">
                                <span className="text-slate-500 font-bold block mb-1">{t.popup_correct_answer}:</span>
                                <span className="text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded border border-cyan-900/50 block w-full">
                                  {item.correctFact}
                                </span>
                             </div>
                          )}
                          <div className="text-xs">
                             <span className="text-slate-500 font-bold block mb-1">{t.popup_ai_comment}:</span>
                             <p className="text-slate-400 italic">"{item.aiComment}"</p>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>

              {/* Reduced Button Height */}
              <div className="p-4 border-t border-slate-700 bg-slate-900 shrink-0">
                 <Button onClick={() => setSelectedResultForPopup(null)} fullWidth variant="secondary" className="py-1.5 text-sm h-8 md:h-10">
                    {commonT.close}
                 </Button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};
