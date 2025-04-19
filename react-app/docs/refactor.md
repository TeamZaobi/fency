# Index.html 重构计划与技术规范

本文档概述了重构 `index.html` 的计划，目标是将其转变为一个动态的内容聚合器和知识图谱浏览器。

## 0. 预备阶段：内容迁移与元数据初始化

在开始核心重构工作之前，需要完成以下准备步骤：

1.  **内容迁移:** 手动将 `react-app/` 目录下的所有相关内容页面/文档迁移到 `html/pages/` 目录下，并根据其内容放入相应的子文件夹 (`info-upgrade`, `research`, `ai-tech`, `knowledge`)。
2.  **确保页面结构:** 检查迁移后的 HTML 文件，确保它们包含必要的元信息标签（如 `<meta name="publish-date">`, `<meta name="category">`）或其内容足以让 LLM 提取这些信息。
3.  **元数据初始化:**
    *   **编写一次性任务:** 使用 Cursor 调用大模型，编写一个任务或脚本。
    *   **任务内容:** 遍历 `html/pages/` 下的所有已迁移 HTML 文件。
    *   **提取信息:** 为每个文件提取元数据：`title` (页面标题), `description` (摘要), `path` (相对于 `html/` 的路径), `publishDate`, `category`, 以及 **`keywords`** (关键词)。
    *   **生成文件:** 使用提取的信息生成初始的 `html/metadata.json` 文件。 **使用页面的相对路径 `path` 作为每个条目的唯一 `id`**。

## 1. 核心目标

*   将 `index.html` 从 `react-app/` 迁移至 `html/` 目录（在此阶段正式创建或覆盖）。
*   `index.html` 需要动态读取 `html/metadata.json` 文件来获取内容信息。
*   基于元数据，动态渲染所有内容页面的卡片列表。
*   基于元数据中的页面及其关联关键词，动态生成并展示一个交互式知识图谱。
*   内容发布流程（通过 LLM 和 `.cursor/rules/web-dev.mdc`）需要更新，以自动维护 `html/metadata.json` 并提取关键词。

## 2. 架构选型

*   **渲染模式:** 客户端渲染 (Client-Side Rendering - CSR)。
    *   `index.html` 加载后，由客户端 JavaScript 负责获取元数据并渲染卡片和图谱。
    *   **理由:** 与交互式知识图谱的需求天然契合，避免了复杂的服务器端渲染或构建步骤。
*   **元数据存储:** 使用 `html/metadata.json` 文件存储所有页面的元数据。

## 3. 技术栈

*   **HTML:** HTML5
*   **CSS:** Tailwind CSS (通过 CDN 引入) 或 自定义 CSS (`html/css/style.css`)
*   **核心脚本语言:** TypeScript (`html/js/main.ts`)，编译为 JavaScript (`html/js/main.js`)。
    *   **理由:** 提供类型安全，提高代码可维护性，对服务器运行时无性能影响。
*   **知识图谱库:** Cytoscape.js (推荐) 或 Vis.js (备选)。通过 CDN 或本地文件引入。
    *   **理由:** 提供强大的图谱渲染和交互能力。
*   **构建工具 (编译 TS):** `tsc` (TypeScript 编译器) 或更现代的工具 (如 Vite, esbuild)。推荐在开发环境或 CI/CD 中构建。

## 4. 核心组件与规范

*   **`html/index.html`:**
    *   基础 HTML 结构。
    *   包含 CSS 和 JS 文件的链接。
    *   包含用于挂载内容的容器元素，例如 `<div id="card-container"></div>` 和 `<div id="knowledge-graph" style="height: 600px; border: 1px solid #ccc;"></div>`。
*   **`html/metadata.json`:**
    *   存储页面元数据的中心文件。
    *   **结构:**
        ```json
        {
          "pages": [
            {
              "id": "pages/category/page-file.html", // 使用相对路径作为唯一 ID
              "title": "页面标题",
              "description": "页面摘要...",
              "path": "pages/category/page-file.html", // 相对于 html/ 目录
              "publishDate": "YYYY-MM-DD",
              "category": "分类名", // 例如 "信息化升级"
              "keywords": ["关键词A", "关键词B"] // 由 LLM 提取
            }
            // ...更多页面条目
          ],
          "lastUpdated": "ISO 8601 Timestamp" // 可选
        }
        ```
