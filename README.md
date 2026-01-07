# Weather Agent Template

This is a template project that demonstrates how to create a weather agent using the Mastra framework. The agent can provide weather information and forecasts based on user queries.

## Overview

The Weather Agent template showcases how to:

- Create an AI-powered agent using Mastra framework
- Implement weather-related workflows
- Handle user queries about weather conditions
- Integrate with OpenAI's API for natural language processing

## New: Psychologist Agent with RAG

This template now includes a **Psychologist Agent** that uses Retrieval-Augmented Generation (RAG) to query markdown documentation about psychology, mental health, and therapeutic approaches.

### Features

- **RAG-powered queries**: The agent can search through psychology documentation to provide evidence-based information
- **Vector search**: Uses FastEmbed for embeddings and LibSQL for vector storage
- **Markdown knowledge base**: Easily extensible documentation in the `docs/` folder
- **Semantic search**: Finds relevant information based on meaning, not just keywords

### Available Documentation

The knowledge base includes information about:
- Psychology basics and key areas
- Common mental health conditions
- Coping strategies and stress management
- Evidence-based therapeutic approaches (CBT, DBT, EMDR, etc.)

## Setup

1. Copy `.env.example` to `.env` and fill in your API keys.
2. Install dependencies: `pnpm install`
3. **Index the documentation**: `pnpm run index-docs` (required before using the psychologist agent)
4. Run the project: `pnpm dev`.

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key. [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

## Using the Psychologist Agent

After indexing the documentation, you can interact with the psychologist agent through the Mastra interface. The agent will:

1. Use the `queryMarkdownTool` to search the knowledge base for relevant information
2. Synthesize the retrieved information to provide comprehensive answers
3. Maintain context using Mastra's memory features

Example queries:
- "What are some coping strategies for anxiety?"
- "Explain cognitive behavioral therapy"
- "What are the signs I should seek professional help?"

## Adding More Documentation

To extend the knowledge base:

1. Add markdown files to the `docs/` folder
2. Run `pnpm run index-docs` to re-index the documentation
3. The new information will be available to the psychologist agent

## Available Agents

- **Weather Agent**: Provides weather information for specific locations
- **Psychologist Agent**: Provides mental health information using RAG over markdown documentation

