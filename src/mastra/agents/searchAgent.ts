import { Agent } from "@mastra/core/agent";
import { webSearch } from "../tools/searchTool";

export const searchAgent = new Agent({
  name: "Search Agent",
  instructions: "You are a search agent that can search the web for information.",
  model: "openai/gpt-4o-mini",
  tools: {
    webSearch,
  },
});
