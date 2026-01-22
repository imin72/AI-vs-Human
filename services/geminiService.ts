
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { QuizQuestion, EvaluationResult, Difficulty, UserProfile, Language, QuizSet } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview';

const CACHE_KEY_QUIZ = "cognito_quiz_cache_v2"; // Version bumped for structure change
const CACHE_KEY_EVAL = "cognito_eval_cache_v1";

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

export const evaluateAnswers = async (
  topic: string, 
  score: number,
  userProfile: UserProfile,
  lang: Language,
  performance: {id: number, ok: boolean}[]
): Promise<EvaluationResult> => {
  const cacheKey = `eval_${topic}_${score}_${lang}_${userProfile.ageGroup}_p${performance.map(p=>p.ok?1:0).join('')}`.toLowerCase();
  const evalCache = loadCache(CACHE_KEY_EVAL);
  if (evalCache[cacheKey]) return evalCache[cacheKey];

  try {
    const languageNames: Record<Language, string> = {
      en: "English",
      ko: "Korean (한국어)",
      ja: "Japanese (日本語)",
      es: "Spanish (Español)",
      fr: "French (Français)",
      zh: "Chinese Simplified (简体中文)"
    };

    const perfStr = performance.map(p => `Q${p.id}:${p.ok?'Correct':'Incorrect'}`).join(', ');
    const prompt = `
      Generate a witty, human-vs-AI style performance report in ${languageNames[lang]}.
      Topic: "${topic}"
      User Score: ${score}/100
      User Context: ${userProfile.ageGroup}, ${userProfile.nationality}
      Performance: ${perfStr}
      
      REQUIREMENTS:
      1. ALL analysis text (aiComparison, demographicComment, aiComment, correctFact) MUST be in ${languageNames[lang]}.
      2. Be analytical yet slightly provocative, like a superior but fair AI.
      3. Return a valid JSON.
    `;
    
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
    return {
      totalScore: score,
      humanPercentile: score,
      demographicPercentile: score,
      demographicComment: lang === 'ko' ? "서버 연결이 원활하지 않아 로컬 분석을 수행합니다." : "Cognito server is temporarily offline. Using local analysis.",
      aiComparison: lang === 'ko' ? "인간의 지능은 안정적이나, AI는 현재 재교정 중입니다." : "Human intelligence is stable; AI is currently recalibrating.",
      title: topic,
      details: performance.map(p => ({
        questionId: p.id,
        isCorrect: p.ok,
        aiComment: lang === 'ko' ? "분석 완료." : "Analysis complete.",
        correctFact: "N/A"
      }))
    };
  }
};
