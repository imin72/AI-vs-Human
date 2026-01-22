
import { QuizQuestion } from '../../types';

export const SPACE_DB: Record<string, QuizQuestion[]> = {
  // --- Solar System ---
  "Solar System_EASY_en": [
    {
      id: 1701,
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Jupiter", "Mars", "Saturn"],
      correctAnswer: "Mars",
      context: "The iron oxide prevalent on its surface gives it a reddish appearance."
    }
  ],
  "Solar System_EASY_ko": [
    {
      id: 1701,
      question: "'붉은 행성'이라고 불리는 행성은 무엇입니까?",
      options: ["금성", "목성", "화성", "토성"],
      correctAnswer: "화성",
      context: "표면에 널리 퍼진 산화철 때문에 붉게 보입니다."
    }
  ]
};
