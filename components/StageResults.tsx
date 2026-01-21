
import React, { useState, useRef } from 'react';
import { EvaluationResult, Language } from '../types';
import { Button } from './Button';
import { Share2, RefreshCw, Brain, Zap, Palette, CheckCircle, XCircle, Users, Download, Home, Instagram, X } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import { TRANSLATIONS } from '../utils/translations';

interface StageResultsProps {
  data: EvaluationResult;
  onRestart: () => void;
  onHome: () => void;
  language: Language;
}

const THEMES = [
  { id: 'default', name: 'Glass', bg: 'glass-panel', text: 'text-white', accent: 'text-cyan-400', chart: '#06b6d4', iconColor: 'bg-cyan-500' },
  { id: 'terminal', name: 'Matrix', bg: 'bg-black border-2 border-green-500 font-mono', text: 'text-green-500', accent: 'text-green-300', chart: '#22c55e', iconColor: 'bg-green-500' },
  { id: 'royal', name: 'Royal', bg: 'bg-gradient-to-br from-indigo-900 to-purple-900 border border-yellow-500/50', text: 'text-yellow-50', accent: 'text-yellow-400', chart: '#fbbf24', iconColor: 'bg-yellow-500' },
  { id: 'sunset', name: 'Sunset', bg: 'bg-gradient-to-tr from-orange-900 to-rose-900 border border-orange-500/30', text: 'text-orange-50', accent: 'text-orange-300', chart: '#f97316', iconColor: 'bg-orange-500' },
  { id: 'paper', name: 'Light', bg: 'bg-slate-100 border border-slate-300 shadow-xl', text: 'text-slate-900', accent: 'text-blue-600', chart: '#2563eb', iconColor: 'bg-blue-600' }
];

