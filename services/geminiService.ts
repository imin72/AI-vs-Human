
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, EvaluationResult, Difficulty, UserProfile, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview';

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
      ? "AI 서비스 요청 한도를 초과했습니다. 약 1분 후 다시 시도해 주세요." 
      : "AI request quota exceeded. Please wait a minute and try again.";
  } else if (message.includes("500") || message.toLowerCase().includes("server error")) {
    message = lang === 'ko'
      ? "AI 서버에 일시적인 오류가 발생했습니다. 다시 시도해 주세요."
      : "AI server is temporarily unavailable. Please try again.";
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
      Important: Questions must be localized and optimized for a person with this nationality (${userProfile?.nationality}) and age group (${userProfile?.ageGroup}). 
      Make them engaging but challenging for this specific person.
      Return strictly JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
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
    });
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
    Provide a witty, slightly superior (like a sophisticated AI) but insightful analysis.
    Compare their knowledge against AI capabilities.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
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
    });
    const cleaned = cleanJson(response.text);
    const evaluation = cleaned ? JSON.parse(cleaned) : {};
    return { ...evaluation, totalScore: score };
  } catch (error: any) {
    handleApiError(error, lang);
    return {} as EvaluationResult;
  }
};
