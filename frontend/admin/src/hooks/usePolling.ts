import { useEffect, useRef } from 'react';

export function usePolling(callback: () => Promise<void>, interval: number): void {
  const savedCallback = useRef<() => Promise<void>>(callback);

  // 记住最新的回调函数
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // 设置轮询
  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }

    // 立即执行一次
    tick();

    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [interval]);
} 