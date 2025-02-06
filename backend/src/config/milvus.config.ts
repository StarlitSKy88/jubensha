export const milvusConfig = {
  address: process.env.MILVUS_ADDRESS || 'localhost:19530',
  username: process.env.MILVUS_USERNAME,
  password: process.env.MILVUS_PASSWORD,
  ssl: process.env.MILVUS_SSL === 'true',
  collection: process.env.MILVUS_COLLECTION || 'knowledge_vectors',
  dimension: parseInt(process.env.MILVUS_DIMENSION || '768', 10),
  // 索引参数
  indexParams: {
    indexType: 'IVF_FLAT',
    metricType: 'L2',
    params: {
      nlist: 1024
    }
  },
  // 搜索参数
  searchParams: {
    nprobe: 16,
    limit: 10
  }
}; 