*   **`html/js/main.ts`:**
    *   **`loadMetadata()`:** 异步函数，获取并解析 `metadata.json`。
    *   **`renderCards(pages: PageData[])`:** 根据页面数据生成卡片 HTML/DOM 并插入 `#card-container`。**默认应按 `publishDate` 降序排列卡片。**
    *   **`buildGraphData(pages: PageData[])`:** 将页面数据转换为图谱库所需的节点和边数据结构（基于共享关键词创建边，关键词比较时建议进行规范化处理，如转小写）。
    *   **`initKnowledgeGraph(graphData)`:** 初始化图谱库，配置样式和交互（缩放、拖动、点击节点跳转页面），渲染图谱到 `#knowledge-graph`。
    *   **`toggleTheme()`:** 实现深色/浅色模式切换逻辑。
    *   **`PageData`, `GraphNode`, `GraphEdge`:** TypeScript 接口定义。
*   **`react-app/.cursor/rules/web-dev.mdc` (需修改):**
    *   移除手动更新 `index.html` 的规则。
    *   添加规则：生成新页面后，**必须**读取新页面的元数据（标题, 摘要, 日期, 分类, **关键词**）和文件路径。
    *   添加规则：**必须**读取 `html/metadata.json`。
    *   添加规则：**必须**由 LLM **提取关键词**（可指导进行基础规范化）。
    *   添加规则：将新页面信息（以其 `path` 作为 `id`）作为一个新条目**添加或更新**到 `metadata.json` 的 `pages` 数组中。
    *   添加规则：将更新后的**完整**数据结构**健壮地**写回 `html/metadata.json`。
        *   **强烈建议采用原子写入策略**：读取 -> 修改内存中数据 -> 序列化 -> 写入临时文件 -> 验证 -> 原子重命名覆盖原文件。确保 JSON 文件的完整性。

## 5. 实施路线图

0.  **阶段 0: 内容迁移与元数据初始化 (如上文所述)**
1.  **阶段 1: 基础结构与 `index.html`**
    *   创建 `html/` 目录结构 (`js`, `css`, `pages` - 若未在阶段 0 完成)。
    *   创建基础 `html/index.html` 文件。
    *   设置 TypeScript 环境 (`tsconfig.json`)。
2.  **阶段 2: 卡片渲染**
    *   在 `main.ts` 中实现加载 `metadata.json` 和按日期降序渲染卡片的逻辑。
3.  **阶段 3: 知识图谱渲染**
    *   引入图谱库，在 `main.ts` 中实现构建图谱数据、初始化图谱和基本交互（缩放、拖动、点击跳转）的逻辑。
4.  **阶段 4: 样式与交互完善**
    *   应用 CSS 样式美化页面。
    *   实现深色/浅色模式切换。
    *   完善图谱交互（如点击节点显示信息）。
    *   响应式设计优化。
5.  **阶段 5: 更新内容生成规则 (`web-dev.mdc`)**
    *   修改规则以自动化 `metadata.json` 的维护、关键词提取，并包含健壮的写入策略。

## 6. 技术风险与缓解

*   **`metadata.json` 损坏:** 更新过程中出错可能导致文件损坏。
    *   **缓解:** 在 `.mdc` 规则中强制要求 LLM 采用健壮的原子写入策略（读取->修改->写临时文件->验证->重命名）。定期备份 `metadata.json`。
*   **图谱性能:** 页面过多时可能变慢。
    *   **缓解:** 选择高性能库 (Cytoscape.js), 优化数据处理 (如关键词规范化), 考虑按需渲染或分页/虚拟滚动（未来迭代）。
*   **关键词质量:** LLM 提取可能不准或不一致。
    *   **缓解:** 优化 `.mdc` Prompt 指导 LLM 提取和规范化关键词。允许在 Markdown Front Matter 中手动指定关键词并优先使用。在客户端 `buildGraphData` 中进行补充规范化（如转小写）。
*   **初始元数据生成:** 一次性脚本/任务可能需要调试。
    *   **缓解:** 分步测试脚本，先处理少量文件，验证输出的 `metadata.json` 格式和内容。
