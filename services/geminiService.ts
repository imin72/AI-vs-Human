
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { QuizQuestion, EvaluationResult, Difficulty, UserProfile, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview';

const CACHE_KEY_QUIZ = "cognito_quiz_cache_v1";
const CACHE_KEY_EVAL = "cognito_eval_cache_v1";

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

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 3000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error.message?.toLowerCase() || "";
    if (retries > 0 && (errorMsg.includes("429") || errorMsg.includes("quota"))) {
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
    const prompt = `Topic: ${topic}, Diff: ${difficulty}, Lang: ${lang}, User: ${userProfile?.ageGroup || 'General'}. JSON 5 short Qs.`;

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
    throw new Error("API_ERROR_QUIZ");
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
    // 요약된 퍼포먼스 데이터만 전송하여 토큰 절약
    const perfStr = performance.map(p => `Q${p.id}:${p.ok?'OK':'FAIL'}`).join(', ');
    const prompt = `Report on "${topic}" (Score:${score}/100). User:${userProfile.ageGroup}. Lang:${lang}. Perf:${perfStr}. JSON only. Brief & witty.`;
    
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
                  aiComment: { type: Type.STRING, description: "Max 12 words" },
                  correctFact: { type: Type.STRING, description: "Correct answer key" }
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
    throw new Error("API_ERROR_EVAL");
  }
};
