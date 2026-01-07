import { createTool } from "@mastra/core/tools";
import z from "zod";
import Exa from "exa-js";

const apiKey = process.env.EXA_API_KEY;
if (!apiKey) {
  throw new Error('EXA_API_KEY environment variable is required');
}

export const exa = new Exa(apiKey);

const MAX_CONTENT_LENGTH = 500;

export const webSearch = createTool({
  id: "exa-web-search",
  description: "Search the web",
  inputSchema: z.object({
    query: z.string().min(1).max(50).describe("The search query"),
  }),
  outputSchema: z.array(
    z.object({
      title: z.string().nullable(),
      url: z.string(),
      content: z.string(),
      publishedDate: z.string().optional(),
    }),
  ),
  execute: async ({ context }) => {
    try {
      const response = await exa.searchAndContents(context.query, {
        livecrawl: "always",
        numResults: 2,
        text: true,
      });

      return response.results.map((result) => ({
        title: result.title,
        url: result.url,
        content: (result.text || "").slice(0, MAX_CONTENT_LENGTH),
        publishedDate: result.publishedDate,
      }));
    } catch (error) {
      throw new Error(`Failed to search with Exa: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});
