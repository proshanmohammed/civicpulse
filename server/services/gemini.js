import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const isGeminiAvailable = Boolean(apiKey && apiKey !== 'your-gemini-api-key' && apiKey.trim().length > 10);

let ai = null;
if (isGeminiAvailable) {
  try {
    ai = new GoogleGenAI({ apiKey });
    console.log('[Gemini] @google/genai initialized with model gemini-2.5-flash and text-embedding-004');
  } catch (err) {
    console.warn('[Gemini] Failed to instantiate GoogleGenAI client, falling back to local NLP heuristics:', err.message);
  }
} else {
  console.log('[Gemini] GEMINI_API_KEY not provided or default placeholder. Using resilient municipal intelligence NLP fallback.');
}

/**
 * System prompt defining CivicPulse municipal triage behavior
 */
export const CIVIC_SYSTEM_PROMPT = `
You are CivicPulse, an expert municipal intelligence engine. Your role is to assist city authorities and citizens by objectively triaging civic grievances.
You prioritize human safety, structural integrity, and public health above routine maintenance.
You detect semantic duplicates with high precision and write clear, actionable briefs for municipal field crews.
Always maintain neutrality, accuracy, and clear reasoning.
`;

/**
 * Analyzes citizen complaints using Gemini 2.5 Flash
 */
