import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { weatherWorkflow } from './workflows';
import { weatherAgent, searchAgent } from './agents';

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { weatherAgent, searchAgent },
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
