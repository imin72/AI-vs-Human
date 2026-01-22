
import { QuizQuestion } from '../../types';

export const MOVIES_DB: Record<string, QuizQuestion[]> = {
  // --- Marvel Cinematic Universe ---
  "Marvel Cinematic Universe_EASY_en": [
    {
      id: 601,
      question: "Which movie kicked off the Marvel Cinematic Universe in 2008?",
      options: ["The Incredible Hulk", "Iron Man", "Captain America: The First Avenger", "Thor"],
      correctAnswer: "Iron Man",
      context: "It starred Robert Downey Jr. and ended with Nick Fury discussing the 'Avenger Initiative'."
    },
    {
      id: 602,
      question: "What is the name of Thor's hammer?",
      options: ["Stormbreaker", "Mjolnir", "Gungnir", "Aegis"],
      correctAnswer: "Mjolnir",
      context: "Whosoever holds this hammer, if he be worthy, shall possess the power of Thor."
    },
    {
      id: 603,
      question: "Where is Black Panther from?",
      options: ["Wakanda", "Zamunda", "Genosha", "Latveria"],
      correctAnswer: "Wakanda",
      context: "A technologically advanced African nation hidden from the world."
    },
    {
      id: 604,
      question: "Who is the main villain in 'Avengers: Infinity War'?",
      options: ["Loki", "Ultron", "Thanos", "Red Skull"],
      correctAnswer: "Thanos",
      context: "He sought to collect all six Infinity Stones to wipe out half of all life."
    },
    {
      id: 605,
      question: "What is Captain America's shield made of?",
      options: ["Adamantium", "Vibranium", "Titanium", "Carbonadium"],
      correctAnswer: "Vibranium",
      context: "It is a rare metal found almost exclusively in Wakanda."
    }
  ],
  "Marvel Cinematic Universe_EASY_ko": [
    {
      id: 601,
      question: "2008년 개봉하여 마블 시네마틱 유니버스(MCU)의 시작을 알린 영화는?",
      options: ["인크레더블 헐크", "아이언맨", "캡틴 아메리카", "토르"],
      correctAnswer: "아이언맨",
      context: "로버트 다우니 주니어가 주연을 맡았으며, 쿠키 영상에서 닉 퓨리가 처음 등장합니다."
    },
    {
      id: 602,
      question: "토르가 사용하는 망치의 이름은 무엇입니까?",
      options: ["스톰브레이커", "묠니르", "궁니르", "이지스"],
      correctAnswer: "묠니르",
      context: "고결한 자만이 이 망치를 들고 토르의 힘을 얻을 수 있습니다."
    },
    {
      id: 603,
      question: "블랙 팬서의 고향인 가상의 아프리카 국가는?",
      options: ["와칸다", "자문다", "제노샤", "라트베리아"],
      correctAnswer: "와칸다",
      context: "비브라늄을 기반으로 한 초고도 문명을 이룩했지만 외부에는 빈국으로 위장하고 있었습니다."
    },
    {
      id: 604,
      question: "'어벤져스: 인피니티 워'의 메인 빌런은 누구입니까?",
      options: ["로키", "울트론", "타노스", "레드 스컬"],
      correctAnswer: "타노스",
      context: "인피니티 스톤 6개를 모아 우주 생명체의 절반을 없애려 했습니다."
    },
    {
      id: 605,
      question: "캡틴 아메리카의 방패는 어떤 금속으로 만들어졌습니까?",
      options: ["아다만티움", "비브라늄", "티타늄", "카보나디움"],
      correctAnswer: "비브라늄",
      context: "충격을 완벽하게 흡수하는 금속으로, 주로 와칸다에서 채굴됩니다."
    }
  ]
};
