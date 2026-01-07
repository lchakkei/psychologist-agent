import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { psychologistAgent } from '../agents';

const provideSupportSchema = z.object({
  userInput: z.string(),
});

const provideSupport = createStep({
  id: 'provide-support',
  description: 'Provides psychological support and guidance',
  inputSchema: provideSupportSchema,
  outputSchema: z.object({
    response: z.string(),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const prompt = inputData.userInput;

    const response = await psychologistAgent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let responseText = '';

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      responseText += chunk;
    }

    return {
      response: responseText,
    };
  },
});

const psychologistWorkflow = createWorkflow({
  id: 'psychologist-workflow',
  inputSchema: z.object({
    userInput: z.string().describe('The user input or concern to discuss'),
  }),
  outputSchema: z.object({
    response: z.string(),
  }),
})
  .then(provideSupport);

psychologistWorkflow.commit();

export { psychologistWorkflow };
