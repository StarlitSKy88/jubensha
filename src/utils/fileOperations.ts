import fs from 'fs/promises';
import path from 'path';

export interface FileOperationResult {
  success: boolean;
  message: string;
}

const DOCUMENTS_DIR = path.join(process.cwd(), 'documents');

// 确保文档目录存在
export async function ensureDocumentsDir(): Promise<void> {
  try {
    await fs.access(DOCUMENTS_DIR);
  } catch {
    await fs.mkdir(DOCUMENTS_DIR, { recursive: true });
  }
}

// 验证文件路径是否合法
export function isValidFilePath(filePath: string): boolean {
  const normalizedPath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
  const fullPath = path.join(DOCUMENTS_DIR, normalizedPath);
  return fullPath.startsWith(DOCUMENTS_DIR);
}

// 保存文件
export async function saveFile(filePath: string, content: string): Promise<FileOperationResult> {
  try {
    if (!isValidFilePath(filePath)) {
      return { success: false, message: '无效的文件路径' };
    }

    await ensureDocumentsDir();
    const fullPath = path.join(DOCUMENTS_DIR, filePath);
    const dir = path.dirname(fullPath);
    
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
    
    return { success: true, message: '文件保存成功' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '文件保存失败',
    };
  }
}

// 读取文件
export async function readFile(filePath: string): Promise<FileOperationResult & { content?: string }> {
  try {
    if (!isValidFilePath(filePath)) {
      return { success: false, message: '无效的文件路径' };
    }

    const fullPath = path.join(DOCUMENTS_DIR, filePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    
    return { 
      success: true,
      message: '文件读取成功',
      content,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '文件读取失败',
    };
  }
}

// 删除文件
export async function deleteFile(filePath: string): Promise<FileOperationResult> {
  try {
    if (!isValidFilePath(filePath)) {
      return { success: false, message: '无效的文件路径' };
    }

    const fullPath = path.join(DOCUMENTS_DIR, filePath);
    await fs.unlink(fullPath);
    
    return { success: true, message: '文件删除成功' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '文件删除失败',
    };
  }
}

// 递归获取文件列表的辅助函数
async function getFilesRecursively(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const res = path.resolve(dir, entry.name);
      if (entry.isDirectory()) {
        return getFilesRecursively(res);
      }
      return path.relative(DOCUMENTS_DIR, res);
    })
  );
  
  return files.flat();
}

// 列出文件
export async function listFiles(): Promise<FileOperationResult & { files?: string[] }> {
  try {
    await ensureDocumentsDir();
    const files = await getFilesRecursively(DOCUMENTS_DIR);
    
    return {
      success: true,
      message: '获取文件列表成功',
      files: files.map(file => file.replace(/\\/g, '/')),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '获取文件列表失败',
    };
  }
} 