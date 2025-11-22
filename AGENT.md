# AGENT 工作规约（OpenAI CodeX 最佳实践）

> 适用范围：整个仓库。若与用户的直接指令冲突，以用户指令为准；若与 `.cursor/rules` 冲突，以用户+本规约共同裁决，保持一致性与可维护性。

## 1. 开发流程（CodeX 工作法）
- 计划先行：用 plan（update_plan）拆分 3–7 个小步骤，任何时刻仅一个 in_progress。
- 操作前简述：每组相关命令前用一句话说明要做什么与为什么（preamble）。
- 改动最小：仅修改为完成任务所必需的文件与行，避免“顺手优化”。
- 文件编辑：一律使用 `apply_patch`；同一文件在一次提交中成块修改，避免多次零碎编辑。
- 查阅规范：优先阅读 `.cursor/rules` 与本文件，再决定实现方式；使用 `rg`/`sed -n` 分段阅读（≤250 行）。
- 路径与引用：使用相对路径；在对话中引用文件时使用可点击的真实路径（如 `pages/agents/index.html:1`）。
- 校验与预览：
  - 变更 HTML/CSS/JS：在仓库根目录启动本地服务 `python3 -m http.server 8000`，浏览 `http://localhost:8000/` 验证。
  - 有回归风险的改动，先在子页面/局部做“金丝雀”验证，再推广。
- 备份与重构：进行目录重组或批量移动前，创建 `backup/<timestamp>/` 快照；移动文件优先 `git mv` 保留历史。
- 安全与合规：
  - 不引入需要构建链的重型依赖；CDN 资源需有“离线回退”。
  - 处理外部数据时，默认启用最小化权限、输入校验与错误兜底。

## 2. 目录与页面约定
- 目录结构（约定优于配置）：
  - 页面：`pages/`（专题在子目录，如 `pages/agents/`）
  - 样式与脚本：`assets/css/`、`assets/js/`、图片 `assets/images/`、PDF `assets/pdf/`
  - 内容：`md/`（Markdown 源，页面可动态渲染）
  - 脚本：`scripts/`（提取/处理工具）
  - 数据与产物：`data/`（中间文件、缓存等）
- 命名：文件使用短横线小写（kebab-case），页面文件名即导航 slug（如 `openai-agentkit.html`）。
- 导航：Agent 教学站点统一使用 `assets/js/agents-nav.js` 渲染导航并高亮当前页。
- 页面骨架（示例）：
  ```html
  <!doctype html>
  <html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>页面标题</title>
    <link rel="stylesheet" href="../../assets/css/agents.css" />
  </head>
  <body>
    <header class="ag-header">…</header>
    <main class="container ag-main">…</main>
    <script src="../../assets/js/agents-nav.js"></script>
  </body>
  </html>
  ```

## 3. 内容与可视化（对齐 `.cursor/rules/web-dev.mdc`）
- 语言：全部页面内容使用简体中文。
- 信息呈现：
  - 结构化层次清晰（总览→要点→细节）；必要时提供图表/信息图。
  - 每个专题页建议提供“进一步阅读”5 条外链（论文/文章/文档）。
- 数据来源：仅使用授权来源；页面内注明来源与时间，避免含混引用。
- 性能：避免阻塞脚本；首屏内容优先，图表按需加载。
- 可访问性：语义标签、可读对比度、键盘可达；图片需 `alt` 文本。

## 4. 主题与设计系统（统一令牌）
- 所有新页面采用下列 CSS 令牌（:root/.dark），作为主题与组件样式的唯一来源。
- 字体：`--font-sans: "Oxanium", sans-serif`，`--font-mono: "Source Code Pro"`；圆角 `--radius: 0px`；投影按变量使用。
- 颜色与变量（可直接复制到样式文件，建议集中到 `assets/css/theme.css` 并在页面中引入）：

