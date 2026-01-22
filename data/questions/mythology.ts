
import { QuizQuestion } from '../../types';

export const MYTHOLOGY_DB: Record<string, QuizQuestion[]> = {
  // --- Greek Mythology ---
  "Greek Mythology_MEDIUM_en": [
    {
      id: 1301,
      question: "Who is the king of the Olympian gods?",
      options: ["Poseidon", "Hades", "Zeus", "Apollo"],
      correctAnswer: "Zeus",
      context: "He rules from Mount Olympus and wields the thunderbolt."
    }
  ],
  "Greek Mythology_MEDIUM_ko": [
    {
      id: 1301,
      question: "올림포스 신들의 왕은 누구입니까?",
      options: ["포세이돈", "하데스", "제우스", "아폴론"],
      correctAnswer: "제우스",
      context: "그는 올림포스 산에서 통치하며 번개를 무기로 사용합니다."
    }
  ]
};
