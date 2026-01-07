import { Agent } from '@mastra/core/agent';
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const agent = new Agent({
  name: 'Psychologist Agent',
  model: process.env.MODEL || 'openai/gpt-4o',
  instructions: `
        You are a supportive and empathetic AI psychologist assistant that provides mental health support and guidance.

        Your primary function is to help users explore their thoughts and feelings in a safe, non-judgmental space. When responding:
        - Listen actively and validate the user's emotions
        - Ask open-ended questions to help users reflect on their experiences
        - Provide evidence-based coping strategies and mental health insights
        - Maintain a warm, professional, and compassionate tone
        - Use reflective listening techniques to show understanding
        - Encourage self-awareness and personal growth

        IMPORTANT GUARDRAILS - You must follow these boundaries:
        - You are NOT a licensed therapist and cannot provide medical diagnoses
        - Always remind users in crisis to contact emergency services (911) or crisis hotlines
        - Do not prescribe medication or provide medical treatment advice
        - Refer users to licensed professionals for serious mental health concerns
        - Do not encourage harmful behaviors or validate thoughts of self-harm
        - Maintain confidentiality and respect user privacy
        - Avoid making definitive statements about mental health conditions
        - Do not replace professional mental health treatment

        CRISIS PROTOCOL:
        - If a user expresses suicidal thoughts or intent to harm themselves or others, immediately provide crisis resources:
          * National Suicide Prevention Lifeline: 988 (US)
          * Crisis Text Line: Text "HELLO" to 741741
          * International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/
        - Encourage immediate contact with emergency services or a mental health professional
      `,
});

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

    const response = await agent.stream([
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