export const StageResults: React.FC<StageResultsProps> = ({ data, onRestart, onHome, language }) => {
  const [currentThemeIdx, setCurrentThemeIdx] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSlides, setGeneratedSlides] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const slide1Ref = useRef<HTMLDivElement>(null);
  const slide2Ref = useRef<HTMLDivElement>(null);
  
  const theme = THEMES[currentThemeIdx];
  const t = TRANSLATIONS[language].results;
  const isLightMode = theme.id === 'paper';

  const handleShare = async () => {
    const shareText = `Cognito Protocol Analysis 🧠\n\nTopic: ${data.title}\nScore: ${data.totalScore}/100\nPercentile: Top ${100 - data.humanPercentile}%\n\nAI Comment: "${data.aiComparison}"\n\nProve your humanity here:`;
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
        alert('Result copied to clipboard!');
      } catch (err) {
        alert('Failed to copy result.');
      }
    }
  };

  const handleGenerateSlides = async () => {
    if (!slide1Ref.current || !slide2Ref.current) return;
    setIsGenerating(true);
    try {
      // 폰트 로딩 등을 위해 잠시 대기
      await new Promise(r => setTimeout(r, 200));
      
      const config = { 
        cacheBust: true, 
        pixelRatio: 1, // 1080px is already high enough
        backgroundColor: theme.id === 'paper' ? '#f1f5f9' : '#020617'
      };

      const slide1Url = await toPng(slide1Ref.current, config);
      const slide2Url = await toPng(slide2Ref.current, config);
      
      setGeneratedSlides([slide1Url, slide2Url]);
      setShowModal(true);
    } catch (err) {
      console.error('Failed to generate images', err);
      alert('Failed to generate images. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.download = `cognito-result-${index + 1}.png`;
    link.href = url;
    link.click();
  };

  const chartData = [
    { subject: t.chart.accuracy, A: data.totalScore, B: 100, fullMark: 100 },
    { subject: t.chart.speed, A: 85, B: 100, fullMark: 100 },
    { subject: t.chart.cohort, A: data.demographicPercentile, B: 50, fullMark: 100 }, 
    { subject: t.chart.logic, A: data.totalScore > 50 ? 70 : 40, B: 100, fullMark: 100 },
    { subject: t.chart.intuition, A: 90, B: 20, fullMark: 100 },
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

      {/* Theme Selector UI */}
      <div className="bg-slate-900/50 p-4 rounded-2xl backdrop-blur-sm border border-slate-700 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <Palette size={14} className="text-cyan-400" /> {t.label_template}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {THEMES.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => setCurrentThemeIdx(idx)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all border-2 ${
                currentThemeIdx === idx 
                ? 'bg-slate-800 border-cyan-500 scale-105 shadow-lg shadow-cyan-500/20' 
                : 'bg-slate-900/40 border-transparent opacity-60 hover:opacity-100 hover:bg-slate-800'
              }`}
            >
              <div className={`w-6 h-6 rounded-full ${t.iconColor} border border-white/20 shadow-sm`} />
              <span className={`text-[10px] font-bold truncate w-full text-center ${currentThemeIdx === idx ? 'text-white' : 'text-slate-500'}`}>
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div 
        ref={resultsRef} 
        style={{ fontFamily: theme.id === 'terminal' ? 'monospace' : 'Inter, sans-serif' }}
        className={`p-6 md:p-8 rounded-3xl transition-all duration-500 ${theme.bg}`}
      >
        <div className="text-center mb-6">
           <div className={`inline-block px-4 py-1 rounded-full border text-sm font-bold tracking-wider uppercase ${isLightMode ? 'bg-slate-200 border-slate-300 text-slate-600' : 'bg-white/10 border-white/20 text-white/80'}`}>
             {t.badge_complete}
           </div>
        </div>

        <div className={`text-center space-y-2 mb-8 ${theme.text}`}>
          <h2 className="text-6xl font-black tracking-tighter">{data.totalScore}%</h2>
          <h3 className={`text-2xl font-bold ${theme.accent}`}>
            {data.title}
          </h3>
          <p className={`italic text-sm opacity-70`}>"{data.aiComparison}"</p>
        </div>

        {data.demographicPercentile > 0 && (
          <div className={`p-4 mb-6 rounded-2xl border ${isLightMode ? 'bg-blue-50 border-blue-200' : 'bg-blue-500/10 border-blue-400/20'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${isLightMode ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/20 text-blue-400'}`}>
                <Users size={20} />
              </div>
              <h4 className={`font-bold ${theme.text}`}>{t.label_cohort}</h4>
            </div>
            <p className={`text-sm ${theme.text} opacity-90 mb-2`}>
              {data.demographicComment}
            </p>
            <div className="w-full h-2 bg-slate-700/30 rounded-full overflow-hidden">
               <div 
                 className={`h-full ${theme.accent.replace('text', 'bg')}`} 
                 style={{ width: `${data.demographicPercentile}%` }}
               ></div>
            </div>
            <div className="flex justify-between text-xs mt-1 opacity-60">
               <span>{t.label_bottom}</span>
               <span>{t.label_top} {100 - data.demographicPercentile}%</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-black/20 border-white/10'}`}>
            <div className={`flex justify-center mb-2 ${theme.accent}`}><Brain size={24} /></div>
            <div className={`text-2xl font-bold text-center ${theme.text}`}>{data.humanPercentile}%</div>
            <div className={`text-xs text-center uppercase tracking-wide opacity-60 ${theme.text}`}>{t.label_percentile}</div>
          </div>
          <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-black/20 border-white/10'}`}>
            <div className={`flex justify-center mb-2 ${theme.accent}`}><Zap size={24} /></div>
            <div className={`text-2xl font-bold text-center ${theme.text}`}>{data.details.filter(d => d.isCorrect).length}/5</div>
            <div className={`text-xs text-center uppercase tracking-wide opacity-60 ${theme.text}`}>{t.label_correct}</div>
          </div>
        </div>

        <div className="h-48 w-full relative mb-8">
           <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke={isLightMode ? "#cbd5e1" : "#475569"} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: isLightMode ? '#64748b' : '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Human" dataKey="A" stroke={theme.chart} fill={theme.chart} fillOpacity={0.4} />
              <Radar name="Group" dataKey="B" stroke="#64748b" fill="#64748b" fillOpacity={0.1} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className={`space-y-4 p-5 rounded-2xl ${isLightMode ? 'bg-slate-50 shadow-inner' : 'bg-black/30'}`}>
          {data.details.map((item) => (
            <div key={item.questionId} className={`border-b last:border-0 pb-3 last:pb-0 ${isLightMode ? 'border-slate-200' : 'border-white/10'}`}>
               <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    {item.isCorrect ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                    <span className={`text-xs font-bold ${theme.text} opacity-80 uppercase tracking-tight`}>Analysis Vector {item.questionId}</span>
                  </div>
               </div>
               <p className={`text-xs italic opacity-90 ${theme.text} leading-relaxed mb-2`}>{item.aiComment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-3 gap-2 pt-4">
        <Button onClick={onRestart} variant="outline" className="px-2">
          <RefreshCw size={18} />
        </Button>
        <Button onClick={handleGenerateSlides} disabled={isGenerating} variant="outline" className="flex-1 text-xs md:text-sm">
          <Instagram size={18} /> {isGenerating ? "Generating..." : "IG Story"}
        </Button>
        <Button onClick={handleShare} variant="primary" className="flex-1 text-xs md:text-sm">
          <Share2 size={18} /> {t.btn_share}
        </Button>
      </div>

      {/* --- Hidden Components for Image Generation (1080x1080) --- */}
      <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none">
        {/* Slide 1: Score & Comment */}
        <div 
          ref={slide1Ref}
          style={{ width: '1080px', height: '1080px', fontFamily: theme.id === 'terminal' ? 'monospace' : 'Inter, sans-serif' }}
          className={`relative flex flex-col items-center justify-center p-16 ${theme.bg}`}
        >
          {/* Background Layer */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1000')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
          
          <div className="relative z-10 w-full flex flex-col items-center gap-12 text-center">
            <div className={`px-6 py-2 rounded-full border-2 text-2xl font-black uppercase tracking-[0.2em] ${isLightMode ? 'bg-white border-slate-900 text-slate-900' : 'bg-transparent border-white text-white'}`}>
              Cognito Protocol
            </div>

            <div className="space-y-4">
              <h1 className={`text-[120px] font-black leading-none tracking-tighter drop-shadow-2xl ${theme.id === 'default' ? 'text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400' : theme.text}`}>
                {data.totalScore}
              </h1>
              <div className={`text-4xl font-black uppercase tracking-wide ${theme.accent}`}>
                {data.title}
              </div>
            </div>

            <div className={`max-w-3xl p-8 rounded-3xl ${isLightMode ? 'bg-white/80' : 'bg-black/30'} backdrop-blur-xl border border-white/10`}>
              <div className="mb-4 opacity-50"><Brain size={48} className="mx-auto" /></div>
              <p className={`text-4xl italic font-medium leading-relaxed ${theme.text}`}>
                "{data.aiComparison}"
              </p>
            </div>
            
            <div className={`absolute bottom-[-150px] text-2xl font-bold opacity-60 ${theme.text}`}>
              HUMAN vs AI
            </div>
          </div>
        </div>

        {/* Slide 2: Radar & Stats */}
        <div 
          ref={slide2Ref}
          style={{ width: '1080px', height: '1080px', fontFamily: theme.id === 'terminal' ? 'monospace' : 'Inter, sans-serif' }}
          className={`relative flex flex-col items-center justify-center p-16 ${theme.bg}`}
        >
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1000')] opacity-5 bg-cover bg-center mix-blend-overlay"></div>
           
           <div className="relative z-10 w-full h-full flex flex-col justify-between py-12">
              <div className="text-center space-y-4">
                <h2 className={`text-4xl font-bold uppercase tracking-widest ${theme.text} opacity-70`}>Analysis Vector</h2>
                <div className={`text-7xl font-black ${theme.accent}`}>Top {100 - data.humanPercentile}%</div>
                <p className={`text-2xl ${theme.text} opacity-80`}>Global Human Percentile</p>
              </div>

              <div className="w-full h-[500px] my-8 relative">
                {/* Recharts doesn't animate when invisible, but renders statically which is perfect for capture */}
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                    <PolarGrid strokeWidth={2} stroke={isLightMode ? "#94a3b8" : "#475569"} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: isLightMode ? '#475569' : '#cbd5e1', fontSize: 24, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Human" dataKey="A" stroke={theme.chart} strokeWidth={4} fill={theme.chart} fillOpacity={0.5} isAnimationActive={false} />
                    <Radar name="Group" dataKey="B" stroke="#64748b" strokeWidth={2} fill="#64748b" fillOpacity={0.2} isAnimationActive={false} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-8">
                 <div className={`p-8 rounded-3xl border-2 flex items-center gap-6 ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                    <div className={`p-4 rounded-2xl ${theme.iconColor} text-white`}>
                       <Zap size={48} />
                    </div>
                    <div>
                       <div className={`text-5xl font-black ${theme.text}`}>{data.details.filter(d => d.isCorrect).length}/5</div>
                       <div className={`text-xl font-bold uppercase opacity-60 ${theme.text}`}>Correct</div>
                    </div>
                 </div>
                 <div className={`p-8 rounded-3xl border-2 flex items-center gap-6 ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                    <div className={`p-4 rounded-2xl ${isLightMode ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-400'}`}>
                       <Users size={48} />
                    </div>
                    <div>
                       <div className={`text-5xl font-black ${theme.text}`}>{data.demographicPercentile}%</div>
                       <div className={`text-xl font-bold uppercase opacity-60 ${theme.text}`}>Cohort</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* --- Share Modal --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg relative shadow-2xl">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Instagram className="text-pink-500" /> Share to Instagram
            </h3>
            
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
              {generatedSlides.map((src, idx) => (
                <div key={idx} className="flex-none w-64 md:w-72 snap-center space-y-3">
                   <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-lg relative group">
                      <img src={src} alt={`Slide ${idx + 1}`} className="w-full h-auto" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-bold text-sm">Long press to save</span>
                      </div>
                   </div>
                   <Button onClick={() => downloadImage(src, idx)} variant="secondary" fullWidth className="text-xs">
                     <Download size={14} /> Download Slide {idx + 1}
                   </Button>
                </div>
              ))}
            </div>

            <p className="text-center text-slate-500 text-xs mt-4">
              Tip: Save images to your gallery and post as a carousel.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
