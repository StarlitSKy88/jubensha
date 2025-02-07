import React from 'react';
import { StatusBarProps } from '@/types/editor';
import styles from './Editor.module.css';

export const StatusBar: React.FC<StatusBarProps> = ({ state }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={styles.statusBar}>
      <div className={styles.statusItem}>
        {state.isLoading ? '保存中...' : '就绪'}
      </div>
      <div className={styles.statusItem}>
        {state.isDirty ? '未保存的更改' : '无更改'}
      </div>
      {state.lastSaved && (
        <div className={styles.statusItem}>
          上次保存: {formatTime(state.lastSaved)}
        </div>
      )}
      {state.error && (
        <div className={`${styles.statusItem} ${styles.error}`}>
          错误: {state.error}
        </div>
      )}
      <div className={styles.statusItem}>
        字数: {state.content.length}
      </div>
    </div>
  );
}; 
}; 