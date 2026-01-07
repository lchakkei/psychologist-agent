import { Agent } from '@mastra/core/agent';
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

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
        • Crisis support: 988 Lifeline (US), local emergency services

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

    // Simple concern analysis logic (matching the psychologistTool)
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

// Helper functions (matching the tool's logic)
function categorizeConcern(concern: string): string {
  const categories: Record<string, string[]> = {
    'Anxiety': ['anxiety', 'anxious', 'worry', 'nervous', 'panic', 'fear', 'stressed'],
    'Depression': ['depression', 'depressed', 'sad', 'hopeless', 'empty', 'worthless'],
    'Stress': ['stress', 'overwhelmed', 'pressure', 'burnout', 'exhausted'],
    'Relationships': ['relationship', 'partner', 'family', 'friend', 'conflict', 'communication'],
    'Self-esteem': ['self-esteem', 'confidence', 'worth', 'inadequate', 'insecure'],
    'Sleep': ['sleep', 'insomnia', 'tired', 'fatigue', 'rest'],
    'Grief': ['grief', 'loss', 'mourning', 'bereavement', 'death'],
    'Anger': ['anger', 'angry', 'rage', 'frustrated', 'irritable'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => concern.includes(keyword))) {
      return category;
    }
  }
  return 'General Well-being';
}

function assessSeverity(concern: string): string {
  const highSeverityKeywords = ['suicide', 'kill myself', 'end it all', 'self-harm', 'hurt myself', 'crisis'];
  const moderateSeverityKeywords = ['can\'t cope', 'unbearable', 'desperate', 'severe', 'terrible'];
  
  if (highSeverityKeywords.some(keyword => concern.includes(keyword))) {
    return 'High - Immediate professional help recommended';
  } else if (moderateSeverityKeywords.some(keyword => concern.includes(keyword))) {
    return 'Moderate - Consider professional support';
  }
  return 'Mild - Self-help strategies may be beneficial';
}

function getSupportData(category: string, severity: string): {
  supportLevel: string;
  techniques: string[];
  immediateSteps: string[];
} {
  const supportStrategies: Record<string, {
    supportLevel: string;
    techniques: string[];
    immediateSteps: string[];
  }> = {
    'Anxiety': {
      supportLevel: 'Cognitive Behavioral Therapy (CBT) and relaxation techniques',
      techniques: [
        'Deep breathing exercises (4-7-8 technique)',
        'Progressive muscle relaxation',
        'Mindfulness meditation',
        'Grounding techniques (5-4-3-2-1 method)',
        'Cognitive restructuring'
      ],
      immediateSteps: [
        'Take slow, deep breaths',
        'Name what you\'re feeling without judgment',
        'Practice the 5-4-3-2-1 grounding technique',
        'Remove yourself from triggering situations if possible'
      ]
    },
    'Depression': {
      supportLevel: 'Professional therapy and possible medication consultation',
      techniques: [
        'Behavioral activation',
        'Journaling thoughts and feelings',
        'Regular physical exercise',
        'Social connection maintenance',
        'Sleep hygiene improvement'
      ],
      immediateSteps: [
        'Reach out to a trusted friend or family member',
        'Engage in one small pleasurable activity',
        'Get outside for fresh air and sunlight',
        'Maintain basic self-care routines'
      ]
    },
    'Stress': {
      supportLevel: 'Stress management techniques and lifestyle adjustments',
      techniques: [
        'Time management and prioritization',
        'Regular breaks and boundary setting',
        'Physical exercise',
        'Relaxation techniques',
        'Problem-solving strategies'
      ],
      immediateSteps: [
        'List your priorities and delegate when possible',
        'Take a 10-minute break',
        'Practice deep breathing',
        'Identify one thing you can control right now'
      ]
    },
  };

  const defaultSupport = {
    supportLevel: 'General mental health support and self-care',
    techniques: [
      'Regular self-reflection',
      'Maintaining healthy routines',
      'Social connection',
      'Physical activity',
      'Mindfulness practice'
    ],
    immediateSteps: [
      'Take a moment to check in with yourself',
      'Practice one self-care activity',
      'Reach out to someone you trust',
      'Write down your thoughts and feelings'
    ]
  };

  return supportStrategies[category] || defaultSupport;
}
