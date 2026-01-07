import { Agent } from '@mastra/core/agent';
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { categorizeConcern, assessSeverity, getSupportData } from '../utils/mental-health-helpers';

const agent = new Agent({
  name: 'Psychologist Agent',
  model: process.env.MODEL || 'openai/gpt-4o',
  instructions: `
        You are an empathetic psychological support specialist who excels at providing personalized mental health guidance. Analyze the concern data and provide practical, evidence-based recommendations.

        For each concern, structure your response exactly as follows:

        🧠 CONCERN ANALYSIS
        ═══════════════════════════
        
        📋 OVERVIEW
        • Category: [category]
        • Severity: [severity level]
        • Support Level: [recommended support type]

        💡 UNDERSTANDING YOUR FEELINGS
        [Provide validation and explanation of what they might be experiencing]

        🛠️ RECOMMENDED TECHNIQUES
        1. [Technique Name]
           • Description: [how to do it]
           • When to use: [best timing]
           • Why it helps: [explanation]

        2. [Technique Name]
           • Description: [how to do it]
           • When to use: [best timing]
           • Why it helps: [explanation]

        🎯 IMMEDIATE ACTION STEPS
        1. [Step 1] - [brief explanation]
        2. [Step 2] - [brief explanation]
        3. [Step 3] - [brief explanation]

        📞 PROFESSIONAL SUPPORT
        [Guidance on when and how to seek professional help, including crisis resources if applicable]

        ⚠️ IMPORTANT REMINDERS
        • You are not alone in this
        • These feelings are valid and common
        • Professional help is available and effective
        • Crisis support: 988 Lifeline (US), 116 123 (UK Samaritans), 13 11 14 (Australia Lifeline), or your local emergency services

        Guidelines:
        - Always maintain an empathetic, non-judgmental tone
        - Provide 2-3 specific, actionable techniques
        - Include 3-4 immediate steps they can take right now
        - Emphasize professional help for moderate to severe concerns
        - Include crisis resources for high-severity concerns
        - Keep language clear, supportive, and accessible

        Maintain this exact formatting for consistency, using the emoji and section headers as shown.
      `,
});

const concernSchema = z.object({
  concern: z.string(),
  severity: z.string(),
  category: z.string(),
  supportLevel: z.string(),
  techniques: z.array(z.string()),
  immediateSteps: z.array(z.string()),
});

const analyzeConcern = createStep({
  id: 'analyze-concern',
  description: 'Analyzes a mental health concern and categorizes it',
  inputSchema: z.object({
    concern: z.string().describe('The mental health concern to analyze'),
  }),
  outputSchema: concernSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    // Use shared utility functions for concern analysis
    const category = categorizeConcern(inputData.concern.toLowerCase());
    const severity = assessSeverity(inputData.concern.toLowerCase());
    const supportData = getSupportData(category, severity);

    return {
      concern: inputData.concern,
      severity: severity,
      category: category,
      supportLevel: supportData.supportLevel,
      techniques: supportData.techniques,
      immediateSteps: supportData.immediateSteps,
    };
  },
});

const provideGuidance = createStep({
  id: 'provide-guidance',
  description: 'Provides personalized psychological guidance based on the concern analysis',
  inputSchema: concernSchema,
  outputSchema: z.object({
    guidance: z.string(),
  }),
  execute: async ({ inputData }) => {
    const analysis = inputData;

    if (!analysis) {
      throw new Error('Analysis data not found');
    }

    const prompt = `Based on the following mental health concern analysis, provide comprehensive, empathetic guidance:
      ${JSON.stringify(analysis, null, 2)}
      `;

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let guidanceText = '';

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      guidanceText += chunk;
    }

    return {
      guidance: guidanceText,
    };
  },
});

const psychologistWorkflow = createWorkflow({
  id: 'psychologist-workflow',
  inputSchema: z.object({
    concern: z.string().describe('The mental health concern to address'),
  }),
  outputSchema: z.object({
    guidance: z.string(),
  }),
})
  .then(analyzeConcern)
  .then(provideGuidance);

psychologistWorkflow.commit();

export { psychologistWorkflow };
