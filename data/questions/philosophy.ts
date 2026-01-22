
import { QuizQuestion } from '../../types';

export const PHILOSOPHY_DB: Record<string, QuizQuestion[]> = {
  // --- Stoicism ---
  "Stoicism_MEDIUM_en": [
    {
      id: 1801,
      question: "Which Roman Emperor was also a famous Stoic philosopher?",
      options: ["Nero", "Augustus", "Marcus Aurelius", "Caligula"],
      correctAnswer: "Marcus Aurelius",
      context: "His work 'Meditations' is a significant source of modern understanding of ancient Stoic philosophy."
    }
  ],
  "Stoicism_MEDIUM_ko": [
    {
      id: 1801,
      question: "유명한 스토아 철학자이기도 했던 로마 황제는 누구입니까?",
      options: ["네로", "아우구스투스", "마르쿠스 아우렐리우스", "칼리굴라"],
      correctAnswer: "마르쿠스 아우렐리우스",
      context: "그의 저서 '명상록'은 고대 스토아 철학을 이해하는 데 중요한 자료입니다."
    }
  ]
};