```css
:root {
  --background: rgb(204, 204, 204);
  --foreground: rgb(31, 31, 31);
  --card: rgb(176, 176, 176);
  --card-foreground: rgb(31, 31, 31);
  --popover: rgb(176, 176, 176);
  --popover-foreground: rgb(31, 31, 31);
  --primary: rgb(183, 28, 28);
  --primary-foreground: rgb(255, 255, 255);
  --secondary: rgb(85, 107, 47);
  --secondary-foreground: rgb(255, 255, 255);
  --muted: rgb(184, 184, 184);
  --muted-foreground: rgb(74, 74, 74);
  --accent: rgb(70, 130, 180);
  --accent-foreground: rgb(255, 255, 255);
  --destructive: rgb(255, 111, 0);
  --destructive-foreground: rgb(0, 0, 0);
  --border: rgb(80, 80, 80);
  --input: rgb(80, 80, 80);
  --ring: rgb(183, 28, 28);
  --chart-1: rgb(183, 28, 28);
  --chart-2: rgb(85, 107, 47);
  --chart-3: rgb(70, 130, 180);
  --chart-4: rgb(255, 111, 0);
  --chart-5: rgb(141, 110, 99);
  --sidebar: rgb(176, 176, 176);
  --sidebar-foreground: rgb(31, 31, 31);
  --sidebar-primary: rgb(183, 28, 28);
  --sidebar-primary-foreground: rgb(255, 255, 255);
  --sidebar-accent: rgb(70, 130, 180);
  --sidebar-accent-foreground: rgb(255, 255, 255);
  --sidebar-border: rgb(80, 80, 80);
  --sidebar-ring: rgb(183, 28, 28);
  --font-sans: "Oxanium", sans-serif;
  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-mono: "Source Code Pro", monospace;
  --radius: 0px;
  --shadow-x: 0px;
  --shadow-y: 2px;
  --shadow-blur: 4px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.4;
  --shadow-color: hsl(0 0% 0%);
  --shadow-2xs: 0px 2px 4px 0px hsl(0 0% 0% / 0.20);
  --shadow-xs: 0px 2px 4px 0px hsl(0 0% 0% / 0.20);
  --shadow-sm: 0px 2px 4px 0px hsl(0 0% 0% / 0.40), 0px 1px 2px -1px hsl(0 0% 0% / 0.40);
  --shadow: 0px 2px 4px 0px hsl(0 0% 0% / 0.40), 0px 1px 2px -1px hsl(0 0% 0% / 0.40);
  --shadow-md: 0px 2px 4px 0px hsl(0 0% 0% / 0.40), 0px 2px 4px -1px hsl(0 0% 0% / 0.40);
  --shadow-lg: 0px 2px 4px 0px hsl(0 0% 0% / 0.40), 0px 4px 6px -1px hsl(0 0% 0% / 0.40);
  --shadow-xl: 0px 2px 4px 0px hsl(0 0% 0% / 0.40), 0px 8px 10px -1px hsl(0 0% 0% / 0.40);
  --shadow-2xl: 0px 2px 4px 0px hsl(0 0% 0% / 1.00);
  --tracking-normal: 0em;
  --spacing: 0.25rem;
}

.dark {
  --background: rgb(26, 26, 26);
  --foreground: rgb(224, 224, 224);
  --card: rgb(42, 42, 42);
  --card-foreground: rgb(224, 224, 224);
  --popover: rgb(42, 42, 42);
  --popover-foreground: rgb(224, 224, 224);
  --primary: rgb(229, 57, 53);
  --primary-foreground: rgb(255, 255, 255);
  --secondary: rgb(104, 159, 56);
  --secondary-foreground: rgb(0, 0, 0);
  --muted: rgb(37, 37, 37);
  --muted-foreground: rgb(160, 160, 160);
  --accent: rgb(100, 181, 246);
  --accent-foreground: rgb(0, 0, 0);
  --destructive: rgb(255, 160, 0);
  --destructive-foreground: rgb(0, 0, 0);
  --border: rgb(74, 74, 74);
  --input: rgb(74, 74, 74);
  --ring: rgb(229, 57, 53);
  --chart-1: rgb(229, 57, 53);
  --chart-2: rgb(104, 159, 56);
  --chart-3: rgb(100, 181, 246);
  --chart-4: rgb(255, 160, 0);
  --chart-5: rgb(161, 136, 127);
  --sidebar: rgb(20, 20, 20);
  --sidebar-foreground: rgb(224, 224, 224);
  --sidebar-primary: rgb(229, 57, 53);
  --sidebar-primary-foreground: rgb(255, 255, 255);
  --sidebar-accent: rgb(100, 181, 246);
  --sidebar-accent-foreground: rgb(0, 0, 0);
  --sidebar-border: rgb(74, 74, 74);
  --sidebar-ring: rgb(229, 57, 53);
  --font-sans: "Oxanium", sans-serif;
  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-mono: "Source Code Pro", monospace;
  --radius: 0px;
  --shadow-x: 0px;
  --shadow-y: 2px;
  --shadow-blur: 5px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.6;
  --shadow-color: hsl(0 0% 0%);
  --shadow-2xs: 0px 2px 5px 0px hsl(0 0% 0% / 0.30);
  --shadow-xs: 0px 2px 5px 0px hsl(0 0% 0% / 0.30);
  --shadow-sm: 0px 2px 5px 0px hsl(0 0% 0% / 0.60), 0px 1px 2px -1px hsl(0 0% 0% / 0.60);
  --shadow: 0px 2px 5px 0px hsl(0 0% 0% / 0.60), 0px 1px 2px -1px hsl(0 0% 0% / 0.60);
  --shadow-md: 0px 2px 5px 0px hsl(0 0% 0% / 0.60), 0px 2px 4px -1px hsl(0 0% 0% / 0.60);
  --shadow-lg: 0px 2px 5px 0px hsl(0 0% 0% / 0.60), 0px 4px 6px -1px hsl(0 0% 0% / 0.60);
  --shadow-xl: 0px 2px 5px 0px hsl(0 0% 0% / 0.60), 0px 8px 10px -1px hsl(0 0% 0% / 0.60);
  --shadow-2xl: 0px 2px 5px 0px hsl(0 0% 0% / 1.50);
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

- 用法建议：组件层使用语义变量（如 `--color-primary`），页面层仅用布局与栅格变量，避免直接硬编码颜色。

## 5. Markdown 渲染策略
- 优先使用 Marked（CDN）：
  - `<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>`
  - 离线/失败时使用轻量 fallback 渲染函数（已在 `openai-agentkit.html`、`langchain.html` 示例内置）。
- 内容路径回退顺序（示例）：`../../md/...` → `/md/...` → `md/...`，尽量保证在不同部署根路径下可用。

## 6. 质量基线与“Do / Don’t”
- Do：
  - 使用 `rg`/`sed -n` 分段阅读；HTML 页面在本地服务中验证首屏及导航。
  - 任何网络资源提供离线退化路径（如渲染失败时展示原始文本）。
  - 引用文件时提供可点击路径（如 `pages/agents/openai-agentkit.html:1`）。
- Don’t：
  - 不在无必要时调整无关文件；不引入重型构建链；不使用全局样式硬覆盖主题变量。

## 7. 变更记录
- 初始化本规约，用于指导“Agent 应用教学”站点及全仓 Web 开发的一致性与可维护性。

— 完 —
