#!/usr/bin/env node
/**
 * Script to index markdown files into the vector database
 * Run this script before using the psychologist agent to populate the knowledge base
 */

import { indexMarkdownTool } from './mastra/tools/markdown-rag';
import { RuntimeContext } from '@mastra/core/runtime-context';

async function main() {
  console.log('Starting markdown indexing...');
  
  try {
    const result = await indexMarkdownTool.execute({
      context: {
        docsPath: './docs'
      },
      runtimeContext: new RuntimeContext(),
    });
    
    console.log('✅', result.message);
    console.log(`📚 Indexed ${result.documentCount} document chunks`);
  } catch (error) {
    console.error('❌ Error indexing markdown files:', error);
    process.exit(1);
  }
}

main();
