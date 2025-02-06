export const mongodbConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/knowledge_base',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
}; 