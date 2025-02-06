export const logConfig = {
  level: process.env.LOG_LEVEL || 'info',
  filename: process.env.LOG_FILENAME || 'app.log',
  maxSize: process.env.LOG_MAX_SIZE || '20m',
  maxFiles: process.env.LOG_MAX_FILES || '14d',
  dirname: process.env.LOG_DIR || 'logs',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  format: {
    timestamp: true,
    colorize: true,
    json: true,
    prettyPrint: process.env.NODE_ENV === 'development'
  }
}; 