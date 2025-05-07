import React, { useMemo, useRef, useCallback } from 'react';
import { ForceGraph2D } from 'react-force-graph-2d';
import { useNavigate } from 'react-router-dom';
import { MetadataPage } from '@/types/metadata'; // 假设类型定义在此
import { useTheme } from '@/context/ThemeProvider'; // 获取主题信息

interface KnowledgeGraphProps {
  pages: MetadataPage[];
  width?: number; // 允许外部传入宽度
  height?: number; // 允许外部传入高度
}

// 定义节点和链接的类型，增强代码可读性
interface GraphNode {
  id: string; // page.path
  name: string; // page.title
  category: string; // page.category
  keywords: string[]; // page.keywords
  // 可以添加其他需要渲染的属性
  // val?: number; // 可以根据某种度量（如链接数）设置节点大小
}

interface GraphLink {
  source: string; // source node id (page.path)
  target: string; // target node id (page.path)
  // 可以添加表示链接强度的属性
  // strength?: number; 
}

// 简单的关键词共享计算逻辑
const calculateLinks = (pages: MetadataPage[], minSharedKeywords = 1): GraphLink[] => {
  const links: GraphLink[] = [];
  const pageMap = new Map(pages.map(p => [p.path, p])); // 便于查找

  for (let i = 0; i < pages.length; i++) {
    for (let j = i + 1; j < pages.length; j++) {
      const pageA = pages[i];
      const pageB = pages[j];

      // 确保 keywords 存在且是数组
      const keywordsA = Array.isArray(pageA.keywords) ? new Set(pageA.keywords) : new Set();
      const keywordsB = Array.isArray(pageB.keywords) ? new Set(pageB.keywords) : new Set();
      
      const intersection = new Set([...keywordsA].filter(k => keywordsB.has(k)));

      if (intersection.size >= minSharedKeywords) {
        // 确保 path 存在
        if (pageA.path && pageB.path) {
           links.push({ source: pageA.path, target: pageB.path });
        }
      }
    }
  }
  return links;
};

// 分类颜色映射 (示例)
const categoryColors: { [key: string]: string } = {
  'ai-tech': '#3b82f6', // blue-500
  'info-upgrade': '#10b981', // emerald-500
  'knowledge': '#f97316', // orange-500
  'research': '#8b5cf6', // violet-500
  'default': '#6b7280' // gray-500
};

export const KnowledgeGraph = ({ pages, width = 800, height = 600 }: KnowledgeGraphProps) => {
  const navigate = useNavigate();
  const { theme } = useTheme(); // 获取当前主题
  const fgRef = useRef<any>(); // 引用 ForceGraph 实例

  // 使用 useMemo 避免在每次渲染时重新计算节点和链接
  const graphData = useMemo(() => {
    const nodes: GraphNode[] = pages.map(page => ({
      id: page.path, // 使用 path 作为唯一 ID
      name: page.title.split(' | ')[0], // 移除 ' | 凿壁'
      category: page.category,
      keywords: Array.isArray(page.keywords) ? page.keywords : [],
      // val: 1 // 基础大小
    }));

    const links = calculateLinks(pages, 1); // 至少共享1个关键词则创建链接
    
    // // 可以基于链接数调整节点大小 (可选)
    // const nodeLinkCounts = links.reduce((acc, link) => {
    //   acc[link.source] = (acc[link.source] || 0) + 1;
    //   acc[link.target] = (acc[link.target] || 0) + 1;
    //   return acc;
    // }, {} as Record<string, number>);
    // nodes.forEach(node => {
    //   node.val = 1 + (nodeLinkCounts[node.id] || 0) * 0.5; // 示例大小调整逻辑
    // });

    return { nodes, links };
  }, [pages]);

  // 节点点击处理
  const handleNodeClick = useCallback((node: any) => {
    // node.id 就是 page.path
    const pathSegments = node.id.split('/'); // e.g., ['pages', 'ai-tech', 'file.html']
    if (pathSegments.length >= 3) {
        const category = pathSegments[1];
        const slugWithExt = pathSegments[pathSegments.length - 1]; // e.g., 'file.html'
        const slug = slugWithExt.replace('.html', ''); // 'file'
        navigate(`/pages/${category}/${slug}`);
        
        // 点击节点后居中放大 (可选)
        if (fgRef.current) {
            fgRef.current.centerAt(node.x, node.y, 1000); // 动画时间 1s
            fgRef.current.zoom(2.5, 1000); // 放大到 2.5 倍
        }
    }
  }, [navigate]);

  // 节点绘制函数
  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = 12 / globalScale; // 字体大小随缩放调整
    ctx.font = `${fontSize}px Sans-Serif`;
    
    // 节点颜色
    const color = categoryColors[node.category] || categoryColors['default'];
    ctx.fillStyle = color;
    
    // 绘制圆形节点
    const nodeSize = node.val || 4; // 使用节点大小，默认为 4
    ctx.beginPath(); 
    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
    ctx.fill();

    // 绘制标签
    const textWidth = ctx.measureText(label).width;
    const labelX = node.x;
    const labelY = node.y + nodeSize + fontSize * 0.8; // 放在节点下方
    
    // 根据主题设置文本颜色
    ctx.fillStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)';
    ctx.textAlign = 'center';
    ctx.fillText(label, labelX, labelY);

  }, [theme]);

  return (
    <div className="border rounded-lg overflow-hidden bg-card" style={{ width: '100%', height: height }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeId="id"
        nodeLabel="name" // 鼠标悬停时显示完整标题
        // nodeVal="val" // 使用 val 属性设置节点大小
        nodeRelSize={4} // 基础节点大小
        // nodeColor={node => categoryColors[node.category] || categoryColors['default']} // 改用 nodeCanvasObject
        nodeCanvasObject={nodeCanvasObject} // 自定义节点绘制
        nodeCanvasObjectMode={() => 'after'} // 在默认绘制后绘制标签
        linkDirectionalParticles={1} // 显示链接方向粒子
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleSpeed={d => 0.005}
        linkColor={() => theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'} // 链接颜色随主题变化
        width={width} // 使用传入的宽度，或默认值
        height={height} // 使用传入的高度，或默认值
        onNodeClick={handleNodeClick}
        // 其他配置项...
        cooldownTicks={100} // 增加稳定时间
        enableZoomInteraction // 允许缩放
        enablePanInteraction // 允许平移
      />
    </div>
  );
}; 