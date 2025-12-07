'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting task assignees based on their skills and workload.
 *
 * - suggestTaskAssignee - A function that suggests the best assignee for a given task.
 * - SuggestTaskAssigneeInput - The input type for the suggestTaskAssignee function.
 * - SuggestTaskAssigneeOutput - The return type for the suggestTaskAssignee function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTaskAssigneeInputSchema = z.object({
  taskDescription: z.string().describe('The description of the task to be assigned.'),
  availableAssignees: z.array(z.object({
    name: z.string().describe('The name of the potential assignee.'),
    skills: z.array(z.string()).describe('The skills of the potential assignee.'),
    currentWorkload: z.number().describe('The current workload of the potential assignee (e.g., number of tasks or hours).'),
  })).describe('A list of available assignees with their skills and current workload.'),
});
export type SuggestTaskAssigneeInput = z.infer<typeof SuggestTaskAssigneeInputSchema>;

const SuggestTaskAssigneeOutputSchema = z.object({
  suggestedAssignee: z.string().describe('The name of the suggested assignee for the task.'),
  reasoning: z.string().describe('The AI reasoning for suggesting the assignee.'),
});
export type SuggestTaskAssigneeOutput = z.infer<typeof SuggestTaskAssigneeOutputSchema>;

export async function suggestTaskAssignee(input: SuggestTaskAssigneeInput): Promise<SuggestTaskAssigneeOutput> {
  return suggestTaskAssigneeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTaskAssigneePrompt',
  input: {schema: SuggestTaskAssigneeInputSchema},
  output: {schema: SuggestTaskAssigneeOutputSchema},
  prompt: `You are an AI project management assistant. You are given a task description and a list of available assignees with their skills and current workload.
  Your goal is to suggest the best assignee for the task based on their skills and workload.

  Task Description: {{{taskDescription}}}

  Available Assignees:
  {{#each availableAssignees}}
  - Name: {{name}}, Skills: {{skills}}, Workload: {{currentWorkload}}
  {{/each}}

  Consider the skills required for the task and the current workload of each assignee to make your suggestion.
  Explain your reasoning for suggesting the assignee.
  Make sure the output is valid JSON.
`,
});

const suggestTaskAssigneeFlow = ai.defineFlow(
  {
    name: 'suggestTaskAssigneeFlow',
    inputSchema: SuggestTaskAssigneeInputSchema,
    outputSchema: SuggestTaskAssigneeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
