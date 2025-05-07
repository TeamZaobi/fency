# 项目关键数据结构汇总

本文档汇总了"凿壁"React重构项目中使用的关键数据结构和接口定义。

## 1. 元数据文件 (`public/metadata.json`)

该文件是驱动首页内容展示（卡片、知识图谱）的核心数据源。

```json
{
  "lastUpdated": "YYYY-MM-DDTHH:MM:SS.sssZ", // ISO 8601 格式的最后更新时间戳
  "pages": [                                 // 包含所有页面元数据的数组
    {
      "id": "pages/分类目录/文件名.html",      // 唯一标识符，通常与path相同
      "path": "pages/分类目录/文件名.html",    // HTML文件的相对路径
      "title": "页面标题 | 凿壁",              // 页面完整标题
      "lastModifiedDate": "YYYY-MM-DDTHH:MM:SS.sssZ", // HTML文件的最后修改时间
      "category": "分类名称",                 // 必须是 "ai-tech", "info-upgrade", "knowledge", "research" 之一
      "description": "页面内容简短描述...",    // 100-200字符的摘要
      "keywords": [                          // 关键词数组 (至少3-5个)
        "关键词1",
        "关键词2",
        "..."
      ],
      "publish-date": "YYYY-MM-DD"           // 发布日期 (必须是创建/更新时的服务器日期)
    }
    // ... 更多页面条目
  ]
}
```

**注意:** `publish-date` 必须是服务器当前日期，不能是未来日期。

相关规范文档: `@rules/metadata-json-structure`

## 2. HTML 页面元数据标签

每个独立的 HTML 内容页面 (`public/pages/**/*.html`) 必须在 `<head>` 部分包含以下元数据标签：

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- 必需的元数据标签 -->
<meta name="publish-date" content="YYYY-MM-DD"> <!-- 必须是服务器当前日期 -->
<meta name="category" content="分类名"> <!-- "ai-tech", "info-upgrade", "knowledge", "research" -->
<meta name="description" content="页面摘要...">
<meta name="keywords" content="关键词1,关键词2,...">

<title>页面标题 | 凿壁</title>
```

相关规范文档: `@rules/html-page-structure`

## 3. TypeScript 类型定义 (`src/types/metadata.ts`)

该文件定义了 `metadata.json` 在 TypeScript 中对应的类型。

```typescript
// src/types/metadata.ts

export interface MetadataPage {
  id: string;
  path: string;
  title: string;
  lastModifiedDate: string; // ISO 8601 timestamp
  category: string; // 'ai-tech' | 'info-upgrade' | 'knowledge' | 'research'
  description: string;
  keywords: string[];
  "publish-date": string; // YYYY-MM-DD
}

export interface Metadata {
  lastUpdated: string; // ISO 8601 timestamp
  pages: MetadataPage[];
}
```

## 4. React 组件 Props

### `ContentCardProps` (`src/components/ContentCard.tsx`)

```typescript
import { MetadataPage } from "@/types/metadata";

interface ContentCardProps {
  page: MetadataPage; // 传入单个页面的元数据
}
```

### `CategoryFilterProps` (`src/components/CategoryFilter.tsx`)

```typescript
interface CategoryFilterProps {
  activeCategory: string; // 当前选中的分类 (value)
  onCategoryChange: (category: string) => void; // 分类变化时的回调函数
  // availableCategories?: string[]; // 可选：动态生成分类列表
}
```

### `KnowledgeGraphProps` (`src/components/KnowledgeGraph.tsx`)

```typescript
import { MetadataPage } from "@/types/metadata";

interface KnowledgeGraphProps {
  pages: MetadataPage[]; // 传入所有页面的元数据数组
  width?: number;        // 可选：图谱容器宽度
  height?: number;       // 可选：图谱容器高度
}
```

## 5. `useMetadata` Hook 返回值 (`src/hooks/useMetadata.ts`)

该 Hook 用于异步获取并提供 `metadata.json` 的内容。

```typescript
import { Metadata } from '../types/metadata';

// 返回值类型 (隐式定义，但结构如下)
interface UseMetadataResult {
  data: Metadata | null;    // 获取到的元数据，或初始为 null
  loading: boolean;         // 是否正在加载
  error: Error | null;      // 加载过程中发生的错误，或 null
}

// 使用示例
// const { data, loading, error } = useMetadata();
```

## 6. 知识图谱内部数据结构 (`src/components/KnowledgeGraph.tsx`)

这些接口用于 `react-force-graph-2d` 库。

### `GraphNode`

```typescript
interface GraphNode {
  id: string;       // 节点唯一ID (使用 page.path)
  name: string;     // 节点名称 (用于标签，通常是 page.title)
  category: string; // 页面分类 (用于着色)
  keywords: string[]; // 页面关键词
  // val?: number;   // 可选：节点大小值
}
```

### `GraphLink`

```typescript
interface GraphLink {
  source: string; // 源节点 ID (page.path)
  target: string; // 目标节点 ID (page.path)
  // strength?: number; // 可选：链接强度
}
``` 