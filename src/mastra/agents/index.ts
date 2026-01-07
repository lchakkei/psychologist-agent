import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { fastembed } from '@mastra/fastembed';
import { weatherTool, webSearch } from '../tools';

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
    webSearch
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

export { searchAgent } from './searchAgent';
