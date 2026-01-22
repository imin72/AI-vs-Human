
import { QuizQuestion } from '../../types';

export const NATURE_DB: Record<string, QuizQuestion[]> = {
  // --- Mammals ---
  "Mammals_EASY_en": [
    {
      id: 1501,
      question: "What is the largest mammal on Earth?",
      options: ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
      correctAnswer: "Blue Whale",
      context: "It can weigh as much as 200 tons."
    }
  ],
  "Mammals_EASY_ko": [
    {
      id: 1501,
      question: "지구상에서 가장 큰 포유류는 무엇입니까?",
      options: ["아프리카 코끼리", "대왕고래 (흰수염고래)", "기린", "하마"],
      correctAnswer: "대왕고래 (흰수염고래)",
      context: "몸무게가 최대 200톤에 달할 수 있습니다."
    }
  ]
};
