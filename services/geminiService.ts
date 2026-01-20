
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
  
  // Handle Quota Exceeded (429)
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

export const generateLocalizedTopics = async (
  userProfile: UserProfile,
  lang: Language
): Promise<{ categories: { id: string, label: string }[] }> => {
  const targetLang = lang === 'ko' ? 'Korean' : lang === 'ja' ? 'Japanese' : lang === 'es' ? 'Spanish' : 'English';
  const prompt = `
    As an expert in cultural studies and education for ${userProfile.nationality}, suggest 8 diverse quiz categories.
    These should reflect what a person from ${userProfile.nationality} (Age: ${userProfile.ageGroup}) would find engaging, challenging, or culturally significant.
    Include both global topics and highly specific local topics of ${userProfile.nationality}.
    Output strictly in JSON format.
    Language: ${targetLang}.
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
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING }
                },
                required: ["id", "label"]
              }
            }
          }
        }
      }
    });
    const cleaned = cleanJson(response.text);
    return cleaned ? JSON.parse(cleaned) : { categories: [] };
  } catch (error) {
    console.error("Failed to generate topics:", error);
    return { categories: [] };
  }
};

export const generateLocalizedSubtopics = async (
  category: string,
  userProfile: UserProfile,
  lang: Language
): Promise<{ subtopics: string[] }> => {
  const targetLang = lang === 'ko' ? 'Korean' : lang === 'ja' ? 'Japanese' : lang === 'es' ? 'Spanish' : 'English';
  const prompt = `
    Generate 6 specific and interesting subtopics for the category "${category}" tailored for a citizen of ${userProfile.nationality}.
    Ensure the topics range from common knowledge to expert depth relevant to their cultural background.
    Output strictly in JSON format.
    Language: ${targetLang}.
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
            subtopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    const cleaned = cleanJson(response.text);
    return cleaned ? JSON.parse(cleaned) : { subtopics: [] };
  } catch (error) {
    console.error("Failed to generate subtopics:", error);
    return { subtopics: [] };
  }
};

export const generateQuestions = async (
  topic: string, 
  difficulty: Difficulty, 
  lang: Language,
  userProfile?: UserProfile
): Promise<QuizQuestion[]> => {
  try {
    const prompt = `
      Generate 5 unique multiple-choice trivia questions about "${topic}" in ${lang === 'ko' ? 'Korean' : 'English'}.
      Difficulty: ${difficulty}. User Nationality: ${userProfile?.nationality || 'Global'}.
      The questions must be culturally optimized for ${userProfile?.nationality}.
      Return pure JSON.
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
  const prompt = `Evaluate the user's performance on "${topic}" with score ${score}/100. Consider their background: ${JSON.stringify(userProfile)}. Language: ${targetLang}.`;
  
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
