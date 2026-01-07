# Weather Agent Template

This is a template project that demonstrates how to create a weather agent using the Mastra framework. The agent can provide weather information and forecasts based on user queries.

## Overview

The Weather Agent template showcases how to:

- Create an AI-powered agent using Mastra framework
- Implement weather-related workflows
- Handle user queries about weather conditions
- Integrate with OpenAI's API for natural language processing
- Use web search functionality to find current information
- Configure AI tracing with observability for monitoring and debugging

## Setup

1. Copy `.env.example` to `.env` and fill in your API keys.
2. Install dependencies: `pnpm install`
3. Run the project: `pnpm dev`.

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key. [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- `GOOGLE_API_KEY`: Your Google API key for Google Custom Search. [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
- `GOOGLE_SEARCH_ENGINE_ID`: Your Google Custom Search Engine ID. [https://programmablesearchengine.google.com/](https://programmablesearchengine.google.com/)
