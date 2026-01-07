import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { categorizeConcern, assessSeverity, getSupportData } from '../utils/mental-health-helpers';

interface MentalHealthResponse {
  concern: string;
  severity: string;
  category: string;
  supportLevel: string;
  techniques: string[];
  immediateSteps: string[];
}

export const psychologistTool = createTool({
  id: 'get-mental-health-support',
  description: 'Get mental health support and guidance for a specific concern',
  inputSchema: z.object({
    concern: z.string().describe('The mental health concern or issue'),
  }),
  outputSchema: z.object({
    concern: z.string(),
    severity: z.string(),
    category: z.string(),
    supportLevel: z.string(),
    techniques: z.array(z.string()),
    immediateSteps: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    return await getMentalHealthSupport(context.concern);
  },
});

const getMentalHealthSupport = async (concern: string): Promise<MentalHealthResponse> => {
  // Analyze the concern and categorize it
  const category = categorizeConcern(concern.toLowerCase());
  const severity = assessSeverity(concern.toLowerCase());
  
  // Get appropriate support level and techniques based on category
  const supportData = getSupportData(category, severity);

  return {
    concern: concern,
    severity: severity,
    category: category,
    supportLevel: supportData.supportLevel,
    techniques: supportData.techniques,
    immediateSteps: supportData.immediateSteps,
  };
};
