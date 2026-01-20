import React, { useState } from 'react';
import { EvaluationResult, Language } from '../types';
import { Button } from './Button';
import { Share2, RefreshCw, Brain, Zap, Palette, CheckCircle, XCircle, Users } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
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
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${url}`);
        alert('Result copied to clipboard!');
      } catch (err) {
        alert('Failed to copy result.');
      }
    }
  };

  // Prepare chart data
  const chartData = [
    { subject: t.chart.accuracy, A: data.totalScore, B: 100, fullMark: 100 },
    { subject: t.chart.speed, A: 85, B: 100, fullMark: 100 },
    { subject: t.chart.cohort, A: data.demographicPercentile, B: 50, fullMark: 100 }, 
    { subject: t.chart.logic, A: data.totalScore > 50 ? 70 : 40, B: 100, fullMark: 100 },
    { subject: t.chart.intuition, A: 90, B: 20, fullMark: 100 },
  ];

  const isLightMode = theme.id === 'paper';

  return (
    <div className="space-y-4 animate-fade-in w-full max-w-2xl">
      
      {/* Theme Toggle Bar */}
      <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-xl backdrop-blur-sm border border-slate-700">
        <span className="text-xs font-bold text-slate-400 ml-2 uppercase tracking-wider">{t.label_template}</span>
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white transition-colors border border-slate-600"
        >
          <Palette size={14} /> {theme.name} Mode
        </button>
      </div>

      {/* Main Result Card */}
      <div className={`p-6 md:p-8 rounded-3xl transition-all duration-500 ${theme.bg}`}>
        
        {/* Header Badge */}
        <div className="text-center mb-6">
           <div className={`inline-block px-4 py-1 rounded-full border text-sm font-bold tracking-wider uppercase ${isLightMode ? 'bg-slate-200 border-slate-300 text-slate-600' : 'bg-white/10 border-white/20 text-white/80'}`}>
             {t.badge_complete}
           </div>
        </div>

        {/* Score & Title */}
        <div className={`text-center space-y-2 mb-8 ${theme.text}`}>
          <h2 className="text-6xl font-black">{data.totalScore}%</h2>
          <h3 className={`text-2xl font-bold ${theme.accent}`}>
            {data.title}
          </h3>
          <p className={`italic text-sm opacity-70`}>"{data.aiComparison}"</p>
        </div>

        {/* Cohort Analysis Section */}
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

        {/* Stats Grid */}
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

        {/* Chart */}
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

        {/* Question Review (Compact) */}
        <div className={`space-y-3 p-4 rounded-2xl max-h-48 overflow-y-auto ${isLightMode ? 'bg-slate-50' : 'bg-black/20'}`}>
          {data.details.map((item) => (
            <div key={item.questionId} className={`border-b last:border-0 pb-3 last:pb-0 ${isLightMode ? 'border-slate-200' : 'border-white/10'}`}>
               <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    {item.isCorrect ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
                    <span className={`text-xs font-bold ${theme.text} opacity-80`}>Question {item.questionId}</span>
                  </div>
               </div>
               <p className={`text-xs italic opacity-70 ${theme.text} mb-1`}>{item.aiComment}</p>
               {!item.isCorrect && (
                  <p className={`text-[10px] font-bold ${theme.accent}`}>Correct: {item.correctFact}</p>
               )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button onClick={onRestart} variant="outline" className="flex-1">
          <RefreshCw size={18} /> {t.btn_retry}
        </Button>
        <Button onClick={handleShare} variant="primary" className="flex-1">
          <Share2 size={18} /> {t.btn_share}
        </Button>
      </div>

    </div>
  );
};
