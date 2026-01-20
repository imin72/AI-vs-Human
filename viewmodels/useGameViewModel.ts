
import { useState, useCallback } from 'react';
import { 
  AppStage, 
  Language, 
  UserProfile, 
  Difficulty, 
  QuizQuestion, 
  UserAnswer, 
  EvaluationResult
} from '../types';
import { generateQuestions, evaluateAnswers, generateLocalizedTopics, generateLocalizedSubtopics } from '../services/geminiService';
import { TRANSLATIONS } from '../utils/translations';

export interface GameViewModel {
  state: {
    stage: AppStage;
    language: Language;
    userProfile: UserProfile;
    topicState: {
      selectedCategory: string;
      selectedSubTopic: string;
      customTopic: string;
      difficulty: Difficulty;
      displayedTopics: {id: string, label: string}[];
      displayedSubTopics: string[];
      isTopicLoading: boolean;
    };
    quizState: {
      questions: QuizQuestion[];
      currentQuestionIndex: number;
      userAnswers: UserAnswer[];
      selectedOption: string | null;
    };
    resultState: {
      evaluation: EvaluationResult | null;
      errorMsg: string;
    };
  };
  actions: {
    setLanguage: (lang: Language) => void;
    startIntro: () => void;
    updateProfile: (profile: Partial<UserProfile>) => void;
    submitProfile: () => void;
    shuffleTopics: () => void;
    selectCategory: (id: string, label: string) => void;
    selectSubTopic: (sub: string) => void;
    setCustomTopic: (topic: string) => void;
    shuffleSubTopics: (categoryLabel: string) => void;
    setDifficulty: (diff: Difficulty) => void;
    startQuiz: () => Promise<void>;
    selectOption: (option: string) => void;
    confirmAnswer: () => void;
    resetApp: () => void;
    goBack: () => void;
  };
  t: typeof TRANSLATIONS['en'];
}

export const useGameViewModel = (): GameViewModel => {
  const [stage, setStage] = useState<AppStage>(AppStage.LANGUAGE);
  const [language, setLanguage] = useState<Language>('en');
  const [userProfile, setUserProfile] = useState<UserProfile>({ gender: '', ageGroup: '', nationality: '' });
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubTopic, setSelectedSubTopic] = useState<string>('');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [displayedTopics, setDisplayedTopics] = useState<{id: string, label: string}[]>([]);
  const [displayedSubTopics, setDisplayedSubTopics] = useState<string[]>([]);
  const [isTopicLoading, setIsTopicLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const t = TRANSLATIONS[language];

  const fetchLocalizedTopics = useCallback(async () => {
    setIsTopicLoading(true);
    try {
      const data = await generateLocalizedTopics(userProfile, language);
      setDisplayedTopics(data.categories);
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to generate topics.");
    } finally {
      setIsTopicLoading(false);
    }
  }, [userProfile, language]);

  const fetchLocalizedSubtopics = useCallback(async (label: string) => {
    setIsTopicLoading(true);
    try {
      const data = await generateLocalizedSubtopics(label, userProfile, language);
      setDisplayedSubTopics(data.subtopics);
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to generate subtopics.");
    } finally {
      setIsTopicLoading(false);
    }
  }, [userProfile, language]);

  const actions = {
    setLanguage: (lang: Language) => { setLanguage(lang); setStage(AppStage.INTRO); },
    startIntro: () => setStage(AppStage.PROFILE),
    updateProfile: (profile: Partial<UserProfile>) => setUserProfile(prev => ({ ...prev, ...profile })),
    submitProfile: () => {
      fetchLocalizedTopics();
      setStage(AppStage.TOPIC_SELECTION);
    },
    shuffleTopics: fetchLocalizedTopics,
    selectCategory: (id: string, label: string) => {
      setSelectedCategory(id);
      setSelectedSubTopic('');
      if (id !== 'Custom') {
        fetchLocalizedSubtopics(label);
      }
    },
    selectSubTopic: (sub: string) => setSelectedSubTopic(sub),
    setCustomTopic: (topic: string) => setCustomTopic(topic),
    shuffleSubTopics: (label: string) => fetchLocalizedSubtopics(label),
    setDifficulty: (diff: Difficulty) => setDifficulty(diff),
    goBack: () => {
      if (selectedCategory) { 
        setSelectedCategory(''); 
        setSelectedSubTopic(''); 
      }
      else if (stage === AppStage.TOPIC_SELECTION) setStage(AppStage.PROFILE);
      else if (stage === AppStage.PROFILE) setStage(AppStage.INTRO);
      else if (stage === AppStage.INTRO) setStage(AppStage.LANGUAGE);
      else if (stage === AppStage.QUIZ) { if (window.confirm(t.common.confirm_exit)) setStage(AppStage.TOPIC_SELECTION); }
      else setStage(AppStage.TOPIC_SELECTION);
    },
    startQuiz: async () => {
      const finalTopic = selectedCategory === 'Custom' ? customTopic : selectedSubTopic;
      if (!finalTopic) return;
      setStage(AppStage.LOADING_QUIZ);
      try {
        const qs = await generateQuestions(finalTopic, difficulty, language, userProfile);
        setQuestions(qs);
        setStage(AppStage.QUIZ);
      } catch (e: any) {
        setErrorMsg(e.message);
        setStage(AppStage.TOPIC_SELECTION);
      }
    },
    selectOption: (option: string) => setSelectedOption(option),
    confirmAnswer: () => {
      if (!selectedOption) return;
      const question = questions[currentQuestionIndex];
      const answer = { questionId: question.id, questionText: question.question, selectedOption, correctAnswer: question.correctAnswer, isCorrect: selectedOption === question.correctAnswer };
      const updated = [...userAnswers, answer];
      setUserAnswers(updated);
      setSelectedOption(null);
      if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1);
      else finishQuiz(updated);
    },
    resetApp: () => { 
      setStage(AppStage.LANGUAGE); 
      setUserProfile({ gender: '', ageGroup: '', nationality: '' }); 
      setEvaluation(null); 
      setUserAnswers([]); 
      setCurrentQuestionIndex(0); 
      setSelectedCategory(''); 
    }
  };

  const finishQuiz = async (finalAnswers: UserAnswer[]) => {
    setStage(AppStage.ANALYZING);
    try {
      const score = Math.round((finalAnswers.filter(a => a.isCorrect).length / finalAnswers.length) * 100);
      const res = await evaluateAnswers(selectedSubTopic || customTopic, score, finalAnswers, userProfile, language);
      setEvaluation(res);
      setStage(AppStage.RESULTS);
    } catch (e: any) {
      setErrorMsg(e.message);
      setStage(AppStage.ERROR);
    }
  };

  return {
    state: {
      stage, language, userProfile,
      topicState: { selectedCategory, selectedSubTopic, customTopic, difficulty, displayedTopics, displayedSubTopics, isTopicLoading },
      quizState: { questions, currentQuestionIndex, userAnswers, selectedOption },
      resultState: { evaluation, errorMsg }
    },
    actions, t
  };
};
