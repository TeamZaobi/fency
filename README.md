# 凿壁 - 健康医疗行业的AI解决方案平台

![凿壁](https://img.shields.io/badge/团队-凿壁-blue)
![领域](https://img.shields.io/badge/领域-医疗AI-green)
![状态](https://img.shields.io/badge/状态-持续更新-brightgreen)

## 项目创建背景

随着人工智能技术的飞速发展，医疗健康领域正面临数字化转型的重大机遇。然而，AI技术在医疗行业的落地过程中依然存在诸多障碍：一方面是技术与临床实际需求的脱节，另一方面是医疗机构对AI技术评估与选择的困惑。

凿壁项目正是在这一背景下应运而生。2023年，在国家健康医疗大数据研究院的支持下，我们组建了一支跨学科团队，由医疗专家、AI研究人员和技术工程师共同合作，致力于破解医疗AI落地难题。项目名称"凿壁"源自中国古代"凿壁偷光"的典故，寓意着我们希望为医疗行业打开一扇通往AI技术光明的窗口。

## 项目简介

凿壁团队致力于为卫生健康行业提供前沿的AI解决方案。我们的使命是：

- **帮助健康医疗行业凿开AI乱象**
- **帮AI行业凿开医疗行业壁垒**

我们深知医疗行业的特殊性与复杂性，团队汇集了医疗专家和AI技术人才，通过跨学科合作，打造适合中国医疗体系的智能化解决方案。我们不仅仅是技术提供者，更是医疗AI领域的思想者与探索者。

## 内容分类

网站内容分为四大类：

1. **信息化升级**: 医疗数据资产化、医院智能化升级相关内容
2. **科研辅助**: AI研究主题全景、临床辅助决策系统等
3. **AI技术与生态**: 大模型能力解析、多模态技术、开发框架等
4. **知识报告**: AI模型理论、医疗AI研究综述、认知科学研究等

## 项目结构

项目按照功能和内容类型进行了科学组织，具体结构如下：

```
凿壁-医疗AI解决方案平台/
├── index.html                    # 项目首页
├── README.md                     # 项目说明文档
├── CHANGELOG.md                  # 更新日志
├── CONTRIBUTING.md               # 贡献指南
│
├── pages/                        # 主要内容页面目录
│   ├── info-upgrade/             # 信息化升级相关页面
│   ├── research/                 # 科研辅助相关页面
│   ├── ai-tech/                  # AI技术与生态相关页面
│   └── knowledge/                # 知识报告相关页面
│
├── models/                       # AI模型相关页面
│   └── comparisons/              # 模型对比评测
│
├── includes/                     # 页面公共部分
│   ├── header/                   # 页头文件
│   └── footer/                   # 页脚文件
│
├── assets/                       # 静态资源文件
│   ├── css/                      # CSS样式文件
│   ├── js/                       # JavaScript脚本
│   └── images/                   # 图片资源
│
├── scripts/                      # 项目辅助脚本
│   ├── metadata-processor.js     # 元数据处理脚本
│   └── metadata-llm-integration.js # LLM集成模块
│
├── audit/                        # 代码审计文档
│   ├── README.md                 # 审计概述
│   ├── code-structure-best-practices.md # 代码最佳实践
│   └── project-reflection.md     # 项目反思
│
├── react-app/                    # React应用目录
│   ├── src/                      # 源代码
│   ├── public/                   # 公共资源
│   └── README.md                 # React应用说明
│
└── docs/                         # 项目文档
    ├── README.md                 # 详细文档
    ├── architecture.md           # 架构设计文档
    ├── content-processing-workflow.md # 内容处理工作流程
    ├── version-management.md     # 版本管理计划
    ├── plan.md                   # 开发计划
    ├── prd.md                    # 产品需求文档
    └── build.md                  # 构建指南
```

## 元数据管理

本项目采用元数据驱动的内容组织方式，确保所有页面都具有标准化的元数据结构，便于索引和关联。每个HTML页面都包含以下元数据标签：

```html
<meta name="category" content="分类名">  <!-- 必须是预定义的四个分类之一 -->
<meta name="description" content="页面内容的简洁摘要...">
<meta name="publish-date" content="YYYY-MM-DD">  <!-- 发布日期，格式为年-月-日 -->
<meta name="keywords" content="关键词1, 关键词2, 关键词3, ...">  <!-- 与页面内容相关的关键词列表 -->
```

## 技术栈

- HTML5 + CSS3
- TailwindCSS
- JavaScript
- React (用于部分现代化功能)
- FontAwesome图标库
- Mermaid.js用于图表可视化

## 版本管理

凿壁项目采用**功能驱动**的版本管理策略，而非固定时间周期的发布模式。这意味着我们的版本发布由功能完成度和产品路线图驱动，确保每个版本都提供有意义的用户价值，同时保持高质量标准。

### 版本号规范

采用语义化版本控制（Semantic Versioning）规范：

- **格式**：`主版本号.次版本号.修订号`（例如：1.2.3）
- **主版本号**：当进行不兼容的API更改或重大功能重构时递增
- **次版本号**：当添加功能但保持向后兼容性时递增
- **修订号**：当进行向后兼容的错误修复时递增

### 版本类型

根据功能重要性和范围，将版本分为以下类型：

1. **主要版本（Major Release）**：包含重大功能更新或架构变更
2. **功能版本（Feature Release）**：包含新功能但保持向后兼容性
3. **维护版本（Maintenance Release）**：主要包含错误修复和小改进
4. **紧急修复版本（Hotfix）**：针对生产环境中的关键问题

详细的版本管理计划请参考 [docs/version-management.md](docs/version-management.md)。

## 开发指南

### 本地开发

1. 克隆仓库
   ```bash
   git clone https://github.com/TeamZaobi/fency.git
   cd fency
   ```

2. 使用浏览器打开`index.html`开始本地预览，或通过本地服务器运行（推荐）：
   ```bash
   # 使用Python简易HTTP服务器
   python -m http.server
   ```

3. 访问 `http://localhost:8000` 查看网站

### 开发规范

- 所有页面内容必须为简体中文
- 保持代码结构清晰、语义化，包含适当的注释
- 确保网站在各设备上响应式展示
- 遵循Git最佳实践
- 所有页面须通过W3C标准验证

## 联系方式

- **作者**: 季晓康
- **Email**: jxk@sdu.edu.cn
- **角色**: AI观察员，认知中枢
- **微信公众号**: 凿壁
- **办公地址**: 山东省济南市市中区二环南路12550号

## 版权信息

© 2023-2025 国家健康医疗大数据研究院. 版权所有
