---
description: 凿壁项目网页开发与LLM生成规则
globs: 
alwaysApply: true
---
# 凿壁项目 - 网页开发规则

## B. 凿壁项目 - 网页开发核心原则

1.  **项目模式**: 本项目采用 完整HTML开发的模式。每个 `.html` 文件是一个独立的单元，代表一篇内容。
2.  **核心目标**: **最大化每个页面的创意性、独特性和视觉精美度**。允许牺牲网站范围的一致性和自动化维护的便利性，以追求卓越的单页体验。
3.  **内容来源**: 每个页面的内容都是由人工提供单个或者文件夹的markdown文件， 然后在本项目中生成HTML文件。
4.  **聚合方式**: 所有生成的 `.html` 页面通过一个**动态索引页 (`index.html`)** 进行链接和组织。该索引页通过客户端 JavaScript 读取一个**通过开发流程维护**的 `metadata.json` 文件来动态渲染内容卡片和知识图谱。
5.  **部署环境 (重要):** 本项目存在**两个主要的部署目标**：
    *   **Nginx 服务器:** 直接服务项目根目录 (`/var/www` 或类似路径) 的内容，通常与 `develop` 分支同步，作为预览或内部访问环境。
    *   **GitHub Pages:** 最终面向公众的稳定版本，通常基于 `main` 分支部署。
    需要特别注意，GitHub Pages 上的项目站点**可能**部署在子目录下 (例如 `https://<username>.github.io/<repository-name>/`)，这与直接在 Nginx 根目录部署不同。因此，为了**确保在两种环境下都能正确工作**，引用项目内部资源（如 CSS, JS, 图片, 数据文件 `metadata.json` 等）时，**必须优先使用相对路径** (e.g., `metadata.json`, `./images/logo.png`, `../styles/main.css`)，避免使用 `/` 开头的根路径，以确保在两种部署场景下路径都能正确解析。
6.  **无全局框架 (内容页)**: 单个内容页面 (`pages/**/*.html`) 不使用 SSG 或传统模板引擎，不存在全局共享的布局、组件或样式表（除非单个页面自行引入）。`index.html` 本身使用客户端技术（如 React/TS）构建。

## B-bis. 多文档融合页面生成模式

除了基于单一 Markdown 文档生成独立 HTML 页面的模式外，本项目还支持基于**文件夹内的多个 Markdown 文件**生成一个**聚合分析型 HTML 页面**的模式。此模式适用于对同一主题，由不同来源（例如不同的大语言模型）生成的内容进行比较和整合。

1.  **输入**: 一个包含多个 `.md` 文件的文件夹 (例如 `/md/cursor049/`)。每个 `.md` 文件的文件名**必须**代表其内容的来源（例如生成该内容的大模型名称）。
2.  **核心目标**:
    *   **内容融合与筛选**: 将文件夹内所有文件的内容，基于共同的主题（通过 Markdown 标题识别）进行对齐。对于相同主题的内容，依据"逻辑最清晰"、"内容最详细"、"文字最贴切"的**启发式规则**（例如优先选择内容更长、结构更清晰的版本）筛选出最佳内容。
    *   **来源追溯**: 在最终整合的内容中，清晰标注每个内容片段的原始来源（文件名/模型名）。
    *   **贡献度分析**: 分析不同来源对最终整合内容的贡献情况（例如，被采纳的内容块数量或字数），识别贡献度最高的 Top 3 来源。
    *   **多维比较**: 为 Top 3 来源创建一个雷达图，从"数据翔实"、"内容全面"、"逻辑清晰"、"独特观察"、"文字贴切"等维度进行比较（评分基于启发式规则）。
3.  **输出**: 一个独立的 HTML 文件，包含两个主要部分：
    *   **Part 1: 整合内容**: 经过筛选、整合、并带有来源标注的结构化内容。
    *   **Part 2: 来源分析**: 包含贡献度统计、Top 3 来源列表以及比较雷达图。
4.  **设计与技术**: 此类页面的生成同样需要遵循 `C. 网页设计与开发规范` 中的设计目标和技术规范，但内容结构需适应上述"整合内容 + 来源分析"的模式。必须使用 Chart.js 等库来实现雷达图。页面中应明确说明分析和评分是基于启发式规则自动生成的。
5.  **适用场景**: 当需要对多个来源（尤其是 LLM）针对同一任务生成的不同版本内容进行横向比较、提炼精华并分析差异时。

