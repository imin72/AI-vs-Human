
import React, { useMemo, useState, useEffect } from 'react';
import { 
  Play, 
  ChevronLeft, 
  History, 
  FlaskConical, 
  Palette, 
  Zap, 
  Map, 
  Film, 
  Music, 
  Gamepad2, 
  Trophy, 
  Cpu, 
  Scroll, 
  Book, 
  Leaf, 
  Utensils, 
  Orbit, 
  Lightbulb,
  PlusCircle,
  Hash,
  Dices
} from 'lucide-react';
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

const getCategoryIcon = (id: string) => {
  switch (id) {
    case TOPIC_IDS.HISTORY: return <History size={20} />;
    case TOPIC_IDS.SCIENCE: return <FlaskConical size={20} />;
    case TOPIC_IDS.ARTS: return <Palette size={20} />;
    case TOPIC_IDS.GENERAL: return <Zap size={20} />;
    case TOPIC_IDS.GEOGRAPHY: return <Map size={20} />;
    case TOPIC_IDS.MOVIES: return <Film size={20} />;
    case TOPIC_IDS.MUSIC: return <Music size={20} />;
    case TOPIC_IDS.GAMING: return <Gamepad2 size={20} />;
    case TOPIC_IDS.SPORTS: return <Trophy size={20} />;
    case TOPIC_IDS.TECH: return <Cpu size={20} />;
    case TOPIC_IDS.MYTHOLOGY: return <Scroll size={20} />;
    case TOPIC_IDS.LITERATURE: return <Book size={20} />;
    case TOPIC_IDS.NATURE: return <Leaf size={20} />;
    case TOPIC_IDS.FOOD: return <Utensils size={20} />;
    case TOPIC_IDS.SPACE: return <Orbit size={20} />;
    case TOPIC_IDS.PHILOSOPHY: return <Lightbulb size={20} />;
    default: return <PlusCircle size={20} />;
  }
};

