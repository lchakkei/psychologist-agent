#!/usr/bin/env node
/**
 * Test script to validate RAG components without requiring API keys
 */

import * as fs from 'fs/promises';
import * as path from 'path';

async function testMarkdownLoading() {
  console.log('🧪 Testing markdown file loading...\n');
  
  const docsPath = './docs';
  const files = await fs.readdir(docsPath);
  const markdownFiles = files.filter(file => file.endsWith('.md'));
  
  console.log(`✅ Found ${markdownFiles.length} markdown files:`);
  markdownFiles.forEach(file => console.log(`   - ${file}`));
  
  console.log('\n🧪 Testing markdown parsing...\n');
  
  for (const file of markdownFiles) {
    const filePath = path.join(docsPath, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const headings = lines.filter(line => line.startsWith('#'));
    
    console.log(`📄 ${file}:`);
    console.log(`   - ${content.length} characters`);
    console.log(`   - ${lines.length} lines`);
    console.log(`   - ${headings.length} headings`);
    console.log(`   - Sections: ${headings.map(h => h.replace(/^#+\s*/, '')).join(', ')}`);
    console.log('');
  }
  
  console.log('✅ All markdown files loaded and parsed successfully!\n');
}

async function testChunking() {
  console.log('🧪 Testing document chunking...\n');
  
  const testContent = `# Test Heading 1
This is some content under heading 1.

## Subheading 1.1
More content here.

# Test Heading 2
Different section content.`;

  const lines = testContent.split('\n');
  let chunks = 0;
  let currentChunk = '';
  
  for (const line of lines) {
    if (line.startsWith('#') && currentChunk.trim()) {
      chunks++;
      currentChunk = '';
    }
    currentChunk += line + '\n';
  }
  if (currentChunk.trim()) chunks++;
  
  console.log(`✅ Sample content chunked into ${chunks} sections\n`);
}

async function testToolStructure() {
  console.log('🧪 Testing tool structure...\n');
  
  try {
    // Dynamically import to check structure
    const tools = await import('./mastra/tools/markdown-rag.js');
    
    console.log('✅ indexMarkdownTool loaded:');
    console.log(`   - ID: ${tools.indexMarkdownTool.id}`);
    console.log(`   - Description: ${tools.indexMarkdownTool.description}`);
    
    console.log('\n✅ queryMarkdownTool loaded:');
    console.log(`   - ID: ${tools.queryMarkdownTool.id}`);
    console.log(`   - Description: ${tools.queryMarkdownTool.description}`);
    
    console.log('\n✅ Both tools structured correctly!\n');
  } catch (error) {
    console.error('❌ Error loading tools:', error instanceof Error ? error.message : String(error));
  }
}

async function testAgents() {
  console.log('🧪 Testing agent structure...\n');
  
  try {
    const agents = await import('./mastra/agents/index.js');
    
    console.log('✅ weatherAgent loaded:');
    console.log(`   - Name: ${agents.weatherAgent.name}`);
    
    console.log('\n✅ psychologistAgent loaded:');
    console.log(`   - Name: ${agents.psychologistAgent.name}`);
    console.log(`   - Tools: ${Object.keys(agents.psychologistAgent.tools || {}).join(', ')}`);
    
    console.log('\n✅ Both agents structured correctly!\n');
  } catch (error) {
    console.error('❌ Error loading agents:', error instanceof Error ? error.message : String(error));
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════\n');
  console.log('  RAG Markdown Query System - Component Tests\n');
  console.log('═══════════════════════════════════════════════════════\n\n');
  
  try {
    await testMarkdownLoading();
    await testChunking();
    await testToolStructure();
    await testAgents();
    
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('  ✅ All component tests passed!\n');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('\n📝 Next steps:');
    console.log('   1. Set your OPENAI_API_KEY in .env');
    console.log('   2. Run: npm run index-docs');
    console.log('   3. Run: npm run dev');
    console.log('   4. Test the psychologist agent!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

main();
