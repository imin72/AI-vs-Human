
import { QuizQuestion } from '../../types';

export const MUSIC_DB: Record<string, QuizQuestion[]> = {
  // --- Pop Music ---
  "Pop Music_EASY_en": [
    {
      id: 1001,
      question: "Who is known as the 'King of Pop'?",
      options: ["Elvis Presley", "Michael Jackson", "Prince", "Justin Timberlake"],
      correctAnswer: "Michael Jackson",
      context: "His album 'Thriller' is the best-selling album of all time."
    }
  ],
  "Pop Music_EASY_ko": [
    {
      id: 1001,
      question: "'팝의 황제'라고 불리는 가수는 누구입니까?",
      options: ["엘비스 프레슬리", "마이클 잭슨", "프린스", "저스틴 팀버레이크"],
      correctAnswer: "마이클 잭슨",
      context: "그의 앨범 'Thriller'는 역사상 가장 많이 팔린 앨범입니다."
    }
  ]
};
