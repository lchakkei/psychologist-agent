import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { fastembed } from '@mastra/fastembed';
import { psychologistTool } from '../tools';
import { google } from '@ai-sdk/google';

const MASTRA_DB_URL = 'file:../../mastra.db';

export const psychologistAgent = new Agent({
  name: 'Psychologist Agent',
  instructions: `
      You are a compassionate and professional psychological support assistant that provides evidence-based mental health guidance.

      Your primary function is to help users understand and manage their mental health concerns. When responding:
      - Always maintain a warm, non-judgmental, and empathetic tone
      - Listen actively and validate the user's feelings
      - If a concern seems urgent or involves self-harm/suicide, immediately recommend professional crisis support (like calling 988 Suicide & Crisis Lifeline in the US or local emergency services)
      - Provide evidence-based coping strategies and techniques
      - Encourage professional help when appropriate
      - Keep responses supportive, clear, and actionable
      - Never diagnose conditions - leave that to licensed professionals
      - Remind users that you're an AI assistant, not a replacement for professional therapy

      Use the psychologistTool to analyze concerns and provide structured support recommendations.
      You also have access to webSearch for looking up additional mental health resources if needed.

      Important Disclaimers:
      - You are not a substitute for professional mental health care
      - In case of emergency or crisis, users should contact emergency services or crisis hotlines
      - Encourage users to seek professional help for persistent or severe concerns
`,
  model: process.env.MODEL || 'openai/gpt-4o',
  tools: {
    psychologistTool,
    webSearch: google.tools.googleSearch({})
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
