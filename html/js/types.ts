// 定义页面数据接口
export interface PageData {
    id: string;              // 唯一标识符（文件路径）
    title: string;           // 页面标题
    description: string;     // 页面描述/摘要
    category: string;        // 分类（信息化升级、科研辅助、AI技术与生态、知识报告）
    publishDate: string;     // 发布日期，格式：YYYY-MM-DD
    path: string;            // 页面路径 (同 id)
    keywords?: string[];     // 可选的关键词数组
    lastModifiedDate: string; // 最后修改日期 (ISO 格式)
}

// 定义元数据接口
export interface Metadata {
    pages: PageData[];       // 页面数据数组
    lastUpdated: string;     // 元数据文件最后更新时间 (ISO 格式)
}
