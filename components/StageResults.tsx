
import React, { useState, useEffect, useRef } from 'react';
import { EvaluationResult, Language, TOPIC_IDS, UserProfile } from '../types';
import { Button } from './Button';
import { Share2, RefreshCw, Brain, CheckCircle, CheckCircle2, XCircle, Home, ArrowRight, Activity, Terminal, History, FlaskConical, Palette, Zap, Map, Film, Music, Gamepad2, Trophy, Cpu, Scroll, Book, Leaf, Utensils, Orbit, Lightbulb, Link as LinkIcon, Download, Twitter, Smartphone, Instagram, TrendingUp, AlertTriangle } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, Tooltip, AreaChart, Area } from 'recharts';
import { toPng } from 'html-to-image';
import { TRANSLATIONS } from '../utils/translations';

interface StageResultsProps {
  data: EvaluationResult;
  sessionResults?: EvaluationResult[];
  userProfile?: UserProfile;
  onRestart: () => void;
  onHome: () => void;
  onNextTopic?: () => void;
  remainingTopics?: number;
  nextTopicName?: string;
  language: Language;
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
  userProfile,
  onRestart, 
  onHome, 
  onNextTopic, 
  remainingTopics = 0, 
  nextTopicName, 
  language 
}) => {
  // Page 0: Summary, Page 1: Details, Page 2: Trends
  const [currentPage, setCurrentPage] = useState(0); 
  const [chartReady, setChartReady] = useState(false);
  const [selectedResultForPopup, setSelectedResultForPopup] = useState<EvaluationResult | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  
  // Refs for capturing individual slides
  const summaryRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const trendsRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[language].results;
  const commonT = TRANSLATIONS[language].common;
  const categoriesT = TRANSLATIONS[language].topics.categories;
  // Intro translations needed for Human/AI labels in charts
  const introT = TRANSLATIONS[language].intro;

  // Determine if this is the Final Summary view (batch finished) or single topic
  const isFinalSummary = remainingTopics === 0 && sessionResults.length > 0;
  const resultCount = sessionResults.length;
  const isThreeItems = resultCount === 3;

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

  // Chart Data Preparation (Radar)
  const radarData = isFinalSummary ? [
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

  // --- Trends Data Preparation ---
  const history = userProfile?.history || [];
  
  // 1. Growth Data (Line Chart) - Last 10 attempts
  const growthData = history.slice(-10).map((h, i) => ({
    name: i + 1, // Attempt number
    score: h.score,
    ai: h.aiScore
  }));

  // 2. Gap Calculation
  const avgUserScore = history.length > 0 
    ? Math.round(history.reduce((acc, h) => acc + h.score, 0) / history.length) 
    : 0;
  const avgAiScore = history.length > 0 
    ? Math.round(history.reduce((acc, h) => acc + h.aiScore, 0) / history.length) 
    : 0;
  const gap = avgAiScore - avgUserScore;

  // 3. Weakness Analysis (Find lowest Elo)
  const eloRatings = userProfile?.eloRatings || {};
  let weakestTopicId = "";
  let lowestElo = 2000;
  Object.entries(eloRatings).forEach(([id, rating]) => {
     if (rating < lowestElo) {
       lowestElo = rating;
       weakestTopicId = id;
     }
  });
  
  // Only show weakness if we have data
  const hasEnoughData = history.length >= 3;
  const weaknessLabel = weakestTopicId ? (categoriesT[weakestTopicId] || weakestTopicId) : "N/A";

  // --- Share Functions ---
  const shareText = `Cognito Protocol 🧬\nScore: ${currentScore}/100 [${gradeInfo.label}]\n${isFinalSummary ? 'Aggregate Analysis' : `Topic: ${data.title}`}\n\nProve your humanity:`;
  const hashtags = "HumanVsAI,Cognito";
  const shareUrl = window.location.href;

  // Generic function to generate blob and try native sharing
  const performNativeShare = async (platform?: 'twitter' | 'instagram' | 'system') => {
    setIsGeneratingShare(true);
    let targetRef = summaryRef;
    if (currentPage === 1) targetRef = detailsRef;
    if (currentPage === 2) targetRef = trendsRef;
    
    try {
      if (targetRef.current) {
        // Generate Blob directly
        const blob = await toPng(targetRef.current, { cacheBust: true, backgroundColor: '#020617' })
          .then(dataUrl => fetch(dataUrl))
          .then(res => res.blob());

        const file = new File([blob], `cognito-result-${Date.now()}.png`, { type: 'image/png' });
        
        // Try Web Share API Level 2 (File sharing)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Cognito Analysis',
            text: shareText,
            files: [file],
            url: shareUrl
          });
        } else {
          // Fallback based on platform
          if (platform === 'twitter') {
            const text = encodeURIComponent(shareText);
            const url = encodeURIComponent(shareUrl);
            window.open(`https://x.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`, '_blank');
          } else if (platform === 'instagram') {
             // For Instagram/Others without native share, download the image and prompt
             const link = document.createElement('a');
             link.download = file.name;
             link.href = URL.createObjectURL(blob);
             link.click();
             alert("Image downloaded! Open Instagram to share it to your Story.");
          } else {
            // System fallback
            handleCopyLink();
          }
        }
      }
    } catch (err) {
      console.error("Share failed", err);
      if (platform === 'twitter') {
         // Text only fallback for Twitter
         const text = encodeURIComponent(shareText);
         const url = encodeURIComponent(shareUrl);
         window.open(`https://x.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`, '_blank');
      } else {
         alert("Could not generate share image.");
      }
    } finally {
      setIsGeneratingShare(false);
      setShowShareMenu(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => alert('Link copied to clipboard!'));
    setShowShareMenu(false);
  };

  const handleSaveImage = async () => {
    let targetRef = summaryRef;
    if (currentPage === 1) targetRef = detailsRef;
    if (currentPage === 2) targetRef = trendsRef;

    if (targetRef.current) {
      try {
        const dataUrl = await toPng(targetRef.current, { cacheBust: true, backgroundColor: '#020617' });
        const link = document.createElement('a');
        link.download = `cognito-result-${currentPage === 0 ? 'summary' : currentPage === 1 ? 'details' : 'trends'}-${Date.now()}.png`;
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

  // Determine grid layout class based on number of items
  const getGridLayoutClass = () => {
    if (!isFinalSummary) return 'space-y-3 overflow-y-auto custom-scrollbar';
    
    // Dynamic Layout Logic
    switch (resultCount) {
      case 1: return 'grid grid-cols-1 grid-rows-1 gap-3';
      case 2: return 'grid grid-cols-1 grid-rows-2 gap-3'; // Stack vertically
      default: return 'grid grid-cols-2 grid-rows-2 gap-3'; // 3 or 4 items (2x2 grid)
    }
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
                              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                <Radar name={introT.human_label} dataKey="A" stroke="#22d3ee" strokeWidth={3} fill="#22d3ee" fillOpacity={0.4} />
                              </RadarChart>
                           </ResponsiveContainer>
                         ) : <div className="h-full flex items-center justify-center"><Activity className="animate-pulse text-cyan-900"/></div>}
                       </div>
                    </div>
                 </div>
                 
                 <div className="text-center text-xs text-slate-500 animate-pulse mt-3 shrink-0">
                   Swipe or click below for details
                 </div>
              </div>

              {/* PAGE 2: DETAILS LIST */}
              <div ref={detailsRef} className="w-full h-full flex-shrink-0 p-6 md:p-8 bg-[#020617] flex flex-col">
                 <div className={`h-full ${getGridLayoutClass()}`}>
                    {isFinalSummary ? (
                      sessionResults.map((res, idx) => {
                        const g = getGrade(res.totalScore);
                        const categoryLabel = getLocalizedCategory(res.id);
                        const spanClass = (isThreeItems && idx === 0) ? 'col-span-2' : '';
                        
                        return (
                          <button 
                            key={idx} 
                            onClick={() => handleItemClick(res)}
                            className={`w-full bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-cyan-500/50 hover:bg-slate-800 transition-all group text-left shadow-lg hover:shadow-cyan-900/10 relative overflow-hidden ${spanClass}`}
                          >
                             <div className="absolute top-0 right-0 p-8 opacity-5 bg-gradient-radial from-cyan-500 to-transparent rounded-full pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
                             
                             <div className="flex justify-between items-start w-full relative z-10">
                                <div className="flex flex-col gap-1">
                                   <div className="text-cyan-400 bg-slate-950/50 p-1.5 rounded-lg border border-slate-700/50 w-fit">
                                      {getTopicIcon(res.id)}
                                   </div>
                                   <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 truncate max-w-[80px] leading-tight">{categoryLabel}</span>
                                </div>
                                <div className={`text-3xl font-black italic leading-none ${g.color} drop-shadow-lg`}>{g.label}</div>
                             </div>

                             <div className="text-xs font-bold text-white leading-tight group-hover:text-cyan-300 transition-colors line-clamp-2 my-1">
                                {res.title}
                             </div>

                             <div className="grid grid-cols-1 gap-1 w-full mt-auto">
                                <div className="bg-slate-950/60 rounded p-1 border border-slate-800 flex justify-between items-center px-2">
                                   <span className="text-[8px] text-slate-500 font-bold uppercase">{introT.ai_label}</span>
                                   <span className="text-[10px] font-mono font-bold text-cyan-400">{res.totalScore}</span>
                                </div>
                                <div className="bg-slate-950/60 rounded p-1 border border-slate-800 flex justify-between items-center px-2">
                                   <span className="text-[8px] text-slate-500 font-bold uppercase">{t.suffix_global || "Global"}</span>
                                   <span className="text-[10px] font-mono font-bold text-purple-400">{t.label_top} {100 - res.humanPercentile}%</span>
                                </div>
                             </div>
                          </button>
                        );
                      })
                    ) : (
                       data.details.map((item, idx) => (
                         <button 
                           key={idx} 
                           onClick={() => setSelectedResultForPopup(data)}
                           className={`w-full p-4 rounded-xl border transition-all text-left ${item.isCorrect ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'} hover:opacity-80 shrink-0`}
                         >
                            <div className="flex gap-3">
                               <div className={`mt-1 shrink-0 ${item.isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {item.isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                                </div>
                                <div>
                                   <div className="text-xs font-bold text-slate-400 uppercase mb-1">{t.popup_question} {idx + 1}</div>
                                   <div className="text-sm font-medium text-slate-200 line-clamp-2">{item.questionText || item.aiComment}</div>
                                </div>
                            </div>
                         </button>
                       ))
                    )}
                 </div>
              </div>

              {/* PAGE 3: TRENDS & ANALYTICS (NEW) */}
              <div ref={trendsRef} className="w-full h-full flex-shrink-0 p-6 md:p-8 bg-[#020617] flex flex-col overflow-y-auto custom-scrollbar">
                
                {/* 1. Growth Graph */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-cyan-400" />
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.section_growth}</h3>
                  </div>
                  <div className="w-full h-32 bg-slate-900/50 rounded-xl border border-slate-800 p-2">
                    {growthData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={growthData}>
                          <Line type="monotone" name={introT.human_label} dataKey="score" stroke="#22d3ee" strokeWidth={2} dot={{r: 2}} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }} 
                            itemStyle={{ color: '#22d3ee' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-600">Not enough data</div>
                    )}
                  </div>
                </div>

                {/* 2. Gap Analysis (Area Chart) */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Activity size={16} className="text-rose-400" />
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.section_gap}</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500"><span className="text-white">{gap}</span> {t.unit_pts}</span>
                  </div>
                  <div className="w-full h-32 bg-slate-900/50 rounded-xl border border-slate-800 p-2">
                    {growthData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={growthData}>
                           <defs>
                              <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }} />
                           <Area type="monotone" name={introT.ai_label} dataKey="ai" stroke="#f43f5e" fillOpacity={1} fill="url(#colorAi)" />
                           <Area type="monotone" name={introT.human_label} dataKey="score" stroke="#22d3ee" fillOpacity={0} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-600">Not enough data</div>
                    )}
                  </div>
                </div>

                {/* 3. Weakness Analysis */}
                <div className="mt-auto">
                   <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={16} className="text-amber-400" />
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.section_weakness}</h3>
                   </div>
                   <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5 bg-amber-500 blur-2xl rounded-full"></div>
                      
                      <div className="relative z-10 flex gap-4 items-start">
                         <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-amber-500 shrink-0">
                            {hasEnoughData ? getTopicIcon(weakestTopicId) : <Brain size={20} />}
                         </div>
                         <div>
                            {hasEnoughData ? (
                              <>
                                <div className="text-xs font-bold text-slate-500 uppercase mb-1">{t.msg_weakness}</div>
                                <div className="text-lg font-black text-white mb-2">{weaknessLabel}</div>
                                <p className="text-xs text-slate-400 leading-relaxed italic border-t border-slate-800 pt-2">
                                  "{t.msg_advice}"
                                </p>
                              </>
                            ) : (
                              <div className="flex h-full items-center text-xs text-slate-500">
                                 Play more rounds to unlock personalized weakness analysis.
                              </div>
                            )}
                         </div>
                      </div>
                   </div>
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
                 <button 
                   onClick={() => setCurrentPage(2)}
                   className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${currentPage === 2 ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                 >
                   {t.page_trends}
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

      {/* SHARE MENU POPUP - (Existing code for share menu) */}
      {showShareMenu && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-slate-950/80 backdrop-blur-sm">
           <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
              <h3 className="text-lg font-bold text-white text-center mb-4">{t.btn_share}</h3>
              
              {isGeneratingShare ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <RefreshCw className="animate-spin text-cyan-400 mb-2" />
                  <span className="text-xs text-slate-400">Generating snapshot...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => performNativeShare('system')} className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors gap-2">
                      <Smartphone size={24} className="text-purple-400" />
                      <span className="text-xs font-bold text-slate-300">System</span>
                   </button>
                   
                   <button onClick={() => performNativeShare('twitter')} className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors gap-2">
                      <Twitter size={24} className="text-sky-400" />
                      <span className="text-xs font-bold text-slate-300">X / Twitter</span>
                   </button>

                   <button onClick={() => performNativeShare('instagram')} className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors gap-2">
                      <Instagram size={24} className="text-rose-500" />
                      <span className="text-xs font-bold text-slate-300">Instagram</span>
                   </button>

                   <button onClick={handleSaveImage} className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors gap-2">
                      <Download size={24} className="text-emerald-400" />
                      <span className="text-xs font-bold text-slate-300">
                          {t.btn_save}
                      </span>
                   </button>
                </div>
              )}

              <div className="flex flex-col gap-2 mt-2">
                 <div className="bg-slate-800/50 p-2 rounded text-center">
                    <button onClick={handleCopyLink} className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 w-full">
                       <LinkIcon size={12} /> Copy Link
                    </button>
                 </div>
                 <Button onClick={() => setShowShareMenu(false)} fullWidth variant="secondary" className="py-2 text-sm">
                    {commonT.close}
                 </Button>
              </div>
           </div>
        </div>
      )}

      {/* DETAIL POPUP MODAL */}
      {selectedResultForPopup && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-slate-950/80 backdrop-blur-sm">
           <div className="bg-slate-900 border border-slate-700 w-full max-w-lg max-h-[90%] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
              
              <div className="p-4 border-b border-slate-700 bg-slate-900 flex justify-between items-center shrink-0">
                 <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                       {getTopicIcon(selectedResultForPopup.id)} 
                       <span className="flex flex-col">
                          <span className="text-xs md:text-sm text-slate-300 font-bold leading-none">
                            {selectedResultForPopup.title}
                          </span>
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
                       
                       <h4 className="text-sm font-bold text-white mb-2 leading-snug">
                          {item.questionText || "Question text unavailable"}
                       </h4>

                       <div className="grid grid-cols-1 gap-2 mb-3">
                           <div className={`text-xs p-2 rounded border ${item.isCorrect ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/30 border-rose-500/30 text-rose-300'}`}>
                              <span className="font-bold block opacity-70 mb-0.5">{t.popup_your_answer}:</span>
                              {item.selectedOption || "N/A"}
                           </div>

                           {!item.isCorrect && (
                              <div className="text-xs p-2 rounded border bg-cyan-950/30 border-cyan-500/30 text-cyan-300">
                                 <span className="font-bold block opacity-70 mb-0.5">{t.popup_correct_answer}:</span>
                                 {item.correctAnswer || item.correctFact || "N/A"}
                              </div>
                           )}
                       </div>

                       <div className="text-xs pt-3 border-t border-slate-800/50">
                          <span className="text-slate-500 font-bold block mb-1">{t.popup_ai_comment}:</span>
                          <p className="text-slate-400 italic">"{item.aiComment}"</p>
                       </div>
                    </div>
                 ))}
              </div>

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
