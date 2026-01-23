
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { QuizQuestion, EvaluationResult, Difficulty, UserProfile, Language, QuizSet, UserAnswer } from "../types";
import { getStaticQuestions, resolveTopicInfo } from "../data/staticDatabase";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview';

const CACHE_KEY_QUIZ = "cognito_quiz_cache_v3"; 

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

/**
 * Helper to generate the unique cache key
 */
const generateCacheKey = (topic: string, difficulty: Difficulty, lang: Language) => {
  return `${topic}_${difficulty}_${lang}`.toLowerCase();
};

// Helper: Translate Elo to descriptive level for Gemini
const getAdaptiveLevel = (elo: number): string => {
  if (elo < 800) return "Beginner";
  if (elo < 1200) return "Intermediate";
  if (elo < 1600) return "Advanced";
  return "Expert/PhD Level";
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
  const seenIds = new Set(userProfile?.seenQuestionIds || []);

  // HYBRID STRATEGY: 
  // 1. Check Static Database (Highest Quality) -> FILTER by seen IDs
  // 2. Check LocalStorage Cache (Fastest fallback) -> FILTER by seen IDs
  // 3. Fallback to API -> ADAPT by Elo

  for (const topic of topics) {
    const cacheKey = generateCacheKey(topic, difficulty, lang);

    // 1. Try Static Database first
    const staticQuestions = await getStaticQuestions(topic, difficulty, lang);
    if (staticQuestions) {
      // --- ADAPTIVE FILTERING ---
      const unseenQuestions = staticQuestions.filter(q => !seenIds.has(q.id));
      
      if (unseenQuestions.length >= 5) {
        // Shuffle and take 5
        const selected = unseenQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);
        console.log(`[Static DB Hit] ${topic} (Adaptive Filter: ${selected.length})`);
        results.push({ topic, questions: selected });
        continue; // Done with this topic
      } else {
        console.log(`[Static DB Depleted] ${topic} - Not enough unseen questions.`);
        // Fallthrough to Cache/API
      }
    }

    // 2. Try Local Cache (Previous API generations)
    if (quizCache[cacheKey]) {
       const cachedQuestions = quizCache[cacheKey];
       if (Array.isArray(cachedQuestions)) {
           // Filter cache for seen IDs too
           const unseenCache = cachedQuestions.filter((q: QuizQuestion) => !seenIds.has(q.id));
           if (unseenCache.length >= 5) {
               const selected = unseenCache.sort(() => 0.5 - Math.random()).slice(0, 5);
               console.log(`[Cache Hit] ${topic} (Adaptive Filter: ${selected.length})`);
               results.push({ topic, questions: selected });
               continue;
           }
       }
    }

    console.log(`[Cache Miss/Depleted] ${topic} - Requesting API`);
    missingTopics.push(topic);
  }

  // 3. Fetch missing topics via Gemini API
  if (missingTopics.length > 0) {
    try {
      const SUPPORTED_LANGUAGES: Language[] = ['en', 'ko', 'ja', 'zh', 'es', 'fr'];
      
      // Construct Adaptive Context per Topic
      const adaptiveContexts = missingTopics.map(t => {
         // Resolve topic info to get English ID for Elo lookup
         const info = resolveTopicInfo(t, lang);
         const catId = info?.catId || "GENERAL";
         const elo = userProfile?.eloRatings?.[catId] || 1000;
         const level = getAdaptiveLevel(elo);
         return `${t}: User Knowledge Level: ${level} (Elo ${elo})`;
      }).join("; ");

      const prompt = `
        You are a high-level knowledge testing AI.
        Generate 5 multiple-choice questions for EACH of the following topics: ${JSON.stringify(missingTopics)}.
        
        CRITICAL INSTRUCTIONS:
        1. Base Difficulty: ${difficulty}.
        2. USER ADAPTATION PROFILE: ${adaptiveContexts}.
           - If user is Expert, ask obscure/deep questions.
           - If Beginner, ask fundamental questions.
        3. Target Audience: ${userProfile?.ageGroup || 'General'}.
        4. **MULTI-LANGUAGE GENERATION:** For EACH question, provide the content in ALL supported languages: English (en), Korean (ko), Japanese (ja), Chinese Simplified (zh), Spanish (es), and French (fr).
        5. Return a JSON object where keys are the exact topic names provided.
      `;

      const questionSchema = {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          // Language Maps
          en: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.STRING }, context: { type: Type.STRING } } },
          ko: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.STRING }, context: { type: Type.STRING } } },
          ja: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.STRING }, context: { type: Type.STRING } } },
          zh: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.STRING }, context: { type: Type.STRING } } },
          es: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.STRING }, context: { type: Type.STRING } } },
          fr: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.STRING }, context: { type: Type.STRING } } }
        },
        required: ["id", "en", "ko", "ja", "zh", "es", "fr"]
      };

      const topicProperties: Record<string, any> = {};
      missingTopics.forEach(topic => {
        topicProperties[topic] = {
          type: Type.ARRAY,
          items: questionSchema
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
          const rawQuestions = generatedData[topic];
          
          // Process and Save EACH language
          SUPPORTED_LANGUAGES.forEach(targetLang => {
            // Extract specific language version from the raw multi-lang response
            const localizedQuestions: QuizQuestion[] = rawQuestions.map((q: any) => ({
              id: q.id,
              ...q[targetLang] // Spread question, options, correctAnswer, context
            }));

            // Save to Local Cache
            const cacheKey = generateCacheKey(topic, difficulty, targetLang);
            quizCache[cacheKey] = localizedQuestions;

            // --- AUTO-SAVE LOGIC (Dev Only) ---
            if (import.meta.env.DEV && targetLang === lang) { // Only log saving for current lang to avoid spam, but actually saving all is better? 
               // Actually save ALL languages to file
               const info = resolveTopicInfo(topic, targetLang); // Topic name might be in original request lang
               // Note: resolveTopicInfo works best if 'topic' matches 'targetLang'. 
               // Since 'topic' is from the loop (which is in 'lang'), we need to be careful.
               // For simplicity in Dev mode, we just try to save.
               if (info) {
                 const { catId, englishName } = info;
                 const fileKey = `${englishName}_${difficulty}_${targetLang}`;
                 
                 fetch('/__save-question', {
                   method: 'POST',
                   headers: {'Content-Type': 'application/json'},
                   body: JSON.stringify({ categoryId: catId, key: fileKey, data: localizedQuestions })
                 }).catch(e => console.warn("Auto-save failed:", e));
               }
            }
          });

          // Add ONLY the requested language to the results return
          const resultQuestions = rawQuestions.map((q: any) => ({
            id: q.id,
            ...q[lang]
          }));
          results.push({ topic, questions: resultQuestions });
        }
      });
      
      saveCache(CACHE_KEY_QUIZ, quizCache);
    } catch (error) {
      console.error("Batch Quiz Generation Failed:", error);
      missingTopics.forEach(topic => {
         results.push({ topic, questions: FALLBACK_QUIZ });
      });
    }
  }

  return topics.map(t => results.find(r => r.topic === t)!).filter(Boolean);
};

