
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  AppStage, 
  Language, 
  UserProfile, 
  Difficulty, 
  QuizQuestion, 
  UserAnswer, 
  EvaluationResult,
  QuizSet
} from '../types';
import { generateQuestionsBatch, evaluateBatchAnswers, BatchEvaluationInput } from '../services/geminiService';
import { audioHaptic } from '../services/audioHapticService';
import { TRANSLATIONS } from '../utils/translations';

const PROFILE_KEY = 'cognito_user_profile_v1';

const DEBUG_QUIZ: QuizQuestion[] = [
  { 
    id: 1, 
    question: "Which protocol is used for secure web browsing?", 
    options: ["HTTP", "HTTPS", "FTP", "SMTP"], 
    correctAnswer: "HTTPS", 
    context: "Hypertext Transfer Protocol Secure is the standard." 
  },
  { 
    id: 2, 
    question: "What is the time complexity of binary search?", 
    options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"], 
    correctAnswer: "O(log n)", 
    context: "Binary search divides the search interval in half." 
  },
  {
    id: 3,
    question: "Which React hook is used for side effects?",
    options: ["useState", "useEffect", "useMemo", "useReducer"],
    correctAnswer: "useEffect",
    context: "useEffect handles side effects in function components."
  }
];

// Fisher-Yates Shuffle Helper
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

interface AccumulatedBatchData {
  topicLabel: string;
  topicId: string;
  answers: UserAnswer[];
}

