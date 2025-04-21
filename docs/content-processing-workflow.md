# 凿壁项目 - 内容处理工作流

> 本文档详细记录了凿壁项目中，LLM 生成的 HTML 页面的标准化处理流程，作为当前工作的操作指南，也可用作未来设计自动化脚本的需求基础。
>
> **命名约定说明**: 在本文档及项目其他文档中，`@rules` 是对项目根目录下 `.cursor/rules/` 文件夹的引用简称。当看到 `@rules` 时，它实际指向的是 `.cursor/rules/` 目录及其包含的规则文件。

## 1. 工作流目标

此工作流的主要目标是确保所有由 LLM 生成的 HTML 页面符合项目的基本元数据和结构标准（如 `@rules` 中定义），以实现：

* **元数据一致性**：确保所有页面都有标准化的元数据，便于未来可能的自动化索引。
* **导航一致性**：确保所有页面都有返回首页的链接和标准的页脚信息。
* **可见元信息**：确保页面都有可见的分类和发布日期，增强用户对内容的理解。
* **结构完整性**：在保留 LLM 创意和页面独特设计的同时，确保基本结构元素的存在。

## 2. 触发条件

在以下情况下，需要执行内容处理工作流：

1. **新页面生成**：当使用 LLM 生成新的 HTML 页面并保存到 `pages/` 的子目录中后。
2. **内容重大更新**：当对现有页面进行重大内容更新，可能需要更新元数据（如描述、关键词）时。
3. **项目标准变更**：当项目的元数据或结构标准（`@rules`）发生变化时，可能需要对现有页面进行批量更新。
4. **页面迁移**：当从其他位置迁移页面到 `pages/` 子目录时。

## 3. 处理步骤

### 3.1 页面文件准备

1. **文件命名检查**：
   * 确保文件名使用小写英文字母，单词间用连字符 `-` 分隔。
   * 文件名应清晰反映页面主要内容主题，例如 `ai-essential-papers.html`。

2. **存放位置验证**：
   * 根据页面的分类（将在后续步骤中确定），确认文件存放在 `pages/` 下的正确子文件夹：
     - `info-upgrade/`：信息化升级类内容
     - `research/`：科研辅助类内容
     - `ai-tech/`：AI技术与生态类内容
     - `knowledge/`：知识报告类内容

### 3.2 内容分析与元数据补充

1. **读取文件内容**：
   * 使用文本编辑器或 HTML 解析工具读取整个 HTML 文件。

2. **确定页面的基本信息**：
   * 分析页面标题 (`<title>` 标签内容)
   * 分析页面正文内容，了解主题、目的和主要信息点
   * 如有必要，可使用 LLM 辅助分析内容

3. **验证/添加 `<head>` 中的元数据**：
   * 确保 `<head>` 部分包含以下 `<meta>` 标签：
      ```html
      <meta name="category" content="分类名">  <!-- 必须是预定义的四个分类之一 -->
      <meta name="description" content="页面内容的简洁摘要...">
      <meta name="publish-date" content="YYYY-MM-DD">  <!-- 发布日期，格式为年-月-日 -->
      <meta name="keywords" content="关键词1, 关键词2, 关键词3, ...">  <!-- 与页面内容相关的关键词列表 -->
      ```
   * 如果缺少任何标签，需要添加：
     - `category`：从四个预定义分类中选择最匹配的一个
     - `description`：撰写或使用 LLM 生成一段 100-200 字符的页面内容摘要
     - `publish-date`：确定合适的发布日期（新页面通常是当前日期）
     - `keywords`：确定 5-10 个与页面内容密切相关的关键词，以逗号分隔

### 3.3 页面结构验证与补充

1. **验证/添加返回首页链接**：
   * 检查页面是否在明显位置（通常是页面顶部导航或页面底部）包含返回首页的链接：
     ```html
     <a href="../../index.html">返回首页</a>  <!-- 路径根据文件所在子目录层级调整 -->
     ```
   * 如果缺少，则在适当位置（如页面顶部导航栏）添加