## C. 网页设计与开发规范

### C.1 **角色设定：**

你是一位兼具顶尖设计审美和高超动效实现能力的**创意前端开发者与交互设计师**。你对现代 Web 设计趋势、用户体验最佳实践和信息可视化有深刻理解，尤其擅长创造既美观实用、信息清晰，又能在关键时刻通过精妙动态效果带来"Aha-moment"的网页作品。你的代码严谨，注释清晰，注重性能与跨设备兼容性。

### C.2 **核心任务：**

设计并开发一个**视觉惊艳、信息清晰、交互丰富、高度可读的"中文"现代化单页网页**。你需要充分发挥专业判断，融合最佳的设计原则和前沿的动效技术，打造一个既有深度信息价值，又有极致感官体验的作品。

### C.3 **内容要求：**

1.  **语言:** 所有面向用户的页面内容**必须为简体中文**。
2.  **核心信息:** 忠实呈现md文件提供的的全部信息，并针对其中的核心信息通过**视觉化、结构化**的方式进行重塑，使其更易于理解和消化。
3.  **信息增强 (可选但推荐):** 主动分析 `内容`，如认为有必要，可搜索并补充少量关键背景信息、概念解释或相关图表，以增强用户对主题的全面理解。
4.  **数据与概念可视化:**
    * 深入分析 `内容` 中的关键数据、概念及其关系。
    * 设计**至少一个**美观且富有洞察力的数据可视化图表或信息图（如使用 **Charts.js** 实现条形图、折线图、饼图等）来量化展示关键数据。
    * 设计**至少一个**概念关系图或流程图（如使用 **Mermaid.js** 实现思维导图、流程图、时序图等）来直观展示核心概念、结构或逻辑关系。对其中的中文内容务必使用引号等最佳实践。
    * 可视化设计需与整体页面风格协调统一，清晰传达信息。
5.  **延伸阅读:**
    * 基于 `内容` 的主题，研究并筛选出 **3-5 个**最相关、最有价值的**进一步阅读资源**（优先选择权威论文、经典书籍或深度报告）。
    * 在页面中创建一个"进一步阅读"或"推荐资源"版块，列出这些资源的标题、简要说明（为何推荐），并尽可能提供**可直接访问的有效链接** (URL)。
6.  **作者与版权信息:**
    * 在页面底部添加一个清晰的区域，包含以下信息：
        * 作者姓名: [季晓康]
        * 微信公众号：凿壁
        * 版权信息：国家健康医疗大数据研究院

### C.4 **设计目标与指导 (请灵活运用，追求卓越):**

1.  **整体风格与调性:**
    * 追求**精致、现代、专业、具有高级感**的视觉风格。可参考高端杂志、专业出版物或领域内顶尖的在线报告设计。
    * 营造能引起用户**情感共鸣**（根据内容主题决定，如专业、启发、严谨等）的氛围。
2.  **视觉吸引力 (Aha-moment):**
    * 创造一个在视觉上令人印象深刻的"第一眼"体验，能迅速抓住用户注意力并激发探索欲。
    * **Hero 模块 (强烈建议):** 设计一个引人注目的页面首屏 (Hero Section)，包含精心设计的大标题、引人入胜的副标题或摘要，并搭配高质量的背景图像、插画或抽象视觉元素。
3.  **可读性与排版:**
    * **字体选择:** 精心选择适合中文阅读的字体组合（如 Noto Serif SC / Noto Sans SC，或其他高质量中文字体搭配合适的西文字体），确保正文易读，标题具有表现力。
    * **视觉层次:** 利用字号、字重、颜色、行高、字间距等排版元素，构建清晰、舒适的视觉层次结构，引导用户阅读流。
    * **排版细节 (可选):** 可考虑运用首字下沉、引用样式、列表美化、悬挂标点（若适用）等细节提升文本的精致感。
    * **图标点缀:** 合理使用 **Font Awesome** 图标库中的图标，为列表、特性、小标题等元素增加视觉趣味和识别度。
4.  **配色方案:**
    * 利用下列配色方案：

    ---