export async function generateAIAnalysis(description, category) {
  if (ai) {
    try {
      const model = 'gemini-2.5-flash';
      const prompt = `
        ${CIVIC_SYSTEM_PROMPT}

        Analyze the following citizen civic complaint:
        Description: "${description}"
        User Selected Category: "${category || 'auto-detect'}"

        Perform the following tasks and output strictly in JSON format matching the schema:
        1. Clean category (validate or correct to one of: waterlogging, roads, waste, streetlights, electrical).
        2. Generate a concise 1-sentence summary.
        3. Calculate a priority score from 0 to 100 based on safety hazards, urgency, and scale.
        4. Assign priority level ('Critical', 'High', 'Medium', 'Low').
        5. Provide a plain-language explanation for why this priority score was assigned.
        6. Generate a 1-sentence action brief for field workers.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              category: { type: 'STRING' },
              summary: { type: 'STRING' },
              priority_score: { type: 'INTEGER' },
              priority_level: { type: 'STRING' },
              explanation: { type: 'STRING' },
              action_brief: { type: 'STRING' }
            },
            required: ['category', 'summary', 'priority_score', 'priority_level', 'explanation', 'action_brief']
          }
        }
      });

      const parsed = typeof response.text === 'function' ? JSON.parse(response.text()) : JSON.parse(response.text);
      // Validate schema
      return normalizeAnalysis(parsed, description, category);
    } catch (error) {
      console.warn('[Gemini] API error during generateContent. Falling back to local heuristic pipeline:', error.message);
    }
  }

  return generateFallbackAIAnalysis(description, category);
}

/**
 * Generates 768-dimensional vector embedding using text-embedding-004
 */
export async function generateTextEmbedding(text) {
  if (ai) {
    try {
      const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: text
      });
      if (response && response.embedding && Array.isArray(response.embedding.values)) {
        return response.embedding.values;
      }
    } catch (error) {
      console.warn('[Gemini] API error during embedContent. Using fallback embedding engine:', error.message);
    }
  }

  return generateFallbackEmbedding(text);
}

/**
 * Normalizes analysis results to strictly conform to CivicPulse types
 */
function normalizeAnalysis(parsed, description, originalCategory) {
  const validCategories = ['waterlogging', 'roads', 'waste', 'streetlights', 'electrical'];
  let cat = (parsed.category || '').toLowerCase().trim();
  if (!validCategories.includes(cat)) {
    cat = detectCategoryHeuristic(description, originalCategory);
  }

  let score = Number(parsed.priority_score);
  if (isNaN(score)) score = 50;
  score = Math.max(0, Math.min(100, Math.round(score)));

  let level = parsed.priority_level;
  if (!['Critical', 'High', 'Medium', 'Low'].includes(level)) {
    if (score >= 90) level = 'Critical';
    else if (score >= 70) level = 'High';
    else if (score >= 40) level = 'Medium';
    else level = 'Low';
  }

  return {
    category: cat,
    summary: parsed.summary || description.slice(0, 100),
    priority_score: score,
    priority_level: level,
    explanation: parsed.explanation || `Priority determined based on reported safety and urgency indicators (${level}).`,
    action_brief: parsed.action_brief || `Dispatch municipal inspection team to assess ${cat} issue.`
  };
}

/**
 * Heuristic category detection
 */
function detectCategoryHeuristic(text, fallback) {
  const lower = (text || '').toLowerCase();
  if (/wire|electric|transformer|spark|shock|pole fall|short circuit|cable/i.test(lower)) return 'electrical';
  if (/water|drain|flood|sewer|pipe|leak|overflow|clog|submerge/i.test(lower)) return 'waterlogging';
  if (/pothole|road|asphalt|tarmac|crater|traffic signal|speed bump|manhole/i.test(lower)) return 'roads';
  if (/garbage|trash|waste|dump|bin|debris|litter|smell|stench/i.test(lower)) return 'waste';
  if (/light|lamp|dark|bulb|illumination|street light/i.test(lower)) return 'streetlights';
  return fallback && ['waterlogging', 'roads', 'waste', 'streetlights', 'electrical'].includes(fallback) 
    ? fallback 
    : 'roads';
}

/**
 * Resilient, explainable municipal intelligence NLP fallback
 */
export function generateFallbackAIAnalysis(description, initialCategory) {
  const category = detectCategoryHeuristic(description, initialCategory);
  const text = (description || '').toLowerCase();

  // Safety risk factors
  const criticalKeywords = ['exposed wire', 'live wire', 'sparking', 'burst pipe', 'major flood', 'sinkhole', 'collapse', 'fire hazard', 'electrocution', 'gas leak', 'deep crater'];
  const highKeywords = ['blocked access', 'school', 'hospital', 'traffic blocked', 'manhole open', 'severe', 'impassable', 'pedestrians at risk', 'ambulance'];
  const mediumKeywords = ['overflowing', 'garbage bin', 'flickering', 'smell', 'pothole', 'street light off', 'water accumulation'];

  let score = 35; // base score
  let reasons = [];

  const hasCritical = criticalKeywords.some(kw => text.includes(kw));
  const hasHigh = highKeywords.some(kw => text.includes(kw));
  const hasMedium = mediumKeywords.some(kw => text.includes(kw));

  if (category === 'electrical') {
    score += 40;
    reasons.push('electrical infrastructure poses inherent public electrocution hazards');
  }

  if (hasCritical) {
    score = Math.max(score, 92);
    reasons.push('immediate life-safety or structural catastrophe risk detected');
  } else if (hasHigh) {
    score = Math.max(score, 76);
    reasons.push('significant public transit/access disruption near key infrastructure');
  } else if (hasMedium) {
    score = Math.max(score, 52);
    reasons.push('recurring localized nuisance requiring scheduled municipal maintenance');
  }

  // Adjust bounds
  score = Math.min(99, Math.max(15, score));

  let priority_level = 'Low';
  if (score >= 90) priority_level = 'Critical';
  else if (score >= 70) priority_level = 'High';
  else if (score >= 40) priority_level = 'Medium';

  const summary = description.length > 90 
    ? description.slice(0, 87) + '...' 
    : description;

  const explanation = `${priority_level} priority assigned (${score}/100) due to ${reasons.length ? reasons.join(' and ') : 'standard civic maintenance assessment'}.`;

  const actionBriefs = {
    electrical: 'Emergency dispatch: Deploy certified utility crew with insulated safety gear to de-energize and secure perimeter immediately.',
    waterlogging: 'Deploy suction truck and civil storm-drainage crew to clear obstruction and prevent surrounding structural water ingress.',
    roads: 'Dispatch road maintenance unit for cold-mix asphalt patching and barricade placement to avert vehicular accidents.',
    waste: 'Schedule automated sanitation compactor truck and hygiene sanitation spray for overflowing civic containment unit.',
    streetlights: 'Assign municipal electrical technician to replace luminaire fixture and inspect junction pole wiring.'
  };

  return {
    category,
    summary,
    priority_score: score,
    priority_level,
    explanation,
    action_brief: actionBriefs[category] || 'Dispatch municipal maintenance crew for on-site assessment.'
  };
}

/**
 * Deterministic 768-dimensional embedding generation using n-gram feature hashing
 * Ensures cosine similarity works identically in local tests and matches semantic duplicates!
 */
export function generateFallbackEmbedding(text) {
  const DIMENSIONS = 768;
  const embedding = new Array(DIMENSIONS).fill(0);
  const words = (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    // Hash word into multiple dimensions
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash << 5) - hash + word.charCodeAt(c);
      hash |= 0;
    }
    const idx1 = Math.abs(hash) % DIMENSIONS;
    const idx2 = Math.abs((hash * 31) + 17) % DIMENSIONS;
    embedding[idx1] += 1.0;
    embedding[idx2] += 0.5;

    // Bi-gram hashing for phrases like "live wire", "burst pipe"
    if (i < words.length - 1) {
      const bigram = word + '_' + words[i + 1];
      let bihash = 0;
      for (let c = 0; c < bigram.length; c++) {
        bihash = (bihash << 5) - bihash + bigram.charCodeAt(c);
        bihash |= 0;
      }
      const bidx = Math.abs(bihash) % DIMENSIONS;
      embedding[bidx] += 2.0;
    }
  }

  // Normalize vector to unit length (L2 norm)
  let sumSq = 0;
  for (let i = 0; i < DIMENSIONS; i++) {
    sumSq += embedding[i] * embedding[i];
  }
  const norm = Math.sqrt(sumSq) || 1.0;
  for (let i = 0; i < DIMENSIONS; i++) {
    embedding[i] = Number((embedding[i] / norm).toFixed(6));
  }

  return embedding;
}

/**
 * Calculate cosine similarity between two numerical vectors
 */
export function calculateCosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