2. **验证/添加可见的分类和日期信息**：
   * 检查页面是否在明显位置（通常在标题下方或页面开头区域）显示分类和发布日期：
     ```html
     <div class="article-meta">
       <span class="meta-item"><i class="fas fa-calendar-alt"></i>发布日期: 2024-04-05</span>
       <span class="meta-item"><i class="fas fa-folder"></i>分类: 科研辅助</span>
     </div>
     ```
   * 如果缺少，则在适当位置添加，同时尊重页面的整体设计风格

3. **验证/添加作者和版权信息**：
   * 检查页面底部是否包含标准的作者和版权信息：
     ```html
     <footer>
       <div>
         <p>作者: 季晓康</p>
         <p>Email: jxk@sdu.edu.cn</p>
         <p>角色: AI观察员，认知中枢</p>
         <p>微信公众号：凿壁</p>
       </div>
       <p>&copy; 2024 国家健康医疗大数据研究院</p>
     </footer>
     ```
   * 如果缺少，则在页面底部添加，同时尊重页面的整体设计风格

### 3.4 保存与验证

1. **保存修改**：
   * 将所有修改保存到原始HTML文件

2. **HTML代码验证**：
   * 验证修改后的HTML代码是否仍然有效，没有语法错误
   * 可以使用W3C验证器或浏览器开发者工具进行基本检查

3. **视觉检查**：
   * 在浏览器中打开修改后的页面，确保所有新增元素（如返回链接、可见元信息、页脚）与页面整体风格协调
   * 检查深色/浅色模式切换功能是否仍然正常工作（如果页面实现了此功能）

### 3.5 索引页更新提醒

**重要：** 项目当前采用手动维护索引的模式，因此在内容处理工作流完成后，还需要：

1. 元数据已自动更新到 `metadata.json` 文件：
   * `index.html` 将自动加载并显示新内容
   * 在该区域的内容卡片列表中添加一个新的文章卡片，包含：
     - 标题（来自 `<title>` 或可能略有修改）
     - 摘要（来自 `<meta name="description">` 内容）
     - 发布日期（来自 `<meta name="publish-date">` 内容）
     - 分类标签（来自 `<meta name="category">` 内容）
     - 指向新页面的链接（使用正确的相对路径）
   * 确保卡片按发布日期降序排列

## 4. 异常处理

在内容处理过程中可能遇到以下异常情况，需要相应处理：

### 4.1 内容解析问题

* **HTML结构复杂或非标准**：
  * 处理：尽量使用强大的HTML解析工具或浏览器开发者工具辅助分析结构
  * 原则：尊重原始页面的创意和结构，只在必要位置添加所需元素

* **内容重复或相似**：
  * 情况：发现两个标题相似的页面（如 `researchtopics.html` 和 `clinical-research-topic-selection.html`）
  * 处理：
    1. 比较两个文件的内容和创建日期
    2. 确定是草稿/正式版关系，还是不同的内容
    3. 对于真正的重复内容，考虑保留更完整/更新的版本，或咨询项目维护者
    4. 如果决定保留两者，确保它们有明显不同的标题和描述

### 4.2 元数据生成问题

* **分类选择困难**：
  * 处理：分析页面主要内容和目的，选择最符合的预定义分类
  * 注意：如果确实难以分类，可选择与页面主要受众最相关的分类

* **关键词生成困难**：
  * 处理：可以使用LLM辅助生成关键词，提示LLM分析页面内容并提取5-10个最能代表内容的关键词

### 4.3 修改兼容性问题

* **页面样式与新增元素冲突**：
  * 处理：尽量使用与页面现有元素一致的样式，避免引入新的CSS类或规则
  * 原则：如有必要，可以针对新增元素添加内联样式，使其与页面整体风格统一

* **深色/浅色模式兼容性**：
  * 处理：确保新增元素在深色和浅色模式下都有适当的样式
  * 方法：通过CSS变量或媒体查询确保兼容性

## 5. 自动化考虑事项

当前的内容处理工作流是半手动的，由 AI 辅助的人工操作完成。未来可考虑通过脚本自动化部分或全部流程：

### 5.1 自动化可行的部分

1. **文件名和位置检查**：
   * 开发脚本扫描 `pages/` 目录，验证文件命名规范和位置
   * 如有必要，可以提供自动重命名或移动建议

