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
} from '../types';
import { generateQuestionsBatch, evaluateBatchAnswers, BatchEvaluationInput, seedLocalDatabase } from '../services/geminiService';
import { audioHaptic } from '../services/audioHapticService';
import { TRANSLATIONS } from '../utils/translations';
import { useAppNavigation } from '../hooks/useAppNavigation'; 

const PROFILE_KEY = 'cognito_user_profile_v1';

// ... (DEBUG_QUIZ, shuffleArray, getBrowserLanguage 등 기존 코드 유지) ...
const DEBUG_QUIZ: QuizQuestion[] = [
    // ... 기존 내용 ...
    { id: 1, question: "Q1", options: ["A"], correctAnswer: "A", context: "" }
];
const shuffleArray = <T,>(array: T[]) => array; // 간략화 (기존 코드 사용)
const getBrowserLanguage = (): Language => 'en'; // 간략화 (기존 코드 사용)

interface AccumulatedBatchData {
  topicLabel: string;
  topicId: string;
  answers: UserAnswer[];
}

export const useGameViewModel = () => {
  // [1] 내비게이션 훅 (여기가 핵심)
  const { 
    stage, setStage, 
    selectionPhase, setSelectionPhase, 
    updateCallbacks, 
    goBack, goHome 
  } = useAppNavigation(AppStage.INTRO);

  // [2] 언어 (변경 시 리렌더링 발생 -> 내비게이션 훅의 ref가 이를 감지해야 함)
  const [language, setLanguage] = useState<Language>('en'); // 실제론 getBrowserLanguage()
  const t = useMemo(() => TRANSLATIONS[language], [language]);

  // ... (프로필, 퀴즈 상태 등 기존 코드 유지) ...
  const [userProfile, setUserProfile] = useState<UserProfile>({ 
    gender: '', ageGroup: '', nationality: '', eloRatings: {}, seenQuestionIds: [], history: []
  });
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

  // 초기화 함수
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

  // [중요] 내비게이션 훅에 최신 메시지와 콜백 전달
  useEffect(() => {
    updateCallbacks(
      () => { try { window.close(); } catch {} }, 
      resetQuizData,                              
      t.common.confirm_exit_app || "앱을 종료하시겠습니까?", // 언어별 메시지 주입
      t.common.confirm_home || "홈으로 이동하시겠습니까?"     // 언어별 메시지 주입
    );
  }, [t, updateCallbacks, resetQuizData]); // t가 바뀔 때마다 실행됨

  // ... (나머지 비즈니스 로직, useEffect, finishBatchQuiz, actions 등은 기존과 동일) ...
  // ... 생략 ...

  // 임시 반환값 (실제 코드엔 기존 로직 포함)
  return {
      state: { stage, language, userProfile, topicState: { selectionPhase, selectedCategories, selectedSubTopics, difficulty, displayedTopics, isTopicLoading: isPending }, quizState: { questions, currentQuestionIndex, userAnswers, selectedOption, remainingTopics: quizQueue.length, nextTopicName: undefined, currentTopicName: undefined, batchProgress, isSubmitting }, resultState: { evaluation, sessionResults, errorMsg } },
      actions: { 
          setLanguage: (l: Language) => { setLanguage(l); resetQuizData(); },
          goBack, goHome,
          startIntro: () => setStage(AppStage.TOPIC_SELECTION),
          editProfile: () => setStage(AppStage.PROFILE),
          resetProfile: () => {},
          updateProfile: () => {},
          submitProfile: () => setStage(AppStage.TOPIC_SELECTION),
          selectCategory: () => {},
          proceedToSubTopics: () => setSelectionPhase('SUBTOPIC'),
          selectSubTopic: () => {},
          setDifficulty: () => {},
          resetApp: resetQuizData,
          startQuiz: async () => setStage(AppStage.QUIZ),
          nextTopicInQueue: () => {},
          startDebugQuiz: () => {},
          triggerSeeding: () => {},
          previewResults: () => setStage(AppStage.RESULTS),
          previewLoading: () => {},
          selectOption: () => {},
          confirmAnswer: () => {},
          shuffleTopics: () => {},
          shuffleSubTopics: () => {},
          setCustomTopic: () => {}
      }, 
      t
  };
};