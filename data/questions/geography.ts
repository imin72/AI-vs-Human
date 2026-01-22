
import { QuizQuestion } from '../../types';

export const GEOGRAPHY_DB: Record<string, QuizQuestion[]> = {
  // --- Capitals ---
  "Capitals_MEDIUM_en": [
    {
      id: 701,
      question: "What is the capital city of Australia?",
      options: ["Sydney", "Melbourne", "Canberra", "Perth"],
      correctAnswer: "Canberra",
      context: "It was chosen as the capital in 1908 as a compromise between rivals Sydney and Melbourne."
    },
    {
      id: 702,
      question: "Which city is the capital of Canada?",
      options: ["Toronto", "Vancouver", "Montreal", "Ottawa"],
      correctAnswer: "Ottawa",
      context: "Queen Victoria chose Ottawa as the capital in 1857."
    },
    {
      id: 703,
      question: "What is the capital of Turkey?",
      options: ["Istanbul", "Ankara", "Izmir", "Antalya"],
      correctAnswer: "Ankara",
      context: "While Istanbul is the largest city, Ankara became the capital in 1923."
    },
    {
      id: 704,
      question: "What is the capital of Brazil?",
      options: ["Rio de Janeiro", "Sao Paulo", "Brasilia", "Salvador"],
      correctAnswer: "Brasilia",
      context: "Brasilia was a planned city built in 1960 to move the capital from Rio de Janeiro."
    },
    {
      id: 705,
      question: "Hanoi is the capital of which country?",
      options: ["Thailand", "Vietnam", "Cambodia", "Laos"],
      correctAnswer: "Vietnam",
      context: "It served as the capital of North Vietnam before the country's reunification in 1976."
    }
  ],
  "Capitals_MEDIUM_ko": [
    {
      id: 701,
      question: "호주의 수도는 어디입니까?",
      options: ["시드니", "멜버른", "캔버라", "퍼스"],
      correctAnswer: "캔버라",
      context: "시드니와 멜버른의 경쟁 끝에 1908년 두 도시 사이의 타협안으로 선정되었습니다."
    },
    {
      id: 702,
      question: "캐나다의 수도는 어디입니까?",
      options: ["토론토", "밴쿠버", "몬트리올", "오타와"],
      correctAnswer: "오타와",
      context: "1857년 빅토리아 여왕이 수도로 지정했습니다."
    },
    {
      id: 703,
      question: "튀르키예(터키)의 수도는 어디입니까?",
      options: ["이스탄불", "앙카라", "이즈미르", "안탈리아"],
      correctAnswer: "앙카라",
      context: "이스탄불이 가장 큰 도시이지만, 1923년 공화국 수립과 함께 앙카라가 수도가 되었습니다."
    },
    {
      id: 704,
      question: "브라질의 수도는 어디입니까?",
      options: ["리우데자네이루", "상파울루", "브라질리아", "살바도르"],
      correctAnswer: "브라질리아",
      context: "국토 균형 발전을 위해 1960년 리우데자네이루에서 천도한 계획도시입니다."
    },
    {
      id: 705,
      question: "하노이는 어느 나라의 수도입니까?",
      options: ["태국", "베트남", "캄보디아", "라오스"],
      correctAnswer: "베트남",
      context: "1976년 통일 전에는 북베트남의 수도였습니다."
    }
  ]
};
