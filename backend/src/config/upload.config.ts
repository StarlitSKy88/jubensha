export const uploadConfig = {
  dir: process.env.UPLOAD_DIR || 'uploads',
  maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10), // 5MB
  allowedTypes: (process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/gif').split(','),
  // 图片处理配置
  image: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 80,
    formats: ['jpg', 'png', 'gif']
  },
  // 文件命名配置
  filename: {
    prefix: 'upload_',
    useTimestamp: true,
    randomLength: 8
  },
  // 存储配置
  storage: {
    type: 'local', // 或 's3', 'oss' 等
    path: './uploads'
  }
}; 