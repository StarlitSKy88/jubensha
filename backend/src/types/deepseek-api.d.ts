declare module 'deepseek-api' {
  export interface DeepseekConfig {
    apiKey: string;
  }

  export interface CompletionOptions {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  }

  export interface CompletionResponse {
    choices: Array<{
      text: string;
      index: number;
    }>;
  }

  export class DeepseekAPI {
    constructor(config: DeepseekConfig);
    createCompletion(options: CompletionOptions): Promise<CompletionResponse>;
  }
} 