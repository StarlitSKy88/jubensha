import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';
import { CharacterError } from '../errors/character.error';

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/characters';
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = nanoid();
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// 文件过滤器
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new CharacterError('不支持的文件类型', 400));
    return;
  }

  // 检查文件大小（5MB）
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    cb(new CharacterError('文件大小不能超过5MB', 400));
    return;
  }

  cb(null, true);
};

// 创建上传中间件
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export class UploadService {
  /**
   * 处理图片上传
   */
  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      // 返回文件URL
      return `/uploads/characters/${file.filename}`;
    } catch (error) {
      // 删除已上传的文件
      if (file.path) {
        fs.unlinkSync(file.path);
      }
      throw new CharacterError('图片上传失败', 500);
    }
  }

  /**
   * 删除图片
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      throw new CharacterError('图片删除失败', 500);
    }
  }

  /**
   * 批量删除图片
   */
  async deleteImages(imageUrls: string[]): Promise<void> {
    try {
      for (const url of imageUrls) {
        const filePath = path.join(process.cwd(), url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      throw new CharacterError('批量删除图片失败', 500);
    }
  }

  /**
   * 验证图片URL
   */
  validateImageUrl(url: string): boolean {
    // 检查是否是本地上传的图片URL
    return /^\/uploads\/characters\/[\w-]+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }
}

export const uploadService = new UploadService(); 