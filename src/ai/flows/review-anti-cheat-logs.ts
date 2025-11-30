'use server';

/**
 * @fileOverview An anti-cheat log review AI agent.
 *
 * - reviewAntiCheatLogs - A function that handles the anti-cheat log review process.
 * - ReviewAntiCheatLogsInput - The input type for the reviewAntiCheatLogs function.
 * - ReviewAntiCheatLogsOutput - The return type for the reviewAntiCheatLogs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReviewAntiCheatLogsInputSchema = z.object({
  logs: z.string().describe('The anti-cheat logs to review.'),
});
export type ReviewAntiCheatLogsInput = z.infer<typeof ReviewAntiCheatLogsInputSchema>;

const ReviewAntiCheatLogsOutputSchema = z.object({
  summary: z.string().describe('A summary of the anti-cheat logs.'),
  suspiciousPatterns: z.string().describe('A list of suspicious patterns found in the logs.'),
  recommendations: z.string().describe('Recommendations for action based on the logs.'),
});
export type ReviewAntiCheatLogsOutput = z.infer<typeof ReviewAntiCheatLogsOutputSchema>;

export async function reviewAntiCheatLogs(input: ReviewAntiCheatLogsInput): Promise<ReviewAntiCheatLogsOutput> {
  return reviewAntiCheatLogsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reviewAntiCheatLogsPrompt',
  input: {schema: ReviewAntiCheatLogsInputSchema},
  output: {schema: ReviewAntiCheatLogsOutputSchema},
  prompt: `You are an expert in reviewing anti-cheat logs for a competitive Counter-Strike 2 platform.

You will be provided with anti-cheat logs. Your task is to:

1.  Summarize the logs.
2.  Identify any suspicious patterns that might indicate cheating.
3.  Provide recommendations for action based on your findings, such as reviewing gameplay footage or applying temporary bans.

Anti-Cheat Logs:
{{{logs}}}`,
});

const reviewAntiCheatLogsFlow = ai.defineFlow(
  {
    name: 'reviewAntiCheatLogsFlow',
    inputSchema: ReviewAntiCheatLogsInputSchema,
    outputSchema: ReviewAntiCheatLogsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
