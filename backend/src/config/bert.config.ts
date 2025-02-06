export const bertConfig = {
  endpoint: process.env.BERT_ENDPOINT || 'http://localhost:8000/encode',
  batchSize: parseInt(process.env.BERT_BATCH_SIZE || '32', 10),
  maxLength: parseInt(process.env.BERT_MAX_LENGTH || '512', 10),
  // 请求配置
  requestConfig: {
    timeout: 30000,
    retries: 3,
    retryDelay: 1000
  },
  // 缓存配置
  cache: {
    enabled: true,
    ttl: 3600 // 1小时
  }
}; 