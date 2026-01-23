import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState(false); 
  
  // Batch Progress Tracking
  const [batchProgress, setBatchProgress] = useState<{ total: number, current: number, topics: string[] }>({ total: 0, current: 0, topics: [] });
  const [completedBatches, setCompletedBatches] = useState<AccumulatedBatchData[]>([]);

  // Result State
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [sessionResults, setSessionResults] = useState<EvaluationResult[]>([]); 
  const [errorMsg, setErrorMsg] = useState('');
  const [isPending, setIsPending] = useState(false);

  const t = useMemo(() => TRANSLATIONS[language], [language]);

  // --- [핵심 수정 1] Refs로 상태 감싸기 (이벤트 리스너 안정성 확보) ---
  const stageRef = useRef(stage);
  const selectionPhaseRef = useRef(selectionPhase);
  const tRef = useRef(t);
  
  useEffect(() => { stageRef.current = stage; }, [stage]);
  useEffect(() => { selectionPhaseRef.current = selectionPhase; }, [selectionPhase]);
  useEffect(() => { tRef.current = t; }, [t]);

  // Load Profile on Mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
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
      const batchInputs: BatchEvaluationInput[] = [];
      const updatedProfile = { ...profile };
      const currentScores = { ...(profile.scores || {}) };
      const currentElos = { ...(profile.eloRatings || {}) };
      const seenIds = new Set(profile.seenQuestionIds || []);
      const currentHistory = [...(profile.history || [])];

      allBatches.forEach(batch => {
        const correctCount = batch.answers.filter(a => a.isCorrect).length;
        const totalCount = batch.answers.length;
        const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
        
        if (score >= (currentScores[batch.topicLabel] || 0)) {
           currentScores[batch.topicLabel] = score;
        }

        batch.answers.forEach(a => seenIds.add(a.questionId));

        const currentElo = currentElos[batch.topicId] || 1000;
        let eloChange = 0;
        if (score >= 80) eloChange = 30;
        else if (score >= 60) eloChange = 10;
        else if (score >= 40) eloChange = -10;
        else eloChange = -20;

        const newElo = Math.max(0, currentElo + eloChange);
        currentElos[batch.topicId] = newElo;

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

      updatedProfile.scores = currentScores;
      updatedProfile.eloRatings = currentElos;
      updatedProfile.seenQuestionIds = Array.from(seenIds);
      updatedProfile.history = currentHistory;
      
      setUserProfile(updatedProfile);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));

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

      const results = await evaluateBatchAnswers(batchInputs, updatedProfile, lang);
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

  // Helper for Resetting
  const resetAllStateToHome = useCallback(() => {
    setStage(AppStage.INTRO);
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
    setSelectedOption(null);
    setEvaluation(null);
  }, []);

  // --- [핵심 수정 2] History Trap 설치 (앱 로드 시 1회만 실행) ---
  useEffect(() => {
    // 앱 초기화 시 히스토리를 하나 쌓아서 뒤로가기가 '종료'가 되도록 함
    if (!window.history.state || window.history.state.key !== 'app_initialized') {
        window.history.replaceState({ key: 'root' }, '');
        window.history.pushState({ key: 'app_initialized', stage: 'intro' }, '');
    }
  }, []);

  // --- [핵심 수정 3] 통합된 Back Navigation Handler (Refs + Async) ---
  useEffect(() => {
    const handlePopState = (_: PopStateEvent) => {
      // Refs를 사용하여 가장 최신의 값을 안전하게 가져옴
      const currentStage = stageRef.current;
      const currentPhase = selectionPhaseRef.current;
      const currentT = tRef.current;
      
      const confirmHomeMsg = currentT.common.confirm_home || "수행내용이 초기화되고 홈화면으로 이동합니다.";

      // 1) IntroView: 뒤로가기 시 무조건 종료 팝업
      if (currentStage === AppStage.INTRO) {
        const exitMsg = currentT.common.confirm_exit_app || "앱을 종료하시겠습니까?";
        if (window.confirm(exitMsg)) {
          // [중요] setTimeout으로 종료 로직을 비동기 처리하여 브라우저 충돌 방지
          setTimeout(() => {
             const len = window.history.length;
             // 히스토리가 쌓여있다면 최대한 뒤로 보내서 이탈 시도
             if (len > 2) window.history.go(-(len - 1));
             else window.history.back();
             
             try { window.close(); } catch {}
          }, 0);
        } else {
          // 취소 시 Trap 복구 (Intro 상태 유지)
          window.history.pushState({ key: 'app_initialized', stage: 'intro' }, '');
        }
        return;
      }

      // 2) PROFILE, TOPIC_SELECTION: 바로 전단계로 이동 (팝업 없음)
      if (currentStage === AppStage.PROFILE) {
        setStage(AppStage.INTRO);
        return;
      }
      
      if (currentStage === AppStage.TOPIC_SELECTION) {
        if (currentPhase === 'SUBTOPIC') {
          setSelectionPhase('CATEGORY');
          setSelectedSubTopics([]);
          return;
        }
        // CATEGORY에서 뒤로가기 -> Intro
        setStage(AppStage.INTRO);
        return;
      }

      // 3) QUIZ, RESULTS, ERROR: 홈 이동 확인 팝업
      const isQuizStage = currentStage === AppStage.QUIZ || currentStage === AppStage.LOADING_QUIZ;
      const isResultStage = currentStage === AppStage.RESULTS || currentStage === AppStage.ERROR || currentStage === AppStage.ANALYZING;

      if (isQuizStage || isResultStage) {
        // 일단 뒤로가기 동작을 막기 위해 히스토리 복구 (Lock)
        window.history.pushState({ key: 'locked', stage: currentStage }, '');

        if (window.confirm(confirmHomeMsg)) {
          // [중요] setTimeout으로 상태 변경을 비동기 처리
          setTimeout(() => {
             resetAllStateToHome();
             // 여기서 replaceState는 굳이 안 해도 resetAllStateToHome이 Intro로 보내므로 OK
          }, 0);
        }
        // 아니오 선택 시: 이미 pushState로 복구했으므로 현상 유지됨
        return;
      }

      // Fallback
      setStage(AppStage.INTRO);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [resetAllStateToHome]); // 의존성 최소화


  // --- Actions ---
  const actions = useMemo(() => ({
    setLanguage: (lang: Language) => { 
      try { audioHaptic.playClick('soft'); } catch {}
      setSelectedCategories([]);
      setSelectedSubTopics([]);
      setSelectionPhase('CATEGORY');
      setLanguage(lang); 
    },
    startIntro: () => {
      try { audioHaptic.playClick('hard'); } catch {}
      // 앞으로 이동 시 히스토리 추가
      window.history.pushState({ key: 'step_2' }, '');
      if (userProfile.gender && userProfile.nationality) {
        setStage(AppStage.TOPIC_SELECTION);
      } else {
        setStage(AppStage.PROFILE);
      }
    },
    editProfile: () => {
      try { audioHaptic.playClick(); } catch {}
      window.history.pushState({ key: 'profile' }, '');
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
        window.history.pushState({ key: 'subtopic' }, '');
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
    
    // UI 뒤로가기 버튼은 브라우저 백과 동일하게 동작하도록 통일
    goBack: () => {
      if (isPending || isSubmitting) return; 
      try { audioHaptic.playClick(); } catch {}
      window.history.back();
    },
    
    goHome: () => {
      try { audioHaptic.playClick(); } catch {}
      const needsConfirmation = stage === AppStage.QUIZ || stage === AppStage.LOADING_QUIZ || stage === AppStage.ANALYZING;
      if (needsConfirmation) {
        if (!window.confirm(t.common.confirm_home || "홈화면으로 이동하시겠습니까?")) return;
      }
      setIsPending(false);
      setIsSubmitting(false);
      resetAllStateToHome();
    },

    resetApp: () => {
      try { audioHaptic.playClick(); } catch {}
      resetAllStateToHome();
      setStage(AppStage.TOPIC_SELECTION);
    },

    startQuiz: async () => {
      if (isPending) return;
      if (selectedSubTopics.length === 0) return;
      
      try { audioHaptic.playClick('hard'); } catch {}
      setIsPending(true);
      setStage(AppStage.LOADING_QUIZ);
      
      // 퀴즈 진입 시 히스토리 추가
      window.history.pushState({ key: 'quiz_start' }, '');

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
          setCompletedBatches([]); 
          
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
       
       window.history.pushState({ key: 'debug_quiz' }, '');

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
         await seedLocalDatabase((msg) => { console.log(msg); });
         alert("Seeding Complete! Check console for details.");
       } catch (e: any) {
         alert("Seeding Failed: " + e.message);
       } finally {
         setIsPending(false);
       }
    },

    previewResults: () => {
      try { audioHaptic.playClick(); } catch {}
      window.history.pushState({ key: 'preview_results' }, '');

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
        setTimeout(() => {
           setStage(AppStage.INTRO);
        }, 5000);
    },
    
    selectOption: (option: string) => {
        if (isSubmitting) return; 
        try { audioHaptic.playClick('soft'); } catch {}
        setSelectedOption(option);
    },

    confirmAnswer: () => {
      if (!selectedOption || isSubmitting) return; 
      
      setIsSubmitting(true);
      const question = questions[currentQuestionIndex];
      const isCorrect = selectedOption === question.correctAnswer;
      
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
      
      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
           setCurrentQuestionIndex(prev => prev + 1);
           setSelectedOption(null); 
           setIsSubmitting(false); 
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
  }), [isPending, stage, selectionPhase, selectedCategories, selectedSubTopics, difficulty, language, userProfile, questions, currentQuestionIndex, userAnswers, selectedOption, t, quizQueue, currentQuizSet, batchProgress, displayedTopics, completedBatches, isSubmitting, resetAllStateToHome]);

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
        isSubmitting 
      },
      resultState: { evaluation, sessionResults, errorMsg } 
    },
    actions, t
  };
};