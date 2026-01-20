
import { useState, useMemo } from 'react';
import { 
  AppStage, 
  Language, 
  UserProfile, 
  Difficulty, 
  QuizQuestion, 
  UserAnswer, 
  EvaluationResult,
  TOPIC_IDS
} from '../types';
import { generateQuestions, evaluateAnswers } from '../services/geminiService';
import { TRANSLATIONS } from '../utils/translations';

export const useGameViewModel = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.LANGUAGE);
  const [language, setLanguage] = useState<Language>('en');
  const [userProfile, setUserProfile] = useState<UserProfile>({ gender: '', ageGroup: '', nationality: '' });
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubTopic, setSelectedSubTopic] = useState<string>('');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPending, setIsPending] = useState(false); // API guard

  const t = TRANSLATIONS[language];

  const displayedTopics = useMemo(() => {
    return Object.entries(t.topics.categories)
      .filter(([id]) => id !== TOPIC_IDS.CUSTOM)
      .map(([id, label]) => ({ id, label }));
  }, [t]);

  const displayedSubTopics = useMemo(() => {
    if (!selectedCategory || selectedCategory === TOPIC_IDS.CUSTOM) return [];
    return t.topics.subtopics[selectedCategory] || [];
  }, [selectedCategory, t]);

  const actions = {
    setLanguage: (lang: Language) => { setLanguage(lang); setStage(AppStage.INTRO); },
    startIntro: () => setStage(AppStage.PROFILE),
    updateProfile: (profile: Partial<UserProfile>) => setUserProfile(prev => ({ ...prev, ...profile })),
    submitProfile: () => setStage(AppStage.TOPIC_SELECTION),
    selectCategory: (id: string) => {
      setSelectedCategory(id);
      setSelectedSubTopic('');
    },
    selectSubTopic: (sub: string) => setSelectedSubTopic(sub),
    setCustomTopic: (topic: string) => setCustomTopic(topic),
    setDifficulty: (diff: Difficulty) => setDifficulty(diff),
    goBack: () => {
      if (isPending) return;
      if (selectedCategory) { setSelectedCategory(''); setSelectedSubTopic(''); }
      else if (stage === AppStage.TOPIC_SELECTION) setStage(AppStage.PROFILE);
      else if (stage === AppStage.PROFILE) setStage(AppStage.INTRO);
      else if (stage === AppStage.INTRO) setStage(AppStage.LANGUAGE);
      else if (stage === AppStage.QUIZ) { if (window.confirm(t.common.confirm_exit)) setStage(AppStage.TOPIC_SELECTION); }
      else setStage(AppStage.TOPIC_SELECTION);
    },
    startQuiz: async () => {
      if (isPending) return;
      const finalTopic = selectedCategory === TOPIC_IDS.CUSTOM ? customTopic : selectedSubTopic;
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
        setErrorMsg(e.message);
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
        finishQuiz(updated);
      }
    },
    resetApp: () => { 
      setStage(AppStage.TOPIC_SELECTION);
      setEvaluation(null); 
      setUserAnswers([]); 
      setCurrentQuestionIndex(0); 
      setSelectedCategory(''); 
      setErrorMsg('');
      setIsPending(false);
    },
    shuffleTopics: () => {},
    shuffleSubTopics: () => {}
  };

  const finishQuiz = async (finalAnswers: UserAnswer[]) => {
    if (isPending) return;
    setIsPending(true);
    setStage(AppStage.ANALYZING);
    try {
      const score = Math.round((finalAnswers.filter(a => a.isCorrect).length / finalAnswers.length) * 100);
      const res = await evaluateAnswers(selectedSubTopic || customTopic, score, userProfile, language);
      setEvaluation(res);
      setStage(AppStage.RESULTS);
    } catch (e: any) {
      setErrorMsg(e.message);
      setStage(AppStage.ERROR);
    } finally {
      setIsPending(false);
    }
  };

  return {
    state: {
      stage, language, userProfile,
      topicState: { selectedCategory, selectedSubTopic, customTopic, difficulty, displayedTopics, displayedSubTopics, isTopicLoading: isPending },
      quizState: { questions, currentQuestionIndex, userAnswers, selectedOption },
      resultState: { evaluation, errorMsg }
    },
    actions, t
  };
};
