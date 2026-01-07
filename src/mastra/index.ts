import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { CloudExporter, DefaultExporter, SensitiveDataFilter, SamplingStrategyType } from '@mastra/core/ai-tracing';
import { weatherWorkflow } from './workflows';
import { weatherAgent } from './agents';

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { weatherAgent },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  observability: {
    configs: {
      default: {
        serviceName: 'mastra',
        sampling: { type: SamplingStrategyType.ALWAYS },
        processors: [new SensitiveDataFilter()],
        exporters: [new CloudExporter(), new DefaultExporter()],
      },
    },
  },
});
