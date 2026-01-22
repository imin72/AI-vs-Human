
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { QuizQuestion, EvaluationResult, Difficulty, UserProfile, Language, QuizSet } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview';

const CACHE_KEY_QUIZ = "cognito_quiz_cache_v2"; // Version bumped for structure change

// 비상용 폴백 퀴즈
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

// Batch Generation Function
export const generateQuestionsBatch = async (
  topics: string[], 
  difficulty: Difficulty, 
  lang: Language,
  userProfile?: UserProfile
): Promise<QuizSet[]> => {
  const quizCache = loadCache(CACHE_KEY_QUIZ);
  const results: QuizSet[] = [];
  const missingTopics: string[] = [];

  // 1. Check Cache
  for (const topic of topics) {
    const cacheKey = `quiz_${topic}_${difficulty}_${lang}`.toLowerCase();
    if (quizCache[cacheKey]) {
      results.push({ topic, questions: quizCache[cacheKey] });
    } else {
      missingTopics.push(topic);
    }
  }

  // 2. Fetch missing topics in one batch
  if (missingTopics.length > 0) {
    try {
      const languageNames: Record<Language, string> = {
        en: "English",
        ko: "Korean (한국어)",
        ja: "Japanese (日本語)",
        es: "Spanish (Español)",
        fr: "French (Français)",
        zh: "Chinese Simplified (简体中文)"
      };

      const prompt = `
        You are a high-level knowledge testing AI.
        Generate 5 multiple-choice questions for EACH of the following topics: ${JSON.stringify(missingTopics)}.
        
        CRITICAL INSTRUCTIONS:
        1. ALL text content MUST be written in ${languageNames[lang]}.
        2. Difficulty level: ${difficulty}.
        3. Target Audience: ${userProfile?.ageGroup || 'General'}.
        4. Provide interesting 'context' (hints/facts) for each question.
        5. Return a JSON object where keys are the exact topic names provided, and values are arrays of questions.
      `;

      // Construct dynamic schema based on missing topics
      const topicProperties: Record<string, any> = {};
      missingTopics.forEach(topic => {
        topicProperties[topic] = {
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
        };
      });

      const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: MODEL_NAME,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: topicProperties,
            required: missingTopics
          }
        }
      }));

      const generatedData = JSON.parse(cleanJson(response.text));
      
      missingTopics.forEach(topic => {
        if (generatedData[topic]) {
          const qs = generatedData[topic];
          // Save to cache
          const cacheKey = `quiz_${topic}_${difficulty}_${lang}`.toLowerCase();
          quizCache[cacheKey] = qs;
          
          results.push({ topic, questions: qs });
        }
      });
      
      saveCache(CACHE_KEY_QUIZ, quizCache);
    } catch (error) {
      console.error("Batch Quiz Generation Failed:", error);
      // Fallback for missing topics
      missingTopics.forEach(topic => {
         results.push({ topic, questions: FALLBACK_QUIZ });
      });
    }
  }

  // Sort results to match original order
  return topics.map(t => results.find(r => r.topic === t)!).filter(Boolean);
};

// Keep single generation for backward compatibility or single re-tries
export const generateQuestions = async (
  topic: string, 
  difficulty: Difficulty, 
  lang: Language,
  userProfile?: UserProfile
): Promise<QuizQuestion[]> => {
  const res = await generateQuestionsBatch([topic], difficulty, lang, userProfile);
  return res[0]?.questions || FALLBACK_QUIZ;
};

// Original single evaluation function (kept for reference or single mode fallback)
export const evaluateAnswers = async (
  topic: string, 
  score: number,
  userProfile: UserProfile,
  lang: Language,
  performance: {id: number, ok: boolean}[]
): Promise<EvaluationResult> => {
  // Use batch function for consistency, wrapping single item
  const results = await evaluateBatchAnswers([{
    topic,
    score,
    performance
  }], userProfile, lang);
  return results[0];
};

export interface BatchEvaluationInput {
  topic: string;
  score: number;
  performance: {id: number, ok: boolean}[];
}

// New Batch Evaluation Function
export const evaluateBatchAnswers = async (
  batches: BatchEvaluationInput[],
  userProfile: UserProfile,
  lang: Language
): Promise<EvaluationResult[]> => {
  try {
     const languageNames: Record<Language, string> = {
      en: "English",
      ko: "Korean (한국어)",
      ja: "Japanese (日本語)",
      es: "Spanish (Español)",
      fr: "French (Français)",
      zh: "Chinese Simplified (简体中文)"
    };

    const summaries = batches.map(b => 
      `Topic: ${b.topic}, Score: ${b.score}/100, Details: [${b.performance.map(p => `Q${p.id}:${p.ok?'O':'X'}`).join(',')}]`
    ).join('\n');

    const prompt = `
      You are an AI analyst evaluating human intelligence.
      Analyze the user's performance across multiple topics and generate a separate report for EACH topic.
      
      User Context: Age ${userProfile.ageGroup}, Nationality ${userProfile.nationality}.
      Language: ${languageNames[lang]} (Return ALL text in this language).

      Input Data:
      ${summaries}

      REQUIREMENTS:
      1. Return a JSON object containing an array "results".
      2. Each item in "results" must correspond to the input topics in order.
      3. For "details", provide a brief witty comment on why they might have missed it or a congratulation.
      4. "aiComparison" and "demographicComment" should be creative and slightly provocative (Human vs AI theme).
    `;

    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            results: {
              type: Type.ARRAY,
              items: {
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
          }
        }
      }
    }));

    const parsed = JSON.parse(cleanJson(response.text));
    
    // Fallback if results are missing or mismatched
    if (!parsed.results || !Array.isArray(parsed.results) || parsed.results.length !== batches.length) {
       throw new Error("Batch analysis result mismatch");
    }

    // Merge score back into results (API doesn't calculate score, it analyzes it)
    return parsed.results.map((res: any, index: number) => ({
      ...res,
      totalScore: batches[index].score,
      // Map details back to IDs if needed, ensuring length matches
      details: batches[index].performance.map((p, pIdx) => ({
        questionId: p.id,
        isCorrect: p.ok,
        aiComment: res.details?.[pIdx]?.aiComment || "Analysis unavailable",
        correctFact: res.details?.[pIdx]?.correctFact || "N/A"
      }))
    }));

  } catch (error) {
    console.error("Batch Evaluation Failed", error);
    // Fallback generation
    return batches.map(b => ({
      totalScore: b.score,
      humanPercentile: b.score,
      demographicPercentile: b.score,
      demographicComment: lang === 'ko' ? "서버 부하로 인해 로컬 분석으로 대체되었습니다." : "Local analysis used due to server load.",
      aiComparison: "AI recalibrating...",
      title: b.topic,
      details: b.performance.map(p => ({
        questionId: p.id,
        isCorrect: p.ok,
        aiComment: "N/A",
        correctFact: "N/A"
      }))
    }));
  }
};