```
:root {
  --background: rgb(240, 248, 255);
  --foreground: rgb(55, 65, 81);
  --card: rgb(255, 255, 255);
  --card-foreground: rgb(55, 65, 81);
  --popover: rgb(255, 255, 255);
  --popover-foreground: rgb(55, 65, 81);
  --primary: rgb(34, 197, 94);
  --primary-foreground: rgb(255, 255, 255);
  --secondary: rgb(224, 242, 254);
  --secondary-foreground: rgb(75, 85, 99);
  --muted: rgb(243, 244, 246);
  --muted-foreground: rgb(107, 114, 128);
  --accent: rgb(209, 250, 229);
  --accent-foreground: rgb(55, 65, 81);
  --destructive: rgb(239, 68, 68);
  --destructive-foreground: rgb(255, 255, 255);
  --border: rgb(229, 231, 235);
  --input: rgb(229, 231, 235);
  --ring: rgb(34, 197, 94);
  --chart-1: rgb(34, 197, 94);
  --chart-2: rgb(16, 185, 129);
  --chart-3: rgb(5, 150, 105);
  --chart-4: rgb(4, 120, 87);
  --chart-5: rgb(6, 95, 70);
  --sidebar: rgb(224, 242, 254);
  --sidebar-foreground: rgb(55, 65, 81);
  --sidebar-primary: rgb(34, 197, 94);
  --sidebar-primary-foreground: rgb(255, 255, 255);
  --sidebar-accent: rgb(209, 250, 229);
  --sidebar-accent-foreground: rgb(55, 65, 81);
  --sidebar-border: rgb(229, 231, 235);
  --sidebar-ring: rgb(34, 197, 94);
  --font-sans: DM Sans, sans-serif;
  --font-serif: Lora, serif;
  --font-mono: IBM Plex Mono, monospace;
  --radius: 0.5rem;
  --shadow-2xs: 0px 4px 8px -1px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0px 4px 8px -1px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 1px 2px -2px hsl(0 0% 0% / 0.10);
  --shadow: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 1px 2px -2px hsl(0 0% 0% / 0.10);
  --shadow-md: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 2px 4px -2px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 4px 6px -2px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 8px 10px -2px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0px 4px 8px -1px hsl(0 0% 0% / 0.25);
}

.dark {
  --background: rgb(15, 23, 42);
  --foreground: rgb(209, 213, 219);
  --card: rgb(30, 41, 59);
  --card-foreground: rgb(209, 213, 219);
  --popover: rgb(30, 41, 59);
  --popover-foreground: rgb(209, 213, 219);
  --primary: rgb(52, 211, 153);
  --primary-foreground: rgb(15, 23, 42);
  --secondary: rgb(45, 55, 72);
  --secondary-foreground: rgb(161, 161, 170);
  --muted: rgb(30, 41, 59);
  --muted-foreground: rgb(107, 114, 128);
  --accent: rgb(55, 65, 81);
  --accent-foreground: rgb(161, 161, 170);
  --destructive: rgb(239, 68, 68);
  --destructive-foreground: rgb(15, 23, 42);
  --border: rgb(75, 85, 99);
  --input: rgb(75, 85, 99);
  --ring: rgb(52, 211, 153);
  --chart-1: rgb(52, 211, 153);
  --chart-2: rgb(45, 212, 191);
  --chart-3: rgb(34, 197, 94);
  --chart-4: rgb(16, 185, 129);
  --chart-5: rgb(5, 150, 105);
  --sidebar: rgb(30, 41, 59);
  --sidebar-foreground: rgb(209, 213, 219);
  --sidebar-primary: rgb(52, 211, 153);
  --sidebar-primary-foreground: rgb(15, 23, 42);
  --sidebar-accent: rgb(55, 65, 81);
  --sidebar-accent-foreground: rgb(161, 161, 170);
  --sidebar-border: rgb(75, 85, 99);
  --sidebar-ring: rgb(52, 211, 153);
  --font-sans: DM Sans, sans-serif;
  --font-serif: Lora, serif;
  --font-mono: IBM Plex Mono, monospace;
  --radius: 0.5rem;
  --shadow-2xs: 0px 4px 8px -1px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0px 4px 8px -1px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 1px 2px -2px hsl(0 0% 0% / 0.10);
  --shadow: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 1px 2px -2px hsl(0 0% 0% / 0.10);
  --shadow-md: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 2px 4px -2px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 4px 6px -2px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 8px 10px -2px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0px 4px 8px -1px hsl(0 0% 0% / 0.25);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);
}
```

    * **模式切换:** 实现完整的浅色/深色模式切换功能。默认应能跟随用户系统设置，同时提供清晰的手动切换按钮/开关。