2. **元数据一致性检查**：
   * 开发脚本扫描所有HTML文件，检查必要的 `<meta>` 标签是否存在
   * 对于缺失项，生成报告，以便人工或更高级的自动化过程处理

3. **基础结构检查**：
   * 开发脚本验证返回链接、可见元信息和页脚信息是否存在
   * 对于缺失项，生成报告

### 5.2 自动化实现选项

1. **元数据提取自动化脚本**：

   * **脚本触发方式**：
     - **Git钩子触发**：设置 pre-commit 或 post-commit 钩子，在提交新HTML文件或修改现有文件时自动触发
     - **CI/CD流程集成**：在部署前自动运行脚本检查所有HTML文件
     - **定时任务**：设置 cron 任务定期检查整个站点
     - **手动触发**：维护者通过命令行或UI工具手动触发

   * **具体实现方式**：
     ```javascript
     // Node.js实现示例
     const fs = require('fs');
     const path = require('path');
     const cheerio = require('cheerio'); // HTML解析库
     const { Configuration, OpenAIApi } = require('openai'); // OpenAI API客户端

     // 配置OpenAI
     const configuration = new Configuration({
       apiKey: process.env.OPENAI_API_KEY,
     });
     const openai = new OpenAIApi(configuration);

     // 扫描目录下所有HTML文件
     async function processDirectory(directoryPath) {
       const files = fs.readdirSync(directoryPath);

       for (const file of files) {
         if (file.endsWith('.html')) {
           await processHTMLFile(path.join(directoryPath, file));
         } else if (fs.statSync(path.join(directoryPath, file)).isDirectory()) {
           await processDirectory(path.join(directoryPath, file));
         }
       }
     }

     // 处理单个HTML文件
     async function processHTMLFile(filePath) {
       console.log(`处理文件: ${filePath}`);
       const content = fs.readFileSync(filePath, 'utf8');
       const $ = cheerio.load(content);

       // 检查元数据
       const missingMeta = checkMetadata($);

       if (missingMeta.length > 0) {
         // 提取文本内容用于LLM分析
         const title = $('title').text();
         const bodyText = $('body').text().substring(0, 5000); // 限制长度

         // 调用LLM生成缺失的元数据
         const generatedMeta = await generateMetadata(title, bodyText, missingMeta);

         // 应用生成的元数据
         applyMetadata($, generatedMeta);

         // 保存修改
         fs.writeFileSync(filePath, $.html());
         console.log(`已更新文件: ${filePath}`);
       }
     }

     // 检查元数据是否完整
     function checkMetadata($) {
       const requiredMeta = ['category', 'description', 'publish-date', 'keywords'];
       const missing = [];

       for (const meta of requiredMeta) {
         if ($(`meta[name="${meta}"]`).length === 0) {
           missing.push(meta);
         }
       }

       return missing;
     }

     // 调用LLM生成元数据
     async function generateMetadata(title, bodyText, missingMeta) {
       try {
         const prompt = `
           分析以下HTML页面内容，生成缺失的元数据：
           标题: ${title}
           正文摘要: ${bodyText.substring(0, 1000)}...
           
           需要生成: ${missingMeta.join(', ')}
           
           按照以下格式返回JSON:
           {
             "category": "选择以下之一: ai-tech, info-upgrade, knowledge, research",
             "description": "100-200字简洁摘要",
             "publish-date": "YYYY-MM-DD格式的日期",
             "keywords": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"]
           }
           
           只返回JSON，不要有其他内容。
         `;

         const response = await openai.createChatCompletion({
           model: "gpt-4",
           messages: [
             { role: "system", content: "你是一个网页内容分析专家，擅长提取关键信息并生成恰当的元数据。" },
             { role: "user", content: prompt }
           ],
           temperature: 0.3,
         });

         const result = response.data.choices[0].message.content;
         return JSON.parse(result);
       } catch (error) {
         console.error(`生成元数据失败: ${error.message}`);
         return {};
       }
     }

     // 应用生成的元数据到HTML
     function applyMetadata($, metadata) {
       for (const [key, value] of Object.entries(metadata)) {
         if (!value) continue;
         
         if (key === 'keywords' && Array.isArray(value)) {
           $('head').append(`<meta name="keywords" content="${value.join(', ')}">`);
         } else {
           $('head').append(`<meta name="${key}" content="${value}">`);
         }
       }
     }

     // 开始处理
     (async () => {
       const pagesDir = path.join(__dirname, 'pages');
       await processDirectory(pagesDir);
     })();
     ```

   * **错误处理机制**：
     - 添加详细的日志记录，记录每个处理步骤和可能出现的错误
     - 实现失败重试机制，特别是对LLM API调用可能的临时故障
     - 设置错误报告邮件发送给维护者
     - 保留处理前的文件备份，以便需要时能够回滚更改

