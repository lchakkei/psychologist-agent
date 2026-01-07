import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { fastembed } from '@mastra/fastembed';
import { 
  ModerationProcessor,
  SystemPromptScrubber,
  PIIDetector,
  BatchPartsProcessor
} from '@mastra/core/processors';
import { weatherTool } from '../tools';

const MASTRA_DB_URL = 'file:../../mastra.db';

export const psychologistAgent = new Agent({
  name: 'Psychologist Agent',
  instructions: `
      You are a compassionate and professional psychologist assistant dedicated to providing emotional support and mental health guidance.

      Your primary function is to help users with their mental health and emotional well-being. When responding:
      - Create a safe, non-judgmental space for users to express their feelings
      - Practice active listening and validate their emotions
      - Ask thoughtful, open-ended questions to better understand their situation
      - Provide evidence-based coping strategies and therapeutic techniques when appropriate
      - Recognize signs of crisis and recommend professional help when necessary
      - Maintain confidentiality and respect boundaries
      - Use empathetic language and show genuine care
      - Never diagnose conditions - instead, help users explore their feelings and thoughts
      - Encourage self-reflection and personal growth
      - Keep responses supportive, warm, and professional

      Remember: You are here to support, not to replace professional therapy. Always encourage users to seek professional help for serious mental health concerns.
`,
  model: process.env.MODEL || 'openai/gpt-4o',
  
  outputProcessors: [
    // Batch stream parts first to reduce LLM calls
    new BatchPartsProcessor({
      batchSize: 10,
    }),
    // Ensure AI responses don't contain harmful content
    new ModerationProcessor({
      model: 'poe/google/gemini-2.5-flash-lite',
      instructions: 'Check if and Avoid the response contains harmful, hateful, harassing, violent, or self-harm content',
      threshold: 0.6,
      strategy: 'block',
      categories: ['hate', 'harassment', 'violence', 'self-harm'],
      includeScores: true,
      chunkWindow: 1
    }),
    // Prevent system prompt leakage in AI responses
    new SystemPromptScrubber({
      model: 'poe/google/gemini-2.5-flash-lite',
      strategy: 'redact',
      redactionMethod: 'placeholder',
      includeDetections: true
    }),
    // Ensure AI doesn't accidentally leak PII in responses
    new PIIDetector({
      model: 'poe/google/gemini-2.5-flash-lite',
      threshold: 0.7,
      strategy: 'redact',
      detectionTypes: ['email', 'phone', 'ssn', 'credit-card'],
      redactionMethod: 'mask'
    })
  ],
  
  tools: {
    weatherTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({ url: MASTRA_DB_URL }),
    options: {
      threads: { generateTitle: true },
      semanticRecall: true,
      workingMemory: { enabled: true },
    },
    embedder: fastembed,
    vector: new LibSQLVector({ connectionUrl: MASTRA_DB_URL }),
  }),
});
