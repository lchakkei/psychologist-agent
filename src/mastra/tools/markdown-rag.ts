import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { embed } from 'ai';
import { fastembed } from '@mastra/fastembed';
import { LibSQLVector } from '@mastra/libsql';
import * as fs from 'fs/promises';
import * as path from 'path';

const MASTRA_DB_URL = 'file:../../mastra.db';

// Initialize the vector store
const vectorStore = new LibSQLVector({ connectionUrl: MASTRA_DB_URL });

interface Document {
  id: string;
  content: string;
  metadata: {
    filename: string;
    section: string;
    path: string;
  };
}

// Function to read and parse markdown files
async function loadMarkdownFiles(docsPath: string): Promise<Document[]> {
  const documents: Document[] = [];
  
  try {
    const files = await fs.readdir(docsPath);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    for (const file of markdownFiles) {
      const filePath = path.join(docsPath, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Split content into chunks by sections (headings)
      const chunks = splitIntoChunks(content, file);
      documents.push(...chunks);
    }
  } catch (error) {
    console.error('Error loading markdown files:', error);
  }
  
  return documents;
}

// Split markdown content into meaningful chunks
function splitIntoChunks(content: string, filename: string): Document[] {
  const chunks: Document[] = [];
  const lines = content.split('\n');
  let currentChunk = '';
  let currentSection = '';
  let chunkIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if line is a heading
    if (line.startsWith('#')) {
      // Save previous chunk if it exists
      if (currentChunk.trim()) {
        chunks.push({
          id: `${filename}-${chunkIndex}`,
          content: currentChunk.trim(),
          metadata: {
            filename,
            section: currentSection,
            path: filename,
          },
        });
        chunkIndex++;
      }
      
      // Start new chunk
      currentSection = line.replace(/^#+\s*/, '');
      currentChunk = line + '\n';
    } else {
      currentChunk += line + '\n';
      
      // If chunk is getting too large (>500 chars), split it
      if (currentChunk.length > 500 && line.trim() === '') {
        chunks.push({
          id: `${filename}-${chunkIndex}`,
          content: currentChunk.trim(),
          metadata: {
            filename,
            section: currentSection,
            path: filename,
          },
        });
        chunkIndex++;
        currentChunk = '';
      }
    }
  }
  
  // Add final chunk
  if (currentChunk.trim()) {
    chunks.push({
      id: `${filename}-${chunkIndex}`,
      content: currentChunk.trim(),
      metadata: {
        filename,
        section: currentSection,
        path: filename,
      },
    });
  }
  
  return chunks;
}

// Function to index documents into vector store
async function indexDocuments(documents: Document[]): Promise<void> {
  const indexName = 'psychology-docs';
  
  try {
    // Prepare vectors and metadata
    const vectors: number[][] = [];
    const metadata: Record<string, any>[] = [];
    const ids: string[] = [];
    
    for (const doc of documents) {
      // Generate embedding using ai SDK
      const { embedding } = await embed({
        model: fastembed,
        value: doc.content,
      });
      
      vectors.push(embedding);
      metadata.push({
        content: doc.content,
        filename: doc.metadata.filename,
        section: doc.metadata.section,
        path: doc.metadata.path,
      });
      ids.push(doc.id);
    }
    
    // Create index if it doesn't exist (you might need to do this once)
    try {
      await vectorStore.createIndex({
        indexName,
        dimension: vectors[0].length,
        metric: 'cosine',
      });
    } catch (error) {
      // Index might already exist, that's okay
      console.log('Index might already exist, continuing...');
    }
    
    // Upsert all vectors
    await vectorStore.upsert({
      indexName,
      vectors,
      metadata,
      ids,
    });
    
    console.log(`Successfully indexed ${documents.length} documents`);
  } catch (error) {
    console.error('Error indexing documents:', error);
    throw error;
  }
}

// Function to query the vector store
async function queryDocuments(query: string, topK: number = 3): Promise<string> {
  const indexName = 'psychology-docs';
  
  try {
    // Generate query embedding using ai SDK
    const { embedding } = await embed({
      model: fastembed,
      value: query,
    });
    
    // Search vector store
    const results = await vectorStore.query({
      indexName,
      queryVector: embedding,
      topK,
      includeVector: false,
    });
    
    if (!results || results.length === 0) {
      return 'No relevant information found in the knowledge base.';
    }
    
    // Format results
    let response = 'Based on the available documentation:\n\n';
    
    for (const result of results) {
      const metadata = result.metadata;
      if (metadata) {
        response += `**From ${metadata.filename} - ${metadata.section}:**\n`;
        response += `${metadata.content}\n\n`;
        response += `---\n\n`;
      }
    }
    
    return response;
  } catch (error) {
    console.error('Error querying documents:', error);
    return 'Error retrieving information from the knowledge base.';
  }
}

// Tool to index markdown files
export const indexMarkdownTool = createTool({
  id: 'index-markdown',
  description: 'Index markdown files from the docs directory into the vector database for RAG queries',
  inputSchema: z.object({
    docsPath: z.string().default('./docs').describe('Path to the docs directory'),
  }),
  outputSchema: z.object({
    message: z.string(),
    documentCount: z.number(),
  }),
  execute: async ({ context }) => {
    const docsPath = path.resolve(context.docsPath);
    const documents = await loadMarkdownFiles(docsPath);
    await indexDocuments(documents);
    
    return {
      message: 'Successfully indexed markdown files',
      documentCount: documents.length,
    };
  },
});

// Tool to query markdown files using RAG
export const queryMarkdownTool = createTool({
  id: 'query-markdown',
  description: 'Query the indexed markdown documentation using semantic search to find relevant information',
  inputSchema: z.object({
    query: z.string().describe('The question or topic to search for in the documentation'),
    topK: z.number().optional().default(3).describe('Number of relevant chunks to retrieve'),
  }),
  outputSchema: z.object({
    results: z.string(),
  }),
  execute: async ({ context }) => {
    const results = await queryDocuments(context.query, context.topK);
    
    return {
      results,
    };
  },
});
