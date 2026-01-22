
import { QuizQuestion } from '../../types';

export const FOOD_DB: Record<string, QuizQuestion[]> = {
  // --- Italian Cuisine ---
  "Italian Cuisine_EASY_en": [
    {
      id: 1601,
      question: "What is the main ingredient in pesto sauce?",
      options: ["Tomato", "Basil", "Spinach", "Parsley"],
      correctAnswer: "Basil",
      context: "Traditional pesto Genovese also includes pine nuts, garlic, parmesan, and olive oil."
    }
  ],
  "Italian Cuisine_EASY_ko": [
    {
      id: 1601,
      question: "페스토 소스의 주재료는 무엇입니까?",
      options: ["토마토", "바질", "시금치", "파슬리"],
      correctAnswer: "바질",
      context: "전통적인 제노바식 페스토에는 잣, 마늘, 파마산 치즈, 올리브 오일도 들어갑니다."
    }
  ]
};
