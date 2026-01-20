import { useState, useCallback } from 'react';
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

// Defines the interface for the ViewModel to ensure strict typing for Views
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
      displayedTopics: string[];
      displayedSubTopics: string[];
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
    selectCategory: (id: string) => void;
    selectSubTopic: (sub: string) => void;
    setCustomTopic: (topic: string) => void;
    shuffleSubTopics: (category: string) => void;
    setDifficulty: (diff: Difficulty) => void;
    startQuiz: () => Promise<void>;
    selectOption: (option: string) => void;
    confirmAnswer: () => void;
    resetApp: () => void;
    goBack: () => void;
  };
  t: typeof TRANSLATIONS['en']; // Current translation object
}

export const useGameViewModel = (): GameViewModel => {
  // --- STATE ---
  const [stage, setStage] = useState<AppStage>(AppStage.LANGUAGE);
  const [language, setLanguage] = useState<Language>('en');
  
  const [userProfile, setUserProfile] = useState<UserProfile>({ gender: '', ageGroup: '' });

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubTopic, setSelectedSubTopic] = useState<string>('');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  
  const [displayedTopics, setDisplayedTopics] = useState<string[]>([]);
  const [displayedSubTopics, setDisplayedSubTopics] = useState<string[]>([]);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const t = TRANSLATIONS[language];

  // --- LOGIC HELPERS ---

  const TOPIC_KEYS_WITHOUT_CUSTOM = Object.values(TOPIC_IDS).filter(id => id !== TOPIC_IDS.CUSTOM);

  const shuffleTopics = useCallback(() => {
    const shuffled = [...TOPIC_KEYS_WITHOUT_CUSTOM].sort(() => 0.5 - Math.random());
    setDisplayedTopics(shuffled.slice(0, 4));
    setSelectedCategory('');
    setSelectedSubTopic('');
  }, []);

  const shuffleSubTopics = useCallback((category: string) => {
    if (!category || category === TOPIC_IDS.CUSTOM) return;
    const allSubtopics = t.topics.subtopics[category] || [];
    if (allSubtopics.length <= 4) {
        setDisplayedSubTopics(allSubtopics);
    } else {
        const shuffled = [...allSubtopics].sort(() => 0.5 - Math.random());
        setDisplayedSubTopics(shuffled.slice(0, 4));
    }
  }, [language, t.topics.subtopics]); // Depend on language/translation updates

  // --- ACTIONS ---

  const actions = {
    setLanguage: (lang: Language) => {
      setLanguage(lang);
      setStage(AppStage.INTRO);
    },

    startIntro: () => setStage(AppStage.PROFILE),

    updateProfile: (profile: Partial<UserProfile>) => {
      setUserProfile(prev => ({ ...prev, ...profile }));
    },

    submitProfile: () => {
      if (!userProfile.gender) setUserProfile(p => ({ ...p, gender: 'Skip' }));
      if (!userProfile.ageGroup) setUserProfile(p => ({ ...p, ageGroup: 'Skip' }));
      shuffleTopics();
      setStage(AppStage.TOPIC_SELECTION);
    },

    shuffleTopics,
    
    selectCategory: (id: string) => {
      setSelectedCategory(id);
      if (id !== TOPIC_IDS.CUSTOM) {
        shuffleSubTopics(id);
      }
    },

    selectSubTopic: (sub: string) => setSelectedSubTopic(sub),
    setCustomTopic: (topic: string) => setCustomTopic(topic),
    
    shuffleSubTopics, // Expose for refresh button
    
    setDifficulty: (diff: Difficulty) => setDifficulty(diff),

    goBack: () => {
      switch (stage) {
        case AppStage.INTRO:
          setStage(AppStage.LANGUAGE);
          break;
        case AppStage.PROFILE:
          setStage(AppStage.INTRO);
          break;
        case AppStage.TOPIC_SELECTION:
          if (selectedCategory) {
            setSelectedCategory('');
            setSelectedSubTopic('');
            setCustomTopic('');
          } else {
            setStage(AppStage.PROFILE);
          }
          break;
        case AppStage.QUIZ:
          if (window.confirm(t.common.confirm_exit)) {
            setStage(AppStage.TOPIC_SELECTION);
            setQuestions([]);
            setCurrentQuestionIndex(0);
            setUserAnswers([]);
            setSelectedOption(null);
          }
          break;
        case AppStage.RESULTS:
        case AppStage.ERROR:
          setStage(AppStage.TOPIC_SELECTION);
          setQuestions([]);
          setCurrentQuestionIndex(0);
          setUserAnswers([]);
          setSelectedOption(null);
          setEvaluation(null);
          break;
      }
    },

    startQuiz: async () => {
      let finalTopic = '';
      if (selectedCategory === TOPIC_IDS.CUSTOM) {
        finalTopic = customTopic;
      } else {
        const categoryLabel = t.topics.categories[selectedCategory];
        const subtopicLabel = selectedSubTopic || categoryLabel;
        finalTopic = subtopicLabel;
      }

      if (!finalTopic) return;

      setStage(AppStage.LOADING_QUIZ);
      setErrorMsg('');
      try {
        const qs = await generateQuestions(finalTopic, difficulty, language);
        setQuestions(qs);
        setStage(AppStage.QUIZ);
      } catch (e: any) {
        console.error("Quiz Generation Failed:", e);
        // Display the actual error message for debugging
        setErrorMsg(e.message || "Connection to AI Neural Net failed.");
        setStage(AppStage.TOPIC_SELECTION);
      }
    },

    selectOption: (option: string) => setSelectedOption(option),

    confirmAnswer: () => {
      if (!selectedOption) return;

      const question = questions[currentQuestionIndex];
      const isCorrect = selectedOption === question.correctAnswer;
      
      const newAnswers = [
        ...userAnswers,
        {
          questionId: question.id,
          questionText: question.question,
          selectedOption: selectedOption,
          correctAnswer: question.correctAnswer,
          isCorrect: isCorrect,
          answer: selectedOption 
        }
      ];
      setUserAnswers(newAnswers);
      setSelectedOption(null);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        finishQuiz(newAnswers);
      }
    },

    resetApp: () => {
      setStage(AppStage.LANGUAGE); 
      setUserProfile({ gender: '', ageGroup: '' });
      setSelectedCategory('');
      setSelectedSubTopic('');
      setCustomTopic('');
      setDifficulty(Difficulty.MEDIUM);
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setSelectedOption(null);
      setEvaluation(null);
    }
  };

  // Internal Logic
  const finishQuiz = async (finalAnswers: UserAnswer[]) => {
    setStage(AppStage.ANALYZING);
    try {
      const correctCount = finalAnswers.filter(a => a.isCorrect).length;
      const score = Math.round((correctCount / finalAnswers.length) * 100);

      const categoryLabel = t.topics.categories[selectedCategory];
      const subtopicLabel = selectedCategory === TOPIC_IDS.CUSTOM ? customTopic : (selectedSubTopic || categoryLabel);
      
      const result = await evaluateAnswers(
        subtopicLabel, 
        score, 
        finalAnswers.map(a => ({
          question: a.questionText,
          selected: a.selectedOption,
          correct: a.correctAnswer,
          isCorrect: a.isCorrect
        })),
        userProfile,
        language
      );
      
      setEvaluation(result);
      setStage(AppStage.RESULTS);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Failed to analyze results.");
      setStage(AppStage.ERROR);
    }
  };

  return {
    state: {
      stage,
      language,
      userProfile,
      topicState: {
        selectedCategory,
        selectedSubTopic,
        customTopic,
        difficulty,
        displayedTopics,
        displayedSubTopics
      },
      quizState: {
        questions,
        currentQuestionIndex,
        userAnswers,
        selectedOption
      },
      resultState: {
        evaluation,
        errorMsg
      }
    },
    actions,
    t
  };
};