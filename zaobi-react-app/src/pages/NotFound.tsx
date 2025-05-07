import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="container py-20 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - 页面未找到</h1>
      <p className="text-muted-foreground mb-8">抱歉，您访问的页面不存在。</p>
      <Link to="/" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
        返回首页
      </Link>
    </div>
  );
}; 