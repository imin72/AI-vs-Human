
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { QuizQuestion, EvaluationResult, Difficulty, UserProfile, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview';

const CACHE_KEY_QUIZ = "cognito_quiz_cache_v1";
const CACHE_KEY_EVAL = "cognito_eval_cache_v1";

// 비상용 폴백 퀴즈 (API 장애 발생 시 제공)
const FALLBACK_QUIZ: QuizQuestion[] = [
  { id: 1, question: "Which is not a characteristic of Human Intelligence?", options: ["Emotional Intuition", "Pattern Recognition", "Finite Biological Memory", "Infinite Electricity Consumption"], correctAnswer: "Infinite Electricity Consumption", context: "AI uses vast amounts of electricity compared to the human brain." },
  { id: 2, question: "What is the Turing Test designed to determine?", options: ["CPU Speed", "AI's ability to exhibit human-like behavior", "Battery life", "Internet connectivity"], correctAnswer: "AI's ability to exhibit human-like behavior" },
  { id: 3, question: "Which field is Cognito Protocol measuring?", options: ["Weightlifting", "Battle of Wits vs AI", "Cooking speed", "Running endurance"], correctAnswer: "Battle of Wits vs AI" },
  { id: 4, question: "In AI terminology, what does 'LLM' stand for?", options: ["Light Level Monitor", "Large Language Model", "Long Logic Mode", "Lunar Landing Module"], correctAnswer: "Large Language Model" },
  { id: 5, question: "Who is often called the father of Computer Science?", options: ["Alan Turing", "Steve Jobs", "Elon Musk", "Thomas Edison"], correctAnswer: "Alan Turing" }
];

const loadCache = (key: string): Record<string, any> => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
};

const saveCache = (key: string, data: Record<string, any>) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError')) {
      localStorage.clear();
    }
  }
};

async function withRetry<T>(fn: () => Promise<T>, retries = 1, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error.message?.toLowerCase() || "";
    if (retries > 0 && (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("failed to fetch"))) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

const cleanJson = (text: string | undefined): string => {
  if (!text) return "";
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text.trim();
};

export const generateQuestions = async (
  topic: string, 
  difficulty: Difficulty, 
  lang: Language,
  userProfile?: UserProfile
): Promise<QuizQuestion[]> => {
  const cacheKey = `${topic}_${difficulty}_${lang}`.toLowerCase();
  const quizCache = loadCache(CACHE_KEY_QUIZ);
  if (quizCache[cacheKey]) return quizCache[cacheKey];

  try {
    const prompt = `Topic: ${topic}, Diff: ${difficulty}, Lang: ${lang}, User: ${userProfile?.ageGroup || 'General'}. JSON 5 short Qs. Accuracy 100%.`;

    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  context: { type: Type.STRING }
                },
                required: ["id", "question", "options", "correctAnswer"]
              }
            }
          }
        }
      }
    }));

    const qs = JSON.parse(cleanJson(response.text)).questions;
    quizCache[cacheKey] = qs;
    saveCache(CACHE_KEY_QUIZ, quizCache);
    return qs;
  } catch (error) {
    console.error("Quiz Generation Failed:", error);
    // 폴백 퀴즈 제공 (완전한 중단 방지)
    return FALLBACK_QUIZ;
  }
};

export const evaluateAnswers = async (
  topic: string, 
  score: number,
  userProfile: UserProfile,
  lang: Language,
  performance: {id: number, ok: boolean}[]
): Promise<EvaluationResult> => {
  const cacheKey = `${topic}_${score}_${lang}_${userProfile.ageGroup}_p${performance.map(p=>p.ok?1:0).join('')}`.toLowerCase();
  const evalCache = loadCache(CACHE_KEY_EVAL);
  if (evalCache[cacheKey]) return evalCache[cacheKey];

  try {
    const perfStr = performance.map(p => `Q${p.id}:${p.ok?'OK':'FAIL'}`).join(', ');
    const prompt = `Witty report on "${topic}" (Score:${score}/100). User:${userProfile.ageGroup}. Lang:${lang}. Perf:${perfStr}. JSON only. Max 100 words total.`;
    
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            humanPercentile: { type: Type.INTEGER },
            demographicPercentile: { type: Type.INTEGER },
            demographicComment: { type: Type.STRING },
            aiComparison: { type: Type.STRING },
            title: { type: Type.STRING },
            details: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionId: { type: Type.INTEGER },
                  isCorrect: { type: Type.BOOLEAN },
                  aiComment: { type: Type.STRING },
                  correctFact: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    }));
    
    const result = JSON.parse(cleanJson(response.text));
    evalCache[cacheKey] = result;
    saveCache(CACHE_KEY_EVAL, evalCache);
    return result;
  } catch (error) {
    // 분석 실패 시 기본 리포트 반환
    return {
      totalScore: score,
      humanPercentile: score,
      demographicPercentile: score,
      demographicComment: "Cognito server is temporarily offline. Your score is processed locally.",
      aiComparison: "Human intelligence is stable; AI is currently recalibrating.",
      title: "Local Analysis Mode",
      details: performance.map(p => ({
        questionId: p.id,
        isCorrect: p.ok,
        aiComment: "Local analysis available.",
        correctFact: "N/A"
      }))
    };
  }
};
