import { useState, useEffect, useCallback } from 'react';
import { 
  AppStage, Language, UserProfile, Difficulty, 
  TOPIC_IDS, QuizQuestion, EvaluationResult, QuizSet, UserAnswer 
} from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { generateQuestionsBatch, evaluateAnswers, seedLocalDatabase } from '../services/geminiService';
import { audioHaptic } from '../services/audioHapticService';

const PROFILE_KEY = 'cognito_user_profile_v1';

export const useGameViewModel = () => {
  // --- Core State ---
  const [stage, setStage] = useState<AppStage>(AppStage.INTRO);
  const [language, setLanguage] = useState<Language>('en');
  
  // --- Profile State ---
  const [userProfile, setUserProfile] = useState<UserProfile>({
    gender: '',
    ageGroup: '',
    nationality: '',
    scores: {},
    eloRatings: {},
    seenQuestionIds: [],
    history: []
  });

  // --- Topic Selection State ---
  const [selectionPhase, setSelectionPhase] = useState<'CATEGORY' | 'SUBTOPIC'>('CATEGORY');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubTopics, setSelectedSubTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [displayedTopics, setDisplayedTopics] = useState<{id: string, label: string}[]>([]);
  const [isTopicLoading, setIsTopicLoading] = useState(false);

  // --- Quiz State ---
  const [quizQueue, setQuizQueue] = useState<QuizSet[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<UserAnswer[]>([]); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Result State ---
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [sessionResults, setSessionResults] = useState<EvaluationResult[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const t = TRANSLATIONS[language];

  // --- Initialization ---
  useEffect(() => {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserProfile({
           scores: {}, eloRatings: {}, seenQuestionIds: [], history: [], ...parsed
        });
      } catch (e) {
        console.error("Failed to load profile", e);
      }
    }
  }, []);

  useEffect(() => {
    const topicsList = Object.keys(t.topics.categories).map(id => ({
      id,
      label: t.topics.categories[id]
    }));
    setDisplayedTopics(topicsList);
  }, [language, t]);

  // --- Actions ---

  const goHome = useCallback(() => {
    if (stage !== AppStage.INTRO && stage !== AppStage.RESULTS) {
       if(!window.confirm(t.common.confirm_home)) return;
    }
    setStage(AppStage.INTRO);
    setSelectedCategories([]);
    setSelectedSubTopics([]);
    setSelectionPhase('CATEGORY');
    setQuizQueue([]);
    setSessionResults([]);
  }, [stage, t]);

  const startIntro = () => {
    if (userProfile.nationality && userProfile.gender && userProfile.ageGroup) {
      setStage(AppStage.TOPIC_SELECTION);
    } else {
      setStage(AppStage.PROFILE);
    }
  };

  const resetProfile = () => {
    if(window.confirm("Are you sure you want to reset your profile?")) {
        localStorage.removeItem(PROFILE_KEY);
        setUserProfile({ gender: '', ageGroup: '', nationality: '', scores: {}, eloRatings: {}, seenQuestionIds: [], history: [] });
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const submitProfile = () => {
    if (!userProfile.gender) updateProfile({ gender: 'Other' });
    if (!userProfile.ageGroup) updateProfile({ ageGroup: '18-24' });
    if (!userProfile.nationality) updateProfile({ nationality: 'US' });
    
    // Save is handled in next render or explicitly here if needed immediately
    const updated = { ...userProfile, gender: userProfile.gender || 'Other', ageGroup: userProfile.ageGroup || '18-24', nationality: userProfile.nationality || 'US' };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    setStage(AppStage.TOPIC_SELECTION);
  };

  const editProfile = () => setStage(AppStage.PROFILE);

  const shuffleTopics = () => {
    setDisplayedTopics(prev => [...prev].sort(() => 0.5 - Math.random()));
  };

  const selectCategory = (id: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(id)) return prev.filter(c => c !== id);
      if (prev.length >= 3) return prev; 
      return [...prev, id];
    });
  };

  const proceedToSubTopics = () => {
    setSelectionPhase('SUBTOPIC');
    setSelectedSubTopics([]);
  };

  const goBack = () => {
    if (stage === AppStage.QUIZ) {
        if(!window.confirm(t.common.confirm_exit)) return;
        setStage(AppStage.TOPIC_SELECTION);
        return;
    }
    if (stage === AppStage.TOPIC_SELECTION) {
      if (selectionPhase === 'SUBTOPIC') {
        setSelectionPhase('CATEGORY');
      } else {
        goHome();
      }
    }
  };

  const selectSubTopic = (sub: string) => {
    setSelectedSubTopics(prev => {
      if (prev.includes(sub)) return prev.filter(s => s !== sub);
      if (prev.length >= 4) return prev; 
      return [...prev, sub];
    });
  };

  const shuffleSubTopics = () => {};
  const setCustomTopic = (topic: string) => {};

  const startQuiz = async () => {
    setStage(AppStage.LOADING_QUIZ);
    setIsTopicLoading(true);
    setErrorMsg("");

    try {
      const generatedSets = await generateQuestionsBatch(selectedSubTopics, difficulty, language, userProfile);
      if (generatedSets.length === 0) throw new Error("Failed to generate questions.");

      setQuizQueue(generatedSets);
      setCurrentQuizIndex(0);
      setupQuizStep(generatedSets[0]);
      setSessionResults([]); // Reset previous session results
      setStage(AppStage.QUIZ);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Failed to load quiz.");
      setStage(AppStage.ERROR);
    } finally {
      setIsTopicLoading(false);
    }
  };

  const setupQuizStep = (set: QuizSet) => {
    setQuestions(set.questions);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setAnswers([]);
    setIsSubmitting(false);
  };

  const selectOption = (opt: string) => {
    if(!isSubmitting) {
        setSelectedOption(opt);
        audioHaptic.playClick('hard');
    }
  };

  const confirmAnswer = () => {
    if (!selectedOption || isSubmitting) return;

    setIsSubmitting(true);
    const q = questions[currentQuestionIndex];
    const isCorrect = selectedOption === q.correctAnswer;
    
    if(isCorrect) audioHaptic.playSuccess();
    else audioHaptic.playError();

    const newAnswer: UserAnswer = {
        questionId: q.id,
        questionText: q.question,
        selectedOption: selectedOption,
        correctAnswer: q.correctAnswer,
        isCorrect
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsSubmitting(false);
        } else {
            finishTopic(updatedAnswers);
        }
    }, 1000);
  };

  const finishTopic = async (finalAnswers: UserAnswer[]) => {
    const correctCount = finalAnswers.filter(a => a.isCorrect).length;
    const score = Math.round((correctCount / finalAnswers.length) * 100);
    const currentSet = quizQueue[currentQuizIndex];

    // Profile Updates
    const newScores = { ...userProfile.scores };
    const oldScore = newScores[currentSet.topic] || 0;
    if (score > oldScore) newScores[currentSet.topic] = score;
    
    const newEloRatings = { ...userProfile.eloRatings };
    const catId = currentSet.categoryId || "GENERAL";
    const currentElo = newEloRatings[catId] || 1000;
    // Simple Elo logic: win (+15) or loss (-10) scaled by score
    // If score > 60 consider it a 'win' against current level
    const change = score >= 60 ? Math.round((score - 50)/2) : -15; 
    newEloRatings[catId] = Math.max(0, currentElo + change);

    const historyItem = {
        timestamp: Date.now(),
        topicId: currentSet.topic,
        score: score,
        aiScore: Math.min(100, score + Math.floor(Math.random() * 15)), 
        difficulty
    };
    
    const newSeenIds = [...(userProfile.seenQuestionIds || [])];
    finalAnswers.forEach(a => {
        if (!newSeenIds.includes(a.questionId)) newSeenIds.push(a.questionId);
    });

    const updatedProfile = {
        ...userProfile,
        scores: newScores,
        eloRatings: newEloRatings,
        seenQuestionIds: newSeenIds,
        history: [...(userProfile.history || []), historyItem]
    };
    
    setUserProfile(updatedProfile);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));

    // Analyze Result
    setStage(AppStage.ANALYZING);
    try {
        const result = await evaluateAnswers(
            currentSet.topic, 
            score, 
            updatedProfile, 
            language, 
            finalAnswers.map(a => ({ id: a.questionId, ok: a.isCorrect }))
        );
        
        // Ensure we preserve the ID for iconography mapping
        const resultWithId = { ...result, id: catId };

        const newSessionResults = [...sessionResults, resultWithId];
        setSessionResults(newSessionResults);
        setEvaluation(resultWithId);
        
        setStage(AppStage.RESULTS);
        audioHaptic.playLevelUp();
    } catch (e) {
        console.error(e);
        setErrorMsg("Analysis failed.");
        setStage(AppStage.ERROR);
    }
  };

  const nextTopicInQueue = () => {
    const nextIndex = currentQuizIndex + 1;
    if (nextIndex < quizQueue.length) {
        setCurrentQuizIndex(nextIndex);
        setupQuizStep(quizQueue[nextIndex]);
        setStage(AppStage.QUIZ);
    }
  };

  const resetApp = () => {
    setStage(AppStage.INTRO);
    setQuizQueue([]);
    setSessionResults([]);
  };

  // Debugs
  const startDebugQuiz = () => {
    setDifficulty(Difficulty.EASY);
    setSelectedSubTopics(["Quantum Physics"]);
    setStage(AppStage.LOADING_QUIZ);
    setTimeout(() => startQuiz(), 500);
  };
  const previewResults = () => {
     setStage(AppStage.RESULTS);
     const mock = {
         id: TOPIC_IDS.SCIENCE, title: "Quantum Physics", totalScore: 85, humanPercentile: 92,
         aiComparison: "Good", demographicPercentile: 88, demographicComment: "Top", details: []
     };
     setEvaluation(mock);
     setSessionResults([mock]);
  };
  const previewLoading = () => setStage(AppStage.LOADING_QUIZ);
  const triggerSeeding = () => seedLocalDatabase((msg) => console.log(msg));

  return {
    state: {
      stage, language, userProfile,
      topicState: {
        selectionPhase, selectedCategories, selectedSubTopics, difficulty, displayedTopics, isTopicLoading, errorMsg, userProfile
      },
      quizState: {
        questions, currentQuestionIndex, selectedOption,
        currentTopicName: quizQueue[currentQuizIndex]?.topic || "",
        batchProgress: { total: quizQueue.length, current: currentQuizIndex + 1, topics: quizQueue.map(q => q.topic) },
        isSubmitting,
        remainingTopics: quizQueue.length - 1 - currentQuizIndex,
        nextTopicName: quizQueue[currentQuizIndex + 1]?.topic
      },
      resultState: { evaluation, sessionResults, errorMsg }
    },
    actions: {
      setLanguage, goHome, startIntro, resetProfile, updateProfile, submitProfile, editProfile,
      shuffleTopics, selectCategory, proceedToSubTopics, selectSubTopic, shuffleSubTopics, setCustomTopic, setDifficulty, startQuiz, goBack,
      selectOption, confirmAnswer, nextTopicInQueue, resetApp,
      startDebugQuiz, previewResults, previewLoading, triggerSeeding
    },
    t
  };
};