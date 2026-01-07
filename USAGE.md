# RAG Markdown Query - Usage Examples

This document explains how to use the RAG (Retrieval-Augmented Generation) functionality to query markdown documentation.

## Overview

The RAG system consists of two main tools:

1. **indexMarkdownTool** - Indexes markdown files from the `docs/` directory into a vector database
2. **queryMarkdownTool** - Queries the indexed documentation using semantic search

## Setup

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Add Your OpenAI API Key

Copy `.env.example` to `.env` and add your API key:

```env
OPENAI_API_KEY=your_api_key_here
MODEL=openai/gpt-4o
```

### 3. Index the Documentation

Before using the psychologist agent, you need to index the markdown files:

```bash
npm run index-docs
# or
pnpm run index-docs
```

This will:
- Read all `.md` files from the `docs/` directory
- Split them into semantic chunks
- Generate embeddings using FastEmbed
- Store them in the LibSQL vector database

## Usage

### Running the Agents

Start the Mastra development server:

```bash
npm run dev
# or
pnpm run dev
```

This will start the Mastra interface where you can interact with both agents:
- **Weather Agent** - For weather information
- **Psychologist Agent** - For psychology and mental health information using RAG

### Example Queries for the Psychologist Agent

The psychologist agent will automatically use the `queryMarkdownTool` to search the documentation when you ask questions:

**Example 1: Asking about coping strategies**
```
User: What are some coping strategies for anxiety?

Agent: [Uses queryMarkdownTool to search for "anxiety coping strategies"]
       [Returns relevant information from docs/coping-strategies.md]
```

**Example 2: Learning about therapy types**
```
User: Tell me about cognitive behavioral therapy

Agent: [Uses queryMarkdownTool to search for "cognitive behavioral therapy"]
       [Returns information from docs/therapy-techniques.md]
```

**Example 3: Understanding mental health conditions**
```
User: What is PTSD?

Agent: [Uses queryMarkdownTool to search for "PTSD"]
       [Returns relevant sections from docs/psychology-basics.md]
```

## How It Works

### Document Chunking

The system automatically splits markdown files into chunks based on:
- Section headings (# and ##)
- Content length (max ~500 characters per chunk)

This ensures that retrieved information is focused and relevant.

### Vector Search

When you ask a question:
1. Your question is converted to a vector embedding
2. The system finds the top 3 most similar document chunks
3. These chunks are returned as context for the agent to synthesize an answer

### Metadata

Each chunk stores metadata including:
- **filename**: Source file name
- **section**: The heading/section name
- **path**: File path
- **content**: The actual text content

## Adding More Documentation

To extend the knowledge base:

1. **Create new markdown files** in the `docs/` directory

```markdown
# New Topic

## Subtopic 1
Content here...

## Subtopic 2
More content...
```

2. **Re-index the documentation**

```bash
npm run index-docs
```

3. **Test with the agent**

The new information will now be available for the psychologist agent to query.

## Testing

Run the component tests:

```bash
npm run test-rag
# or
pnpm run test-rag
```

This validates:
- Markdown files are loaded correctly
- Document chunking works
- Tools are structured properly
- Agents are configured correctly

## Architecture

```
docs/
  └── *.md files          → Source documentation

indexMarkdownTool         → Processes and indexes docs
  ├── Load files
  ├── Chunk content
  ├── Generate embeddings (FastEmbed)
  └── Store in LibSQL Vector DB

queryMarkdownTool         → Retrieves relevant info
  ├── Embed query
  ├── Search vector DB
  └── Return top matches

psychologistAgent         → Uses queryMarkdownTool
  └── Synthesizes responses from retrieved docs
```

## Troubleshooting

### "No relevant information found"

- Make sure you ran `npm run index-docs` first
- Check that markdown files exist in `docs/` directory
- Try rephrasing your query

### Database errors

- Delete the `.db` files and re-run `npm run index-docs`
- Ensure you have write permissions in the project directory

### Import errors

- Run `npm install` to ensure all dependencies are installed
- Make sure you're using Node.js version 18 or higher

## Advanced Usage

### Customizing Chunk Size

Edit `src/mastra/tools/markdown-rag.ts`:

```typescript
// Change from 500 to your preferred size
if (currentChunk.length > 500 && line.trim() === '') {
  // ...
}
```

### Adjusting Retrieved Chunks

When calling `queryMarkdownTool`, adjust `topK`:

```typescript
queryMarkdownTool.execute({
  context: {
    query: 'your question',
    topK: 5  // Return top 5 chunks instead of 3
  }
})
```

### Using Different Embeddings

The system uses FastEmbed by default. To use a different embedding model, modify:

```typescript
// In markdown-rag.ts
import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';

// Replace fastembed with openai
const { embedding } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  value: doc.content,
});
```

## Best Practices

1. **Keep markdown files focused** - One topic per file
2. **Use clear headings** - These become searchable sections
3. **Update regularly** - Re-index after adding new docs
4. **Test queries** - Ensure retrieval quality with test-rag
5. **Monitor chunk size** - Balance between context and specificity
