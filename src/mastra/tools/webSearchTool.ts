import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { tavily } from '@tavily/core';

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score?: number;
}

interface TavilySearchResponse {
  results: TavilySearchResult[];
}

export const webSearchTool = createTool({
  id: 'web-search',
  description: 'Search the web for current information, news, and answers to questions. Use this when you need up-to-date information or when the user asks about current events, recent developments, or information not in your training data.',
  inputSchema: z.object({
    query: z.string().describe('The search query to find information on the web'),
    searchDepth: z.enum(['basic', 'advanced']).optional().describe('The depth of the search - basic for quick results, advanced for comprehensive research'),
    maxResults: z.number().min(1).max(10).optional().describe('Maximum number of results to return (1-10)'),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        content: z.string(),
        score: z.number().optional(),
      })
    ),
    query: z.string(),
  }),
  execute: async ({ context }) => {
    const apiKey = process.env.TAVILY_API_KEY;
    
    if (!apiKey) {
      throw new Error('TAVILY_API_KEY environment variable is not set');
    }

    const client = tavily({ apiKey });
    
    const response = await client.search(context.query, {
      searchDepth: context.searchDepth || 'basic',
      maxResults: context.maxResults || 5,
    }) as TavilySearchResponse;

    return {
      results: response.results.map((result: TavilySearchResult) => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: result.score,
      })),
      query: context.query,
    };
  },
});
