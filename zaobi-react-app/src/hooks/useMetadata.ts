import { useState, useEffect } from 'react';
import { Metadata } from '../types/metadata';

export const useMetadata = () => {
  const [data, setData] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // 开始加载时设置为true
      setError(null);
      try {
        const response = await fetch('/metadata.json'); // 从public目录获取
        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error("Error fetching metadata:", err); // 添加日志记录
        setError(err instanceof Error ? err : new Error('Unknown error fetching metadata'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // 空依赖数组，仅在组件挂载时获取一次

  return { data, loading, error };
}; 