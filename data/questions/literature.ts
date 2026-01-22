
import { QuizQuestion } from '../../types';

export const LITERATURE_DB: Record<string, QuizQuestion[]> = {
  // --- Shakespeare ---
  "Shakespeare_MEDIUM_en": [
    {
      id: 1401,
      question: "To be, or not to be, that is the question' is a famous line from which play?",
      options: ["Macbeth", "Hamlet", "Romeo and Juliet", "Othello"],
      correctAnswer: "Hamlet",
      context: "Prince Hamlet speaks this line while contemplating life and death."
    }
  ],
  "Shakespeare_MEDIUM_ko": [
    {
      id: 1401,
      question: "'죽느냐 사느냐, 그것이 문제로다'는 어떤 희곡의 명대사입니까?",
      options: ["맥베스", "햄릿", "로미오와 줄리엣", "오셀로"],
      correctAnswer: "햄릿",
      context: "햄릿 왕자가 삶과 죽음 사이에서 고뇌하며 하는 독백입니다."
    }
  ]
};
