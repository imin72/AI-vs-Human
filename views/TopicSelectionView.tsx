
import React from 'react';
import { Play, ChevronLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { Difficulty, TOPIC_IDS } from '../types';

interface TopicSelectionViewProps {
  t: any;
  state: {
    selectedCategory: string;
    selectedSubTopic: string;
    customTopic: string;
    difficulty: Difficulty;
    displayedTopics: {id: string, label: string}[];
    displayedSubTopics: string[];
    isTopicLoading: boolean;
    errorMsg: string;
  };
  actions: {
    goBack: () => void;
    shuffleTopics: () => void;
    selectCategory: (id: string) => void;
    setCustomTopic: (val: string) => void;
    shuffleSubTopics: () => void;
    selectSubTopic: (sub: string) => void;
    setDifficulty: (diff: Difficulty) => void;
    startQuiz: () => void;
  };
}

export const TopicSelectionView: React.FC<TopicSelectionViewProps> = ({ t, state, actions }) => {
  const { selectedCategory, selectedSubTopic, customTopic, difficulty, displayedTopics, displayedSubTopics, errorMsg } = state;

  return (
    <div className="glass-panel p-6 rounded-3xl space-y-6 animate-fade-in relative overflow-hidden min-h-[400px]">
      <button 
        onClick={actions.goBack}
        className="absolute top-4 left-4 text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
      >
        <ChevronLeft size={16} /> {t.btn_back}
      </button>

      <div className="flex items-center justify-between mb-4 pt-2">
        <div className="w-10"></div>
        <h2 className="text-2xl font-bold text-center">
          {!selectedCategory ? t.title_select : t.title_config}
        </h2>
        <div className="w-10"></div>
      </div>
      
      {errorMsg && <div className="text-red-400 text-center text-sm bg-red-900/20 p-2 rounded">{errorMsg}</div>}

      {!selectedCategory ? (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
          <div className="grid grid-cols-2 gap-3">
            {displayedTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => actions.selectCategory(topic.id)}
                className="p-4 rounded-xl border bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-cyan-500 transition-all flex flex-col items-center gap-2 h-24 justify-center shadow-lg"
              >
                <span className="font-bold text-center text-sm">{topic.label}</span>
              </button>
            ))}
          </div>
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-wider">OR</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>
          <button onClick={() => actions.selectCategory(TOPIC_IDS.CUSTOM)} className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-400 hover:text-white hover:border-rose-500 transition-all font-bold text-sm">
            {t.categories[TOPIC_IDS.CUSTOM]}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {selectedCategory === TOPIC_IDS.CUSTOM ? (
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 block">{t.label_custom}</label>
              <input type="text" placeholder={t.ph_custom} value={customTopic} onChange={(e) => actions.setCustomTopic(e.target.value)} className="w-full bg-slate-900/80 border border-slate-600 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500 outline-none" />
            </div>
          ) : (
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 block">{t.label_field}</label>
              <div className="grid grid-cols-2 gap-2 max-h-[30vh] overflow-y-auto custom-scrollbar pr-1">
                {displayedSubTopics.map(sub => (
                  <button key={sub} onClick={() => actions.selectSubTopic(sub)} className={`p-3 rounded-lg text-xs font-medium border transition-all ${selectedSubTopic === sub ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 block">{t.label_difficulty}</label>
            <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-700">
              {Object.values(Difficulty).map((diff) => (
                <button key={diff} onClick={() => actions.setDifficulty(diff)} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${difficulty === diff ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{t.difficulty[diff]}</button>
              ))}
            </div>
          </div>
          <Button onClick={actions.startQuiz} disabled={(selectedCategory === TOPIC_IDS.CUSTOM && !customTopic) || (selectedCategory !== TOPIC_IDS.CUSTOM && !selectedSubTopic)} fullWidth className="mt-4">
            {t.btn_start_sim} <Play size={18} />
          </Button>
        </div>
      )}
    </div>
  );
};
