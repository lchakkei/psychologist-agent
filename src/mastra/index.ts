import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { weatherWorkflow } from './workflows';
import { psychologistAgent } from './agents';

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { psychologistAgent },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  observability: {
    default: {
      enabled: true,
    },
  },
});
