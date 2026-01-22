
import React, { useState, useRef } from 'react';
import { EvaluationResult, Language } from '../types';
import { Button } from './Button';
import { Share2, RefreshCw, Brain, Zap, Palette, CheckCircle, XCircle, Users, Home, Instagram, X, ArrowRight, Download, Quote } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import { TRANSLATIONS } from '../utils/translations';

interface StageResultsProps {
  data: EvaluationResult;
  onRestart: () => void;
  onHome: () => void;
  onNextTopic?: () => void;
  remainingTopics?: number;
  nextTopicName?: string;
  language: Language;
}

const THEMES = [
  { id: 'default', name: 'Cyber', bg: 'glass-panel', text: 'text-white', accent: 'text-cyan-400', chart: '#06b6d4', iconColor: 'bg-cyan-500' },
  { id: 'royal', name: 'Royal', bg: 'bg-gradient-to-br from-indigo-900 to-purple-900 border border-yellow-500/50', text: 'text-yellow-50', accent: 'text-yellow-400', chart: '#fbbf24', iconColor: 'bg-yellow-500' },
  { id: 'paper', name: 'Light', bg: 'bg-slate-100 border border-slate-300 shadow-xl', text: 'text-slate-900', accent: 'text-blue-600', chart: '#2563eb', iconColor: 'bg-blue-600' }
];