2. **完整自动化处理流程**:
   - **预处理阶段**：扫描和分析HTML文件，评估需要的修改
   - **元数据生成阶段**：使用LLM生成缺失的元数据
   - **修改实施阶段**：应用生成的元数据和结构修改
   - **验证阶段**：验证修改后的HTML是否符合项目标准，没有语法错误
   - **报告阶段**：生成处理报告，包括修改摘要和可能需要人工干预的事项

### 5.3 自动化挑战点

1. **内容理解与元数据生成**：
   * 挑战：自动生成高质量、相关的描述和关键词需要深入理解页面内容
   * 可能解决方案：集成 LLM API (如OpenAI或本地运行的模型)，结合 HTML 解析

2. **HTML结构修改的兼容性**：
   * 挑战：自动在不同结构的HTML页面中插入新元素，而不破坏原有布局和样式
   * 可能解决方案：使用保守的DOM操作策略，优先在已知元素(如body开头或结尾)附近插入新内容，使用页面已有的样式类

3. **错误处理和恢复**：
   * 挑战：自动化处理过程中可能出现各种错误，如API失败、解析错误等
   * 解决方案：设计健壮的错误处理机制，包括重试策略、回滚机制和人工干预通知
   * 示例：
     ```javascript
     // 错误处理和重试机制示例
     async function safeProcessFile(filePath, maxRetries = 3) {
       let attempts = 0;
       let backupPath = filePath + '.bak';

       // 创建备份
       fs.copyFileSync(filePath, backupPath);

       while (attempts < maxRetries) {
         try {
           await processHTMLFile(filePath);
           // 成功处理，移除备份
           fs.unlinkSync(backupPath);
           return true;
         } catch (error) {
           attempts++;
           console.error(`处理文件 ${filePath} 失败，尝试 ${attempts}/${maxRetries}`, error);

           if (attempts >= maxRetries) {
             console.error(`达到最大重试次数，恢复备份`);
             fs.copyFileSync(backupPath, filePath);
             fs.unlinkSync(backupPath);

             // 发送通知给维护者
             notifyMaintainer(filePath, error);
             return false;
           }

           // 等待一段时间后重试
           await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
         }
       }
     }
     ```

### 5.4 可能的自动化实现路径

1. **阶段1 - 基础扫描脚本**：
   * 开发一个简单的扫描脚本，检查所有HTML文件的元数据和结构一致性
   * 生成报告，标识需要人工处理的文件和问题

2. **阶段2 - 半自动修复工具**：
   * 扩展脚本，增加自动修复简单问题的能力（如添加标准页脚）
   * 对于复杂修改，生成修改建议，等待人工确认后应用

3. **阶段3 - LLM集成工具**：
   * 集成LLM API，增加内容理解和元数据生成能力
   * 实现更智能的修改推荐和自动应用

4. **阶段4 - Git钩子或CI/CD集成**：
   * 开发Git钩子，在提交新HTML文件时自动触发检查和修复流程
   * 或集成到CI/CD管道中，作为发布前的自动化检查步骤

## 6. 工作流实现示例

以下是一个典型的内容处理工作流实施示例：

1. **新页面处理**：
   ```
   新HTML文件 -> 读取内容 -> 分析结构和主题 -> 补充元数据 ->
   检查/添加返回链接 -> 检查/添加可见元信息 -> 检查/添加页脚 ->
   保存修改 -> 验证HTML -> 自动更新 metadata.json
   ```

2. **发现潜在重复页面处理**：
   ```