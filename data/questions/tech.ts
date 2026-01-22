
import { QuizQuestion } from '../../types';

export const TECH_DB: Record<string, QuizQuestion[]> = {
  // --- Artificial Intelligence ---
  "Artificial Intelligence_MEDIUM_en": [
    {
      id: 401,
      question: "What refers to the ability of an AI to interpret and generate human language?",
      options: ["Computer Vision", "NLP (Natural Language Processing)", "Reinforcement Learning", "Robotics"],
      correctAnswer: "NLP (Natural Language Processing)",
      context: "NLP combines computational linguistics with statistical, machine learning, and deep learning models."
    },
    {
      id: 402,
      question: "Which test was proposed in 1950 to assess a machine's ability to exhibit intelligent behavior?",
      options: ["Voight-Kampff Test", "Turing Test", "Rorschach Test", "Mirror Test"],
      correctAnswer: "Turing Test",
      context: "Alan Turing originally called it the 'Imitation Game'."
    },
    {
      id: 403,
      question: "What is the term for an AI system designed to perform a specific task, like playing chess?",
      options: ["AGI (Artificial General Intelligence)", "ANI (Artificial Narrow Intelligence)", "ASI (Artificial Super Intelligence)", "Singularity"],
      correctAnswer: "ANI (Artificial Narrow Intelligence)",
      context: "Most AI today, including Siri and AlphaGo, falls under the category of Narrow AI."
    },
    {
      id: 404,
      question: "In machine learning, what is 'Overfitting'?",
      options: ["When the model is too slow", "When the model learns the training data too well, including noise", "When the dataset is too large", "When the computer overheats"],
      correctAnswer: "When the model learns the training data too well, including noise",
      context: "An overfitted model performs poorly on new, unseen data because it memorized the training set instead of learning patterns."
    },
    {
      id: 405,
      question: "Who developed the AI program 'AlphaGo' that defeated Lee Sedol?",
      options: ["OpenAI", "DeepMind", "IBM", "Boston Dynamics"],
      correctAnswer: "DeepMind",
      context: "Google DeepMind's victory in 2016 was a landmark moment for AI, as Go was considered too complex for computers."
    }
  ],
  "Artificial Intelligence_MEDIUM_ko": [
    {
      id: 401,
      question: "AI가 인간의 언어를 이해하고 생성하는 능력을 다루는 분야는 무엇입니까?",
      options: ["컴퓨터 비전", "자연어 처리 (NLP)", "강화 학습", "로보틱스"],
      correctAnswer: "자연어 처리 (NLP)",
      context: "NLP는 컴퓨터 언어학과 통계적 모델링을 결합하여 인간의 언어를 처리합니다."
    },
    {
      id: 402,
      question: "1950년에 제안된 것으로, 기계가 인간과 구별할 수 없는 지적 행동을 할 수 있는지 판별하는 테스트는?",
      options: ["보이트-캄프 테스트", "튜링 테스트", "로르샤흐 테스트", "거울 테스트"],
      correctAnswer: "튜링 테스트",
      context: "앨런 튜링은 이를 '이미테이션 게임'이라고 불렀습니다."
    },
    {
      id: 403,
      question: "체스나 바둑처럼 특정 작업만 수행하도록 설계된 AI를 무엇이라 합니까?",
      options: ["인공 일반 지능 (AGI)", "약인공지능 (ANI)", "초인공지능 (ASI)", "특이점"],
      correctAnswer: "약인공지능 (ANI)",
      context: "현재 우리가 접하는 대부분의 AI(시리, 알파고 등)는 약인공지능에 해당합니다."
    },
    {
      id: 404,
      question: "머신러닝에서 모델이 학습 데이터를 지나치게 과하게 학습하여 새로운 데이터에 대한 예측력이 떨어지는 현상은?",
      options: ["과소적합 (Underfitting)", "과적합 (Overfitting)", "정규화 (Normalization)", "최적화 (Optimization)"],
      correctAnswer: "과적합 (Overfitting)",
      context: "모델이 데이터의 패턴이 아닌 노이즈까지 암기해버린 상태를 말합니다."
    },
    {
      id: 405,
      question: "이세돌 9단을 꺾은 AI '알파고'를 개발한 회사는 어디입니까?",
      options: ["OpenAI", "DeepMind", "IBM", "Boston Dynamics"],
      correctAnswer: "DeepMind",
      context: "구글 딥마인드의 알파고는 2016년 바둑 대결에서 승리하며 전 세계에 충격을 주었습니다."
    }
  ],

  // --- Coding ---
  "Coding_MEDIUM_en": [
    {
      id: 501,
      question: "Which programming language is known as the 'language of the web'?",
      options: ["Java", "Python", "JavaScript", "C++"],
      correctAnswer: "JavaScript",
      context: "It is the only language that runs natively in all major web browsers."
    },
    {
      id: 502,
      question: "What does HTML stand for?",
      options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlinks and Text Management Language", "Home Tool Markup Language"],
      correctAnswer: "Hyper Text Markup Language",
      context: "HTML provides the basic structure of sites, which is then enhanced by CSS and JavaScript."
    },
    {
      id: 503,
      question: "In programming, what is a 'Bug'?",
      options: ["A feature", "An error or flaw in the code", "A type of virus", "A hardware malfunction"],
      correctAnswer: "An error or flaw in the code",
      context: "The term was popularized by Grace Hopper when a real moth was found inside a computer relay."
    },
    {
      id: 504,
      question: "Which data structure operates on a Last-In, First-Out (LIFO) principle?",
      options: ["Queue", "Stack", "Array", "Linked List"],
      correctAnswer: "Stack",
      context: "Think of a stack of plates; you add to the top and remove from the top."
    },
    {
      id: 505,
      question: "What is the primary function of SQL?",
      options: ["Designing websites", "Managing and querying databases", "Creating 3D graphics", "Operating systems"],
      correctAnswer: "Managing and querying databases",
      context: "SQL stands for Structured Query Language."
    }
  ],
  "Coding_MEDIUM_ko": [
    {
      id: 501,
      question: "'웹의 언어'라고 불리며 브라우저에서 실행되는 유일한 프로그래밍 언어는 무엇입니까?",
      options: ["Java", "Python", "JavaScript", "C++"],
      correctAnswer: "JavaScript",
      context: "초기에는 간단한 스크립트 언어였으나, 현재는 프론트엔드와 백엔드 모두에서 사용됩니다."
    },
    {
      id: 502,
      question: "HTML의 약자는 무엇입니까?",
      options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlinks and Text Management Language", "Home Tool Markup Language"],
      correctAnswer: "Hyper Text Markup Language",
      context: "HTML은 웹 페이지의 구조와 내용을 정의하는 마크업 언어입니다."
    },
    {
      id: 503,
      question: "프로그래밍에서 '버그(Bug)'란 무엇을 의미합니까?",
      options: ["숨겨진 기능", "코드의 오류나 결함", "컴퓨터 바이러스", "하드웨어 고장"],
      correctAnswer: "코드의 오류나 결함",
      context: "최초의 프로그래머 중 한 명인 그레이스 호퍼가 컴퓨터 릴레이 사이에 낀 나방을 발견한 데서 유래했습니다."
    },
    {
      id: 504,
      question: "나중에 들어온 데이터가 먼저 나가는 LIFO(후입선출) 방식의 자료구조는?",
      options: ["큐 (Queue)", "스택 (Stack)", "배열 (Array)", "연결 리스트 (Linked List)"],
      correctAnswer: "스택 (Stack)",
      context: "웹 브라우저의 '뒤로 가기' 기능이 스택의 대표적인 예입니다."
    },
    {
      id: 505,
      question: "Git은 무엇을 위한 도구입니까?",
      options: ["데이터베이스 관리", "버전 관리 시스템 (VCS)", "이미지 편집", "코드 컴파일"],
      correctAnswer: "버전 관리 시스템 (VCS)",
      context: "리누스 토르발스가 리눅스 커널 개발을 위해 만들었으며, 현재 전 세계 개발자의 표준 도구입니다."
    }
  ]
};
