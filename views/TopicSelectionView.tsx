
import React, { useState, useEffect } from 'react';
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
  Dices,
  Home
} from 'lucide-react';
import { Button } from '../components/Button.tsx';
import { Difficulty, TOPIC_IDS } from '../types.ts';
import { TRANSLATIONS } from '../utils/translations.ts';

interface TopicSelectionViewProps {
  t: any;
  state: {
    selectedCategory: string;
    selectedSubTopic: string;
    difficulty: Difficulty;
    displayedTopics: {id: string, label: string}[];
    displayedSubTopics: string[];
    isTopicLoading: boolean;
    errorMsg: string;
  };
  actions: {
    goBack: () => void;
    goHome: () => void;
    shuffleTopics: () => void;
    selectCategory: (id: string) => void;
    shuffleSubTopics: () => void;
    selectSubTopic: (sub: string) => void;
    setDifficulty: (diff: Difficulty) => void;
    startQuiz: () => void;
    setCustomTopic: (topic: string) => void;
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
    default: return <Lightbulb size={20} />;
  }
};

export const TopicSelectionView: React.FC<TopicSelectionViewProps> = ({ t, state, actions }) => {
  const { selectedCategory, selectedSubTopic, difficulty, displayedTopics, displayedSubTopics, errorMsg } = state;
  
  const [subsetCategories, setSubsetCategories] = useState<{id: string, label: string}[]>([]);
  const [subsetSubTopics, setSubsetSubTopics] = useState<string[]>([]);

  useEffect(() => {
    if (displayedTopics.length > 0 && subsetCategories.length === 0) {
      handleRefreshCategories();
    }
  }, [displayedTopics]);

  const handleRefreshCategories = () => {
    const shuffled = [...displayedTopics].sort(() => 0.5 - Math.random());
    setSubsetCategories(shuffled.slice(0, 4));
  };

  useEffect(() => {
    if (selectedCategory && displayedSubTopics.length > 0) {
      handleRefreshSubtopics();
    }
  }, [selectedCategory, displayedSubTopics.length]);

  const handleRefreshSubtopics = () => {
    const shuffled = [...displayedSubTopics].sort(() => 0.5 - Math.random());
    setSubsetSubTopics(shuffled.slice(0, 4));
  };

  const getImageUrl = (keyword: string) => {
    // 프리뷰 환경에서 절대 경로 보장을 위해 t에서 직접 이미지를 가져오거나 원문 대조
    if (t.subtopicImages && t.subtopicImages[keyword]) return t.subtopicImages[keyword];
    
    const currentLangSubtopics = t.subtopics[selectedCategory] || [];
    const idx = currentLangSubtopics.indexOf(keyword);
    if (idx !== -1) {
      const englishKeyword = TRANSLATIONS.en.topics.subtopics[selectedCategory]?.[idx];
      if (englishKeyword && t.subtopicImages && t.subtopicImages[englishKeyword]) {
        return t.subtopicImages[englishKeyword];
      }
    }
    return t.categoryImages ? t.categoryImages[selectedCategory] : '';
  };

  const navBtnStyle = "absolute top-4 text-white bg-slate-800/80 backdrop-blur-md p-2 rounded-full hover:bg-slate-700 transition-all z-20 border border-white/10 shadow-lg";

  return (
    <div className="w-full max-w-2xl relative pt-16 animate-fade-in">
      <button 
        onClick={actions.goBack}
        className={`${navBtnStyle} left-0 md:-left-12`}
      >
        <ChevronLeft size={20} />
      </button>

      <button 
        onClick={actions.goHome}
        className={`${navBtnStyle} right-0 md:-right-12`}
        aria-label="Home"
      >
        <Home size={20} />
      </button>

      <div className="glass-panel p-6 rounded-3xl space-y-6 w-full" style={{ minWidth: '320px' }}>
        <div className="text-center pt-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {!selectedCategory ? t.title_select : t.title_config}
          </h2>
        </div>
        
        {errorMsg && <div className="text-red-400 text-center text-xs bg-red-900/20 p-3 rounded-xl border border-red-500/20 animate-pulse">{errorMsg}</div>}

        {!selectedCategory ? (
          <div className="space-y-4">
            <button
              onClick={handleRefreshCategories}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-cyan-600/10 border border-cyan-500/30 text-cyan-400 font-bold text-xs hover:bg-cyan-600/20 transition-all"
            >
              <Dices size={16} /> {t.btn_refresh}
            </button>

            <div className="grid grid-cols-2 gap-3">
              {subsetCategories.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => actions.selectCategory(topic.id)}
                  className="group relative aspect-square md:aspect-video rounded-2xl overflow-hidden border border-slate-700/50 hover:border-cyan-500 transition-all shadow-lg bg-slate-900"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${t.categoryImages[topic.id] || ''}')`, backgroundSize: 'cover' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute inset-0 p-3 flex flex-col items-center justify-end gap-1">
                    <div className="text-cyan-400">{getCategoryIcon(topic.id)}</div>
                    <span className="font-bold text-sm md:text-base text-white uppercase text-center leading-tight drop-shadow-md">
                      {topic.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
              <button
                onClick={handleRefreshSubtopics}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-cyan-600/10 border border-cyan-500/30 text-cyan-400 font-bold text-xs hover:bg-cyan-600/20 transition-all"
              >
                <Dices size={16} /> {t.btn_refresh}
              </button>

              <div className="grid grid-cols-2 gap-3">
                {subsetSubTopics.map(sub => (
                  <button 
                    key={sub} 
                    onClick={() => actions.selectSubTopic(sub)} 
                    className={`group relative aspect-video rounded-2xl overflow-hidden border transition-all bg-slate-900 ${
                      selectedSubTopic === sub 
                        ? 'border-cyan-400 ring-2 ring-cyan-500/50' 
                        : 'border-slate-800 hover:border-slate-500'
                    }`}
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url('${getImageUrl(sub)}')`, backgroundSize: 'cover' }}
                    />
                    <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors" />
                    <div className="absolute inset-0 p-3 flex items-center justify-center">
                      <span className={`text-sm md:text-base font-black text-center uppercase tracking-wide leading-tight drop-shadow-lg ${
                        selectedSubTopic === sub ? 'text-cyan-300' : 'text-white'
                      }`}>
                        {sub}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block pl-1">{t.label_difficulty}</label>
              <div className="flex gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                {Object.values(Difficulty).map((diff) => (
                  <button 
                    key={diff} 
                    onClick={() => actions.setDifficulty(diff)} 
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      difficulty === diff 
                        ? 'bg-cyan-600 text-white shadow-lg' 
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
              disabled={!selectedSubTopic} 
              fullWidth 
              className="mt-2 py-4 shadow-xl"
            >
              {t.btn_start_sim} <Play size={18} className="fill-white" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