5.  **布局与结构:**
    * 采用**基于网格**的布局系统（如 Tailwind CSS 的 Grid 或 Flexbox），确保页面结构规整、对齐。
    * **善用负空间 (留白):** 通过充足的留白创造视觉呼吸感，使内容焦点突出，避免拥挤。
    * **内容组织:** 使用卡片、分割线、背景色块、视觉分隔符等元素，将不同信息模块清晰地组织和分隔开。
6.  **动态交互与动画增强 (策略性应用):**
    * **目标:** 模仿 apple 官网的动效，向下滚动鼠标配合动效,提升用户体验、增强信息表达和页面生动性，而非单纯炫技。动画应服务于内容和设计。
    * **工具:** 使用 Framer Motion (通过CDN引入)

### C.5 **技术规范:**

1.  **核心技术:** HTML5, Tailwind CSS (v2.x 或 v3.x), JavaScript (ES6+)。
2.  **必备库:**
    * Tailwind CSS: `https://cdn.tailwindcss.com` (或指定版本 CDN)
    * Font Awesome: `https://cdn.staticfile.org/font-awesome/6.4.0/css/all.min.css`
    * Mermaid.js: `https://cdn.jsdelivr.net/npm/mermaid@latest/dist/mermaid.min.js` (若使用)
    * Charts.js: `https://cdn.jsdelivr.net/npm/chart.js` (若使用)
3.  **字体加载:**
    * 中文字体: 建议使用 `https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Noto+Sans+SC:wght@400;500;700&display=swap` 或其他稳定 CDN。
    * CSS `font-family` 示例: `font-family: "Noto Sans SC", sans-serif;` (正文), `font-family: "Noto Serif SC", serif;` (标题)
4.  **代码质量:**
    * 使用语义化 HTML 标签。
    * CSS 类名遵循 Tailwind 规范。
    * JavaScript 代码结构清晰，模块化（可用 IIFE 或简单模块模式），包含必要的注释解释复杂逻辑或动画设置。
    * 确保代码符合 W3C 标准，在主流浏览器（Chrome, Firefox, Safari, Edge）上表现一致。
5.  **响应式设计:** 必须在各种设备尺寸（手机、平板、桌面）上都能完美展示和正常工作，布局不混乱，内容不溢出。
6.  **页面结构与元数据 (重要):**
    * **有效 HTML5**: 必须是完整的、有效的 HTML5 文档结构 (`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`)。
    * **页面标题 (`<title>`):** `<head>` 中**必须**包含一个准确、描述性的 `<title>` 标签。
    * **元数据 (`<meta>`):** `<head>` 中**必须**包含以下 `<meta>` 标签，且 `content` 格式需严格遵守：
        * `<meta name="publish-date" content="YYYY-MM-DD">` (**必填**, 发布日期，**必须**使用页面创建当天的服务器时间，不得使用未来日期，否则会导致索引页无法显示内容)
        * `<meta name="category" content="分类名">` (**必填**, `分类名` **必须**是 "ai-tech", "info-upgrade", "knowledge", "research" 其中之一，注意使用代码而非中文名称)
        * `<meta name="description" content="页面摘要...">` (**必填**, 用于索引页动态生成卡片摘要)
        * `<meta name="keywords" content="关键词1,关键词2,...">` (**必填**, 逗号分隔，用于知识图谱生成，至少提供 3-5 个核心关键词)
7.  **页面必需内容:**
    * **可见信息标签:** 在 `<body>` 内的**某个位置** (具体位置和样式可充分发挥美学创意) **必须**包含可见的发布日期和分类名称 (应与 `<meta>` 标签一致)。**特别注意：页面中显示的日期必须与meta标签中的publish-date完全一致**。
    * **返回首页链接:** 页面**必须**包含一个清晰可见的、指向项目根目录 `index.html` 的链接 (路径需根据文件存放位置调整，例如，如果文件在 `pages/info-upgrade/` 下，链接应为 `../../index.html`)。
    * **作者与版权:** **必须**在页面底部包含作者信息和版权信息（具体内容见 C.1）。
