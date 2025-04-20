/**
 * 定义从 metadata.json 加载的页面元数据结构
 */
export interface PageData {
    id: string;                 // 页面唯一ID，通常是相对路径
    path: string;               // 页面HTML文件的相对路径 (e.g., 'pages/ai-tech/...')
    title: string;              // 页面标题
    lastModifiedDate: string;   // ISO 格式的文件最后修改日期
    category: string;           // 页面分类 (e.g., 'ai-tech', 'info-upgrade', etc.)
    description: string;        // 页面摘要描述
    keywords: string[];         // 页面关键词数组
    'publish-date': string;     // 页面发布日期 (YYYY-MM-DD)
    publishDate?: string;       // 可选的旧格式发布日期字段 (兼容性)
}

/**
 * 定义 metadata.json 文件的顶层结构
 */
export interface Metadata {
    lastUpdated: string;      // ISO 格式的最后更新时间戳
    pages: PageData[];        // 包含所有页面元数据的数组
}

// ---- Knowledge Graph Types ----

/**
 * 定义图谱节点的数据结构
 */
export interface GraphNodeData {
    id: string;           // 节点 ID，与 PageData 的 id 相同
    label: string;        // 节点显示的标签，通常是页面标题
    category: string;     // 页面分类，用于样式区分
    path: string;         // 页面路径，用于点击跳转
}

/**
 * 定义图谱边的数据结构
 */
export interface GraphEdgeData {
    id: string;           // 边的唯一 ID
    source: string;       // 起始节点 ID
    target: string;       // 目标节点 ID
    keyword: string;      // 连接两个节点的共享关键词
    weight?: number;      // 可选的边权重（例如基于关键词频率或相关性）
}

/**
 * 定义 Cytoscape 元素的数据结构
 */
export interface GraphElement {
    group: 'nodes' | 'edges';
    data: GraphNodeData | GraphEdgeData;
} 