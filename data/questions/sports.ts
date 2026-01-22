
import { QuizQuestion } from '../../types';

export const SPORTS_DB: Record<string, QuizQuestion[]> = {
  // --- Soccer ---
  "Soccer_EASY_en": [
    {
      id: 1201,
      question: "Which country has won the most FIFA World Cups?",
      options: ["Germany", "Brazil", "Italy", "Argentina"],
      correctAnswer: "Brazil",
      context: "Brazil has won the tournament five times."
    }
  ],
  "Soccer_EASY_ko": [
    {
      id: 1201,
      question: "FIFA 월드컵에서 가장 많이 우승한 나라는 어디입니까?",
      options: ["독일", "브라질", "이탈리아", "아르헨티나"],
      correctAnswer: "브라질",
      context: "브라질은 총 5회 우승을 기록했습니다."
    }
  ]
};
