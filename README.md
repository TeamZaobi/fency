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

网站内容分为四大类，存放在 `html/pages/` 目录下对应的子文件夹中：

1. **信息化升级 (info-upgrade)**: 医疗数据资产化、医院智能化升级相关内容
2. **科研辅助 (research)**: AI研究主题全景、临床辅助决策系统等
3. **AI技术与生态 (ai-tech)**: 大模型能力解析、多模态技术、开发框架等
4. **知识报告 (knowledge)**: AI模型理论、医疗AI研究综述、认知科学研究等

## 项目结构

项目核心文件结构如下：

```
/var/www/
├── index.html           # 网站首页（动态索引页，由JS读取metadata.json生成）
├── metadata.json        # 网站页面元数据索引文件 (核心数据源)
├── assets/              # 静态资源目录
│   └── css/
│       └── fency-theme.css # 核心设计系统样式
├── pages/               # 页面内容目录
│   ├── ai-tech/
│   ├── info-upgrade/
│   ├── knowledge/
│   └── research/
├── scripts/             # 自动化脚本
│   └── deploy.sh        # 一键部署脚本
├── .cursor/             # Cursor AI 辅助开发配置
│   └── rules/           # 项目规则文件目录 (指导AI协作)
├── docs/                # 项目详细文档
└── README.md            # 项目说明文档
```

## 元数据与索引

本项目采用**元数据驱动**的内容组织方式。所有HTML页面都必须包含标准化的元数据标签（详情见 [.cursor/rules/html-page-structure.mdc](mdc:.cursor/rules/html-page-structure.mdc)）。

核心数据源是 [metadata.json](mdc:metadata.json)，它包含了所有页面的元数据，用于动态生成网站首页 [index.html](mdc:index.html) 的内容卡片和知识图谱。

`metadata.json` 的结构和维护规范请参考 [.cursor/rules/metadata-json-structure.mdc](mdc:.cursor/rules/metadata-json-structure.mdc)。

## 技术栈

- HTML5 + CSS3
- TailwindCSS
- JavaScript
- React (用于部分现代化功能)
- FontAwesome图标库
- Mermaid.js用于图表可视化

## 版本管理

项目遵循详细的 Git 版本控制规范，包括功能驱动发布、语义化版本、Git Flow 分支模型和 Conventional Commits 提交消息格式。

详细规范请参考 [.cursor/rules/git-version-control.mdc](mdc:.cursor/rules/git-version-control.mdc)。

## 开发与维护

### Cursor AI 规则
本项目利用 Cursor AI 进行辅助开发和维护。相关规则定义在 `.cursor/rules/` 目录下，指导 AI 的行为，确保代码质量和流程一致性。在项目文档和代码中，我们使用 `@rules` 作为 `.cursor/rules/` 目录的简称和引用方式。

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

### 部署流程

本项目支持一键部署到 GitHub 和 阿里云服务器。

1. **运行部署脚本**:
   ```bash
   ./scripts/deploy.sh
   ```
   *(脚本会自动提交代码到 GitHub，并使用 rsync 同步文件到阿里云服务器)*

### 开发规范
详细的网页开发规范、LLM 页面生成要求和文件管理流程请参考 [.cursor/rules/web-dev.mdc](mdc:.cursor/rules/web-dev.mdc)。

核心要求包括：
- 所有页面内容必须为简体中文
- 保持代码结构清晰、语义化，包含适当的注释
- 确保网站在各设备上响应式展示
- 遵循Git最佳实践
- 所有页面须通过W3C标准验证
- 遵循[开发经验教训](#开发经验教训)中总结的最佳实践

### 开发经验教训

在实际项目开发中，我们积累了宝贵的经验教训，这些经验被记录在 [.cursor/rules/web-dev.mdc](mdc:.cursor/rules/web-dev.mdc) 的 "C.5-bis 开发经验教训" 部分。核心经验包括：

1. **内容完整性检查**：建立内容检查清单，确保所有规划的内容板块都已完整实现，特别是在多部分AI分步生成内容时避免内容断层
   
2. **版本控制意识**：对关键修改记录详细的版本变更信息，采用"功能-修复-优化"三级提交描述体系，便于追踪和回滚

这些经验教训反映了实际开发中发现的问题和相应解决方案，对新加入项目的开发者尤为重要。

## 版本历史

此部分记录项目的所有重要版本更新，最新版本显示在顶部。

### v1.0.2 - 2025-04-22

**新功能:**
- 添加了BitNet分析相关页面
- 添加了智能统计分析系统页面

**改进:**
- 更新了项目规则文档
- 优化了构建流程和文档
- 更新了元数据处理逻辑

### v1.0.1 - 2025-04-21

**改进:**
- 统一了项目文档中对规则目录的引用方式，使用`@rules`作为`.cursor/rules/`目录的简称
- 在所有相关文档中添加了命名约定说明，提高了文档可读性
- 优化了项目文档结构，使其更加清晰和一致

### v1.0.0 - 2025-03-28

**新功能:**
- 实现了以元数据驱动的内容组织方式
- 添加了AI技术、信息化升级、知识报告和科研辅助四大内容分类
- 构建了动态索引页，支持内容卡片和知识图谱展示
- 完善了Cursor AI规则系统，实现AI辅助开发

**改进:**
- 优化了项目文件结构，区分源代码和分发版本
- 标准化了HTML页面元数据格式，确保索引一致性
- 改进了版本控制规范，增加经验教训文档
- 实现了响应式设计，支持多种设备访问

## 联系方式

- **作者**: 季晓康
- **Email**: jxk@sdu.edu.cn
- **角色**: AI观察员，认知中枢
- **微信公众号**: 凿壁
- **办公地址**: 山东省济南市市中区二环南路12550号

## 版权信息

© 2023-2025 国家健康医疗大数据研究院. 版权所有
