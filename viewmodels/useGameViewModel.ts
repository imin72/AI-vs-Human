import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Language, 
  UserProfile, 
  Difficulty, 
  QuizQuestion, 
  UserAnswer, 
  EvaluationResult,
  QuizSet,
  AppStage
  // 에러 수정: 사용하지 않는 HistoryItem 제거
} from '../types';
import { generateQuestionsBatch, evaluateBatchAnswers, BatchEvaluationInput, seedLocalDatabase } from '../services/geminiService';
import { audioHaptic } from '../services/audioHapticService';
import { TRANSLATIONS } from '../utils/translations';
import { useAppNavigation } from '../hooks/useAppNavigation'; 

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

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

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
  // [1] 내비게이션 훅 사용
  const { 
    stage, setStage, 
    selectionPhase, setSelectionPhase, 
    updateCallbacks, 
    goBack, goHome 
  } = useAppNavigation(AppStage.INTRO);

  // [2] 언어 및 번역
  const [language, setLanguage] = useState<Language>(getBrowserLanguage());
  const t = useMemo(() => TRANSLATIONS[language], [language]);

  // [3] 사용자 프로필
  const [userProfile, setUserProfile] = useState<UserProfile>({ 
    gender: '', ageGroup: '', nationality: '', eloRatings: {}, seenQuestionIds: [], history: []
  });

  // [4] 퀴즈 데이터 및 상태
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubTopics, setSelectedSubTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [displayedTopics, setDisplayedTopics] = useState<{id: string, label: string}[]>([]);
  
  const [quizQueue, setQuizQueue] = useState<QuizSet[]>([]);
  const [currentQuizSet, setCurrentQuizSet] = useState<QuizSet | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [batchProgress, setBatchProgress] = useState<{ total: number, current: number, topics: string[] }>({ total: 0, current: 0, topics: [] });
  const [completedBatches, setCompletedBatches] = useState<AccumulatedBatchData[]>([]);
  
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [sessionResults, setSessionResults] = useState<EvaluationResult[]>([]); 
  const [errorMsg, setErrorMsg] = useState('');
  const [isPending, setIsPending] = useState(false);

  // --- 퀴즈 데이터 초기화 함수 ---
  const resetQuizData = useCallback(() => {
    setQuizQueue([]);
    setCurrentQuizSet(null);
    setBatchProgress({ total: 0, current: 0, topics: [] });
    setSessionResults([]); 
    setCompletedBatches([]);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setSelectedCategories([]); 
    setSelectedSubTopics([]);
    setSelectedOption(null);
    setEvaluation(null);
    setIsPending(false);
    setIsSubmitting(false);
  }, []);

  // --- 내비게이션 훅에 콜백 등록 ---
  useEffect(() => {
    updateCallbacks(
      () => { try { window.close(); } catch {} }, 
      resetQuizData,                              
      t.common.confirm_exit_app || "앱을 종료하시겠습니까?",
      t.common.confirm_home || "홈으로 이동하시겠습니까? 진행 중인 내용은 초기화됩니다."
    );
  }, [t, updateCallbacks, resetQuizData]);


  // --- 기존 비즈니스 로직들 ---
  
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUserProfile({ ...parsed, eloRatings: parsed.eloRatings || {}, seenQuestionIds: parsed.seenQuestionIds || [], history: parsed.history || [] });
      }
    } catch (e) { console.warn("Failed to load profile"); }
  }, []);

  useEffect(() => {
    const topics = Object.entries(t.topics.categories).map(([id, label]) => ({ id, label }));
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
        
        if (score >= (currentScores[batch.topicLabel] || 0)) currentScores[batch.topicLabel] = score;

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
      const resultsWithIds = results.map((res, idx) => ({ ...res, id: allBatches[idx].topicId }));

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

  // --- Actions ---
  const actions = useMemo(() => ({
    setLanguage: (lang: Language) => { 
      try { audioHaptic.playClick('soft'); } catch {}
      resetQuizData();
      setLanguage(lang); 
    },
    goBack,
    goHome,
    
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
        if (prev.includes(id)) return prev.filter(cat => cat !== id);
        else {
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
        if (prev.includes(sub)) return prev.filter(p => p !== sub);
        else {
          if (prev.length >= 4) return prev; 
          return [...prev, sub];
        }
      });
    },
    setDifficulty: (diff: Difficulty) => {
       try { audioHaptic.playClick('soft'); } catch {}
       setDifficulty(diff);
    },
    resetApp: () => {
      try { audioHaptic.playClick(); } catch {}
      resetQuizData();
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
          setCompletedBatches([]); 
          
          setBatchProgress({ total: selectedSubTopics.length, current: 1, topics: selectedSubTopics });
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
         const nextProgress = { ...batchProgress, current: batchProgress.current + 1 };
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
           topic: topic, categoryId: "GENERAL",
           questions: DEBUG_QUIZ.map(q => ({ ...q, id: q.id + (index * 100), question: `[${topic}] ${q.question}` }))
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
      const mockResult: EvaluationResult = {
        id: "SCIENCE", totalScore: 88, humanPercentile: 92,
        aiComparison: "Debug Comparison", demographicPercentile: 95, demographicComment: "Debug",
        title: "Quantum Physics", details: []
      };
      setEvaluation(mockResult);
      setSessionResults([mockResult]);
      setStage(AppStage.RESULTS);
    },
    previewLoading: () => {
        try { audioHaptic.playClick(); } catch {}
        setStage(AppStage.LOADING_QUIZ);
        setTimeout(() => { setStage(AppStage.INTRO); }, 5000);
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
        questionId: question.id, questionText: question.question, selectedOption, correctAnswer: question.correctAnswer, isCorrect 
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
        const currentTopicLabel = currentQuizSet?.topic || "Unknown";
        const currentTopicId = currentQuizSet?.categoryId || "GENERAL";
        const batchData = { topicLabel: currentTopicLabel, topicId: currentTopicId, answers: updatedAnswers };
        const newCompletedBatches = [...completedBatches, batchData];
        setCompletedBatches(newCompletedBatches);

        if (quizQueue.length > 0) {
           setTimeout(() => {
               const [next, ...rest] = quizQueue;
               const nextProgress = { ...batchProgress, current: batchProgress.current + 1 };
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
           finishBatchQuiz(newCompletedBatches, userProfile, language).then(() => { setIsSubmitting(false); });
        }
      }
    },
    shuffleTopics: () => {
      try { audioHaptic.playClick(); } catch {}
      setDisplayedTopics(prev => shuffleArray(prev));
    },
    shuffleSubTopics: () => {},
    setCustomTopic: (_topic: string) => {}
  }), [goBack, goHome, resetQuizData, setStage, setSelectionPhase, userProfile, questions, currentQuestionIndex, userAnswers, selectedOption, t, quizQueue, currentQuizSet, batchProgress, completedBatches, isSubmitting, language, difficulty, selectedCategories, selectedSubTopics, isPending]);

  return {
    state: {
      stage, language, userProfile,
      topicState: { selectionPhase, selectedCategories, selectedSubTopics, difficulty, displayedTopics, isTopicLoading: isPending },
      quizState: { 
        questions, currentQuestionIndex, userAnswers, selectedOption, 
        remainingTopics: quizQueue.length,
        nextTopicName: quizQueue.length > 0 ? quizQueue[0].topic : undefined,
        currentTopicName: currentQuizSet?.topic || (batchProgress.topics.length > 0 ? batchProgress.topics[batchProgress.current - 1] : undefined),
        batchProgress, isSubmitting 
      },
      resultState: { evaluation, sessionResults, errorMsg } 
    },
    actions, t
  };
};