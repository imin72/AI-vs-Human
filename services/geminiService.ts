
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { QuizQuestion, EvaluationResult, Difficulty, UserProfile, Language, QuizSet, UserAnswer } from "../types";
import { getStaticQuestions, resolveTopicInfo } from "../data/staticDatabase";

const MODEL_NAME = 'gemini-3-flash-preview';
const CACHE_KEY_QUIZ = "cognito_quiz_cache_v3"; 

// --- Safe Environment Helpers ---
const isDev = () => {
  // 1. Security Check: Always disable on Vercel Production
  if (typeof window !== 'undefined') {
     const h = window.location.hostname;
     if (h.includes('vercel.app')) return false;
  }

  try {
    // 2. Check Vite's DEV flag
    // @ts-ignore
    if (import.meta.env.DEV) return true;
  } catch {}

  // 3. Runtime Check for Previews
  if (typeof window !== 'undefined') {
    const h = window.location.hostname;
    // Allow Localhost and AIStudio Previews
    if (h === 'localhost' || h === '127.0.0.1' || h.includes('googleusercontent.com') || h.includes('webcontainer.io') || h.includes('idx.google')) return true;
  }
  return false;
};

const getApiKey = () => {
  try {
    return process.env.API_KEY || "";
  } catch {
    console.warn("API Key environment variable not accessible.");
    return "";
  }
};

// Lazy Initialization Wrapper
const getAiClient = () => {
  const apiKey = getApiKey();
  // Allow initialization even if empty to prevent app crash, API calls will fail gracefully later
  return new GoogleGenAI({ apiKey });
};

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
 * Helper to generate the unique cache key.
 */
const generateCacheKey = (stableTopicId: string, difficulty: Difficulty, lang: Language) => {
  return `${stableTopicId}_${difficulty}_${lang}`.toLowerCase();
};

// Helper: Translate Elo to descriptive level for Gemini
const getAdaptiveLevel = (elo: number): string => {
  if (elo < 800) return "Beginner";
  if (elo < 1200) return "Intermediate";
  if (elo < 1600) return "Advanced";
  return "Expert/PhD Level";
};

// --- CLIENT-SIDE SEEDING FUNCTION ---
// Allows generating master data from the browser without CLI
export const seedLocalDatabase = async (onProgress: (msg: string) => void) => {
  // Check environment for logging
  if (!isDev()) {
    console.warn("NOTE: Seeding in production will generate data but cannot save to file system.");
    onProgress("Warning: File saving requires Dev Server. Data will be cached in memory only. Check Console for JSON.");
  }

  // Define core topics to seed (English Master Data)
  const SEED_TARGETS = [
    { cat: "Science", topics: ["Quantum Physics", "Neuroscience", "Astronomy"] },
    { cat: "History", topics: ["World War II", "Ancient Egypt", "Cold War"] },
    { cat: "Tech", topics: ["Artificial Intelligence", "Coding", "Blockchain"] },
    { cat: "Philosophy", topics: ["Stoicism", "Existentialism"] }
  ];

  onProgress("Initializing Seeding Protocol...");

  const ai = getAiClient();

  for (const group of SEED_TARGETS) {
    for (const topic of group.topics) {
      const difficulty = Difficulty.HARD;
      const lang = 'en';
      const key = `${topic}_${difficulty}_${lang}`;
      
      onProgress(`Generating Master Data for: ${topic}...`);
      
      try {
        // Check if exists first
        const existing = await getStaticQuestions(topic, difficulty, lang);
        if (existing) {
          console.log(`[Seed] Skipping ${topic} (Already exists)`);
          continue;
        }

        const prompt = `
          Generate 5 challenging, high-quality multiple-choice questions about "${topic}".
          
          STRICT OBJECTIVITY RULES:
          1. All questions must be based on UNDISPUTED FACTS and HARD DATA.
          2. Avoid subjective value judgments (e.g., "Who is the best...", "What is the most beautiful...").
          3. Answers must be objectively verifiable in a standard encyclopedia.
          4. No ambiguous scenarios.
          
          Constraints:
          - Language: English. Difficulty: Hard.
          - Format: JSON Array with keys: id, question, options, correctAnswer, context.
          - Context: A short, interesting fact explaining the answer.
        `;

        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: [{ parts: [{ text: prompt }] }],
          config: { responseMimeType: "application/json" }
        });

        const questions = JSON.parse(cleanJson(response.text));
        
        // Log to console for manual copying in Preview environments
        console.group(`📦 [SEED DATA] ${topic}`);
        console.log(JSON.stringify(questions, null, 2));
        console.groupEnd();

        // Save via Middleware (Will fail silently on Prod)
        try {
          await fetch('/__save-question', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ 
                categoryId: group.cat, 
                key: key, 
                data: questions 
              })
          });
        } catch (err) {
          // Expected failure in preview
        }

        // Also update cache so we can use it immediately
        const quizCache = loadCache(CACHE_KEY_QUIZ);
        quizCache[generateCacheKey(topic, difficulty, lang)] = questions;
        saveCache(CACHE_KEY_QUIZ, quizCache);
        
        // Small delay to prevent rate limits
        await new Promise(r => setTimeout(r, 1000));

      } catch (e) {
        console.error(`[Seed] Failed for ${topic}`, e);
        onProgress(`Error seeding ${topic}`);
      }
    }
  }
  onProgress("Seeding Complete! Check Browser Console for JSON Data.");
};

