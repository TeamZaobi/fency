import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react'; // 导入返回图标

export const ContentPage = () => {
  const { category, slug } = useParams<{ category: string; slug: string }>();

  // 检查参数是否存在
  if (!category || !slug) {
    return (
      <div className="container py-8 text-center">
        <p>无效的页面路径。</p>
        <Link to="/" className="text-primary hover:underline mt-4 inline-block">返回首页</Link>
      </div>
    );
  }

  // 构建 iframe 的 src URL
  // 假设原始 HTML 文件位于 /pages/ 目录下，相对于网站根目录
  // 例如：/pages/ai-tech/llm-page-design.html
  const iframeSrc = `/pages/${category}/${slug}.html`;

  return (
    <div className="container py-8 flex flex-col h-screen"> {/* 使用 h-screen 使容器占满视口高度 */}
      {/* 返回按钮 */}
      <div className="mb-4">
        <Link 
          to="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Link>
      </div>

      {/* Iframe 容器 */}
      <div className="flex-grow border rounded-lg overflow-hidden"> {/* 添加边框和圆角，让 iframe 区域更明显 */}
        <iframe
          src={iframeSrc}
          title={`Content: ${category}/${slug}`} // 提供一个描述性的 title
          className="w-full h-full border-0" // 确保 iframe 占满容器且无边框
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms" // 增加安全性，根据需要调整 sandbox 属性
          // onError 处理加载错误 (可选)
          onError={(e) => {
            console.error(`Error loading iframe content from ${iframeSrc}:`, e);
            // 可以在这里显示一个错误消息给用户
          }}
        />
      </div>
    </div>
  );
}; 