
import React from 'react';
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
  Target,
  Sparkles,
  Dices,
  Atom,
  Sword,
  Clapperboard,
  Pizza,
  Microscope,
  Mountain,
  Ghost,
  Cpu as TechIcon,
  Tent
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

const getSubtopicIcon = (sub: string) => {
  const s = sub.toLowerCase();
  
  // History & Mythology
  if (s.includes('ancient') || s.includes('egypt') || s.includes('myth') || s.includes('folklore')) return <Scroll size={14} />;
  if (s.includes('war') || s.includes('battle') || s.includes('crusades') || s.includes('civil')) return <Sword size={14} />;
  if (s.includes('renaissance') || s.includes('empire') || s.includes('era')) return <History size={14} />;
  
  // Science & Tech
  if (s.includes('quantum') || s.includes('physics') || s.includes('atom')) return <Atom size={14} />;
  if (s.includes('neuro') || s.includes('genetic') || s.includes('bio') || s.includes('medical')) return <Microscope size={14} />;
  if (s.includes('ai') || s.includes('code') || s.includes('robotic') || s.includes('hard') || s.includes('cyber')) return <TechIcon size={14} />;
  
  // Space
  if (s.includes('solar') || s.includes('planet') || s.includes('moon') || s.includes('galaxy') || s.includes('star')) return <Orbit size={14} />;
  
  // Arts & Literature
  if (s.includes('art') || s.includes('paint') || s.includes('sculpt') || s.includes('design')) return <Palette size={14} />;
  if (s.includes('book') || s.includes('novel') || s.includes('writer') || s.includes('liter')) return <Book size={14} />;
  
  // Media & Entertainment
  if (s.includes('movie') || s.includes('film') || s.includes('oscar') || s.includes('cinema')) return <Clapperboard size={14} />;
  if (s.includes('music') || s.includes('pop') || s.includes('rock') || s.includes('jazz')) return <Music size={14} />;
  if (s.includes('game') || s.includes('retro') || s.includes('playstation') || s.includes('nintendo')) return <Gamepad2 size={14} />;
  
  // Geography & Nature
  if (s.includes('mount') || s.includes('river') || s.includes('island')) return <Mountain size={14} />;
  if (s.includes('animal') || s.includes('bird') || s.includes('ocean') || s.includes('forest')) return <Leaf size={14} />;
  if (s.includes('surviv')) return <Tent size={14} />;
  
  // Sports
  if (s.includes('soccer') || s.includes('basket') || s.includes('ball') || s.includes('olympic')) return <Trophy size={14} />;
  
  // Food
  if (s.includes('cuisine') || s.includes('food') || s.includes('dessert') || s.includes('cook')) return <Pizza size={14} />;
  
  // Others
  if (s.includes('horror') || s.includes('ghost')) return <Ghost size={14} />;
  if (s.includes('phobia') || s.includes('quiz')) return <Target size={14} />;
  
  return <Sparkles size={14} />;
};

export const TopicSelectionView: React.FC<TopicSelectionViewProps> = ({ t, state, actions }) => {
  const { selectedCategory, selectedSubTopic, customTopic, difficulty, displayedTopics, displayedSubTopics, errorMsg } = state;

  const handleRandomCategory = () => {
    const randomIdx = Math.floor(Math.random() * displayedTopics.length);
    actions.selectCategory(displayedTopics[randomIdx].id);
  };

  const handleRandomSubtopic = () => {
    if (displayedSubTopics.length > 0) {
      const randomIdx = Math.floor(Math.random() * displayedSubTopics.length);
      actions.selectSubTopic(displayedSubTopics[randomIdx]);
    }
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
              <div className="flex items-center justify-between mb-4 pl-1">
                <div className="flex items-center gap-2">
                  <div className="text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">{getCategoryIcon(selectedCategory)}</div>
                  <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block">{t.label_field}</label>
                </div>
                <button 
                  onClick={handleRandomSubtopic}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 text-[10px] font-black uppercase hover:border-cyan-500 transition-all active:scale-95 shadow-md"
                >
                  <Dices size={14} /> {t.btn_refresh || 'Random'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2.5 max-h-[35vh] overflow-y-auto custom-scrollbar pr-1">
                {displayedSubTopics.map(sub => (
                  <button 
                    key={sub} 
                    onClick={() => actions.selectSubTopic(sub)} 
                    className={`group p-3 rounded-xl text-xs font-bold border transition-all flex items-center gap-3 relative overflow-hidden ${
                      selectedSubTopic === sub 
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_4px_12px_rgba(8,145,178,0.3)]' 
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-600 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <div className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
                      selectedSubTopic === sub ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'
                    }`}>
                      {getSubtopicIcon(sub)}
                    </div>
                    <span className="truncate pr-1">{sub}</span>
                    {selectedSubTopic === sub && (
                      <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" />
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
