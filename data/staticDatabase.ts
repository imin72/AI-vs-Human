
import { QuizQuestion, TOPIC_IDS, Difficulty, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';

// Map Category IDs to their dynamic import functions
const MODULE_MAP: Record<string, () => Promise<any>> = {
  [TOPIC_IDS.SCIENCE]: () => import('./questions/science'),
  [TOPIC_IDS.HISTORY]: () => import('./questions/history'),
  [TOPIC_IDS.TECH]: () => import('./questions/tech'),
  [TOPIC_IDS.ARTS]: () => import('./questions/arts'),
  [TOPIC_IDS.GEOGRAPHY]: () => import('./questions/geography'),
  [TOPIC_IDS.GENERAL]: () => import('./questions/general'),
  [TOPIC_IDS.MOVIES]: () => import('./questions/movies'),
  [TOPIC_IDS.MUSIC]: () => import('./questions/music'),
  [TOPIC_IDS.GAMING]: () => import('./questions/gaming'),
  [TOPIC_IDS.SPORTS]: () => import('./questions/sports'),
  [TOPIC_IDS.MYTHOLOGY]: () => import('./questions/mythology'),
  [TOPIC_IDS.LITERATURE]: () => import('./questions/literature'),
  [TOPIC_IDS.NATURE]: () => import('./questions/nature'),
  [TOPIC_IDS.FOOD]: () => import('./questions/food'),
  [TOPIC_IDS.SPACE]: () => import('./questions/space'),
  [TOPIC_IDS.PHILOSOPHY]: () => import('./questions/philosophy'),
};

/**
 * Helper: Find the English name (Stable ID) and Category for a given localized topic name.
 * This ensures that "양자 역학" maps to "Quantum Physics" so we can look it up in the DB.
 */
const resolveTopicInfo = (localizedName: string, lang: Language) => {
  // If language is English, we can try to find it directly, but it's safer to traverse to find the category.
  const subtopicsMap = TRANSLATIONS[lang].topics.subtopics;
  
  for (const [catId, topics] of Object.entries(subtopicsMap)) {
    const index = topics.indexOf(localizedName);
    if (index !== -1) {
      // Found the topic! Now get the English name at the same index.
      const englishName = TRANSLATIONS['en'].topics.subtopics[catId][index];
      return { catId, englishName };
    }
  }
  return null;
};

/**
 * Lazy loads questions for a specific topic.
 */
export const getStaticQuestions = async (
  topic: string, 
  difficulty: Difficulty, 
  lang: Language
): Promise<QuizQuestion[] | null> => {
  
  // 1. Resolve localized topic name to English key and Category
  const info = resolveTopicInfo(topic, lang);
  if (!info) {
    console.warn(`[StaticDB] Could not resolve topic: ${topic} (${lang})`);
    return null;
  }

  const { catId, englishName } = info;

  // 2. Dynamically import the category module
  const loader = MODULE_MAP[catId];
  if (!loader) return null;

  try {
    const module = await loader();
    // The modules export objects like SCIENCE_DB, HISTORY_DB. 
    // We assume the export name matches the pattern or we check values.
    // For simplicity, we grab the first export that looks like a DB record.
    const db = Object.values(module)[0] as Record<string, QuizQuestion[]>;
    
    // 3. Construct the key: "EnglishName_DIFFICULTY_Language"
    const key = `${englishName}_${difficulty}_${lang}`;
    
    // 4. Return data if exists
    return db[key] || null;

  } catch (error) {
    console.error(`[StaticDB] Failed to load module for ${catId}`, error);
    return null;
  }
};