export const TopicSelectionView: React.FC<TopicSelectionViewProps> = ({ t, state, actions }) => {
  const { selectedCategory, selectedSubTopic, customTopic, difficulty, displayedTopics, displayedSubTopics, errorMsg } = state;
  
  // Local state to manage the 4 subtopics being displayed
  const [subsetSubTopics, setSubsetSubTopics] = useState<string[]>([]);

  // When category changes, pick 4 random subtopics
  useEffect(() => {
    if (selectedCategory && displayedSubTopics.length > 0) {
      handleRefreshSubtopics();
    }
  }, [selectedCategory, displayedSubTopics.length]);

  const handleRefreshSubtopics = () => {
    const shuffled = [...displayedSubTopics].sort(() => 0.5 - Math.random());
    setSubsetSubTopics(shuffled.slice(0, 4));
    // If the currently selected subtopic is not in the new subset, we don't necessarily clear it, 
    // but the UI will show it's not selected among the visible ones.
  };

  const handleRandomCategory = () => {
    const randomIdx = Math.floor(Math.random() * displayedTopics.length);
    actions.selectCategory(displayedTopics[randomIdx].id);
  };

  return (
    <div className="glass-panel p-6 rounded-3xl space-y-6 animate-fade-in relative overflow-hidden min-h-[400px]">
      <button 
        onClick={actions.goBack}
        className="absolute top-4 left-4 text-white bg-slate-900/40 backdrop-blur-md p-2 rounded-full hover:bg-slate-800 transition-all z-20 border border-white/10"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="flex items-center justify-between mb-2 pt-2">
        <div className="w-10"></div>
        <h2 className="text-2xl font-bold text-center tracking-tight text-white drop-shadow-md">
          {!selectedCategory ? t.title_select : t.title_config}
        </h2>
        <div className="w-10"></div>
      </div>
      
      {errorMsg && <div className="text-red-400 text-center text-sm bg-red-900/20 p-2 rounded border border-red-500/20 animate-pulse">{errorMsg}</div>}

      {!selectedCategory ? (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
          <button
            onClick={handleRandomCategory}
            className="w-full flex items-center justify-center gap-2 py-3 mb-2 rounded-2xl bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-cyan-500/30 text-cyan-400 font-bold text-sm hover:from-purple-600/40 hover:to-cyan-600/40 transition-all group shadow-lg"
          >
            <Dices size={18} className="group-hover:rotate-12 transition-transform" />
            RANDOM SELECTION
          </button>

          <div className="grid grid-cols-2 gap-3">
            {displayedTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => actions.selectCategory(topic.id)}
                className="group relative h-32 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-cyan-500 transition-all shadow-xl active:scale-[0.98]"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url('${t.categoryImages[topic.id] || ''}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent group-hover:from-slate-950 group-hover:via-slate-950/50" />
                <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col items-center gap-1.5 translate-y-2 group-hover:translate-y-0 transition-transform">
                  <div className="text-cyan-400 group-hover:text-cyan-300 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {getCategoryIcon(topic.id)}
                  </div>
                  <span className="font-extrabold text-center text-[10px] md:text-xs text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                    {topic.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
          
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Manual Input</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>
          
          <button 
            onClick={() => actions.selectCategory(TOPIC_IDS.CUSTOM)} 
            className="w-full p-4 rounded-2xl border border-slate-700 bg-slate-900/50 text-slate-400 hover:text-white hover:border-rose-500 transition-all font-bold text-sm flex items-center justify-center gap-2 group shadow-inner"
          >
            <PlusCircle size={18} className="group-hover:text-rose-500 transition-colors" />
            {t.categories[TOPIC_IDS.CUSTOM]}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {selectedCategory === TOPIC_IDS.CUSTOM ? (
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-3 block pl-1">{t.label_custom}</label>
              <div className="relative">
                 <input 
                  type="text" 
                  autoFocus
                  placeholder={t.ph_custom} 
                  value={customTopic} 
                  onChange={(e) => actions.setCustomTopic(e.target.value)} 
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl p-4 pl-12 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600" 
                />
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              </div>
            </div>
          ) : (
            <div>
              {/* Shuffle/Random Selection Button for Subtopics */}
              <button
                onClick={handleRefreshSubtopics}
                className="w-full flex items-center justify-center gap-2 py-3 mb-4 rounded-2xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-blue-500/30 text-blue-400 font-bold text-sm hover:from-cyan-600/40 hover:to-blue-600/40 transition-all group shadow-lg"
              >
                <Dices size={18} className="group-hover:rotate-12 transition-transform" />
                RANDOM SELECTION (SHUFFLE)
              </button>

              <div className="flex items-center gap-2 mb-4 pl-1">
                <div className="text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">{getCategoryIcon(selectedCategory)}</div>
                <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block">{t.label_field}</label>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {subsetSubTopics.map(sub => (
                  <button 
                    key={sub} 
                    onClick={() => actions.selectSubTopic(sub)} 
                    className={`group relative h-24 rounded-xl overflow-hidden border transition-all active:scale-[0.98] ${
                      selectedSubTopic === sub 
                        ? 'border-cyan-400 ring-2 ring-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
                        : 'border-slate-800 hover:border-slate-500'
                    }`}
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500000000000?auto=format&fit=crop&w=400&q=80&sig=${encodeURIComponent(sub)}')` }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t transition-colors ${
                      selectedSubTopic === sub 
                        ? 'from-cyan-900/95 via-cyan-900/60 to-cyan-900/40' 
                        : 'from-slate-950/90 via-slate-950/30 to-transparent group-hover:from-slate-950/95'
                    }`} />
                    
                    <div className="absolute inset-0 p-3 flex flex-col justify-end">
                      <span className={`text-[12px] font-black text-center leading-tight transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase tracking-wide ${
                        selectedSubTopic === sub ? 'text-white' : 'text-slate-100'
                      }`}>
                        {sub}
                      </span>
                    </div>
                    
                    {selectedSubTopic === sub && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_cyan]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block pl-1">{t.label_difficulty}</label>
            <div className="flex gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/50 shadow-inner">
              {Object.values(Difficulty).map((diff) => (
                <button 
                  key={diff} 
                  onClick={() => actions.setDifficulty(diff)} 
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                    difficulty === diff 
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_4px_10px_rgba(0,0,0,0.3)] border border-white/10' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t.difficulty[diff]}
                </button>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={actions.startQuiz} 
            disabled={(selectedCategory === TOPIC_IDS.CUSTOM && !customTopic) || (selectedCategory !== TOPIC_IDS.CUSTOM && !selectedSubTopic)} 
            fullWidth 
            className="mt-4 py-4 rounded-2xl text-base font-black tracking-widest uppercase shadow-[0_8px_30px_rgba(8,145,178,0.25)] group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {t.btn_start_sim} <Play size={20} className="group-hover:translate-x-1 transition-transform fill-white" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>
        </div>
      )}
    </div>
  );
};
