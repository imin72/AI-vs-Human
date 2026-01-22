
import React from 'react';
import { 
  Play, History, FlaskConical, Palette, Zap, Map, Film, Music, Gamepad2, 
  Trophy, Cpu, Scroll, Book, Leaf, Utensils, Orbit, Lightbulb, Home, Bug, CheckCircle2, 
  UserPen, Medal, ArrowRight, Eye, RefreshCw
} from 'lucide-react';
import { Button } from '../components/Button.tsx';
import { LanguageSwitcher } from '../components/LanguageSwitcher.tsx';
import { Difficulty, TOPIC_IDS, UserProfile, Language } from '../types.ts';

interface TopicSelectionViewProps {
  t: any;
  state: {
    selectionPhase?: 'CATEGORY' | 'SUBTOPIC';
    selectedCategories: string[];
    selectedSubTopics: string[];
    difficulty: Difficulty;
    displayedTopics: {id: string, label: string}[];
    isTopicLoading: boolean;
    errorMsg: string;
    userProfile?: UserProfile; 
  };
  language: Language;
  actions: {
    goBack: () => void;
    goHome: () => void;
    shuffleTopics: () => void;
    selectCategory: (id: string) => void;
    proceedToSubTopics?: () => void;
    shuffleSubTopics: () => void;
    selectSubTopic: (sub: string) => void;
    setDifficulty: (diff: Difficulty) => void;
    startQuiz: () => void;
    setCustomTopic: (topic: string) => void;
    startDebugQuiz?: () => void;
    previewResults?: () => void;
    editProfile: () => void;
    setLanguage: (lang: Language) => void;
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

export const TopicSelectionView: React.FC<TopicSelectionViewProps> = ({ t, state, actions, language }) => {
  const { selectionPhase = 'CATEGORY', selectedCategories, selectedSubTopics, difficulty, displayedTopics, errorMsg, userProfile } = state;
  const isCategoryPhase = selectionPhase === 'CATEGORY';

  // Standardized button style for top right controls: Fixed width/height (w-10 h-10) for perfect alignment
  const btnStyle = "w-10 h-10 flex items-center justify-center text-white bg-slate-800/80 backdrop-blur-md rounded-full hover:bg-slate-700 transition-all border border-white/10 shadow-lg p-0";

  // When in Subtopic phase, we need to show subtopics for ALL selected categories
  const groupedSubTopics = !isCategoryPhase ? selectedCategories.map(catId => ({
    catId,
    label: t.categories[catId],
    subtopics: t.subtopics[catId] || []
  })) : [];

  return (
    <div className="w-full h-full relative flex flex-col animate-fade-in">
      
      {/* Main Glass Panel */}
      <div className="glass-panel flex flex-col flex-grow h-0 rounded-3xl overflow-hidden shadow-2xl">
        {/* Compact Header - Unified Title & Controls */}
        <div className="p-4 pb-2 shrink-0 border-b border-white/5 bg-slate-900/40 flex justify-between items-start gap-3">
          <div className="flex flex-col min-w-0 flex-1 pt-1">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 truncate leading-tight">
              {isCategoryPhase ? t.title_select : t.title_config}
            </h2>
            <p className="text-xs text-slate-400 mt-2 whitespace-normal break-words leading-relaxed">
              {t.desc_select}
            </p>
          </div>
          
          <div className="flex gap-2 shrink-0 items-start">
             {/* Left Column: Language & Refresh */}
             <div className="flex flex-col gap-2">
                 <LanguageSwitcher 
                   currentLanguage={language} 
                   onLanguageChange={actions.setLanguage} 
                   className={btnStyle} // Pass same fixed dimensions
                 />
                 {isCategoryPhase && (
                   <button onClick={actions.shuffleTopics} className={`${btnStyle} text-slate-300 hover:text-cyan-400`} aria-label="Shuffle">
                     <RefreshCw size={18} />
                   </button>
                 )}
             </div>

             {/* Right Column: Home & Profile */}
             <div className="flex flex-col gap-2">
                 <button onClick={actions.goHome} className={btnStyle} aria-label="Home">
                   <Home size={18} />
                 </button>
                 {isCategoryPhase && (
                   <button onClick={actions.editProfile} className={`${btnStyle} text-cyan-400 hover:text-white border-cyan-500/20`}>
                     <UserPen size={18} />
                   </button>
                 )}
             </div>
          </div>
        </div>
        
        {errorMsg && <div className="mx-4 mt-2 text-red-400 text-xs bg-red-900/20 p-2 rounded-xl border border-red-500/20 animate-pulse text-center">{errorMsg}</div>}

        {isCategoryPhase ? (
          /* STEP 1: CATEGORY SELECTION */
          <>
            <div className="flex-grow overflow-y-auto custom-scrollbar p-4">
               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {displayedTopics.map((topic) => {
                  const isSelected = selectedCategories.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      onClick={() => actions.selectCategory(topic.id)}
                      className={`group relative aspect-square rounded-2xl overflow-hidden border transition-all shadow-lg ${
                        isSelected 
                          ? 'border-cyan-400 ring-2 ring-cyan-500/50 scale-[0.98]' 
                          : 'border-slate-700/50 hover:border-cyan-500/50 hover:scale-[1.02]'
                      }`}
                    >
                      <div 
                        className={`absolute inset-0 bg-cover bg-center transition-all duration-500 ${isSelected ? 'scale-110' : 'grayscale group-hover:grayscale-0'}`}
                        style={{ backgroundImage: `url('${t.categoryImages[topic.id] || ''}')` }}
                      />
                      <div className={`absolute inset-0 transition-colors duration-300 ${isSelected ? 'bg-cyan-900/60' : 'bg-slate-950/70 group-hover:bg-slate-950/40'}`} />
                      
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-cyan-500 text-white rounded-full p-1 shadow-lg animate-fade-in">
                          <CheckCircle2 size={16} />
                        </div>
                      )}

                      <div className="absolute inset-0 p-3 flex flex-col items-center justify-center gap-2">
                        <div className={`transition-colors ${isSelected ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400'}`}>
                          {getCategoryIcon(topic.id)}
                        </div>
                        <span className={`font-bold text-xs md:text-sm uppercase text-center leading-tight drop-shadow-md transition-colors ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                          {topic.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
               </div>
            </div>
            
            <div className="p-4 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 shrink-0">
              <Button 
                onClick={actions.proceedToSubTopics} 
                disabled={selectedCategories.length === 0}
                fullWidth 
                className={`py-4 shadow-xl transition-all ${selectedCategories.length > 0 ? 'animate-pulse' : ''}`}
              >
                {t.btn_next_step} ({selectedCategories.length}) <ArrowRight size={18} />
              </Button>
            </div>
          </>
        ) : (
          /* STEP 2: SUBTOPIC SELECTION */
          <>
            <div className="flex-grow overflow-y-auto custom-scrollbar relative">
                {groupedSubTopics.map((group) => (
                  <div key={group.catId}>
                    {/* Sticky Header: Full width, opaque, square corners to sit flush */}
                    <div className="sticky top-0 z-10 bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center gap-2 shadow-md">
                       <span className="text-cyan-400">{getCategoryIcon(group.catId)}</span>
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{group.label}</h3>
                    </div>
                    {/* Content Grid: Padded */}
                    <div className="grid grid-cols-2 gap-2 p-4 pt-2">
                      {group.subtopics.map((sub: string) => {
                        const isSelected = selectedSubTopics.includes(sub);
                        const score = userProfile?.scores?.[sub];
                        return (
                          <button 
                            key={sub} 
                            onClick={() => actions.selectSubTopic(sub)} 
                            className={`relative p-3 rounded-xl border transition-all flex flex-col gap-1 text-left ${
                              isSelected 
                                ? 'bg-cyan-900/40 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                                : 'bg-slate-900/40 border-slate-800 hover:border-slate-600 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex justify-between items-start w-full">
                               <span className={`text-xs font-bold leading-tight transition-colors ${
                                  isSelected ? 'text-cyan-100' : 'text-slate-300'
                                }`}>
                                  {sub}
                                </span>
                                {isSelected && <CheckCircle2 size={12} className="text-cyan-400 shrink-0" />}
                            </div>
                            
                            {/* Score Badge */}
                            {!isSelected && score !== undefined && (
                                <div className="text-[9px] font-mono font-bold text-amber-500 flex items-center gap-0.5 mt-1 self-start bg-amber-950/30 px-1 py-0.5 rounded border border-amber-900/50">
                                   <Medal size={8} /> {score}
                                </div>
                             )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>

            <div className="p-4 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 shrink-0 space-y-3">
              <div className="flex items-center justify-between px-1">
                 <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{t.label_difficulty}</label>
                 <span className="text-[10px] text-cyan-500 font-mono">{selectedSubTopics.length} {t.label_topics_selected}</span>
              </div>
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
            
              <Button 
                onClick={actions.startQuiz} 
                disabled={selectedSubTopics.length === 0} 
                fullWidth 
                className="mt-2 py-4 shadow-xl"
              >
                {t.btn_start_sim} <Play size={18} className="fill-white" />
              </Button>

              <div className="flex gap-2 mt-1">
                 {actions.startDebugQuiz && (
                  <button onClick={actions.startDebugQuiz} className="flex-1 text-[10px] text-slate-700 bg-slate-900/50 py-2 rounded-lg font-mono hover:text-rose-500 transition-colors uppercase tracking-widest flex items-center justify-center gap-2">
                    <Bug size={10} /> Bypass
                  </button>
                )}
                {actions.previewResults && (
                  <button onClick={actions.previewResults} className="flex-1 text-[10px] text-slate-700 bg-slate-900/50 py-2 rounded-lg font-mono hover:text-cyan-500 transition-colors uppercase tracking-widest flex items-center justify-center gap-2">
                    <Eye size={10} /> Preview
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
