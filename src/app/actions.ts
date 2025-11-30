'use server';

import { reviewAntiCheatLogs, ReviewAntiCheatLogsOutput } from '@/ai/flows/review-anti-cheat-logs';

export type FormState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
  result: ReviewAntiCheatLogsOutput | null;
};

export async function handleReview(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const logs = formData.get('logs') as string;

  if (!logs) {
    return { status: 'error', message: 'Logs cannot be empty.', result: null };
  }

  try {
    const result = await reviewAntiCheatLogs({ logs });
    return {
      status: 'success',
      message: 'Logs reviewed successfully.',
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: 'An error occurred while reviewing the logs.',
      result: null,
    };
  }
}
