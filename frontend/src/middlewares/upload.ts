import multer from 'multer'
import path from 'path'
import { nanoid } from 'nanoid'

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'))
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${nanoid()}${ext}`)
  }
})

// 文件过滤器
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['application/json']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('不支持的文件类型'), false)
  }
}

// 创建上传中间件
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制 5MB
  }
}) 