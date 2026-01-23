import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
  // --- State Definitions ---
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

  // --- Initial Loaders ---

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

  // Shuffle Topics on Language Change
  useEffect(() => {
    const topics = Object.entries(t.topics.categories)
      .map(([id, label]) => ({ id, label }));
    setDisplayedTopics(shuffleArray(topics));
  }, [t]);

  // --- Logic Helpers ---

  const finishBatchQuiz = async (allBatches: AccumulatedBatchData[], profile: UserProfile, lang: Language) => {
    if (isPending) return;
    setIsPending(true);
    setStage(AppStage.ANALYZING);
    audioHaptic.playClick('hard');

    try {
      // 1. Prepare data for API
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
        // 타입 에러 해결을 위해 명시적 객체 생성
        currentHistory.push({
          timestamp: Date.now(),
          topicId: batch.topicId,
          score: score,
          aiScore: aiBenchmark,
          difficulty: difficulty
        });

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

      // 2. Debug Mode Check
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

      // 3. Real API Call
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

  // --- History Navigation Logic (RE-DESIGNED & FIXED) ---

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
    setEvaluation(null);
  }, []);

  // 1. [초기화] 앱 실행 시 히스토리 스택 설정 (중복 방지 로직 추가)
  useEffect(() => {
    // 이미 히스토리가 depth=1로 설정되어 있다면 다시 초기화하지 않음 (Strict Mode 중복 실행 방지)
    if (window.history.state && window.history.state.depth === 1) {
      return;
    }
    // 초기 실행: 현재를 0으로 바꾸고, 앱 시작점인 1을 쌓음
    // 뒤로가기(0으로 이동) 시 '종료'로 처리하기 위함
    window.history.replaceState({ depth: 0 }, '');
    window.history.pushState({ depth: 1 }, '');
  }, []);

  // 2. [이벤트 핸들러] 뒤로가기 감지 및 처리
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // event.state는 사용자가 '이동하려고 하는 곳'의 상태입니다.
      // 현재 depth가 1(Intro)인데, 뒤로가기를 눌러서 depth가 0인 곳으로 왔다면? -> 종료 시도

      const confirmHomeMsg = t.common.confirm_home || "홈 화면으로 이동하시겠습니까? 진행 중인 내용은 초기화됩니다.";

      // -----------------------------------------------------------
      // Case 1) IntroView에서 뒤로가기 (depth 1 -> 0 감지)
      // -----------------------------------------------------------
      if (stage === AppStage.INTRO) {
        if (window.confirm(t.common.confirm_exit_app || "앱을 종료하시겠습니까?")) {
          // [종료 확정]
          // 이미 depth 0으로 왔습니다. 여기서 한 번 더 뒤로가면(depth -1) 브라우저 밖으로 나갑니다.
          window.history.back();
          // 혹시 모를 상황 대비 close 시도
          window.close();
        } else {
          // [종료 취소]
          // 사용자가 머무르기를 원하므로, 다시 depth 1을 쌓아서 원상복구합니다.
          window.history.pushState({ depth: 1 }, '');
        }
        return;
      }

      // -----------------------------------------------------------
      // Case 2) 영역선택: SubTopic -> Category
      // -----------------------------------------------------------
      if (stage === AppStage.TOPIC_SELECTION && selectionPhase === 'SUBTOPIC') {
        // 브라우저 뒤로가기로 왔으니 히스토리는 자동으로 처리됨
        // 화면 상태만 맞춰줍니다.
        setSelectionPhase('CATEGORY');
        setSelectedSubTopics([]);
        return;
      }

      // -----------------------------------------------------------
      // Case 2-1) 영역선택/프로필 -> Intro
      // -----------------------------------------------------------
      if ((stage === AppStage.TOPIC_SELECTION && selectionPhase === 'CATEGORY') || stage === AppStage.PROFILE) {
        setStage(AppStage.INTRO);
        return;
      }

      // -----------------------------------------------------------
      // Case 3 & 4) 문제풀이/결과 -> 홈 이동 팝업
      // -----------------------------------------------------------
      if (stage === AppStage.QUIZ || stage === AppStage.RESULTS || stage === AppStage.ERROR) {
        // 뒤로가기를 눌렀지만, 팝업에서 취소할 수도 있으므로 일단 다시 앞으로(현재 위치로) 밀어넣어 '이탈'을 막음
        // depth 99는 임의의 값 (현재 상태 유지용)
        window.history.pushState({ depth: 99 }, '');

        if (window.confirm(confirmHomeMsg)) {
          // [예] 홈으로 이동
          resetAllStateToHome();
          // 주의: 여기서 history를 또 조작하지 않아도 됨. 
          // pushState로 막아둔 상태에서 화면만 Intro로 바뀌면 됨.
        }
        // [아니오] 아무것도 안 함 (화면 유지)
        return;
      }

      // 그 외 알 수 없는 상태면 안전하게 Intro로
      setStage(AppStage.INTRO);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [stage, selectionPhase, t, resetAllStateToHome]);


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
      // 앞으로 가기: 히스토리 추가 (depth 2)
      window.history.pushState({ depth: 2 }, ''); 
      
      if (userProfile.gender && userProfile.nationality) {
        setStage(AppStage.TOPIC_SELECTION);
      } else {
        setStage(AppStage.PROFILE);
      }
    },

    editProfile: () => {
      try { audioHaptic.playClick(); } catch {}
      window.history.pushState({ depth: 2 }, ''); 
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
      // 프로필 저장 후 다음 단계로 이동하지만, 같은 '설정' 단계로 보거나 이동으로 처리
      // 여기서는 그냥 화면만 전환 (뒤로가면 Intro)
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
        // 세부 선택 진입: 히스토리 추가 (depth 3)
        window.history.pushState({ depth: 3 }, '');
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
    
    // UI 뒤로가기 버튼: 물리 뒤로가기와 동일하게 처리
    // 이 함수를 호출하면 handlePopState가 실행되어 로직을 수행함
    goBack: () => {
      if (isPending || isSubmitting) return; 
      try { audioHaptic.playClick(); } catch {}
      window.history.back();
    },
    
    goHome: () => {
      try { audioHaptic.playClick(); } catch {}
      // 홈 버튼은 팝업 없이 즉시 이동 (사용자가 명시적으로 눌렀으므로)
      // 혹은 기획 의도에 따라 팝업을 띄울 수도 있음
      if (stage === AppStage.QUIZ || stage === AppStage.RESULTS) {
         if (!window.confirm(t.common.confirm_home || "Return to Home?")) return;
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
      
      // 퀴즈 진입 시 히스토리 추가 (depth 4)
      window.history.pushState({ depth: 4 }, '');

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
       
       // 디버그 퀴즈 진입 시 히스토리 추가
       window.history.pushState({ depth: 4 }, '');

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
      // 결과 화면 진입 (테스트용)
      window.history.pushState({ depth: 5 }, '');

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