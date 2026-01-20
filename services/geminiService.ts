
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, EvaluationResult, Difficulty, UserProfile, Language } from "../types";

// Always use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

// Helper to extract JSON object from text
const cleanJson = (text: string): string => {
  try {
    const firstOpen = text.indexOf('{');
    const lastClose = text.lastIndexOf('}');
    
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
      return text.substring(firstOpen, lastClose + 1);
    }
    
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    return cleaned;
  } catch (e) {
    return text;
  }
};

// Helper to parse Google API Errors
const handleApiError = (error: any): never => {
  console.error("Gemini API Error:", error);
  
  let errorMessage = error.message || "Unknown error occurred";

  try {
    if (typeof errorMessage === 'string' && errorMessage.startsWith('{')) {
      const parsed = JSON.parse(errorMessage);
      if (parsed.error && parsed.error.message) {
        errorMessage = parsed.error.message;
      }
    }
  } catch (e) { }

  if (errorMessage.includes("API key not valid")) {
    throw new Error("Invalid API Key. Please check your Vercel Settings.");
  }
  
  throw new Error(errorMessage);
};

export const generateQuestions = async (
  topic: string, 
  difficulty: Difficulty, 
  lang: Language,
  userProfile?: UserProfile
): Promise<QuizQuestion[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check App Settings.");
  }

  try {
    const randomSeed = Math.floor(Math.random() * 1000000);
    const culturalContext = userProfile && userProfile.nationality !== 'Skip' 
      ? `Tailor the cultural nuance, educational standards, and specific trivia depth to a citizen of ${userProfile.nationality}.` 
      : "Use a neutral global perspective.";

    const prompt = `
      Generate 5 unique and randomized multiple-choice trivia questions about "${topic}" in ${lang === 'ko' ? 'Korean' : lang === 'ja' ? 'Japanese' : lang === 'es' ? 'Spanish' : 'English'}.
      Difficulty Level: ${difficulty}.
      Target Nationality: ${userProfile?.nationality || 'Global'}.
      ${culturalContext}
      Random Seed: ${randomSeed}.
      
      Requirements:
      - Reflect the specific educational level and cultural common knowledge of the target nationality where applicable.
      - The Questions, Options, and Context MUST be in the target language (${lang}).
      - 4 options per question.
      - Only 1 correct answer.
      - "context" should be a subtle hint.
      - Return pure JSON only.
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
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    minItems: 4,
                    maxItems: 4
                  },
                  correctAnswer: { type: Type.STRING, description: "Must exactly match one of the options" },
                  context: { type: Type.STRING, description: "A brief, obscure hint" }
                },
                required: ["id", "question", "options", "correctAnswer"]
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from AI");
    
    try {
      const cleanedText = cleanJson(text);
      const parsed = JSON.parse(cleanedText);
      return parsed.questions;
    } catch (parseError) {
      console.error("JSON Parse Error. Raw text:", text);
      throw new Error("Failed to parse AI response");
    }

  } catch (error: any) {
    handleApiError(error);
    return [];
  }
};

export const evaluateAnswers = async (
  topic: string, 
  score: number,
  results: { question: string; selected: string; correct: string; isCorrect: boolean }[],
  userProfile: UserProfile,
  lang: Language
): Promise<EvaluationResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  try {
    const profileText = `User Demographic: Nationality: ${userProfile.nationality}, Gender: ${userProfile.gender}, Age Group: ${userProfile.ageGroup}.`;

    const targetLangName = lang === 'ko' ? 'Korean' : lang === 'ja' ? 'Japanese' : lang === 'es' ? 'Spanish' : 'English';

    const prompt = `
      You are the Judge AI. A human has completed a quiz on "${topic}".
      Score: ${score}/100.
      ${profileText}
      
      Output Language: ${targetLangName} (Must be strictly in this language).

      Task:
      1. Assign a "Human Percentile" (mock statistic vs general population).
      2. Assign a "Demographic Percentile" comparing them specifically to other ${userProfile.nationality} citizens of their age/gender group.
      3. Write a "Demographic Comment" in ${targetLangName} comparing them to their peer group, considering cultural and educational background.
      4. Create a "Title" for the user in ${targetLangName}.
      5. Write a witty/sarcastic "AI Comparison" regarding their intellect in ${targetLangName}.
      6. For each question, provide a short, snarky or praising comment in ${targetLangName}.
      
      User Details:
      ${JSON.stringify(results)}
    `;

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
                  correctFact: { type: Type.STRING, description: "Short explanation of the correct answer" }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No evaluation returned");
    
    try {
      const cleanedText = cleanJson(text);
      const aiData = JSON.parse(cleanedText);
      return {
        ...aiData,
        totalScore: score
      };
    } catch (parseError) {
      console.error("JSON Parse Error in Eval. Raw text:", text);
      throw new Error("Failed to parse AI evaluation");
    }

  } catch (error: any) {
    handleApiError(error);
    return {} as EvaluationResult;
  }
};
