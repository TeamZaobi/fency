import React, { useState, Suspense, lazy } from "react";
import { useMetadata } from "@/hooks/useMetadata";
import { ContentCard } from "@/components/ContentCard";
import { CategoryFilter } from "@/components/CategoryFilter";
// MetadataPage 类型可能需要从 @/types/metadata 导入，但 useMetadata Hook 内部已经处理了类型

// Lazy load the KnowledgeGraph component
const KnowledgeGraph = lazy(() => 
  import('@/components/KnowledgeGraph').then(module => ({ default: module.KnowledgeGraph }))
);

export const HomePage = () => {
  const { data, loading, error } = useMetadata();
  const [activeCategory, setActiveCategory] = useState("all");

  // 处理加载状态
  if (loading) return <div className="container py-8 text-center">加载中...</div>;
  
  // 处理错误状态
  if (error) return <div className="container py-8 text-center text-red-600">加载元数据出错: {error.message}</div>;
  
  // 处理无数据状态
  if (!data || !data.pages) return <div className="container py-8 text-center">没有找到页面数据。</div>;

  // 过滤并排序页面
  const filteredPages = data.pages
    .filter(page => activeCategory === "all" || page.category === activeCategory)
    .sort((a, b) => {
      // 按发布日期倒序排序，处理无效日期
      const dateA = new Date(a["publish-date"]).getTime();
      const dateB = new Date(b["publish-date"]).getTime();
      // 将无效日期排在后面
      if (isNaN(dateA) && isNaN(dateB)) return 0;
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;
      return dateB - dateA;
    });

  // 知识图谱数据只在非错误和有数据时才传递
  const graphPages = data && data.pages ? data.pages : [];

  return (
    <div className="container py-8">
      {/* Hero 部分 - 可以根据需要设计 */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 tracking-tight lg:text-5xl">凿壁</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          探索AI和医疗大数据领域的前沿见解与实践
        </p>
      </div>
      
      {/* 新增：知识图谱区域，使用 Suspense 进行懒加载处理 */} 
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-center">知识图谱探索</h2>
        {/* 确保在加载完成且有数据时才渲染图谱 */} 
        {!loading && !error && graphPages.length > 0 && (
          <Suspense fallback={<div className="text-center p-8 border rounded-lg bg-card">加载知识图谱中...</div>}>
            <KnowledgeGraph pages={graphPages} height={400} /> {/* 限制图谱高度 */} 
          </Suspense>
        )}
        {/* 如果正在加载或出错，可以显示相应提示 */} 
        {loading && <div className="text-center p-8 border rounded-lg bg-card">加载知识图谱数据...</div>}
        {error && <div className="text-center p-8 border rounded-lg bg-card text-red-500">无法加载知识图谱数据。</div>}
        {!loading && !error && graphPages.length === 0 && <div className="text-center p-8 border rounded-lg bg-card">无足够数据生成知识图谱。</div>}
      </div>
      
      {/* 分类筛选 */}
      <div className="mb-8 flex justify-center">
        <CategoryFilter 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>
      
      {/* 内容卡片网格 */}
      {filteredPages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map(page => (
            <ContentCard key={page.id || page.path} page={page} /> // 使用 path 作为备用 key
          ))}
        </div>
      ) : (
        /* 无结果提示 */
        <div className="text-center py-12">
          <p className="text-muted-foreground">该分类下暂无内容</p>
        </div>
      )}
    </div>
  );
}; 