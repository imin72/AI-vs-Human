
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { QuizQuestion, EvaluationResult, Difficulty, UserProfile, Language } from "../types";

// Always use {apiKey: process.env.API_KEY} as a named parameter
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * 지수 백오프를 사용한 재시도 함수
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error.message?.includes("429") || error.message?.toLowerCase().includes("quota");
    if (retries > 0 && isRateLimit) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

const cleanJson = (text: string | undefined): string => {
  if (!text) return "";
  try {
    const firstOpen = text.indexOf('{');
    const lastClose = text.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
      return text.substring(firstOpen, lastClose + 1);
    }
    return text.trim();
  } catch (e) {
    return text || "";
  }
};

const handleApiError = (error: any, lang: Language): never => {
  console.error("Gemini API Error details:", error);
  let message = error.message || "Unknown error occurred";
  
  if (message.includes("429") || message.toLowerCase().includes("quota") || message.toLowerCase().includes("limit")) {
    message = lang === 'ko' 
      ? "AI 서비스 요청 한도를 일시적으로 초과했습니다. 자동 재시도 후에도 실패했습니다. 잠시 후 다시 시도해 주세요." 
      : "AI request quota exceeded. Please wait a moment and try again.";
  } else if (message.includes("500") || message.toLowerCase().includes("server error")) {
    message = lang === 'ko'
      ? "AI 서버에 일시적인 오류가 발생했습니다. 다시 시도해 주세요."
      : "AI server is temporarily unavailable. Please try again.";
  } else if (message.includes("404") || message.includes("not found")) {
    message = lang === 'ko'
      ? "시스템 구성 오류: 지원되지 않는 모델이거나 API 키 설정이 올바르지 않습니다."
      : "System Configuration Error: Model not found or API key issue.";
  }
  
  throw new Error(message);
};

export const generateQuestions = async (
  topic: string, 
  difficulty: Difficulty, 
  lang: Language,
  userProfile?: UserProfile
): Promise<QuizQuestion[]> => {
  try {
    const prompt = `
      Create a 5-question trivia quiz about "${topic}" in ${lang === 'ko' ? 'Korean' : 'English'}.
      Difficulty: ${difficulty}. 
      Target Profile: ${JSON.stringify(userProfile)}.
      Return strictly JSON.
    `;

    // Extracting response and using .text property correctly
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
    // Property .text is used here, not text()
    const cleaned = cleanJson(response.text);
    return cleaned ? JSON.parse(cleaned).questions : [];
  } catch (error: any) {
    handleApiError(error, lang);
    return [];
  }
};

export const evaluateAnswers = async (
  topic: string, 
  score: number,
  _results: any[],
  userProfile: UserProfile,
  lang: Language
): Promise<EvaluationResult> => {
  const targetLang = lang === 'ko' ? 'Korean' : 'English';
  const prompt = `
    Evaluate a human's quiz performance on "${topic}".
    Score: ${score}/100.
    Profile: ${JSON.stringify(userProfile)}.
    Language: ${targetLang}.
    Provide a witty, AI-centric analysis.
  `;
  
  try {
    // Extracting response and using .text property correctly
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
    // Property .text is used here, not text()
    const cleaned = cleanJson(response.text);
    const evaluation = cleaned ? JSON.parse(cleaned) : {};
    return { ...evaluation, totalScore: score };
  } catch (error: any) {
    handleApiError(error, lang);
    return {} as EvaluationResult;
  }
};
