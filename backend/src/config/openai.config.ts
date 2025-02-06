export const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY,
  // 模型配置
  models: {
    embedding: 'text-embedding-3-small',
    completion: 'gpt-4-turbo-preview',
    chat: 'gpt-4'
  },
  // API配置
  api: {
    timeout: 60000,
    maxRetries: 3,
    baseURL: 'https://api.openai.com/v1'
  },
  // 请求默认参数
  defaults: {
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0
  }
}; 