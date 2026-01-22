
import { QuizQuestion } from '../../types';

export const GAMING_DB: Record<string, QuizQuestion[]> = {
  // --- Nintendo ---
  "Nintendo_EASY_en": [
    {
      id: 1101,
      question: "What is the name of Mario's brother?",
      options: ["Wario", "Luigi", "Yoshi", "Toad"],
      correctAnswer: "Luigi",
      context: "Luigi famously wears green, contrasting with Mario's red."
    }
  ],
  "Nintendo_EASY_ko": [
    {
      id: 1101,
      question: "마리오의 동생 이름은 무엇입니까?",
      options: ["와리오", "루이지", "요시", "키노피오"],
      correctAnswer: "루이지",
      context: "마리오의 빨간색과 대비되는 초록색 옷을 입습니다."
    }
  ]
};
