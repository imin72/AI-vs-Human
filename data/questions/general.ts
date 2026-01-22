
import { QuizQuestion } from '../../types';

export const GENERAL_DB: Record<string, QuizQuestion[]> = {
  // --- Inventions ---
  "Inventions_MEDIUM_en": [
    {
      id: 901,
      question: "Who is credited with inventing the World Wide Web?",
      options: ["Bill Gates", "Tim Berners-Lee", "Steve Jobs", "Al Gore"],
      correctAnswer: "Tim Berners-Lee",
      context: "He implemented the first successful communication between a Hypertext Transfer Protocol (HTTP) client and server."
    }
  ],
  "Inventions_MEDIUM_ko": [
    {
      id: 901,
      question: "월드 와이드 웹(WWW)을 창시한 사람은 누구입니까?",
      options: ["빌 게이츠", "팀 버너스 리", "스티브 잡스", "앨 고어"],
      correctAnswer: "팀 버너스 리",
      context: "그는 1989년 유럽 입자 물리 연구소(CERN)에서 정보 공유를 위해 웹을 제안했습니다."
    }
  ]
};
