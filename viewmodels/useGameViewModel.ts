import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  AppStage, 
  Language, 
  UserProfile, 
  Difficulty, 
  QuizQuestion, 
  UserAnswer, 
  EvaluationResult,
  QuizSet,
  HistoryItem
} from '../types';
import { generateQuestionsBatch, evaluateBatchAnswers, BatchEvaluationInput, seedLocalDatabase } from '../services/geminiService';
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

// Helper to detect browser language
const getBrowserLanguage = (): Language => {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language.split('-')[0];
  const supported: Language[] = ['en', 'ko', 'ja', 'zh', 'es', 'fr'];
  return supported.includes(lang as Language) ? (lang as Language) : 'en';
};

interface AccumulatedBatchData {
  topicLabel: string;
  topicId: string;
  answers: UserAnswer[];
}

export const useGameViewModel = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.INTRO);
  const [language, setLanguage] = useState<Language>(getBrowserLanguage());
  const [userProfile, setUserProfile] = useState<UserProfile>({ 
    gender: '', 
    ageGroup: '', 
    nationality: '',
    eloRatings: {},
    seenQuestionIds: [],
    history: []
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
          seenQuestionIds: parsed.seenQuestionIds || [],
          history: parsed.history || []
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
      const currentHistory = [...(profile.history || [])];

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

        // 3. Track History
        // Use a static AI Score "ceiling" for now (e.g. 95-100) to represent the AI benchmark
        const aiBenchmark = difficulty === Difficulty.HARD ? 98 : difficulty === Difficulty.MEDIUM ? 95 : 92;
        
        const historyItem: HistoryItem = {
          timestamp: Date.now(),
          topicId: batch.topicId,
          score: score,
          aiScore: aiBenchmark,
          difficulty: difficulty
        };
        currentHistory.push(historyItem);

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
      updatedProfile.history = currentHistory;
      
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

  // --- History Navigation Logic (수정됨) ---
  const isNavigatingBackRef = useRef(false);

  useEffect(() => {
    // Initialize history with a clean state on mount
    window.history.replaceState({ stage: 'root' }, '');
  }, []);

  useEffect(() => {
    if (isNavigatingBackRef.current) {
      isNavigatingBackRef.current = false;
      return;
    }
    // Only push state if we are NOT at the root (INTRO)
    if (stage !== AppStage.INTRO) {
      window.history.pushState({ stage }, '');
    }
  }, [stage]);

  const performBackNavigation = useCallback((): boolean => {
    if (isPending || isSubmitting) return false; // Block back nav during submission
    try { audioHaptic.playClick('soft'); } catch {}

    const confirmHomeMsg = t.common.confirm_home || "Return to Home? Progress will be reset.";

    switch (stage) {
      // 2) IntroView를 제외한 영역선택(PROFILE, TOPIC_SELECTION)은 바로 전단계로 이동
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

      // 1) IntroView의 뒤로가기 액션은 무조건 종료팝업
      case AppStage.INTRO:
        // 앱 종료 확인
        if (window.confirm(t.common.confirm_exit_app || "Do you want to exit the app?")) {
           const len = window.history.length;
           // PWA/브라우저 환경에서 뒤로가기를 최대한 수행하여 이탈 시도
           if (len > 1) {
              window.history.go(-(len - 1));
           } else {
             window.close(); // 가능한 경우 창 닫기 시도
           }
           return true;
        }
        return false; // 취소 시 스테이

      // 3) 문제풀이View: 뒤로가기 시 팝업 -> 예(홈+초기화), 아니오(재개)
      case AppStage.QUIZ:
        if (window.confirm(confirmHomeMsg)) {
          // 홈으로 이동 및 완전 초기화
          setStage(AppStage.INTRO);
          // 퀴즈 관련 상태 초기화
          setQuizQueue([]);
          setCurrentQuizSet(null);
          setBatchProgress({ total: 0, current: 0, topics: [] });
          setSessionResults([]); 
          setCompletedBatches([]);
          setUserAnswers([]);
          setCurrentQuestionIndex(0);
          setSelectionPhase('CATEGORY');
          setSelectedCategories([]); 
          setSelectedSubTopics([]);
          // 히스토리 스택 정리
          window.history.replaceState({ stage: 'root' }, '', window.location.pathname);
          return true;
        }
        return false; // 아니오 누르면 문제풀이 유지

      // 4) 결과View: 뒤로가기 시 팝업 -> 예(홈+초기화), 아니오(복귀/유지)
      case AppStage.RESULTS:
      case AppStage.ERROR:
        if (window.confirm(confirmHomeMsg)) {
          // 홈으로 이동 및 완전 초기화
          setStage(AppStage.INTRO);
          setEvaluation(null);
          setSessionResults([]); 
          setCompletedBatches([]);
          setQuizQueue([]);
          setUserAnswers([]);
          setCurrentQuestionIndex(0);
          setSelectionPhase('CATEGORY');
          setSelectedCategories([]);
          setSelectedSubTopics([]);
          // 히스토리 스택 정리
          window.history.replaceState({ stage: 'root' }, '', window.location.pathname);
          return true;
        }
        return false; // 아니오 누르면 결과화면 유지

      default:
        setStage(AppStage.INTRO);
        return true;
    }
  }, [stage, selectionPhase, isPending, isSubmitting, t]);

  useEffect(() => {
    const handlePopState = (_: PopStateEvent) => {
      isNavigatingBackRef.current = true;
      const success = performBackNavigation();
      
      if (!success) {
        // If we stayed (returned false), restore the state
        // This effectively cancels the back navigation in the UI
        window.history.pushState({ stage }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [performBackNavigation, stage]);

  // --- Actions ---
  const actions = useMemo(() => ({
    setLanguage: (lang: Language) => { 
      try { audioHaptic.playClick('soft'); } catch {}
      // Reset selections to prevent language mismatch with static DB
      setSelectedCategories([]);
      setSelectedSubTopics([]);
      setSelectionPhase('CATEGORY');
      setLanguage(lang); 
    },
    startIntro: () => {
      try { audioHaptic.playClick('hard'); } catch {}
      if (userProfile.gender && userProfile.nationality) {
        setStage(AppStage.TOPIC_SELECTION);
      } else {
        setStage(AppStage.PROFILE);
      }
    },
    editProfile: () => {
      try { audioHaptic.playClick(); } catch {}
      setStage(AppStage.PROFILE);
    },
    resetProfile: () => {
      try { audioHaptic.playClick(); } catch {}
      localStorage.removeItem(PROFILE_KEY);
      setUserProfile({ gender: '', ageGroup: '', nationality: '' });
      setStage(AppStage.PROFILE);
    },
    updateProfile: (profile: Partial<UserProfile>) => {
      try { audioHaptic.playClick('soft'); } catch {}
      setUserProfile(prev => ({ ...prev, ...profile }));
    },
    submitProfile: () => {
      try { audioHaptic.playClick('hard'); } catch {}
      localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
      setStage(AppStage.TOPIC_SELECTION);
    },
    selectCategory: (id: string) => {
      try { audioHaptic.playClick('soft'); } catch {}
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
      try { audioHaptic.playClick(); } catch {}
      if (selectedCategories.length > 0) {
        setSelectionPhase('SUBTOPIC');
      }
    },
    selectSubTopic: (sub: string) => {
      try { audioHaptic.playClick('soft'); } catch {}
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
       try { audioHaptic.playClick('soft'); } catch {}
       setDifficulty(diff);
    },
    
    goBack: () => {
      if (isPending || isSubmitting) return; // Block back nav during submission
      try { audioHaptic.playClick(); } catch {}

      // Manual check for subtopic phase to avoid history push/pop complexity
      if (stage === AppStage.TOPIC_SELECTION && selectionPhase === 'SUBTOPIC') {
        setSelectionPhase('CATEGORY');
        setSelectedSubTopics([]);
        return;
      }
      if (stage === AppStage.INTRO) {
          // Trigger the exit confirmation logic defined in popstate handler
          // by simulating a back action or calling performBackNavigation logic directly?
          // Calling performBackNavigation directly won't update browser history correctly if we don't pop.
          // But here we want the exact same behavior as the browser back button.
          window.history.back();
          return;
      }
      
      // Allow standard browser back behavior to trigger handlePopState
      window.history.back();
    },
    
    goHome: () => {
      try { audioHaptic.playClick(); } catch {}
      
      const needsConfirmation = stage === AppStage.QUIZ || stage === AppStage.LOADING_QUIZ || stage === AppStage.ANALYZING;

      if (needsConfirmation) {
        if (!window.confirm(t.common.confirm_home || "Return to Home?")) return;
      }
      
      setIsPending(false);
      setIsSubmitting(false);

      setStage(AppStage.INTRO); 
      
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
      setSelectionPhase('CATEGORY');

      window.history.replaceState({ stage: 'root' }, '', window.location.pathname);
    },

    resetApp: () => {
      try { audioHaptic.playClick(); } catch {}
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
      
      try { audioHaptic.playClick('hard'); } catch {}
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
      try { audioHaptic.playClick(); } catch {}
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
       try { audioHaptic.playClick(); } catch {}
       setIsPending(true);
       setStage(AppStage.LOADING_QUIZ);
       
       try {
         await new Promise(resolve => setTimeout(resolve, 800));
         
         const debugTopics = ["Debug Alpha", "Debug Beta", "Debug Gamma", "Debug Delta"];
         const debugSets: QuizSet[] = debugTopics.map((topic, index) => ({
           topic: topic,
           categoryId: "GENERAL",
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

    triggerSeeding: async () => {
       if (isPending) return;
       try { audioHaptic.playClick('hard'); } catch {}
       setIsPending(true);
       
       try {
         await seedLocalDatabase((msg) => {
            console.log(msg);
         });
         alert("Seeding Complete! Check console for details.");
       } catch (e: any) {
         alert("Seeding Failed: " + e.message);
       } finally {
         setIsPending(false);
       }
    },

    previewResults: () => {
      try { audioHaptic.playClick(); } catch {}
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

    previewLoading: () => {
        try { audioHaptic.playClick(); } catch {}
        setStage(AppStage.LOADING_QUIZ);
        // Automatically go back after 5 seconds
        setTimeout(() => {
           setStage(AppStage.INTRO);
        }, 5000);
    },
    
    selectOption: (option: string) => {
        if (isSubmitting) return; // Block changing answer during submission
        try { audioHaptic.playClick('soft'); } catch {}
        setSelectedOption(option);
    },
    confirmAnswer: () => {
      if (!selectedOption || isSubmitting) return; // Prevent double submission
      
      // 1. Lock the UI immediately
      setIsSubmitting(true);
      
      const question = questions[currentQuestionIndex];
      const isCorrect = selectedOption === question.correctAnswer;
      
      // 2. Play Feedback sound
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
      
      // 3. Move to next question after delay
      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
           setCurrentQuestionIndex(prev => prev + 1);
           setSelectedOption(null); // Clear now
           setIsSubmitting(false); // Unlock
        }, 800); 
      } else {
        const currentTopicLabel = currentQuizSet?.topic || (batchProgress.topics[batchProgress.current - 1] || "Unknown");
        const currentTopicId = currentQuizSet?.categoryId || "GENERAL";
        
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
      try { audioHaptic.playClick(); } catch {}
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
        currentTopicName: currentQuizSet?.topic || (batchProgress.topics.length > 0 ? batchProgress.topics[batchProgress.current - 1] : undefined),
        batchProgress,
        isSubmitting // Expose locking state
      },
      resultState: { evaluation, sessionResults, errorMsg } 
    },
    actions, t
  };
};