export const StageResults: React.FC<StageResultsProps> = ({ data, onRestart, onHome, onNextTopic, remainingTopics = 0, nextTopicName, language }) => {
  const [currentThemeIdx, setCurrentThemeIdx] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSlide, setGeneratedSlide] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const shareCardRef = useRef<HTMLDivElement>(null);
  
  const theme = THEMES[currentThemeIdx];
  const t = TRANSLATIONS[language].results;
  const isLightMode = theme.id === 'paper';

  const getGrade = (score: number) => {
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    if (score >= 40) return 'C';
    return 'F';
  };

  const grade = getGrade(data.totalScore);
  const gradeColor = grade === 'S' || grade === 'A' ? 'text-yellow-400' : grade === 'F' ? 'text-red-500' : 'text-cyan-400';

  const handleShare = async () => {
    const shareText = `Cognito Protocol Analysis 🧠\nTopic: ${data.title}\nScore: ${data.totalScore}/100 [Rank ${grade}]\n\nProve your humanity here:`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cognito: Human vs AI',
          text: shareText,
          url: url
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${url}`);
        alert('Copied to clipboard!');
      } catch (err) {
        alert('Failed to copy.');
      }
    }
  };

  const handleGenerateImage = async () => {
    if (!shareCardRef.current) return;
    setIsGenerating(true);
    try {
      await new Promise(r => setTimeout(r, 200)); // Font loading safeguard
      
      const config = { 
        cacheBust: true, 
        pixelRatio: 2, // High resolution
        backgroundColor: '#020617'
      };

      const imageUrl = await toPng(shareCardRef.current, config);
      setGeneratedSlide(imageUrl);
      setShowModal(true);
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedSlide) return;
    const link = document.createElement('a');
    link.download = `cognito-${data.title.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = generatedSlide;
    link.click();
  };

  const chartData = [
    { subject: t.chart.accuracy, A: data.totalScore, fullMark: 100 },
    { subject: t.chart.speed, A: 85, fullMark: 100 },
    { subject: t.chart.cohort, A: data.demographicPercentile, fullMark: 100 }, 
    { subject: t.chart.logic, A: data.totalScore > 50 ? 80 : 40, fullMark: 100 },
    { subject: t.chart.intuition, A: 90, fullMark: 100 },
  ];

  const navBtnStyle = "absolute top-4 text-white bg-slate-800/80 backdrop-blur-md p-2 rounded-full hover:bg-slate-700 transition-all z-20 border border-white/10 shadow-lg";

  return (
    <div className="space-y-4 animate-fade-in w-full max-w-2xl pb-10 relative pt-16">
      <button 
        onClick={onHome}
        className={`${navBtnStyle} right-0 md:-right-12`}
        aria-label="Home"
      >
        <Home size={20} />
      </button>

      {/* Main Results Card */}
      <div className={`p-6 md:p-8 rounded-3xl transition-all duration-500 ${theme.bg} relative overflow-hidden`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
           <div>
             <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {t.badge_complete}
             </div>
             <h2 className={`text-2xl font-black ${theme.text} leading-none`}>{data.title}</h2>
           </div>
           
           <div className={`w-12 h-12 flex items-center justify-center rounded-xl font-black text-2xl border-2 ${
             grade === 'S' ? 'bg-yellow-500/20 border-yellow-400 text-yellow-400' : 
             grade === 'F' ? 'bg-red-500/20 border-red-500 text-red-500' : 
             'bg-cyan-500/20 border-cyan-400 text-cyan-400'
           }`}>
             {grade}
           </div>
        </div>

        {/* Score & Chart Section */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
           <div className="flex-1 text-center md:text-left">
              <div className="text-6xl font-black tracking-tighter mb-2">
                 <span className={gradeColor}>{data.totalScore}</span>
                 <span className={`text-3xl ${isLightMode ? 'text-slate-400' : 'text-slate-600'}`}>/100</span>
              </div>
              <p className={`text-sm italic opacity-80 ${theme.text} flex gap-2 items-start justify-center md:justify-start`}>
                 <Quote size={14} className="shrink-0 mt-0.5 opacity-50" />
                 {data.aiComparison}
              </p>
           </div>
           
           <div className="w-full md:w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke={isLightMode ? "#cbd5e1" : "#475569"} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: isLightMode ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Human" dataKey="A" stroke={theme.chart} fill={theme.chart} fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className={`p-3 rounded-xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-black/20 border-white/10'}`}>
            <div className={`flex items-center gap-2 mb-1 ${theme.accent}`}>
               <Users size={16} /> <span className="text-[10px] font-bold uppercase">{t.label_percentile}</span>
            </div>
            <div className={`text-xl font-bold ${theme.text}`}>Top {100 - data.humanPercentile}%</div>
          </div>
          <div className={`p-3 rounded-xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-black/20 border-white/10'}`}>
            <div className={`flex items-center gap-2 mb-1 ${theme.accent}`}>
               <Brain size={16} /> <span className="text-[10px] font-bold uppercase">{t.label_correct}</span>
            </div>
            <div className={`text-xl font-bold ${theme.text}`}>{data.details.filter(d => d.isCorrect).length} / 5</div>
          </div>
        </div>

        {/* Detailed Feedback (Collapsible-ish style) */}
        <div className={`space-y-3 p-4 rounded-2xl ${isLightMode ? 'bg-slate-50' : 'bg-slate-900/50'}`}>
           <h4 className={`text-xs font-bold uppercase tracking-widest mb-2 ${theme.text} opacity-60`}>Analysis Vector</h4>
           {data.details.map((item, idx) => (
             <div key={idx} className="flex gap-3 items-start">
                <div className="mt-0.5 shrink-0">
                   {item.isCorrect 
                     ? <CheckCircle size={14} className="text-green-500" /> 
                     : <XCircle size={14} className="text-red-500" />
                   }
                </div>
                <div className="flex-1">
                   <p className={`text-xs ${theme.text} opacity-90 leading-relaxed`}>
                     {item.aiComment}
                   </p>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Theme & Actions */}
      <div className="grid grid-cols-4 gap-2">
          {THEMES.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => setCurrentThemeIdx(idx)}
              className={`h-2 rounded-full transition-all ${currentThemeIdx === idx ? t.iconColor : 'bg-slate-800'}`}
            />
          ))}
      </div>

      <div className="flex flex-col gap-3">
        {remainingTopics > 0 ? (
          <Button onClick={onNextTopic} variant="primary" fullWidth className="py-4 text-base animate-pulse shadow-xl shadow-cyan-500/20">
            {t.btn_next_topic} {nextTopicName} <span className="bg-white/20 px-2 py-0.5 rounded text-xs ml-2">{remainingTopics} Left</span> <ArrowRight size={18} />
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
             <Button onClick={onRestart} variant="outline" className="text-sm">
               <RefreshCw size={16} /> {t.btn_retry}
             </Button>
             <Button onClick={handleGenerateImage} disabled={isGenerating} variant="secondary" className="text-sm">
               <Instagram size={16} /> {isGenerating ? "..." : "Story Card"}
             </Button>
             <Button onClick={handleShare} variant="primary" fullWidth className="col-span-2 shadow-lg">
               <Share2 size={18} /> {t.btn_share}
             </Button>
          </div>
        )}
      </div>

      {/* HIDDEN: Share Card Generation Template (Instagram Story Size 9:16) */}
      <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none overflow-hidden">
        <div 
          ref={shareCardRef} 
          style={{ width: '1080px', height: '1920px' }} 
          className="bg-slate-950 text-white relative flex flex-col items-center justify-between p-16"
        >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(6,182,212,0.15),_transparent_70%)]"></div>
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            {/* Header */}
            <div className="w-full flex justify-between items-center z-10 border-b-4 border-white pb-8">
               <div className="flex flex-col">
                 <span className="text-4xl font-bold text-slate-400 tracking-widest">COGNITO</span>
                 <span className="text-2xl text-cyan-400 font-mono">PROTOCOL_V2</span>
               </div>
               <div className="bg-white text-slate-950 px-6 py-2 text-3xl font-black rounded-lg">HUMAN VERIFIED</div>
            </div>

            {/* Main Content */}
            <div className="flex-1 w-full flex flex-col items-center justify-center gap-16 z-10">
               {/* Topic Tag */}
               <div className="bg-slate-900 border-2 border-slate-700 px-12 py-6 rounded-full">
                  <h2 className="text-6xl font-black text-white uppercase tracking-tight">{data.title}</h2>
               </div>

               {/* Score Circle */}
               <div className="relative w-[600px] h-[600px] flex items-center justify-center">
                  <div className="absolute inset-0 border-8 border-slate-800 rounded-full"></div>
                  <div className="absolute inset-0 border-8 border-cyan-500 rounded-full border-t-transparent -rotate-45"></div>
                  <div className="flex flex-col items-center">
                     <span className="text-[250px] font-black leading-none tracking-tighter text-white drop-shadow-[0_0_50px_rgba(6,182,212,0.5)]">
                        {data.totalScore}
                     </span>
                     <span className="text-5xl font-bold text-slate-500 mt-4">/ 100</span>
                  </div>
               </div>

               {/* Stats Row */}
               <div className="grid grid-cols-2 gap-8 w-full px-8">
                  <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-700">
                     <div className="text-3xl text-cyan-400 font-bold mb-2">RANK</div>
                     <div className="text-7xl font-black text-white">{grade}</div>
                  </div>
                  <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-700">
                     <div className="text-3xl text-cyan-400 font-bold mb-2">PERCENTILE</div>
                     <div className="text-7xl font-black text-white">Top {100 - data.humanPercentile}%</div>
                  </div>
               </div>

               {/* AI Quote */}
               <div className="w-full bg-rose-950/30 border-l-8 border-rose-500 p-8">
                  <p className="text-4xl italic text-rose-200 font-serif leading-relaxed">"{data.aiComparison}"</p>
                  <p className="text-2xl text-rose-500 font-bold mt-4 text-right">- AI OBSERVER</p>
               </div>
            </div>

            {/* Footer */}
            <div className="w-full text-center z-10 pt-8 border-t-4 border-slate-800">
               <p className="text-3xl font-mono text-slate-500">cognito-protocol.web.app</p>
            </div>
        </div>
      </div>
      
      {/* Modal for Generated Image */}
      {showModal && generatedSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-fade-in">
           <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm relative flex flex-col gap-4 shadow-2xl">
             <button onClick={() => setShowModal(false)} className="absolute -top-4 -right-4 p-2 bg-rose-500 text-white rounded-full shadow-lg"><X size={24} /></button>
             
             <div className="text-center space-y-1">
                <h3 className="text-white font-bold text-lg">Card Generated!</h3>
                <p className="text-slate-400 text-xs">Long press to save or click download</p>
             </div>

             <div className="rounded-xl overflow-hidden border border-slate-700 shadow-xl bg-black">
                <img src={generatedSlide} alt="Result Card" className="w-full h-auto object-cover" />
             </div>
             
             <Button onClick={downloadImage} fullWidth variant="primary">
                <Download size={18} /> Save Image
             </Button>
           </div>
        </div>
      )}
    </div>
  );
};
