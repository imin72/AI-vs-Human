import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, EvaluationResult, Difficulty, UserProfile, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

export const generateQuestions = async (topic: string, difficulty: Difficulty, lang: Language): Promise<QuizQuestion[]> => {
  try {
    // Inject a random seed to ensure different questions every time the user retries the same topic
    const randomSeed = Math.floor(Math.random() * 1000000);

    const prompt = `
      Generate 5 unique and randomized multiple-choice trivia questions about "${topic}" in ${lang === 'ko' ? 'Korean' : lang === 'ja' ? 'Japanese' : lang === 'es' ? 'Spanish' : 'English'}.
      Difficulty Level: ${difficulty}.
      Random Seed: ${randomSeed} (Use this to vary the questions significantly from previous generations).
      
      Requirements:
      - The Questions, Options, and Context MUST be in the target language (${lang}).
      - 4 options per question.
      - Only 1 correct answer.
      - "context" should be a subtle hint.
      - Return pure JSON.
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
    
    const parsed = JSON.parse(text);
    return parsed.questions;

  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};

export const evaluateAnswers = async (
  topic: string, 
  score: number,
  results: { question: string; selected: string; correct: string; isCorrect: boolean }[],
  userProfile: UserProfile,
  lang: Language
): Promise<EvaluationResult> => {
  try {
    const hasProfile = userProfile.ageGroup !== 'Skip' && userProfile.gender !== 'Skip';
    const profileText = hasProfile 
      ? `User Demographic: ${userProfile.gender}, Age Group: ${userProfile.ageGroup}.` 
      : "User Demographic: Anonymous Human.";

    const targetLangName = lang === 'ko' ? 'Korean' : lang === 'ja' ? 'Japanese' : lang === 'es' ? 'Spanish' : 'English';

    const prompt = `
      You are the Judge AI. A human has completed a quiz on "${topic}".
      Score: ${score}/100.
      ${profileText}
      
      Output Language: ${targetLangName} (Must be strictly in this language).

      Task:
      1. Assign a "Human Percentile" (mock statistic vs general population).
      2. ${hasProfile ? `Assign a "Demographic Percentile" (mock statistic specifically comparing them to other ${userProfile.ageGroup} ${userProfile.gender}s).` : 'Set demographicPercentile to same as humanPercentile.'}
      3. ${hasProfile ? `Write a "Demographic Comment" in ${targetLangName} comparing them to their peer group.` : 'Write a generic demographic comment.'}
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
    
    const aiData = JSON.parse(text);
    return {
      ...aiData,
      totalScore: score
    };

  } catch (error) {
    console.error("Error evaluating answers:", error);
    throw error;
  }
};