export const generateQuestions = async (
  topic: string, 
  difficulty: Difficulty, 
  lang: Language,
  userProfile?: UserProfile
): Promise<QuizQuestion[]> => {
  const res = await generateQuestionsBatch([topic], difficulty, lang, userProfile);
  return res[0]?.questions || FALLBACK_QUIZ;
};

// Updated Interface: Uses full UserAnswer array
export interface BatchEvaluationInput {
  topic: string;
  score: number;
  performance: UserAnswer[]; 
}

// Updated Single Evaluation Wrapper
export const evaluateAnswers = async (
  topic: string, 
  score: number,
  userProfile: UserProfile,
  lang: Language,
  performance: {id: number, ok: boolean}[] // Kept simple for backward compat, but function below needs full data to be useful
): Promise<EvaluationResult> => {
  // NOTE: This legacy wrapper does not pass text data. 
  // For full features, evaluateBatchAnswers should be called directly with UserAnswer objects.
  return (await evaluateBatchAnswers([{
    topic,
    score,
    performance: performance.map(p => ({
        questionId: p.id,
        isCorrect: p.ok,
        questionText: "N/A",
        selectedOption: "N/A",
        correctAnswer: "N/A"
    }))
  }], userProfile, lang))[0];
};

// Batch Evaluation Function
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
      `Topic: ${b.topic}, Score: ${b.score}/100, Details: [${b.performance.map(p => `Q${p.questionId}:${p.isCorrect?'Correct':'Incorrect'}`).join(',')}]`
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
      5. Include "questionId" in details to match input.
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
    
    if (!parsed.results || !Array.isArray(parsed.results) || parsed.results.length !== batches.length) {
       throw new Error("Batch analysis result mismatch");
    }

    // Merge API results with Original User Data
    return parsed.results.map((res: any, index: number) => {
      const originalBatch = batches[index];
      
      return {
        ...res,
        totalScore: originalBatch.score,
        // CRITICAL: Merge original answer data with AI analysis
        details: originalBatch.performance.map((p) => {
          // Find the AI detail that matches this question ID
          const aiDetail = res.details?.find((d: any) => d.questionId === p.questionId);
          
          return {
            questionId: p.questionId,
            isCorrect: p.isCorrect,
            // Pass through original text data for UI display
            questionText: p.questionText,
            selectedOption: p.selectedOption,
            correctAnswer: p.correctAnswer,
            // Use found detail or fallback
            aiComment: aiDetail?.aiComment || (lang === 'ko' ? "분석 데이터 없음" : "Analysis unavailable"),
            correctFact: aiDetail?.correctFact || "N/A"
          };
        })
      };
    });

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
        questionId: p.questionId,
        isCorrect: p.isCorrect,
        questionText: p.questionText,
        selectedOption: p.selectedOption,
        correctAnswer: p.correctAnswer,
        aiComment: "N/A",
        correctFact: "N/A"
      }))
    }));
  }
};