8.  **独立性与无全局依赖:** 生成的页面**不应**假设存在项目范围的全局 CSS 文件或 JavaScript 脚本 (如全局主题切换脚本)。所有样式和脚本要么内联，要么是页面自身链接的外部资源 (CDN 或页面特定文件)。页面自身的深色/浅色模式切换逻辑需在页面内实现。
9.  **资源引用路径 (重要):** 在 HTML 或 JavaScript 代码中引用项目内部资源（如 CSS 文件、JS 文件、图片、数据文件如 [metadata.json](mdc:metadata.json) 等）时，**必须优先使用相对路径** (e.g., `metadata.json`, `./images/logo.png`, `../styles/main.css`)，而不是以 `/` 开头的根路径 (e.g., `/metadata.json`, `/images/logo.png`)。这是因为根路径在本地开发环境和 GitHub Pages 等服务器部署环境（特别是部署在子目录下时）的解析方式可能不同，使用相对路径可以确保在各种环境下都能正确找到文件。

### C.5.1 可视化库实现细节

当按照 `C.3.4` 的要求使用 Mermaid.js 和 Chart.js 实现可视化时，**必须**遵循以下 JavaScript 实现模式，以确保技术复杂度和可维护性：

1.  **Chart.js 实现要求:**
    *   **初始化:** 每个 Chart.js 图表**必须**使用 `new Chart(ctx, config)` 进行实例化，其中 `ctx` 是通过 `element.getContext('2d')` 从特定的 `<canvas>` 元素获取的 2D 渲染上下文。
    *   **配置结构:** 传递给 `Chart` 构造函数的 `config` 对象**必须**清晰地分离 `data` 和 `options` 属性。`data` 对象（包含 `labels` 和 `datasets`）最好先定义为一个独立的变量，然后再赋值给 `config.data` 键，以提高代码清晰度。
    *   **动态颜色来源 (主题切换强制要求):** 在 `config.options` 对象内部，所有依赖主题的颜色（例如：文本、网格线、边框、数据集背景/点等的颜色）**不得**使用硬编码的字符串（如 `'#FFFFFF'` 或 `'black'`）。相反，它们**必须**在初始化时 *以及* 在主题更新期间，通过 `getComputedStyle(document.documentElement).getPropertyValue('--your-theme-color-variable')` 从 `C.4.4` 中定义的 CSS 自定义属性（变量）动态获取。
    *   **必要选项:** `config.options` **必须**包含基础设置，如 `responsive: true`，以及所选图表类型必需的比例尺（scales）和插件（plugins）配置。
    *   **实例管理:** 如果页面上存在多个 Chart.js 图表，它们的实例**必须**存储在一个易于访问的 JavaScript 结构中（例如，一个数组 `chartInstances = []` 或一个对象映射 `chartInstanceMap = {}`），以便于批量更新（例如主题更改时）。

2.  **Mermaid.js 实现要求:**
    *   **初始化:** 初始化**必须**使用 `mermaid.initialize(config)`。
    *   **主题同步:** 传递给 `mermaid.initialize()` 的 `config` **必须**包含一个 `theme` 属性，该属性的值应根据当前页面的主题状态（`'dark'` 或 `'base'`/`'default'`）动态设置。如果需要使用基础主题之外的自定义主题变量，应通过 `themeVariables` 属性提供，同样需要通过 `getComputedStyle` 从 CSS 变量中获取颜色值。

3.  **主题切换集成 (多库页面强制要求):**
    *   **集中的更新函数:** **必须**实现一个单一的、专门的 JavaScript 函数（例如，命名为 `updateVisualizationThemes` 或其他描述性名称），用于处理页面上**所有**可视化库的主题更新。
    *   **函数逻辑:** 这个主题更新函数**必须**执行以下操作序列：
        a.  确定新的主题状态（例如，检查 `document.documentElement.classList.contains('dark')`）。
        b.  使用更新后的 `theme`（以及可能反映新主题 CSS 变量值的 `themeVariables`）调用 `mermaid.initialize()`。
        c.  遍历存储的 Chart.js 实例集合（见要求 1.e）。
        d.  对于**每一个** Chart.js 实例：
            i.  使用 `getComputedStyle(...)` 为*新*主题动态获取所有必需的 CSS 颜色变量的**当前**值。
            ii. 显式更新图表 `options` 对象中的相关颜色属性（例如：`chartInstance.options.scales.y.ticks.color = newColor;`, `chartInstance.options.plugins.legend.labels.color = newLabelColor;` 等）。
            iii. 调用 `chartInstance.update()` 来应用更改并使用新的主题颜色重绘图表。

