
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
import { generateQuestionsBatch, evaluateAnswers } from '../services/geminiService';
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

export const useGameViewModel = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.LANGUAGE);
  const [language, setLanguage] = useState<Language>('en');
  const [userProfile, setUserProfile] = useState<UserProfile>({ gender: '', ageGroup: '', nationality: '' });
  
  // Selection State
  const [selectionPhase, setSelectionPhase] = useState<'CATEGORY' | 'SUBTOPIC'>('CATEGORY');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubTopics, setSelectedSubTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  
  // Quiz Execution State
  const [quizQueue, setQuizQueue] = useState<QuizSet[]>([]);
  const [currentQuizSet, setCurrentQuizSet] = useState<QuizSet | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // Batch Progress Tracking
  const [batchProgress, setBatchProgress] = useState<{ total: number, current: number, topics: string[] }>({ total: 0, current: 0, topics: [] });

  // Result State
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPending, setIsPending] = useState(false);

  const t = useMemo(() => TRANSLATIONS[language], [language]);

  // Load Profile on Mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) {
        setUserProfile(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load profile");
    }
  }, []);

  const displayedTopics = useMemo(() => {
    return Object.entries(t.topics.categories)
      .map(([id, label]) => ({ id, label }));
  }, [t]);

  const finishQuiz = async (finalAnswers: UserAnswer[], currentTopic: string, profile: UserProfile, lang: Language) => {
    if (isPending) return;
    setIsPending(true);
    setStage(AppStage.ANALYZING);
    
    try {
      const correctCount = finalAnswers.filter(a => a.isCorrect).length;
      const totalCount = finalAnswers.length;
      const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
      
      // Update High Score Logic (Local Only)
      const currentScores = profile.scores || {};
      const previousScore = currentScores[currentTopic] || 0;
      let updatedProfile = profile;
      if (score >= previousScore) {
        updatedProfile = {
          ...profile,
          scores: { ...currentScores, [currentTopic]: score }
        };
        setUserProfile(updatedProfile);
        localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
      }

      // --- DEBUG MODE CHECK ---
      if (currentTopic.startsWith("Debug")) {
        await new Promise(resolve => setTimeout(resolve, 800)); 
        const mockResult: EvaluationResult = {
          totalScore: score,
          humanPercentile: 99,
          aiComparison: "[DEBUG] AI Analysis bypassed. Pure logic verified.",
          demographicPercentile: 50,
          demographicComment: "Debug environment detected. Metrics simulated.",
          title: currentTopic,
          details: finalAnswers.map(a => ({
            questionId: a.questionId,
            isCorrect: a.isCorrect,
            aiComment: a.isCorrect ? "Correct (Debug)" : "Incorrect (Debug)",
            correctFact: "Debug Fact: The correct answer was " + a.correctAnswer
          }))
        };
        setEvaluation(mockResult);
        setStage(AppStage.RESULTS);
        return;
      }

      // --- REAL MODE ---
      const performanceSummary = finalAnswers.map(a => ({
        id: a.questionId,
        ok: a.isCorrect
      }));

      const res = await evaluateAnswers(currentTopic, score, updatedProfile, lang, performanceSummary);
      setEvaluation({ ...res, totalScore: score });
      setStage(AppStage.RESULTS);
    } catch (e: any) {
      console.error("Finish Quiz Error", e);
      setErrorMsg(e.message || "Unknown analysis error");
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
    // Only push state when stage changes, do not push on category selection to avoid history clutter
    if (stage !== AppStage.LANGUAGE) {
      window.history.pushState({ stage }, '');
    }
  }, [stage]);

  const performBackNavigation = useCallback((): boolean => {
    if (isPending) return false;

    // Handle 2-step selection logic: Subtopic -> Category (No history pop)
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
        if (window.confirm(t.common.confirm_exit)) {
          setStage(AppStage.TOPIC_SELECTION);
          setSelectionPhase('CATEGORY');
          setQuizQueue([]);
          setBatchProgress({ total: 0, current: 0, topics: [] });
          return true;
        }
        return false;
      case AppStage.RESULTS:
      case AppStage.ERROR:
        setStage(AppStage.TOPIC_SELECTION);
        setSelectionPhase('CATEGORY');
        return true;
      default:
        return true;
    }
  }, [stage, selectionPhase, isPending, t]);

  useEffect(() => {
    const handlePopState = (_: PopStateEvent) => {
      // If we are at root (Language), allow default browser behavior (exit/back)
      if (stage === AppStage.LANGUAGE) return; 

      isNavigatingBackRef.current = true;
      const success = performBackNavigation();
      
      if (!success) {
        // Restore forward history if navigation cancelled (e.g. Quiz exit cancelled)
        window.history.pushState({ stage }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [performBackNavigation, stage]);

  // --- Actions ---
  const actions = useMemo(() => ({
    setLanguage: (lang: Language) => { 
      setLanguage(lang); 
      if (stage === AppStage.LANGUAGE) {
         setStage(AppStage.INTRO); 
      }
    },
    startIntro: () => {
      if (userProfile.gender && userProfile.nationality) {
        setStage(AppStage.TOPIC_SELECTION);
      } else {
        setStage(AppStage.PROFILE);
      }
    },
    editProfile: () => {
      setStage(AppStage.PROFILE);
    },
    resetProfile: () => {
      localStorage.removeItem(PROFILE_KEY);
      setUserProfile({ gender: '', ageGroup: '', nationality: '' });
      setStage(AppStage.PROFILE);
    },
    updateProfile: (profile: Partial<UserProfile>) => setUserProfile(prev => ({ ...prev, ...profile })),
    submitProfile: () => {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
      setStage(AppStage.TOPIC_SELECTION);
    },
    selectCategory: (id: string) => {
      setSelectedCategories(prev => {
        if (prev.includes(id)) {
          return prev.filter(cat => cat !== id);
        } else {
          return [...prev, id];
        }
      });
    },
    proceedToSubTopics: () => {
      if (selectedCategories.length > 0) {
        setSelectionPhase('SUBTOPIC');
      }
    },
    selectSubTopic: (sub: string) => {
      setSelectedSubTopics(prev => {
        if (prev.includes(sub)) {
          return prev.filter(p => p !== sub);
        } else {
          if (prev.length >= 10) return prev;
          return [...prev, sub];
        }
      });
    },
    setDifficulty: (diff: Difficulty) => setDifficulty(diff),
    
    goBack: () => {
      if (isPending) return;
      
      // Handle internal UI state that doesn't correspond to a history entry
      if (stage === AppStage.TOPIC_SELECTION && selectionPhase === 'SUBTOPIC') {
        setSelectionPhase('CATEGORY');
        setSelectedSubTopics([]);
        return;
      }

      // If at root, do nothing (UI shouldn't have back button, but just in case)
      if (stage === AppStage.LANGUAGE) return;

      // For all other stage transitions, trigger browser back to sync history
      window.history.back();
    },
    
    goHome: () => {
      if (isPending) return;
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
    },

    resetApp: () => {
      setUserAnswers([]); 
      setCurrentQuestionIndex(0); 
      setEvaluation(null);
      setStage(AppStage.QUIZ);
    },

    startQuiz: async () => {
      if (isPending) return;
      if (selectedSubTopics.length === 0) return;
      
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
      if (quizQueue.length === 0) return;
      
      const [next, ...rest] = quizQueue;
      setQuizQueue(rest);
      setCurrentQuizSet(next);
      setQuestions(next.questions);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setEvaluation(null);
      
      setBatchProgress(prev => ({
        ...prev,
        current: prev.current + 1
      }));
      
      setStage(AppStage.QUIZ);
    },

    startDebugQuiz: async () => {
       if (isPending) return;
       setIsPending(true);
       setStage(AppStage.LOADING_QUIZ);
       
       try {
         await new Promise(resolve => setTimeout(resolve, 800));
         
         const debugTopics = ["Debug Alpha", "Debug Beta", "Debug Gamma"];
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
      console.log("previewResults triggered"); // Debugging Log
      const mockResult: EvaluationResult = {
        totalScore: 88,
        humanPercentile: 92,
        aiComparison: "Your cognitive patterns exhibit a surprising resistance to standard predictive models. Highly irregular, yet effective.",
        demographicPercentile: 95,
        demographicComment: "You are an outlier in your demographic cohort.",
        title: "Quantum Physics (Preview)",
        details: [
          { questionId: 1, isCorrect: true, aiComment: "Basic logic verified. Acceptable.", correctFact: "..." },
          { questionId: 2, isCorrect: false, aiComment: "Common human misconception detected. Disappointing.", correctFact: "Quantum entanglement implies non-local correlation, not instantaneous communication of information." },
          { questionId: 3, isCorrect: true, aiComment: "Optimal pathway chosen. Computationally efficient.", correctFact: "..." },
          { questionId: 4, isCorrect: true, aiComment: "Processing speed within upper quartiles.", correctFact: "..." },
          { questionId: 5, isCorrect: true, aiComment: "Knowledge retention confirmed.", correctFact: "..." }
        ]
      };
      setEvaluation(mockResult);
      setStage(AppStage.RESULTS);
    },
    
    selectOption: (option: string) => setSelectedOption(option),
    confirmAnswer: () => {
      if (!selectedOption) return;
      const question = questions[currentQuestionIndex];
      const answer = { 
        questionId: question.id, 
        questionText: question.question, 
        selectedOption, 
        correctAnswer: question.correctAnswer, 
        isCorrect: selectedOption === question.correctAnswer 
      };
      const updated = [...userAnswers, answer];
      setUserAnswers(updated);
      setSelectedOption(null);
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        const currentTopic = currentQuizSet?.topic || (batchProgress.topics[batchProgress.current - 1] || "Unknown");
        finishQuiz(updated, currentTopic, userProfile, language);
      }
    },
    shuffleTopics: () => {},
    shuffleSubTopics: () => {},
    setCustomTopic: (_topic: string) => {}
  }), [isPending, stage, selectionPhase, selectedCategories, selectedSubTopics, difficulty, language, userProfile, questions, currentQuestionIndex, userAnswers, selectedOption, t, quizQueue, currentQuizSet, batchProgress, performBackNavigation]);

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
        batchProgress 
      },
      resultState: { evaluation, errorMsg }
    },
    actions, t
  };
};
