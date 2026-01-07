// Shared utility functions for mental health concern analysis

export function categorizeConcern(concern: string): string {
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

export function assessSeverity(concern: string): string {
  const highSeverityKeywords = [
    'suicide', 'suicidal', 'kill myself', 'end it all', 'end my life',
    'self-harm', 'hurt myself', 'harm myself', 'crisis',
    'want to die', 'better off dead', 'no reason to live'
  ];
  const moderateSeverityKeywords = [
    'can\'t cope', 'cannot cope', 'unbearable', 'desperate', 
    'severe', 'terrible', 'extremely', 'very difficult'
  ];
  
  if (highSeverityKeywords.some(keyword => concern.includes(keyword))) {
    return 'High - Immediate professional help recommended';
  } else if (moderateSeverityKeywords.some(keyword => concern.includes(keyword))) {
    return 'Moderate - Consider professional support';
  }
  return 'Mild - Self-help strategies may be beneficial';
}

export function getSupportData(category: string, severity: string): {
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
    'Relationships': {
      supportLevel: 'Communication skills and couples/family therapy if needed',
      techniques: [
        'Active listening practice',
        'Using "I" statements',
        'Setting healthy boundaries',
        'Conflict resolution strategies',
        'Empathy building exercises'
      ],
      immediateSteps: [
        'Take time to cool down before discussing issues',
        'Listen to understand, not to respond',
        'Express your feelings without blame',
        'Consider the other person\'s perspective'
      ]
    },
    'Self-esteem': {
      supportLevel: 'Self-compassion practices and positive psychology techniques',
      techniques: [
        'Positive self-talk and affirmations',
        'Identifying and challenging negative beliefs',
        'Celebrating small wins',
        'Self-compassion exercises',
        'Values clarification'
      ],
      immediateSteps: [
        'Write down three things you did well today',
        'Challenge one negative thought with evidence',
        'Treat yourself as you would a good friend',
        'Practice one act of self-care'
      ]
    },
    'Sleep': {
      supportLevel: 'Sleep hygiene improvement and possible medical consultation',
      techniques: [
        'Consistent sleep schedule',
        'Bedtime routine development',
        'Screen time reduction before bed',
        'Sleep environment optimization',
        'Relaxation before sleep'
      ],
      immediateSteps: [
        'Set a consistent bedtime',
        'Avoid screens 1 hour before bed',
        'Keep bedroom cool and dark',
        'Practice relaxation techniques'
      ]
    },
    'Grief': {
      supportLevel: 'Grief counseling and support groups',
      techniques: [
        'Allow yourself to feel emotions',
        'Create meaningful rituals',
        'Connect with supportive others',
        'Self-care during grief',
        'Journaling memories'
      ],
      immediateSteps: [
        'Acknowledge your feelings are valid',
        'Reach out to supportive people',
        'Take care of basic needs',
        'Be patient with yourself'
      ]
    },
    'Anger': {
      supportLevel: 'Anger management therapy and emotional regulation',
      techniques: [
        'Identifying anger triggers',
        'Time-out strategies',
        'Relaxation and breathing exercises',
        'Communication skills',
        'Problem-solving approaches'
      ],
      immediateSteps: [
        'Take a time-out to cool down',
        'Practice deep breathing',
        'Identify what triggered the anger',
        'Express feelings calmly when ready'
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
