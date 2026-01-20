
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { QuizQuestion, EvaluationResult, Difficulty, UserProfile, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview';

// 캐시 키 프리픽스
const CACHE_KEY_QUIZ = "cognito_quiz_cache_v1";
const CACHE_KEY_EVAL = "cognito_eval_cache_v1";

/**
 * 로컬 스토리지에서 캐시 로드
 */
const loadCache = (key: string): Record<string, any> => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.warn(`Failed to load cache for ${key}`, e);
    return {};
  }
};

/**
 * 로컬 스토리지에 캐시 저장
 */
const saveCache = (key: string, data: Record<string, any>) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to save cache for ${key}`, e);
    // 용량 부족 시 전체 초기화 (간단한 관리 전략)
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      localStorage.clear();
    }
  }
};

/**
 * 지수 백오프 기반 재시도 함수. 
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 3000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error.message?.toLowerCase() || "";
    if (retries > 0 && (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("limit"))) {
      console.warn(`API Limit reached. Retrying in ${delay}ms... (${retries} retries left)`);
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
  
  // 1. 로컬 캐시 확인
  if (quizCache[cacheKey]) {
    console.log("Using cached quiz for:", cacheKey);
    return quizCache[cacheKey];
  }

  try {
    const prompt = `Topic: ${topic}, Diff: ${difficulty}, Lang: ${lang}, Age: ${userProfile?.ageGroup || 'General'}. Return 5 Qs in JSON. Brief options.`;

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

    const cleanedText = cleanJson(response.text);
    const qs = JSON.parse(cleanedText).questions;
    
    // 2. 결과 저장
    quizCache[cacheKey] = qs;
    saveCache(CACHE_KEY_QUIZ, quizCache);
    
    return qs;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to load quiz. Please check your connection.");
  }
};

export const evaluateAnswers = async (
  topic: string, 
  score: number,
  userProfile: UserProfile,
  lang: Language
): Promise<EvaluationResult> => {
  // 결과 분석은 개인별로 다를 수 있으므로 score와 profile 정보를 조합해 키 생성
  const cacheKey = `${topic}_${score}_${lang}_${userProfile.ageGroup}`.toLowerCase();
  const evalCache = loadCache(CACHE_KEY_EVAL);

  if (evalCache[cacheKey]) {
    console.log("Using cached evaluation for:", cacheKey);
    return evalCache[cacheKey];
  }

  try {
    const prompt = `Eval "${topic}". Score: ${score}/100. Lang: ${lang}. User: ${userProfile.ageGroup}. Witty short AI report in JSON.`;
    
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalScore: { type: Type.INTEGER },
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
    
    const cleanedText = cleanJson(response.text);
    const evaluation = JSON.parse(cleanedText);
    const result = { ...evaluation, totalScore: score };
    
    // 결과 저장
    evalCache[cacheKey] = result;
    saveCache(CACHE_KEY_EVAL, evalCache);
    
    return result;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error("Analysis failed. The AI is taking a short break.");
  }
};
