import dotenv from 'dotenv';
dotenv.config();

console.log('--- Testing Credentials ---');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);

import { GoogleGenAI } from '@google/genai';

async function testGeminiModels() {
  const modelsToTry = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  for (const model of modelsToTry) {
    try {
      console.log(`Trying model: ${model}...`);
      const response = await ai.models.generateContent({
        model,
        contents: 'Say: CivicPulse Online!'
      });
      const text = typeof response.text === 'function' ? response.text() : response.text;
      console.log(`✅ SUCCESS with ${model}:`, text.trim());
      break;
    } catch (err) {
      console.log(`❌ Failed with ${model}:`, err.message);
    }
  }

  // Test embeddings model
  const embedModelsToTry = ['text-embedding-004', 'embedding-001'];
  for (const model of embedModelsToTry) {
    try {
      console.log(`Trying embedding model: ${model}...`);
      const res = await ai.models.embedContent({
        model,
        contents: 'Flooded road near school'
      });
      console.log(`✅ Embedding SUCCESS with ${model}! Dimensions:`, res.embedding.values.length);
      break;
    } catch (err) {
      console.log(`❌ Embedding failed with ${model}:`, err.message);
    }
  }
}

testGeminiModels().then(() => process.exit(0));
