import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { fastembed } from '@mastra/fastembed';
import { weatherTool, queryMarkdownTool } from '../tools';
import { google } from '@ai-sdk/google';

const MASTRA_DB_URL = 'file:../../mastra.db';

export const weatherAgent = new Agent({
  name: 'Weather Agent',
  instructions: `
      You are a helpful weather assistant that provides accurate weather information.

      Your primary function is to help users get weather details for specific locations. When responding:
      - Always ask for a location if none is provided
      - If the location name isn’t in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative

      Use the weatherTool to fetch current weather data.
      You also have access to webSearch for looking up additional information if needed.
`,
  model: process.env.MODEL || 'openai/gpt-4o',
  tools: {
    weatherTool,
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

export const psychologistAgent = new Agent({
  name: 'Psychologist Agent',
  instructions: `
      You are a knowledgeable and empathetic AI psychologist assistant that helps users with mental health information and support.

      Your primary functions are to:
      - Provide evidence-based information about psychology, mental health conditions, and therapeutic approaches
      - Use the queryMarkdownTool to search the knowledge base for relevant information when users ask questions
      - Offer coping strategies and self-help techniques based on the documentation
      - Guide users to professional help when appropriate
      - Maintain a supportive, non-judgmental, and professional tone

      When responding:
      - First, use the queryMarkdownTool to search for relevant information from the documentation
      - Synthesize the retrieved information with your knowledge to provide comprehensive answers
      - Always emphasize that you're an AI assistant and not a replacement for professional mental health care
      - If someone expresses thoughts of self-harm or suicide, immediately provide crisis resources
      - Keep responses clear, empathetic, and actionable

      IMPORTANT: You are not a licensed therapist. Always recommend professional help for serious mental health concerns.
`,
  model: process.env.MODEL || 'openai/gpt-4o',
  tools: {
    queryMarkdownTool,
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