export const useGameViewModel = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.LANGUAGE);
  const [language, setLanguage] = useState<Language>('en');
  const [userProfile, setUserProfile] = useState<UserProfile>({ 
    gender: '', 
    ageGroup: '', 
    nationality: '',
    eloRatings: {},
    seenQuestionIds: []
  });
  
  // Selection State
  const [selectionPhase, setSelectionPhase] = useState<'CATEGORY' | 'SUBTOPIC'>('CATEGORY');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubTopics, setSelectedSubTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [displayedTopics, setDisplayedTopics] = useState<{id: string, label: string}[]>([]);
  
  // Quiz Execution State
  const [quizQueue, setQuizQueue] = useState<QuizSet[]>([]);
  const [currentQuizSet, setCurrentQuizSet] = useState<QuizSet | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Lock for answer submission
  
  // Batch Progress Tracking
  const [batchProgress, setBatchProgress] = useState<{ total: number, current: number, topics: string[] }>({ total: 0, current: 0, topics: [] });
  // Store answers for multiple topics to analyze at the end
  const [completedBatches, setCompletedBatches] = useState<AccumulatedBatchData[]>([]);

  // Result State
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [sessionResults, setSessionResults] = useState<EvaluationResult[]>([]); 
  const [errorMsg, setErrorMsg] = useState('');
  const [isPending, setIsPending] = useState(false);

  const t = useMemo(() => TRANSLATIONS[language], [language]);

  // Load Profile on Mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure new fields exist for legacy profiles
        setUserProfile({
          ...parsed,
          eloRatings: parsed.eloRatings || {},
          seenQuestionIds: parsed.seenQuestionIds || []
        });
      }
    } catch (e) {
      console.warn("Failed to load profile");
    }
  }, []);

  // Initialize and Shuffle Topics when Language Changes
  useEffect(() => {
    const topics = Object.entries(t.topics.categories)
      .map(([id, label]) => ({ id, label }));
    setDisplayedTopics(shuffleArray(topics));
  }, [t]);

  // Determine topic ID from label (helper)
  const getTopicIdFromLabel = (label: string): string => {
    const topicObj = displayedTopics.find(t => t.label === label);
    if (topicObj) return topicObj.id;
    
    // Fallback: Try to find by value in current translations
    const rawKey = Object.keys(t.topics.categories).find(k => t.topics.categories[k] === label);
    return rawKey || "GENERAL"; 
  };

  const finishBatchQuiz = async (allBatches: AccumulatedBatchData[], profile: UserProfile, lang: Language) => {
    if (isPending) return;
    setIsPending(true);
    setStage(AppStage.ANALYZING);
    audioHaptic.playClick('hard');

    try {
      // 1. Prepare data for API
      const batchInputs: BatchEvaluationInput[] = [];
      
      // Update User Stats (Elo & History)
      const updatedProfile = { ...profile };
      const currentScores = { ...(profile.scores || {}) };
      const currentElos = { ...(profile.eloRatings || {}) };
      const seenIds = new Set(profile.seenQuestionIds || []);

      allBatches.forEach(batch => {
        const correctCount = batch.answers.filter(a => a.isCorrect).length;
        const totalCount = batch.answers.length;
        const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
        
        // Update High Score
        if (score >= (currentScores[batch.topicLabel] || 0)) {
           currentScores[batch.topicLabel] = score;
        }

        // --- ADAPTIVE LEARNING LOGIC ---
        // 1. Track Seen Questions
        batch.answers.forEach(a => seenIds.add(a.questionId));

        // 2. Update Elo Rating (Simple Implementation)
        // Base Elo starts at 1000. 
        // If score > 70, rating increases. If < 50, rating decreases.
        const currentElo = currentElos[batch.topicId] || 1000;
        let eloChange = 0;
        
        if (score >= 80) eloChange = 30; // Strong performance
        else if (score >= 60) eloChange = 10; // Moderate improvement
        else if (score >= 40) eloChange = -10; // Slight struggle
        else eloChange = -20; // Needs easier questions

        const newElo = Math.max(0, currentElo + eloChange);
        currentElos[batch.topicId] = newElo;

        if (newElo > currentElo) {
          // Play level up sound if improved significantly (later in UI)
        }
        // -------------------------------

        batchInputs.push({
          topic: batch.topicLabel,
          score: score,
          performance: batch.answers 
        });
      });

      // Save Profile Updates
      updatedProfile.scores = currentScores;
      updatedProfile.eloRatings = currentElos;
      updatedProfile.seenQuestionIds = Array.from(seenIds);
      
      setUserProfile(updatedProfile);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));

      // 2. DEBUG MODE Check
      const isDebug = allBatches.some(b => b.topicLabel.startsWith("Debug"));
      if (isDebug) {
         await new Promise(resolve => setTimeout(resolve, 800));
         const mockResults: EvaluationResult[] = allBatches.map(b => ({
            id: b.topicId,
            totalScore: 80,
            humanPercentile: 90,
            aiComparison: "Debug Mode Analysis.",
            demographicPercentile: 50,
            demographicComment: "Simulated Data.",
            title: b.topicLabel,
            details: b.answers.map(a => ({
               questionId: a.questionId,
               isCorrect: a.isCorrect,
               questionText: a.questionText,
               selectedOption: a.selectedOption,
               correctAnswer: a.correctAnswer,
               aiComment: "Debug Comment",
               correctFact: "Debug Fact"
            }))
         }));
         setEvaluation(mockResults[0]);
         setSessionResults(mockResults);
         audioHaptic.playLevelUp();
         setStage(AppStage.RESULTS);
         return;
      }

      // 3. Real API Call (Batch)
      const results = await evaluateBatchAnswers(batchInputs, updatedProfile, lang);
      
      // Inject IDs back into results for iconography
      const resultsWithIds = results.map((res, idx) => ({
        ...res,
        id: allBatches[idx].topicId
      }));

      setEvaluation(resultsWithIds[0]); 
      setSessionResults(resultsWithIds);
      audioHaptic.playLevelUp();
      setStage(AppStage.RESULTS);

    } catch (e: any) {
      console.error("Batch Finish Error", e);
      setErrorMsg(e.message || "Unknown analysis error");
      audioHaptic.playError();
      setStage(AppStage.ERROR);
    } finally {
      setIsPending(false);
    }
  };

  // --- History Navigation Logic ---
  const isNavigatingBackRef = useRef(false);

  useEffect(() => {
    window.history.replaceState({ stage: 'root' }, '');
  }, []);

  useEffect(() => {
    if (isNavigatingBackRef.current) {
      isNavigatingBackRef.current = false;
      return;
    }
    if (stage !== AppStage.LANGUAGE) {
      window.history.pushState({ stage }, '');
    }
  }, [stage]);

  const performBackNavigation = useCallback((): boolean => {
    if (isPending || isSubmitting) return false; // Block back nav during submission
    audioHaptic.playClick('soft');

    switch (stage) {
      case AppStage.TOPIC_SELECTION:
        if (selectionPhase === 'SUBTOPIC') {
            setSelectionPhase('CATEGORY');
            setSelectedSubTopics([]);
            return true;
        }
        setStage(AppStage.INTRO); 
        return true;
      case AppStage.PROFILE:
        setStage(AppStage.INTRO);
        return true;
      case AppStage.INTRO:
        setStage(AppStage.LANGUAGE);
        return true;
      case AppStage.QUIZ:
        if (currentQuestionIndex > 0) {
           setCurrentQuestionIndex(prev => prev - 1);
           setUserAnswers(prev => prev.slice(0, -1)); 
           setSelectedOption(null);
           return true; 
        }
        if (window.confirm(t.common.confirm_exit)) {
          setStage(AppStage.TOPIC_SELECTION);
          setSelectionPhase('CATEGORY');
          setQuizQueue([]);
          setBatchProgress({ total: 0, current: 0, topics: [] });
          setSessionResults([]); 
          setCompletedBatches([]);
          return true;
        }
        return false;
      case AppStage.RESULTS:
      case AppStage.ERROR:
        setStage(AppStage.TOPIC_SELECTION);
        setSelectionPhase('CATEGORY');
        setSessionResults([]); 
        setCompletedBatches([]);
        return true;
      default:
        return true;
    }
  }, [stage, selectionPhase, isPending, isSubmitting, t, currentQuestionIndex]);

  useEffect(() => {
    const handlePopState = (_: PopStateEvent) => {
      if (stage === AppStage.LANGUAGE) return; 

      isNavigatingBackRef.current = true;
      const success = performBackNavigation();
      
      if (!success) {
        window.history.pushState({ stage }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [performBackNavigation, stage]);

  // --- Actions ---
  const actions = useMemo(() => ({
    setLanguage: (lang: Language) => { 
      audioHaptic.playClick('soft');
      // Reset selections to prevent language mismatch with static DB
      setSelectedCategories([]);
      setSelectedSubTopics([]);
      setSelectionPhase('CATEGORY');

      setLanguage(lang); 
      
      if (stage === AppStage.LANGUAGE) {
         setStage(AppStage.INTRO); 
      }
    },
    startIntro: () => {
      audioHaptic.playClick('hard');
      if (userProfile.gender && userProfile.nationality) {
        setStage(AppStage.TOPIC_SELECTION);
      } else {
        setStage(AppStage.PROFILE);
      }
    },
    editProfile: () => {
      audioHaptic.playClick();
      setStage(AppStage.PROFILE);
    },
    resetProfile: () => {
      audioHaptic.playClick();
      localStorage.removeItem(PROFILE_KEY);
      setUserProfile({ gender: '', ageGroup: '', nationality: '' });
      setStage(AppStage.PROFILE);
    },
    updateProfile: (profile: Partial<UserProfile>) => {
      audioHaptic.playClick('soft');
      setUserProfile(prev => ({ ...prev, ...profile }));
    },
    submitProfile: () => {
      audioHaptic.playClick('hard');
      localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
      setStage(AppStage.TOPIC_SELECTION);
    },
    selectCategory: (id: string) => {
      audioHaptic.playClick('soft');
      setSelectedCategories(prev => {
        if (prev.includes(id)) {
          return prev.filter(cat => cat !== id);
        } else {
          if (prev.length >= 4) return prev; 
          return [...prev, id];
        }
      });
    },
    proceedToSubTopics: () => {
      audioHaptic.playClick();
      if (selectedCategories.length > 0) {
        setSelectionPhase('SUBTOPIC');
      }
    },
    selectSubTopic: (sub: string) => {
      audioHaptic.playClick('soft');
      setSelectedSubTopics(prev => {
        if (prev.includes(sub)) {
          return prev.filter(p => p !== sub);
        } else {
          if (prev.length >= 4) return prev; 
          return [...prev, sub];
        }
      });
    },
    setDifficulty: (diff: Difficulty) => {
       audioHaptic.playClick('soft');
       setDifficulty(diff);
    },
    
    goBack: () => {
      if (isPending || isSubmitting) return; // Block back nav during submission
      audioHaptic.playClick();
      
      if (stage === AppStage.QUIZ) {
        if (currentQuestionIndex > 0) {
          setCurrentQuestionIndex(prev => prev - 1);
          setUserAnswers(prev => prev.slice(0, -1)); 
          setSelectedOption(null);
          return;
        }
      }

      if (stage === AppStage.TOPIC_SELECTION && selectionPhase === 'SUBTOPIC') {
        setSelectionPhase('CATEGORY');
        setSelectedSubTopics([]);
        return;
      }
      if (stage === AppStage.LANGUAGE) return;
      window.history.back();
    },
    
    goHome: () => {
      if (isPending || isSubmitting) return; // Block home nav during submission
      audioHaptic.playClick();
      if (stage === AppStage.QUIZ) {
        if (!window.confirm(t.common.confirm_exit)) return;
      }
      
      if (userProfile.nationality) {
        setStage(AppStage.TOPIC_SELECTION);
        setSelectionPhase('CATEGORY');
      } else {
        setStage(AppStage.LANGUAGE);
      }
      
      setEvaluation(null);
      setUserAnswers([]);
      setCurrentQuestionIndex(0);
      setSelectedCategories([]);
      setSelectedSubTopics([]);
      setQuizQueue([]);
      setCurrentQuizSet(null);
      setBatchProgress({ total: 0, current: 0, topics: [] });
      setSessionResults([]); 
      setCompletedBatches([]);
    },

    resetApp: () => {
      audioHaptic.playClick();
      setUserAnswers([]); 
      setCurrentQuestionIndex(0); 
      setEvaluation(null);
      setQuizQueue([]);
      setCurrentQuizSet(null);
      setBatchProgress({ total: 0, current: 0, topics: [] });
      setSessionResults([]); 
      setCompletedBatches([]);

      setSelectionPhase('CATEGORY');
      setSelectedCategories([]);
      setSelectedSubTopics([]);

      setStage(AppStage.TOPIC_SELECTION);
    },

    startQuiz: async () => {
      if (isPending) return;
      if (selectedSubTopics.length === 0) return;
      
      audioHaptic.playClick('hard');
      setIsPending(true);
      setStage(AppStage.LOADING_QUIZ);
      try {
        const quizSets = await generateQuestionsBatch(selectedSubTopics, difficulty, language, userProfile);
        
        if (quizSets.length > 0) {
          const [first, ...rest] = quizSets;
          setQuizQueue(rest);
          setCurrentQuizSet(first);
          setQuestions(first.questions);
          setCurrentQuestionIndex(0);
          setUserAnswers([]);
          setSessionResults([]); 
          setCompletedBatches([]); // Reset accumulator
          
          setBatchProgress({
            total: selectedSubTopics.length,
            current: 1,
            topics: selectedSubTopics
          });
          
          setStage(AppStage.QUIZ);
        } else {
           throw new Error("No questions generated");
        }
      } catch (e: any) {
        setErrorMsg(e.message || "Failed to initialize protocol");
        setStage(AppStage.ERROR);
      } finally {
        setIsPending(false);
      }
    },
    
    nextTopicInQueue: () => {
      audioHaptic.playClick();
      if (quizQueue.length > 0) {
         const [next, ...rest] = quizQueue;
         
         const nextProgress = {
            ...batchProgress,
            current: batchProgress.current + 1
         };

         setQuizQueue(rest);
         setCurrentQuizSet(next);
         setQuestions(next.questions);
         setCurrentQuestionIndex(0);
         setUserAnswers([]);
         setBatchProgress(nextProgress);
         
         setStage(AppStage.QUIZ);
      }
    },

    startDebugQuiz: async () => {
       if (isPending) return;
       audioHaptic.playClick();
       setIsPending(true);
       setStage(AppStage.LOADING_QUIZ);
       
       try {
         await new Promise(resolve => setTimeout(resolve, 800));
         
         const debugTopics = ["Debug Alpha", "Debug Beta", "Debug Gamma", "Debug Delta"];
         const debugSets: QuizSet[] = debugTopics.map((topic, index) => ({
           topic: topic,
           questions: DEBUG_QUIZ.map(q => ({
              ...q,
              id: q.id + (index * 100), 
              question: `[${topic}] ${q.question}`
           }))
         }));
         
         const [first, ...rest] = debugSets;
         
         setQuizQueue(rest);
         setCurrentQuizSet(first);
         setQuestions(first.questions);
         setCurrentQuestionIndex(0);
         setUserAnswers([]);
         setSessionResults([]);
         setCompletedBatches([]);
         
         setBatchProgress({ total: debugTopics.length, current: 1, topics: debugTopics });
         
         setStage(AppStage.QUIZ);
       } catch (e: any) {
         setErrorMsg("Debug Init Failed: " + e.message);
         setStage(AppStage.ERROR);
       } finally {
         setIsPending(false);
       }
    },

    previewResults: () => {
      audioHaptic.playClick();
      const mockResult: EvaluationResult = {
        id: "SCIENCE",
        totalScore: 88,
        humanPercentile: 92,
        aiComparison: "Cognitive patterns exhibit surprising resistance.",
        demographicPercentile: 95,
        demographicComment: "Outlier detected.",
        title: "Quantum Physics",
        details: []
      };
      setEvaluation(mockResult);
      setSessionResults([
          mockResult, 
          {...mockResult, id:"HISTORY", title:"History", totalScore: 70}, 
          {...mockResult, id:"ARTS", title:"Arts", totalScore: 95},
          {...mockResult, id:"TECH", title:"Technology", totalScore: 65}
      ]);
      setStage(AppStage.RESULTS);
    },
    
    selectOption: (option: string) => {
        if (isSubmitting) return; // Block changing answer during submission
        audioHaptic.playClick('soft');
        setSelectedOption(option);
    },
    confirmAnswer: () => {
      if (!selectedOption || isSubmitting) return; // Prevent double submission
      
      // 1. Lock the UI immediately
      setIsSubmitting(true);
      
      const question = questions[currentQuestionIndex];
      const isCorrect = selectedOption === question.correctAnswer;
      
      // 2. Play Feedback sound (Result determined here)
      if (isCorrect) audioHaptic.playSuccess();
      else audioHaptic.playError();

      const answer = { 
        questionId: question.id, 
        questionText: question.question, 
        selectedOption, 
        correctAnswer: question.correctAnswer, 
        isCorrect 
      };
      const updatedAnswers = [...userAnswers, answer];
      setUserAnswers(updatedAnswers);
      // Don't clear selectedOption yet, so user sees what they picked during transition
      
      // 3. Move to next question after delay
      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
           setCurrentQuestionIndex(prev => prev + 1);
           setSelectedOption(null); // Clear now
           setIsSubmitting(false); // Unlock
        }, 800); // Increased delay slightly to ensure feedback is felt before change
      } else {
        const currentTopicLabel = currentQuizSet?.topic || (batchProgress.topics[batchProgress.current - 1] || "Unknown");
        const currentTopicId = getTopicIdFromLabel(currentTopicLabel);
        
        const batchData: AccumulatedBatchData = {
           topicLabel: currentTopicLabel,
           topicId: currentTopicId,
           answers: updatedAnswers
        };
        
        const newCompletedBatches = [...completedBatches, batchData];
        setCompletedBatches(newCompletedBatches);

        if (quizQueue.length > 0) {
           setTimeout(() => {
               const nextProgress = {
                  ...batchProgress,
                  current: batchProgress.current + 1
               };
               const [next, ...rest] = quizQueue;
               setQuizQueue(rest);
               setCurrentQuizSet(next);
               setQuestions(next.questions);
               setCurrentQuestionIndex(0);
               setUserAnswers([]);
               setBatchProgress(nextProgress);
               setSelectedOption(null);
               setIsSubmitting(false);
           }, 800);
        } else {
           finishBatchQuiz(newCompletedBatches, userProfile, language).then(() => {
               setIsSubmitting(false);
           });
        }
      }
    },
    shuffleTopics: () => {
      audioHaptic.playClick();
      setDisplayedTopics(prev => shuffleArray(prev));
    },
    shuffleSubTopics: () => {},
    setCustomTopic: (_topic: string) => {}
  }), [isPending, stage, selectionPhase, selectedCategories, selectedSubTopics, difficulty, language, userProfile, questions, currentQuestionIndex, userAnswers, selectedOption, t, quizQueue, currentQuizSet, batchProgress, performBackNavigation, displayedTopics, completedBatches, isSubmitting]);

  return {
    state: {
      stage, language, userProfile,
      topicState: { selectionPhase, selectedCategories, selectedSubTopics, difficulty, displayedTopics, isTopicLoading: isPending },
      quizState: { 
        questions, 
        currentQuestionIndex, 
        userAnswers, 
        selectedOption, 
        remainingTopics: quizQueue.length,
        nextTopicName: quizQueue.length > 0 ? quizQueue[0].topic : undefined,
        batchProgress,
        isSubmitting // Expose locking state
      },
      resultState: { evaluation, sessionResults, errorMsg } 
    },
    actions, t
  };
};
