import { z } from 'zod';
import { ArchitectSchema, ArchitectOutput } from './schema';
import { ARCHITECT_SYSTEM_PROMPT } from './prompt';

export const architectSkill = {
  name: "design-bpmn-architecture",
  description: "Genera una arquitectura BPMN técnica con lógica de resiliencia y semántica visual.",
  
  systemPrompt: ARCHITECT_SYSTEM_PROMPT,
  
  parameters: z.object({
    structured_data: z.object({
      context: z.any(),
      bpmn_ingredients: z.any(),
      logic_flow: z.any()
    })
  }),
  
  outputSchema: ArchitectSchema
};

export type ArchitectSkill = typeof architectSkill;
export type { ArchitectOutput };