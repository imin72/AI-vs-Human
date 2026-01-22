
import { QuizQuestion } from '../../types';

export const ARTS_DB: Record<string, QuizQuestion[]> = {
  // --- Impressionism ---
  "Impressionism_MEDIUM_en": [
    {
      id: 801,
      question: "Which artist's painting 'Impression, Sunrise' gave the movement its name?",
      options: ["Claude Monet", "Pierre-Auguste Renoir", "Edouard Manet", "Edgar Degas"],
      correctAnswer: "Claude Monet",
      context: "The term was originally coined by a critic as an insult."
    },
    {
      id: 802,
      question: "Impressionist painters famously focused on the changing qualities of what?",
      options: ["Light", "Geometry", "Emotion", "History"],
      correctAnswer: "Light",
      context: "They often painted outdoors ('en plein air') to capture natural light."
    }
  ],
  "Impressionism_MEDIUM_ko": [
    {
      id: 801,
      question: "이 운동의 이름을 탄생시킨 그림 '인상, 해돋이'를 그린 화가는 누구입니까?",
      options: ["클로드 모네", "피에르 오귀스트 르누아르", "에두아르 마네", "에드가 드가"],
      correctAnswer: "클로드 모네",
      context: "원래 이 용어는 비평가가 그들의 그림을 비꼬기 위해 사용한 말에서 유래했습니다."
    },
    {
      id: 802,
      question: "인상주의 화가들은 주로 무엇의 변화하는 성질에 집중했습니까?",
      options: ["빛", "기하학", "감정", "역사"],
      correctAnswer: "빛",
      context: "그들은 자연광을 포착하기 위해 종종 야외에서 그림을 그렸습니다."
    }
  ]
};
