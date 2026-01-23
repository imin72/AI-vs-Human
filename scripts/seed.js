
/**
 * MASTER DATA GENERATOR (Strategy 2)
 * 
 * Run this script via: npm run seed-db
 * 
 * It will:
 * 1. Read the list of subtopics.
 * 2. Ask Gemini to generate 5-10 high-quality ENGLISH questions for each.
 * 3. Append them to the `data/questions/[Category].ts` files.
 */

import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.API_KEY || process.env.VITE_API_KEY;

if (!API_KEY) {
  console.error("❌ API_KEY is missing in .env file");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const MODEL_NAME = 'gemini-2.5-flash'; // Use a fast model for seeding

// Define target scope (Can be adjusted)
const TARGET_DIFFICULTY = "HARD"; // Generate HARD questions for master DB
const QUESTIONS_PER_TOPIC = 5;

// Topics structure (Simplified version of TRANSLATIONS)
// You can add more categories here to expand the seed scope
const TOPICS_TO_SEED = {
  "Science": ["Quantum Physics", "Astronomy", "Genetics", "Neuroscience"],
  "History": ["World War II", "Ancient Egypt", "Cold War", "Renaissance"],
  "Tech": ["Artificial Intelligence", "Coding", "Cybersecurity", "Blockchain"],
  "Philosophy": ["Stoicism", "Existentialism", "Ethics", "Logic"]
};

async function generateMasterData() {
  console.log("🚀 Starting Master Data Generation (English)...");

  for (const [category, subtopics] of Object.entries(TOPICS_TO_SEED)) {
    console.log(`\n📂 Processing Category: ${category}`);
    
    // Process subtopics in batches to avoid rate limits
    for (const topic of subtopics) {
      const key = `${topic}_${TARGET_DIFFICULTY}_en`;
      const filename = `${category.toLowerCase()}.ts`;
      const filePath = path.resolve(__dirname, '../data/questions', filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.log(`   Creating new file: ${filename}`);
        fs.writeFileSync(filePath, `import { QuizQuestion } from '../../types';\n\nexport const ${category.toUpperCase()}_DB: Record<string, QuizQuestion[]> = {\n};`);
      }

      // Check if key already exists to avoid double cost
      const currentContent = fs.readFileSync(filePath, 'utf-8');
      if (currentContent.includes(`"${key}"`)) {
        console.log(`   ⏭️  Skipping ${topic} (Already exists)`);
        continue;
      }

      console.log(`   ⚡ Generating questions for: ${topic}...`);

      try {
        const prompt = `
          Generate ${QUESTIONS_PER_TOPIC} challenging, high-quality multiple-choice questions about "${topic}".
          
          Constraints:
          - **STRICT OBJECTIVITY**: Questions must be based on absolute facts, physical laws, historical dates, or verifiable data. Avoid subjective value judgments or ambiguous scenarios.
          - Language: English
          - Difficulty: ${TARGET_DIFFICULTY}
          - Format: JSON Array of objects with keys: id (number), question (string), options (string array), correctAnswer (string), context (string).
          - Context: A short, interesting fact explaining the answer.
          - ID: Random integer.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json"
            }
        });

        const rawText = response.text || "[]";
        // Simple JSON cleanup
        const jsonText = rawText.replace(/```json|```/g, "").trim();
        const questions = JSON.parse(jsonText);

        if (Array.isArray(questions) && questions.length > 0) {
           // Append to file
           const newEntry = `\n  "${key}": ${JSON.stringify(questions, null, 2)},`;
           
           // Insert before the last closing brace
           const lastBrace = currentContent.lastIndexOf('};');
           const newContent = currentContent.slice(0, lastBrace) + newEntry + "\n};";
           
           fs.writeFileSync(filePath, newContent);
           console.log(`   ✅ Saved ${questions.length} questions.`);
        }

        // Small delay to be nice to the API
        await new Promise(r => setTimeout(r, 1000));

      } catch (e) {
        console.error(`   ❌ Failed for ${topic}:`, e.message);
      }
    }
  }

  console.log("\n✨ Seeding Complete!");
}

generateMasterData();
