
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
  const [selectedCategory, setSelectedCategory] = useState<string>('');
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

  const displayedSubTopics = useMemo(() => {
    if (!selectedCategory) return [];
    return t.topics.subtopics[selectedCategory] || [];
  }, [selectedCategory, t]);

  const finishQuiz = async (finalAnswers: UserAnswer[], currentTopic: string, profile: UserProfile, lang: Language) => {
    if (isPending) return;
    setIsPending(true);
    setStage(AppStage.ANALYZING);
    
    try {
      const correctCount = finalAnswers.filter(a => a.isCorrect).length;
      const totalCount = finalAnswers.length;
      const score = Math.round((correctCount / totalCount) * 100);
      
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
      // If the topic is "Debug...", skip the API call
      if (currentTopic.startsWith("Debug")) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Fake analyzing delay
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
        setIsPending(false);
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
    if (stage !== AppStage.LANGUAGE) {
      window.history.pushState({ stage, selectedCategory }, '');
    }
  }, [stage, selectedCategory]);

  const performBackNavigation = useCallback((): boolean => {
    if (isPending) return false;

    if (selectedCategory && stage === AppStage.TOPIC_SELECTION) { 
      setSelectedCategory(''); 
      setSelectedSubTopics([]);
      return true;
    }
    
    switch (stage) {
      case AppStage.TOPIC_SELECTION:
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
          setQuizQueue([]);
          setBatchProgress({ total: 0, current: 0, topics: [] });
          return true;
        }
        return false;
      case AppStage.RESULTS:
      case AppStage.ERROR:
        setStage(AppStage.TOPIC_SELECTION);
        return true;
      default:
        return true;
    }
  }, [stage, selectedCategory, isPending, t]);

  useEffect(() => {
    const handlePopState = (_: PopStateEvent) => {
      if (stage === AppStage.LANGUAGE) return; 

      isNavigatingBackRef.current = true;
      const success = performBackNavigation();
      
      if (!success) {
        window.history.pushState({ stage, selectedCategory }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [performBackNavigation, stage, selectedCategory]);

  // --- Actions ---
  const actions = useMemo(() => ({
    setLanguage: (lang: Language) => { 
      setLanguage(lang); 
      setStage(AppStage.INTRO); 
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
    updateProfile: (profile: Partial<UserProfile>) => setUserProfile(prev => ({ ...prev, ...profile })),
    submitProfile: () => {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
      setStage(AppStage.TOPIC_SELECTION);
    },
    selectCategory: (id: string) => {
      setSelectedCategory(id);
      setSelectedSubTopics([]);
    },
    selectSubTopic: (sub: string) => {
      setSelectedSubTopics(prev => {
        if (prev.includes(sub)) {
          return prev.filter(p => p !== sub);
        } else {
          if (prev.length >= 5) return prev;
          return [...prev, sub];
        }
      });
    },
    setDifficulty: (diff: Difficulty) => setDifficulty(diff),
    
    goBack: () => {
      if (isPending) return;
      if (stage === AppStage.LANGUAGE) return;
      performBackNavigation();
    },
    
    goHome: () => {
      if (isPending) return;
      if (stage === AppStage.QUIZ) {
        if (!window.confirm(t.common.confirm_exit)) return;
      }
      
      if (userProfile.nationality) {
        setStage(AppStage.TOPIC_SELECTION);
      } else {
        setStage(AppStage.LANGUAGE);
      }
      
      setEvaluation(null);
      setUserAnswers([]);
      setCurrentQuestionIndex(0);
      setSelectedCategory('');
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
        
        // Setup Queue & Batch Info
        const [first, ...rest] = quizSets;
        setQuizQueue(rest);
        setCurrentQuizSet(first);
        setQuestions(first.questions);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        
        // Initialize Batch Progress
        setBatchProgress({
          total: selectedSubTopics.length,
          current: 1,
          topics: selectedSubTopics
        });
        
        setStage(AppStage.QUIZ);
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
      
      // Update Batch Progress
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
       await new Promise(resolve => setTimeout(resolve, 800));
       
       // Simulate 3 Topics for Debugging Batch Flow
       const debugTopics = ["Debug Alpha", "Debug Beta", "Debug Gamma"];
       const debugSets: QuizSet[] = debugTopics.map((topic, index) => ({
         topic: topic,
         questions: DEBUG_QUIZ.map(q => ({
            ...q,
            id: q.id + (index * 100), // Ensure unique IDs for React keys
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
       setIsPending(false);
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
        const currentTopic = currentQuizSet?.topic || "Unknown";
        finishQuiz(updated, currentTopic, userProfile, language);
      }
    },
    shuffleTopics: () => {},
    shuffleSubTopics: () => {},
    setCustomTopic: (_topic: string) => {}
  }), [isPending, stage, selectedCategory, selectedSubTopics, difficulty, language, userProfile, questions, currentQuestionIndex, userAnswers, selectedOption, t, quizQueue, currentQuizSet, performBackNavigation]);

  return {
    state: {
      stage, language, userProfile,
      topicState: { selectedCategory, selectedSubTopics, difficulty, displayedTopics, displayedSubTopics, isTopicLoading: isPending },
      quizState: { questions, currentQuestionIndex, userAnswers, selectedOption, remainingTopics: quizQueue.length, batchProgress },
      resultState: { evaluation, errorMsg }
    },
    actions, t
  };
};
