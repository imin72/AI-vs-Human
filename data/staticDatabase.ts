
import { QuizQuestion } from '../types';
import { SCIENCE_DB } from './questions/science';
import { HISTORY_DB } from './questions/history';
import { TECH_DB } from './questions/tech';
import { ARTS_DB } from './questions/arts';
import { GEOGRAPHY_DB } from './questions/geography';
import { GENERAL_DB } from './questions/general';
import { MOVIES_DB } from './questions/movies';
import { MUSIC_DB } from './questions/music';
import { GAMING_DB } from './questions/gaming';
import { SPORTS_DB } from './questions/sports';
import { MYTHOLOGY_DB } from './questions/mythology';
import { LITERATURE_DB } from './questions/literature';
import { NATURE_DB } from './questions/nature';
import { FOOD_DB } from './questions/food';
import { SPACE_DB } from './questions/space';
import { PHILOSOPHY_DB } from './questions/philosophy';

/**
 * STATIC QUESTION DATABASE (Pre-generated Pool)
 * 
 * Refactored V3:
 * - All 16 Categories from translations.ts are now modularized.
 * - Key Format: "TopicName_DIFFICULTY_Language" (e.g., "Quantum Physics_HARD_en")
 */

export const STATIC_QUESTION_DB: Record<string, QuizQuestion[]> = {
  ...SCIENCE_DB,
  ...HISTORY_DB,
  ...TECH_DB,
  ...ARTS_DB,
  ...GEOGRAPHY_DB,
  ...GENERAL_DB,
  ...MOVIES_DB,
  ...MUSIC_DB,
  ...GAMING_DB,
  ...SPORTS_DB,
  ...MYTHOLOGY_DB,
  ...LITERATURE_DB,
  ...NATURE_DB,
  ...FOOD_DB,
  ...SPACE_DB,
  ...PHILOSOPHY_DB
};
