# 凿壁项目 - 内容处理工作流

> 本文档详细记录了凿壁项目中，LLM 生成的 HTML 页面的标准化处理流程，作为当前工作的操作指南，也可用作未来设计自动化脚本的需求基础。

## 1. 工作流目标

此工作流的主要目标是确保所有由 LLM 生成的 HTML 页面符合项目的基本元数据和结构标准（如 `.cursor/rules/web-dev.mdc` 中定义），以实现：

* **元数据一致性**：确保所有页面都有标准化的元数据，便于未来可能的自动化索引。
* **导航一致性**：确保所有页面都有返回首页的链接和标准的页脚信息。
* **可见元信息**：确保页面都有可见的分类和发布日期，增强用户对内容的理解。
* **结构完整性**：在保留 LLM 创意和页面独特设计的同时，确保基本结构元素的存在。

## 2. 触发条件

在以下情况下，需要执行内容处理工作流：

1. **新页面生成**：当使用 LLM 生成新的 HTML 页面并保存到 `html/pages/` 的子目录中后。
2. **内容重大更新**：当对现有页面进行重大内容更新，可能需要更新元数据（如描述、关键词）时。
3. **项目标准变更**：当项目的元数据或结构标准（`.cursor/rules/web-dev.mdc`）发生变化时，可能需要对现有页面进行批量更新。
4. **页面迁移**：当从其他位置迁移页面到 `html/pages/` 子目录时。

## 3. 处理步骤

### 3.1 页面文件准备

1. **文件命名检查**：
   * 确保文件名使用小写英文字母，单词间用连字符 `-` 分隔。
   * 文件名应清晰反映页面主要内容主题，例如 `ai-essential-papers.html`。

2. **存放位置验证**：
   * 根据页面的分类（将在后续步骤中确定），确认文件存放在 `html/pages/` 下的正确子文件夹：
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

