export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const ErrorCodes = {
  AI_ANALYSIS_FAILED: 'AI_ANALYSIS_FAILED',
  AI_API_ERROR: 'AI_API_ERROR',
  AI_DIALOGUE_FAILED: 'AI_DIALOGUE_FAILED'
} as const;

export type ErrorCode = keyof typeof ErrorCodes; 