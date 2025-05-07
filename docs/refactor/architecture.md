# 凿壁项目 React 重构 - 核心架构设计

本文档记录了凿壁项目从静态HTML迁移至React+TypeScript技术栈的核心架构设计决策，对应重构任务 Task ID: 2。

## 1. 主要组件结构

项目将采用以下核心组件结构：

- **`App.tsx`**: 应用的根组件，负责：
    - 设置 `react-router-dom` 的 `BrowserRouter`。
    - 定义顶层路由 (`Routes`, `Route`)。
    - 包裹全局 `ThemeProvider` 和 `MetadataProvider` (如果使用)。
    - 引入并渲染 `Layout.tsx`。

- **`Layout.tsx`**: 共享的页面布局组件，包含：
    - **页眉 (Header)**: 包含网站Logo/名称、主导航 (`NavigationMenu`)、主题切换按钮。
    - **页脚 (Footer)**: 包含版权信息、作者信息等。
    - **`<Outlet />`**: 来自 `react-router-dom`，用于渲染当前路由匹配的页面组件。

- **`HomePage.tsx`**: 首页组件 (路由 `/`)，负责：
    - 获取并展示 `metadata.json` 数据。
    - 渲染内容卡片列表 (`ContentCard`)。
    - 实现分类筛选 (`CategoryFilter`) 和排序功能。
    - 展示Hero Section和"关于我们"等静态内容。

- **`ContentPageWrapper.tsx`**: 内容页的包装器组件 (路由 `/pages/:category/:slug`)，负责：
    - 从URL参数 (`useParams`) 获取 `category` 和 `slug`。
    - 动态加载并渲染对应的MDX内容文件 (`React.lazy` + `import()`)。
    - 处理加载状态 (`Suspense`) 和错误状态。
    - 提供MDX组件渲染上下文 (`useMDXComponents`)。

- **`NotFound.tsx`**: 404页面组件 (路由 `*`)。

- **基础UI组件**: 大量使用 `shadcn/ui` 提供的组件（Button, Card, Tabs, NavigationMenu 等）构建界面，存放于 `src/components/ui/`。

## 2. 状态管理方案

- **主题状态 (Theme)**: 使用 React Context API 实现。
    - 创建 `src/context/ThemeProvider.tsx`，管理 `light`/`dark` 状态。
    - 提供 `useTheme` Hook 供组件访问和修改主题。
    - 主题状态持久化到 `localStorage`。

- **元数据 (Metadata)**: 使用自定义 Hook 实现。
    - 创建 `src/hooks/useMetadata.ts`，负责在客户端 `fetch('/metadata.json')`。
    - Hook 返回 `{ data, loading, error }`，供 `HomePage` 等组件使用。
    - *（未来可考虑升级为 Context Provider 或更复杂的状态管理库，如需在多处共享或避免重复获取）*

- **组件本地状态**: 优先使用组件本地状态 (`useState`) 处理非全局的UI状态（如下拉菜单开关、表单输入等）。

## 3. 项目目录结构

采用以下目录结构：

```
zaobi-react-app/
├── public/
│   └── metadata.json       # 页面元数据
├── src/
│   ├── assets/             # 静态资源 (图片, SVG等)
│   │   ├── animations/     # 动画组件 (Task 9)
│   │   ├── charts/         # 图表组件 (Task 8)
│   │   ├── ui/             # shadcn/ui 生成的组件
│   │   ├── ContentCard.tsx   # 内容卡片组件
│   │   ├── CategoryFilter.tsx# 分类筛选组件
│   │   └── Layout.tsx        # 共享布局组件
│   ├── content/            # MDX 内容文件 (按 category 分类)
│   │   ├── ai-tech/
│   │   └── ...
│   ├── context/
│   │   └── ThemeProvider.tsx # 主题 Context
│   ├── hooks/
│   │   └── useMetadata.ts    # 获取元数据 Hook
│   ├── lib/
│   │   └── utils.ts        # shadcn/ui 工具函数 (cn)
│   ├── pages/
│   │   ├── ContentPageWrapper.tsx # 内容页包装器
│   │   ├── HomePage.tsx      # 首页
│   │   └── NotFound.tsx      # 404页面
│   ├── types/
│   │   └── metadata.ts     # metadata.json 类型定义
│   ├── utils/              # 通用工具函数
│   ├── App.tsx             # 应用根组件
│   ├── index.css           # 全局样式
│   ├── main.tsx            # 应用入口
│   └── mdx-components.tsx  # MDX 组件映射 (Task 6)
├── vite.config.ts        # Vite 配置
├── tailwind.config.js    # Tailwind 配置
├── postcss.config.js     # PostCSS 配置
├── components.json       # shadcn/ui 配置
└── package.json
```

## 4. 数据流

1.  **元数据加载**: `HomePage` 组件通过 `useMetadata` Hook 发起客户端 `fetch` 请求，获取 `public/metadata.json` 内容。
2.  **数据传递**: `useMetadata` Hook 返回的数据传递给 `HomePage` 用于渲染卡片列表和筛选。
3.  **路由参数**: 用户点击卡片链接，`react-router-dom` 导航到 `/pages/:category/:slug`。
4.  **动态内容加载**: `ContentPageWrapper` 组件使用 `useParams` 获取 `category` 和 `slug`，然后动态 `import()` 加载对应的 `/content/:category/:slug.mdx` 文件。
5.  **MDX渲染**: 加载的MDX组件由 `ContentPageWrapper` 渲染，可使用 `useMDXComponents` 提供的组件映射。

## 5. 路由结构

使用 `react-router-dom` 定义以下路由：

- `/`: 映射到 `HomePage` 组件。
- `/pages/:category/:slug`: 映射到 `ContentPageWrapper` 组件，动态加载内容。
- `*`: 映射到 `NotFound` 组件，处理所有未匹配的路径。

导航通过 `Layout` 组件中的 `<Link>` 组件实现。 