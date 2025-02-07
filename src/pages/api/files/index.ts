import { NextApiRequest, NextApiResponse } from 'next';
import { saveFile, readFile, deleteFile, listFiles, isValidFilePath } from '@/utils/fileOperations';
import path from 'path';

// 配置文件保存的根目录
const DOCUMENTS_DIR = path.join(process.cwd(), 'documents');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      // 获取文件列表或读取文件内容
      await handleGet(req, res);
      break;
    case 'POST':
      // 保存文件
      await handlePost(req, res);
      break;
    case 'DELETE':
      // 删除文件
      await handleDelete(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { path: filePath } = req.query;

  if (!filePath) {
    // 获取文件列表
    const result = await listFiles(DOCUMENTS_DIR);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
    return;
  }

  // 读取指定文件
  const fullPath = path.join(DOCUMENTS_DIR, filePath as string);
  if (!isValidFilePath(fullPath)) {
    res.status(400).json({ success: false, message: '无效的文件路径' });
    return;
  }

  const result = await readFile(fullPath);
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(404).json(result);
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { path: filePath, content } = req.body;

  if (!filePath || !content) {
    res.status(400).json({ success: false, message: '缺少必要参数' });
    return;
  }

  const fullPath = path.join(DOCUMENTS_DIR, filePath);
  if (!isValidFilePath(fullPath)) {
    res.status(400).json({ success: false, message: '无效的文件路径' });
    return;
  }

  const result = await saveFile(fullPath, content);
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(500).json(result);
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { path: filePath } = req.query;

  if (!filePath) {
    res.status(400).json({ success: false, message: '缺少文件路径' });
    return;
  }

  const fullPath = path.join(DOCUMENTS_DIR, filePath as string);
  if (!isValidFilePath(fullPath)) {
    res.status(400).json({ success: false, message: '无效的文件路径' });
    return;
  }

  const result = await deleteFile(fullPath);
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(500).json(result);
  }
} 