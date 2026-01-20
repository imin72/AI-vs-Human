
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { QuizQuestion, EvaluationResult, Difficulty, UserProfile, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview';

// 인메모리 캐시 저장소
const quizCache: Record<string, QuizQuestion[]> = {};
const evalCache: Record<string, EvaluationResult> = {};

async function withRetry<T>(fn: () => Promise<T>, retries = 1, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.message?.includes("429") || error.message?.toLowerCase().includes("quota"))) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

const cleanJson = (text: string | undefined): string => {
  if (!text) return "";
  const firstOpen = text.indexOf('{');
  const lastClose = text.lastIndexOf('}');
  return (firstOpen !== -1 && lastClose !== -1) ? text.substring(firstOpen, lastClose + 1) : text.trim();
};

export const generateQuestions = async (
  topic: string, 
  difficulty: Difficulty, 
  lang: Language,
  userProfile?: UserProfile
): Promise<QuizQuestion[]> => {
  const cacheKey = `q-${topic}-${difficulty}-${lang}`;
  if (quizCache[cacheKey]) return quizCache[cacheKey];

  try {
    // 프롬프트 경량화: 토큰 절약
    const prompt = `Quiz: "${topic}", Lang: ${lang}, Diff: ${difficulty}. User: ${userProfile?.ageGroup}. 5 Qs in JSON.`;

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
    return qs;
  } catch (error: any) {
    throw new Error("Failed to load questions.");
  }
};

export const evaluateAnswers = async (
  topic: string, 
  score: number,
  userProfile: UserProfile,
  lang: Language
): Promise<EvaluationResult> => {
  // 동일 주제/점수/언어에 대한 분석 결과 캐싱
  const cacheKey = `e-${topic}-${score}-${lang}`;
  if (evalCache[cacheKey]) return evalCache[cacheKey];

  try {
    // 불필요한 문맥 제거, 핵심 지표만 전달하여 토큰 절약
    const prompt = `Eval "${topic}". Score: ${score}/100. Lang: ${lang}. User: ${userProfile.ageGroup}. Provide witty AI report in JSON.`;
    
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
    const evaluation = JSON.parse(cleanJson(response.text));
    const result = { ...evaluation, totalScore: score };
    evalCache[cacheKey] = result;
    return result;
  } catch (error: any) {
    throw new Error("Analysis error.");
  }
};
