export const elasticsearchConfig = {
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD
  },
  // 索引配置
  indices: {
    knowledge: {
      name: 'knowledge',
      settings: {
        number_of_shards: 1,
        number_of_replicas: 1
      }
    },
    logs: {
      name: 'logs',
      settings: {
        number_of_shards: 1,
        number_of_replicas: 1
      }
    }
  },
  // 客户端配置
  clientOptions: {
    maxRetries: 3,
    requestTimeout: 30000,
    sniffOnStart: true
  }
}; 