// --- BACKGROUND TASK: Mirror Translation ---
const triggerBackgroundTranslation = async (
  topicId: string,
  categoryId: string,
  difficulty: Difficulty,
  sourceLang: Language,
  sourceQuestions: QuizQuestion[]
) => {
  if (!isDev()) return;

  const ALL_LANGUAGES: Language[] = ['en', 'ko', 'ja', 'es', 'fr', 'zh'];
  const targetLangs = ALL_LANGUAGES.filter(l => l !== sourceLang);
  const ai = getAiClient();

  console.log(`[Background] Starting translation mirroring for ${topicId} from ${sourceLang} to [${targetLangs.join(',')}]...`);

  try {
    const prompt = `
      You are a translation engine for a Quiz Database.
      Translate the following JSON questions from ${sourceLang} into these languages: ${JSON.stringify(targetLangs)}.
      
      SOURCE DATA:
      ${JSON.stringify(sourceQuestions)}

      RULES:
      1. Return a JSON object where keys are the language codes (${targetLangs.join(', ')}).
      2. The value for each key must be an array of questions matching the source structure exactly.
      3. Maintain the same IDs.
      4. Translate "question", "options", "correctAnswer", and "context" naturally.
      5. Ensure the "correctAnswer" matches the translation used in "options".
    `;

    // Define schema for multi-language output
    const questionSchema = {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        question: { type: Type.STRING }, 
        options: { type: Type.ARRAY, items: { type: Type.STRING } }, 
        correctAnswer: { type: Type.STRING }, 
        context: { type: Type.STRING }
      }
    };

    const langProperties: Record<string, any> = {};
    targetLangs.forEach(lang => {
      langProperties[lang] = { type: Type.ARRAY, items: questionSchema };
    });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: langProperties,
          required: targetLangs
        }
      }
    });

    const translatedData = JSON.parse(cleanJson(response.text));
    const quizCache = loadCache(CACHE_KEY_QUIZ);

    for (const lang of targetLangs) {
      if (translatedData[lang]) {
        const questions = translatedData[lang];
        const cacheKey = generateCacheKey(topicId, difficulty, lang as Language);
        quizCache[cacheKey] = questions;

        await fetch('/__save-question', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
              categoryId: categoryId, 
              key: `${topicId}_${difficulty}_${lang}`, 
              data: questions 
            })
        }).catch(e => console.warn(`[Background] Failed to save ${lang} file:`, e));
      }
    }
    
    saveCache(CACHE_KEY_QUIZ, quizCache);

  } catch (error) {
    console.warn(`[Background] Translation mirroring failed for ${topicId}`, error);
  }
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
  const ai = getAiClient();
  
  const resolvedRequests = topics.map(topicLabel => {
    const info = resolveTopicInfo(topicLabel, lang);
    return {
      originalLabel: topicLabel,
      stableId: info ? info.englishName : topicLabel, 
      catId: info ? info.catId : "GENERAL"
    };
  });

  const missingRequests: typeof resolvedRequests = [];
  const translationRequests: { req: typeof resolvedRequests[0], sourceData: QuizQuestion[] }[] = [];
  
  const seenIds = new Set(userProfile?.seenQuestionIds || []);

  // Check Local Data & Cache
  for (const req of resolvedRequests) {
    const cacheKey = generateCacheKey(req.stableId, difficulty, lang);

    // 1. Check Static Database (Target Language)
    const staticQuestions = await getStaticQuestions(req.originalLabel, difficulty, lang);
    if (staticQuestions) {
      const unseenQuestions = staticQuestions.filter(q => !seenIds.has(q.id));
      if (unseenQuestions.length >= 5) {
        const selected = unseenQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);
        console.log(`[Static DB Hit] ${req.stableId}`);
        results.push({ topic: req.originalLabel, questions: selected, categoryId: req.catId });
        continue;
      }
    }

    // 2. Check Browser Cache
    if (quizCache[cacheKey]) {
       const cachedQuestions = quizCache[cacheKey];
       if (Array.isArray(cachedQuestions)) {
           const unseenCache = cachedQuestions.filter((q: QuizQuestion) => !seenIds.has(q.id));
           if (unseenCache.length >= 5) {
               const selected = unseenCache.sort(() => 0.5 - Math.random()).slice(0, 5);
               console.log(`[Cache Hit] ${req.stableId}`);
               results.push({ topic: req.originalLabel, questions: selected, categoryId: req.catId });
               continue;
           }
       }
    }

    // 3. Strategy 3: Check Static Database (Master Data - English) for Translation
    // If we are NOT requesting English, check if English data exists to translate
    if (lang !== 'en') {
      const masterQuestions = await getStaticQuestions(req.originalLabel, difficulty, 'en');
      if (masterQuestions && masterQuestions.length > 0) {
        // We found English master data! Add to translation queue.
        console.log(`[Master Data Found] ${req.stableId} (en) -> Translating to ${lang}`);
        translationRequests.push({ req, sourceData: masterQuestions });
        continue;
      }
    }

    // 4. If nothing found, add to Generation Queue
    console.log(`[Cache/DB Miss] ${req.stableId} -> Generating`);
    missingRequests.push(req);
  }

  // PROCESS TRANSLATION REQUESTS (Strategy 3)
  if (translationRequests.length > 0) {
    try {
      // Process one by one (or batch if needed, but simple for now)
      for (const item of translationRequests) {
        const { req, sourceData } = item;
        
        // Select 5 questions from Master Data
        const sourceSelection = sourceData.filter(q => !seenIds.has(q.id)).slice(0, 5);
        if (sourceSelection.length === 0) {
          // Fallback if all master data is seen (unlikely for now)
          missingRequests.push(req);
          continue;
        }

        const prompt = `
          Translate these quiz questions from English to ${lang}.
          Return strictly valid JSON matching the input structure.
          INPUT: ${JSON.stringify(sourceSelection)}
        `;

        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: [{ parts: [{ text: prompt }] }],
          config: { responseMimeType: "application/json" }
        });

        const translatedQs = JSON.parse(cleanJson(response.text));
        
        // Cache & Save
        const cacheKey = generateCacheKey(req.stableId, difficulty, lang);
        quizCache[cacheKey] = translatedQs;
        saveCache(CACHE_KEY_QUIZ, quizCache);

        if (isDev()) {
           fetch('/__save-question', {
               method: 'POST',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({ categoryId: req.catId, key: `${req.stableId}_${difficulty}_${lang}`, data: translatedQs })
           }).catch(() => {});
        }

        results.push({ topic: req.originalLabel, questions: translatedQs, categoryId: req.catId });
      }
    } catch (e) {
      console.error("Translation Fallback Failed", e);
      // If translation fails, add to missing requests to try raw generation
      translationRequests.forEach(t => missingRequests.push(t.req));
    }
  }

  // PROCESS GENERATION REQUESTS (Original Generation)
  if (missingRequests.length > 0) {
    try {
      const targetEnglishIds = missingRequests.map(r => r.stableId); 
      
      const adaptiveContexts = missingRequests.map(r => {
         const elo = userProfile?.eloRatings?.[r.catId] || 1000;
         const level = getAdaptiveLevel(elo);
         return `${r.stableId}: User Knowledge Level: ${level} (Elo ${elo})`;
      }).join("; ");

      const prompt = `
        You are a high-level knowledge testing AI.
        Generate 5 multiple-choice questions for EACH of the following topics: ${JSON.stringify(targetEnglishIds)}.
        
        CRITICAL INSTRUCTIONS:
        1. Base Difficulty: ${difficulty}.
        2. **OBJECTIVITY RULE**: All questions must be based on UNDISPUTED FACTS and HARD DATA. 
           - DO NOT ask for subjective opinions, moral judgments, or ambiguous interpretations (e.g., avoid "Who is the best...", "What is the most important...").
           - The correct answer must be VERIFIABLE and INDISPUTABLE.
        3. USER ADAPTATION PROFILE: ${adaptiveContexts}.
        4. Target Audience: ${userProfile?.ageGroup || 'General'}.
        5. **LANGUAGE:** Generate content in **${lang}** language ONLY.
        6. Return a JSON object where keys are the exact topic names provided (${targetEnglishIds.join(', ')}).
      `;

      const questionSchema = {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          question: { type: Type.STRING }, 
          options: { type: Type.ARRAY, items: { type: Type.STRING } }, 
          correctAnswer: { type: Type.STRING }, 
          context: { type: Type.STRING }
        },
        required: ["id", "question", "options", "correctAnswer", "context"]
      };

      const topicProperties: Record<string, any> = {};
      targetEnglishIds.forEach(tId => {
        topicProperties[tId] = { type: Type.ARRAY, items: questionSchema };
      });

      const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: MODEL_NAME,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: topicProperties,
            required: targetEnglishIds
          }
        }
      }));

      const generatedData = JSON.parse(cleanJson(response.text));
      
      missingRequests.forEach(req => {
        if (generatedData[req.stableId]) {
          const rawQuestions = generatedData[req.stableId];
          
          const cacheKey = generateCacheKey(req.stableId, difficulty, lang);
          
          const formattedQuestions: QuizQuestion[] = rawQuestions.map((q: any) => ({
             id: q.id || Math.floor(Math.random() * 100000) + Date.now(),
             question: q.question,
             options: q.options,
             correctAnswer: q.correctAnswer,
             context: q.context
          }));
          
          quizCache[cacheKey] = formattedQuestions;
          
          if (isDev()) {
             fetch('/__save-question', {
                 method: 'POST',
                 headers: {'Content-Type': 'application/json'},
                 body: JSON.stringify({ categoryId: req.catId, key: `${req.stableId}_${difficulty}_${lang}`, data: formattedQuestions })
             }).catch(() => {});

             // Trigger Background Mirroring (Strategy 1)
             triggerBackgroundTranslation(req.stableId, req.catId, difficulty, lang, formattedQuestions);
          }

          results.push({ topic: req.originalLabel, questions: formattedQuestions, categoryId: req.catId });
        }
      });
      
      saveCache(CACHE_KEY_QUIZ, quizCache);
    } catch (error) {
      console.error("Batch Quiz Generation Failed:", error);
      missingRequests.forEach(req => {
         results.push({ topic: req.originalLabel, questions: FALLBACK_QUIZ, categoryId: req.catId });
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
  performance: {id: number, ok: boolean}[] 
): Promise<EvaluationResult> => {
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
    const ai = getAiClient();

    const summaries = batches.map(b => 
      `## Topic: ${b.topic} (Score: ${b.score}/100)
       Questions:
       ${b.performance.map(p => 
         `- Q${p.questionId}: "${p.questionText}"
            User Selected: "${p.selectedOption}"
            Correct Answer: "${p.correctAnswer}"
            Result: ${p.isCorrect ? 'Correct' : 'Incorrect'}`
       ).join('\n')}`
    ).join('\n\n');

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
      3. For "details" array, provide specific analysis for each question based on the Question text and the User's answer. Explain why the answer is wrong or praise the insight.
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