1. 提醒项目维护者手动更新 `index.html` 文件：
   * 在 `index.html` 中找到对应分类的区域 (`<div id="分类ID">`)
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
   * 开发脚本扫描 `html/pages/` 目录，验证文件命名规范和位置
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
       const prompt = `作为内容分析专家，请根据以下HTML页面的标题和内容样本，生成这些缺失的元数据：${missingMeta.join(', ')}。
     
     标题：${title}
     
     内容样本：${bodyText}
     
     请按以下JSON格式返回结果：
     {
       "category": "选择最匹配的类别[信息化升级|科研辅助|AI技术与生态|知识报告]",
       "description": "100-200字符的内容摘要",
       "publish-date": "YYYY-MM-DD格式的日期",
       "keywords": "逗号分隔的5-10个关键词"
     }
     
     只返回缺失项的JSON。`;
       
       const response = await openai.createCompletion({
         model: "gpt-4", // 或其他适合的模型
         prompt: prompt,
         max_tokens: 500
       });
       
       try {
         return JSON.parse(response.data.choices[0].text.trim());
       } catch (e) {
         console.error('LLM返回格式解析错误:', e);
         return {};
       }
     }

     // 应用生成的元数据
     function applyMetadata($, metadata) {
       for (const [key, value] of Object.entries(metadata)) {
         if (value && $(`meta[name="${key}"]`).length === 0) {
           $('head').append(`<meta name="${key}" content="${value}">`);
           console.log(`添加了 meta ${key}: ${value}`);
         }
       }
     }

     // 主函数
     async function main() {
       try {
         await processDirectory('./html/pages');
         console.log('元数据检查和更新完成');
       } catch (error) {
         console.error('处理过程出错:', error);
       }
     }

     main();
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
   保存修改 -> 验证HTML -> 提醒更新 index.html
   ```

2. **发现潜在重复页面处理**：
   ```
   发现相似标题页面 -> 比较内容 -> 确定关系 ->
   (如果是重复) 确定保留版本 -> 咨询维护者 ->
   (如果保留两者) 确保标题和描述区分明确 ->
   标准化处理流程
   ```

## 7. 总结

本文档详细描述了凿壁项目中LLM生成HTML页面的处理工作流程。该流程确保所有页面符合项目元数据和结构标准，同时保留页面的创意和独特设计。当前流程是半手动的，由AI辅助人工完成，但未来可以考虑通过脚本自动化部分或全部流程。

无论当前的手动流程还是未来可能的自动化实现，核心目标都是确保所有页面的元数据一致性、导航一致性、可见元信息和结构完整性，同时尊重LLM生成页面的创意自由度。

## 8. 工作经验总结与最佳实践

在处理凿壁项目的HTML页面元数据和结构标准化过程中，我们积累了以下经验和最佳实践：

### 8.1 元数据处理经验

1. **页面特性分析**：
   * 分析页面时，首先查看标题和内容前几段，快速确定页面主题和类别
   * 查找页面中的关键词和概念，作为生成元数据描述和关键词的基础
   * 留意页面风格和呈现方式，以便在添加新元素时保持风格一致性

2. **元数据标签选择**：
   * 分类标签（`category`）选择时，注意区分"科研辅助"和"知识报告"类别
   * 描述（`description`）应简洁清晰，控制在100-200字符，重点突出页面核心内容
   * 关键词（`keywords`）选择5-10个与内容密切相关的词组，按重要性顺序排列
   * 发布日期（`publish-date`）若无明确信息，可参考文件创建时间或相近内容发布时间

3. **页面元素添加技巧**：
   * 可见元数据信息添加在页面开头区域效果最佳，通常在标题下方或导航栏下方
   * 返回首页链接可整合至页面的导航栏中，替换或补充原有首页链接
   * 作者和版权信息统一放置在页面底部，保持格式一致
   * 遵循页面原有样式风格，使用匹配的CSS类和样式属性

4. **HTML结构修改策略**：
   * 尽量在不破坏原有布局的情况下添加新元素
   * 利用现有的CSS类和样式，避免引入新的样式冲突
   * 确保深色模式和浅色模式下的可见性和兼容性
   * 在修改前先理解页面的DOM结构和CSS层次关系

### 8.2 批量处理效率提升技巧

1. **模式识别**：
   * 识别出常见的HTML结构模式，快速确定需要修改的位置
   * 创建可复用的HTML片段模板，根据页面具体情况微调
   * 总结不同类别页面的特点，针对性地处理不同结构

2. **有效检查机制**：
   * 使用浏览器开发者工具预览更改效果，检查样式和布局
   * 在小范围测试修改后再应用于所有页面
   * 建立简单的检查清单，确保所有必要元素都已添加

3. **常见问题解决方案**：
   * 解决字体和图标冲突：检查CSS优先级，必要时使用更高特异性选择器
   * 解决版面布局问题：使用flex布局或适当的margin/padding调整
   * 避免JavaScript冲突：使用命名空间或闭包隔离页面特定的脚本

### 8.3 自动化前的人工处理经验

在开发自动化脚本之前，人工处理过程中发现的模式和经验对自动化设计至关重要：

1. **页面结构识别模式**：
   * 大多数页面都有一个一致的头部区域，适合添加可见元数据
   * 页脚区域通常是添加作者信息和版权声明的理想位置
   * 多数页面在导航区域有链接结构，适合添加返回首页链接

2. **元数据自动提取提示**：
   * 页面标题（`<title>`）通常包含最关键的主题信息
   * 页面第一段文字常常是内容摘要，适合用于生成描述
   * 页面中出现频率较高的专业术语适合作为关键词
   * 嵌入式图表、引用和强调文本通常标记了内容中的重要概念

3. **文件命名与组织经验**：
   * 文件名应反映内容主题，使用连字符分隔的小写英文
   * 根据元数据分类正确放置文件到相应子目录
   * 新添加的文件需要及时在索引页面中更新引用

这些经验和最佳实践为下一步开发自动化脚本提供了重要参考，也可作为团队成员处理新内容的指南。 