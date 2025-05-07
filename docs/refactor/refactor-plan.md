明白了，你希望借鉴claude-task-master的工作方法和流程，但不实际安装该工具。这是一个很好的方法，让我为你提供一个基于claude-task-master理念的手动实现方案。

## claude-task-master核心流程与手动实现方案

### 1. 项目结构创建 ✅

首先，建立类似于claude-task-master的文件结构：

```
docs/
  refactor/
    tasks/  <- 创建这个新目录存放任务文件
      task_001.txt
      task_002.txt
      ...
  metadata/
    tasks.json  <- 创建这个文件管理所有任务
```

### 2. 任务定义格式 ✅

每个任务文件(`task_XXX.txt`)使用以下格式：

```
# Task ID: 1
# Title: 初始化React项目与基础设置
# Status: pending
# Dependencies: 
# Priority: high
# Description: 创建React+TypeScript项目，集成Tailwind CSS和shadcn/ui。
# Details:
#   使用Vite创建项目，安装必要依赖，配置Tailwind CSS，初始化shadcn/ui。
# Test Strategy:
#   验证项目能正常启动，所有依赖正确安装，基础组件正常显示。
```

### 3. 任务清单JSON格式 ✅

`tasks.json`文件结构：

```json
{
  "tasks": [
    {
      "id": 1,
      "title": "初始化React项目与基础设置",
      "status": "pending",
      "dependencies": [],
      "priority": "high",
      "description": "创建React+TypeScript项目，集成Tailwind CSS和shadcn/ui。",
      "details": "使用Vite创建项目，安装必要依赖，配置Tailwind CSS，初始化shadcn/ui。",
      "testStrategy": "验证项目能正常启动，所有依赖正确安装，基础组件正常显示。",
      "subtasks": []
    },
    // 更多任务...
  ]
}
```

### 4. 借鉴claude-task-master的工作流程 ✅

1. **解析需求文档**：手动将你的`AST-Graph refactor T1.md`和`refactor-plan.md`分析转化为具体任务

2. **任务拆分**：将重构工作拆分为小型、可管理的任务，每个任务有明确的边界

3. **依赖管理**：明确定义任务之间的依赖关系，确保按正确顺序执行

4. **复杂度分析**：评估每个任务的复杂度，识别需要进一步拆分的任务

5. **状态跟踪**：跟踪每个任务的状态（pending, in-progress, done）

### 5. 核心任务列表生成 ✅

基于你的重构文档，已创建以下13个核心任务：

- Task 1: 项目初始化与基础设置
- Task 2: 核心架构设计
- Task 3: 共享Layout组件实现
- Task 4: 路由配置
- Task 5: HomePage组件实现
- Task 6: 内容渲染策略决策与实现
- Task 7: ContentPageWrapper组件开发
- Task 8: 图表组件重构
- Task 9: 动画效果重构
- Task 10: 第一个内容页面迁移
- Task 11: 批量内容迁移
- Task 12: 样式迁移与主题支持
- Task 13: 测试与优化

每个任务都有详细的描述、依赖关系、优先级和测试策略，存储在`docs/metadata/tasks.json`中。

### 6. 借鉴claude-task-master的prompt模式 ✅

在与AI助手对话时，使用以下prompt模式：

1. **任务分析prompt**：
```
请帮我分析这个重构任务的复杂度：[任务描述]
需要考虑：技术复杂性、依赖关系、潜在风险、所需时间
```

2. **任务拆分prompt**：
```
请帮我将以下复杂任务拆分为3-5个子任务：
[复杂任务描述]
每个子任务应有明确的：ID、标题、描述、验收标准
```

3. **依赖分析prompt**：
```
请分析以下任务之间的依赖关系：
[任务列表]
输出格式应为：任务ID -> 依赖任务ID列表
```

4. **实现指导prompt**：
```
我现在要实现任务[ID]：[任务标题]
任务描述：[描述]
请提供实现步骤、代码示例和需要注意的问题
```

5. **状态更新prompt**：
```
我已完成任务[ID]，实现了[功能描述]。
请帮我更新任务状态并推荐下一个应该处理的任务。
```

### 7. 实际操作流程示例

以下是如何手动应用claude-task-master工作流程的示例：

1. **初始分析**：
```
请帮我分析重构计划文档，并生成10-15个关键任务。
每个任务应包含：ID、标题、描述、依赖、优先级。
文档内容如下：
[插入你的refactor-plan.md和AST-Graph refactor T1.md内容]
```

2. **复杂度分析**：
```
请分析"内容渲染策略决策与实现"任务的复杂度。
考虑MDX支持、React组件转换、动态效果处理等因素。
```

3. **下一步推荐**：
```
我已完成"项目初始化与基础设置"任务，成功创建了React+TS项目并配置了Tailwind与shadcn/ui。
根据依赖关系，我应该接下来处理哪个任务？
```

### 8. 重构项目的具体实施计划 ✅

1. 使用上述格式和prompt创建初始任务列表 ✅
2. 为每个任务创建单独的任务文件，放在`docs/refactor/tasks/`目录 ✅
3. 维护一个中央`tasks.json`跟踪所有任务状态 ✅
4. 按照依赖顺序逐个实施任务
5. 完成任务后更新状态并识别下一个任务
6. 对复杂任务使用"拆分"prompt进行细化

## 当前进度

已完成：
- ✅ 项目结构创建
- ✅ 任务定义格式确定
- ✅ 任务清单JSON格式确定
- ✅ 核心任务列表生成 (13个任务)
- ✅ 创建所有任务的详细文件 (task_001.txt 到 task_013.txt)
- ✅ 创建中央任务清单 `docs/metadata/tasks.json`
- ✅ **执行任务1：项目初始化与基础设置**
- ✅ **执行任务2：核心架构设计**
- ✅ **执行任务3：共享Layout组件实现**
- ✅ **执行任务4：路由配置**

下一步：
- **开始执行任务5：HomePage组件实现** 