### C.6 **输出要求:**

* 提供一个**完整、独立、可直接在浏览器中运行的单一 HTML 文件** (`.html`)。
* 所有 CSS (Tailwind 生成的样式 或 内联 `<style>`) 和 JavaScript 代码都应包含在该 HTML 文件中（内联或嵌入）。
* 确保所有外部资源（CDN 链接）有效。
* SVG 图形应直接内联在 HTML 中。
* 最终代码需经过测试，无明显错误或控制台警告。
*   不要一次填充所有HTML代码，在充分思考规划后，分段分步骤创建html文件，并更新内容。


## E. 文件管理与维护 (开发时辅助流程)

1.  **文件存储:** 生成的 `.html` 文件应根据其 `<meta name="category">` 内容存放在 `pages/` 目录下对应的子文件夹中：
    *   `pages/info-upgrade/`
    *   `pages/research/`
    *   `pages/ai-tech/`
    *   `pages/knowledge/`
2.  **文件命名:** HTML 文件名应使用小写英文，用连字符 `-` 分隔，清晰反映内容主题 (例如 `llm-creative-page-design.html`)。
3.  **索引 (`metadata.json`) 维护 (开发时辅助流程):**
    *   **`index.html` 中的文章索引不再手动维护。** 其内容由客户端 JavaScript 读取 `metadata.json` 文件动态生成。
    *   `metadata.json` 是索引的唯一数据源，包含所有已发布页面的元数据数组 (`pages`) 和一个顶层最后更新时间戳 (`lastUpdated`)。
    *   **更新 `metadata.json` 必须严格遵循标准化的、包含验证步骤的提示词 (参考 `architecture.md` P.1-P.5 或类似定义)。**
    *   该自动化流程负责：
        *   从目标 HTML 文件**自动提取**所有必需的元数据 (title, description, publishDate, category, keywords, path)。
        *   **自动获取**文件的最后修改时间 (`lastModifiedDate`)。
        *   读取当前的 `metadata.json`。
        *   将新页面的元数据（使用相对路径 `path` 作为唯一 `id`）添加或更新到内存中的 `pages` 数组。
        *   更新顶层的 `lastUpdated` 时间戳。
        *   **执行原子写入**: 将更新后的数据写入临时文件，验证 JSON 格式有效性，然后替换原文件。
        *   **报告结果**：必须报告整个操作的结果，并明确指出内置的验证步骤是否成功。
    *   **对于多文档融合页面**: 其在 `metadata.json` 中的条目 (`id`, `path`, `title`, `description`, `keywords`) 应反映**整合后的内容主题和来源文件夹信息**，而非单一来源文件。`category` 同样基于整体内容主题选择。
4.  **内容页面验证 (前置步骤):** 在触发 `metadata.json` 更新流程**之前**，应 **验证**新生成的 HTML 文件是否满足 D 部分的核心要求 (元数据标签存在性、返回链接、作者信息等)。
5.  **版本控制:** 所有新创建或修改的 `.html` 文件和更新后的 `metadata.json` 都应通过 Git 提交和管理。

## F. 辅助工具与技术 (页面级)

1.  **CSS 框架 (页面级):** 单个页面**可以**选择性地通过 CDN 链接 Tailwind CSS 或其他 CSS 框架，但需注意这只影响该页面自身。
2.  **JavaScript (页面级):** 单个页面**可以**包含内联 `<script>` 或通过 CDN/本地文件链接必要的 JavaScript 库 (如 Mermaid.js)，用于实现页面特定的交互或可视化。脚本初始化需在页面内部完成。
3.  **Font Awesome:** 可通过 CDN 在单个页面中引入 Font Awesome 以使用图标。

## G. 注意事项

*   保持代码仓库整洁，遵循 Git 最佳实践。
*   所有页面必须通过 W3C 标准验证。
*   不添加任何未经授权的第三方插件或库。
*   严格遵守隐私保护原则，不收集不必要的用户数据。