import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { google } from 'googleapis';

interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
}

interface GoogleSearchResponse {
  items?: GoogleSearchResult[];
}

export const webSearchTool = createTool({
  id: 'web-search',
  description: 'Search the web using Google Search for current information, news, and answers to questions. Use this when you need up-to-date information or when the user asks about current events, recent developments, or information not in your training data.',
  inputSchema: z.object({
    query: z.string().describe('The search query to find information on the web'),
    maxResults: z.number().min(1).max(10).optional().describe('Maximum number of results to return (1-10)'),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        snippet: z.string(),
      })
    ),
    query: z.string(),
  }),
  execute: async ({ context }) => {
    const apiKey = process.env.GOOGLE_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is not set');
    }
    
    if (!searchEngineId) {
      throw new Error('GOOGLE_SEARCH_ENGINE_ID environment variable is not set');
    }

    const customsearch = google.customsearch('v1');
    
    const response = await customsearch.cse.list({
      auth: apiKey,
      cx: searchEngineId,
      q: context.query,
      num: context.maxResults || 5,
    });

    const data = response.data as GoogleSearchResponse;

    return {
      results: (data.items || []).map((item: GoogleSearchResult) => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet,
      })),
      query: context.query,
    };
  },
});
