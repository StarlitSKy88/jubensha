import { useState, useCallback } from 'react';
import { FileOperationResult } from '@/utils/fileOperations';

interface FileOperationsState {
  isLoading: boolean;
  error: string | null;
  lastSaved: Date | null;
}

export function useFileOperations() {
  const [state, setState] = useState<FileOperationsState>({
    isLoading: false,
    error: null,
    lastSaved: null,
  });

  const saveFile = useCallback(async (path: string, content: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path, content }),
      });

      const result: FileOperationResult = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        lastSaved: new Date(),
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '保存失败',
      }));
      return false;
    }
  }, []);

  const loadFile = useCallback(async (path: string): Promise<string | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      const result: FileOperationResult & { content?: string } = await response.json();

      if (!result.success || !result.content) {
        throw new Error(result.message);
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
      }));

      return result.content;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '加载失败',
      }));
      return null;
    }
  }, []);

  const deleteFile = useCallback(async (path: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`, {
        method: 'DELETE',
      });

      const result: FileOperationResult = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '删除失败',
      }));
      return false;
    }
  }, []);

  const listFiles = useCallback(async (): Promise<string[] | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/files');
      const result: FileOperationResult & { files?: string[] } = await response.json();

      if (!result.success || !result.files) {
        throw new Error(result.message);
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
      }));

      return result.files;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '获取文件列表失败',
      }));
      return null;
    }
  }, []);

  return {
    ...state,
    saveFile,
    loadFile,
    deleteFile,
    listFiles,
  };
} 