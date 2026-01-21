
import { useState, useMemo } from 'react';
import { 
  AppStage, 
  Language, 
  UserProfile, 
  Difficulty, 
  QuizQuestion, 
  UserAnswer, 
  EvaluationResult
} from '../types';
import { generateQuestions, evaluateAnswers } from '../services/geminiService';
import { TRANSLATIONS } from '../utils/translations';

export const useGameViewModel = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.LANGUAGE);
  const [language, setLanguage] = useState<Language>('en');
  const [userProfile, setUserProfile] = useState<UserProfile>({ gender: '', ageGroup: '', nationality: '' });
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubTopic, setSelectedSubTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPending, setIsPending] = useState(false);

  const t = useMemo(() => TRANSLATIONS[language], [language]);

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
      
      const performanceSummary = finalAnswers.map(a => ({
        id: a.questionId,
        ok: a.isCorrect
      }));

      const res = await evaluateAnswers(currentTopic, score, profile, lang, performanceSummary);
      setEvaluation({ ...res, totalScore: score });
      setStage(AppStage.RESULTS);
    } catch (e: any) {
      setErrorMsg(e.message || "Unknown analysis error");
      setStage(AppStage.ERROR);
    } finally {
      setIsPending(false);
    }
  };

  const actions = useMemo(() => ({
    setLanguage: (lang: Language) => { 
      setLanguage(lang); 
      setStage(AppStage.INTRO); 
    },
    startIntro: () => setStage(AppStage.PROFILE),
    updateProfile: (profile: Partial<UserProfile>) => setUserProfile(prev => ({ ...prev, ...profile })),
    submitProfile: () => setStage(AppStage.TOPIC_SELECTION),
    selectCategory: (id: string) => {
      setSelectedCategory(id);
      setSelectedSubTopic('');
    },
    selectSubTopic: (sub: string) => setSelectedSubTopic(sub),
    setDifficulty: (diff: Difficulty) => setDifficulty(diff),
    goBack: () => {
      if (isPending) return;

      if (selectedCategory && stage === AppStage.TOPIC_SELECTION) { 
        setSelectedCategory(''); 
        setSelectedSubTopic(''); 
        return;
      }
      
      switch (stage) {
        case AppStage.TOPIC_SELECTION:
          setStage(AppStage.PROFILE);
          break;
        case AppStage.PROFILE:
          setStage(AppStage.INTRO);
          break;
        case AppStage.INTRO:
          setStage(AppStage.LANGUAGE);
          break;
        case AppStage.QUIZ:
          if (window.confirm(t.common.confirm_exit)) {
            setStage(AppStage.TOPIC_SELECTION);
          }
          break;
        case AppStage.RESULTS:
        case AppStage.ERROR:
          setStage(AppStage.TOPIC_SELECTION);
          break;
        default:
          setStage(AppStage.LANGUAGE);
          break;
      }
    },
    startQuiz: async () => {
      if (isPending) return;
      const finalTopic = selectedSubTopic;
      if (!finalTopic) return;
      
      setIsPending(true);
      setStage(AppStage.LOADING_QUIZ);
      try {
        const qs = await generateQuestions(finalTopic, difficulty, language, userProfile);
        setQuestions(qs);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setStage(AppStage.QUIZ);
      } catch (e: any) {
        setErrorMsg(e.message || "Failed to initialize protocol");
        setStage(AppStage.ERROR);
      } finally {
        setIsPending(false);
      }
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
        const currentTopic = selectedSubTopic;
        finishQuiz(updated, currentTopic, userProfile, language);
      }
    },
    resetApp: () => { 
      setStage(AppStage.TOPIC_SELECTION);
      setEvaluation(null); 
      setUserAnswers([]); 
      setCurrentQuestionIndex(0); 
      setSelectedCategory(''); 
      setSelectedSubTopic('');
      setErrorMsg('');
      setIsPending(false);
    },
    shuffleTopics: () => {},
    shuffleSubTopics: () => {},
    setCustomTopic: (_topic: string) => {}
  }), [isPending, stage, selectedCategory, selectedSubTopic, difficulty, language, userProfile, questions, currentQuestionIndex, userAnswers, selectedOption, t]);

  return {
    state: {
      stage, language, userProfile,
      topicState: { selectedCategory, selectedSubTopic, difficulty, displayedTopics, displayedSubTopics, isTopicLoading: isPending },
      quizState: { questions, currentQuestionIndex, userAnswers, selectedOption },
      resultState: { evaluation, errorMsg }
    },
    actions, t
  };
};
