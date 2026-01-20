
export enum AppStage {
  LANGUAGE = 'LANGUAGE',
  INTRO = 'INTRO',
  PROFILE = 'PROFILE',
  TOPIC_SELECTION = 'TOPIC_SELECTION',
  LOADING_QUIZ = 'LOADING_QUIZ',
  QUIZ = 'QUIZ',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export type Language = 'en' | 'ko' | 'ja' | 'es';

export enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD"
}

export interface UserProfile {
  gender: string;
  ageGroup: string;
  nationality: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  context?: string; 
}

export interface UserAnswer {
  questionId: number;
  questionText: string;
  selectedOption: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface EvaluationItem {
  questionId: number;
  isCorrect: boolean;
  aiComment: string;
  correctFact: string;
}

export interface EvaluationResult {
  totalScore: number;
  humanPercentile: number;
  aiComparison: string;
  demographicPercentile: number;
  demographicComment: string;
  details: EvaluationItem[];
  title: string;
}

export const TOPIC_IDS = {
  HISTORY: "History",
  SCIENCE: "Science",
  ARTS: "Arts",
  GENERAL: "General",
  GEOGRAPHY: "Geography",
  MOVIES: "Movies",
  MUSIC: "Music",
  GAMING: "Gaming",
  SPORTS: "Sports",
  TECH: "Tech",
  MYTHOLOGY: "Mythology",
  LITERATURE: "Literature",
  NATURE: "Nature",
  FOOD: "Food",
  SPACE: "Space",
  PHILOSOPHY: "Philosophy",
  CUSTOM: "Custom"
};
