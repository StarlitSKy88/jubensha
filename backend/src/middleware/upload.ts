import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';
import { Request } from 'express';

interface FileTypes {
  image: string[];
  document: string[];
  any: string[];
}

// 配置存储
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    const moduleDir = req.baseUrl.split('/')[1]; // 获取模块名称
    const finalDir = path.join(uploadDir, moduleDir);

    // 确保上传目录存在
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }
    cb(null, finalDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // 生成唯一文件名
    const uniqueSuffix = nanoid();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// 文件过滤器
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 获取允许的文件类型
  const allowedTypes: FileTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    any: []
  };

  const moduleType = req.baseUrl.split('/')[1] as keyof FileTypes;
  const allowed = allowedTypes[moduleType] || allowedTypes.any;

  if (allowed.length === 0 || allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'));
  }
};

// 创建上传中间件
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// 导出文件类型验证函数
export const validateFileType = (filename: string, allowedExtensions: string[]): boolean => {
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
};

// 导出文件删除函数
export const deleteFile = async (filepath: string): Promise<void> => {
  try {
    if (fs.existsSync(filepath)) {
      await fs.promises.unlink(filepath);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`删除文件失败: ${error.message}`);
    }
    throw new Error('删除文件失败：未知错误');
  }
}; 