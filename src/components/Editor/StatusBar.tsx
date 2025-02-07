import React from 'react';
import { StatusBarProps } from '@/types/editor';
import styles from './Editor.module.css';

export const StatusBar: React.FC<StatusBarProps> = ({ state }) => {
  return (
    <div className={styles.statusBar}>
      <div className={styles.statusItem}>
        {state.isLoading ? '加载中...' : '就绪'}
      </div>
      <div className={styles.statusItem}>
        {state.isDirty ? '未保存' : '已保存'}
      </div>
      <div className={styles.statusItem}>
        字数: {state.content.length}
      </div>
    </div>
  );
}; 