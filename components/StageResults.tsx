import React, { useState, useRef } from 'react';
import { EvaluationResult, Language } from '../types';
import { Button } from './Button';
import { Share2, RefreshCw, Brain, Zap, Palette, CheckCircle, XCircle, Users, Download } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import { TRANSLATIONS } from '../utils/translations';

interface StageResultsProps {
  data: EvaluationResult;
  onRestart: () => void;
  language: Language;
}

const THEMES = [
  { id: 'default', name: 'Glass', bg: 'glass-panel', text: 'text-white', accent: 'text-cyan-400', chart: '#06b6d4' },
  { id: 'terminal', name: 'Terminal', bg: 'bg-black border-2 border-green-500 font-mono', text: 'text-green-500', accent: 'text-green-300', chart: '#22c55e' },
  { id: 'royal', name: 'Royal', bg: 'bg-gradient-to-br from-indigo-900 to-purple-900 border border-yellow-500/50', text: 'text-yellow-50', accent: 'text-yellow-400', chart: '#fbbf24' },
  { id: 'sunset', name: 'Sunset', bg: 'bg-gradient-to-tr from-orange-900 to-rose-900 border border-orange-500/30', text: 'text-orange-50', accent: 'text-orange-300', chart: '#f97316' },
  { id: 'paper', name: 'Minimal', bg: 'bg-slate-100 border border-slate-300 shadow-xl', text: 'text-slate-900', accent: 'text-blue-600', chart: '#2563eb' }
];

export const StageResults: React.FC<StageResultsProps> = ({ data, onRestart, language }) => {
  const [currentThemeIdx, setCurrentThemeIdx] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const theme = THEMES[currentThemeIdx];
  const t = TRANSLATIONS[language].results;

  const toggleTheme = () => {
    setCurrentThemeIdx((prev) => (prev + 1) % THEMES.length);
  };

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

  const handleDownload = async () => {
    if (resultsRef.current === null) return;
    setIsSaving(true);
    try {
      // Small delay to ensure any dynamic assets are ready
      await new Promise(r => setTimeout(r, 100));
      const dataUrl = await toPng(resultsRef.current, { 
        cacheBust: true, 
        pixelRatio: 2,
        backgroundColor: theme.id === 'paper' ? '#f1f5f9' : '#020617'
      });
      const link = document.createElement('a');
      link.download = `cognito-result-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
      alert('Failed to save image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const chartData = [
    { subject: t.chart.accuracy, A: data.totalScore, B: 100, fullMark: 100 },
    { subject: t.chart.speed, A: 85, B: 100, fullMark: 100 },
    { subject: t.chart.cohort, A: data.demographicPercentile, B: 50, fullMark: 100 }, 
    { subject: t.chart.logic, A: data.totalScore > 50 ? 70 : 40, B: 100, fullMark: 100 },
    { subject: t.chart.intuition, A: 90, B: 20, fullMark: 100 },
  ];

  const isLightMode = theme.id === 'paper';

  return (
    <div className="space-y-4 animate-fade-in w-full max-w-2xl pb-10">
      <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-xl backdrop-blur-sm border border-slate-700">
        <span className="text-xs font-bold text-slate-400 ml-2 uppercase tracking-wider">{t.label_template}</span>
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white transition-colors border border-slate-600"
        >
          <Palette size={14} /> {theme.name} Mode
        </button>
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

        {/* Removed max-h and overflow-y to show all questions at once */}
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
               {!item.isCorrect && (
                  <div className={`mt-1 text-[11px] p-2 rounded-lg ${isLightMode ? 'bg-white' : 'bg-white/5'} border border-rose-500/20`}>
                    <span className={`font-bold ${theme.accent}`}>Correction:</span> <span className={theme.text}>{item.correctFact}</span>
                  </div>
               )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-4">
        <Button onClick={onRestart} variant="outline" className="px-2">
          <RefreshCw size={18} />
        </Button>
        <Button onClick={handleDownload} disabled={isSaving} variant="outline" className="flex-1">
          <Download size={18} /> {isSaving ? "..." : t.btn_save}
        </Button>
        <Button onClick={handleShare} variant="primary" className="flex-1">
          <Share2 size={18} /> {t.btn_share}
        </Button>
      </div>
    </div>
  );
};