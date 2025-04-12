#!/usr/bin/env node

/**
 * HTML元数据提取脚本
 * 
 * 该脚本用于自动化从HTML文件中提取元数据，可以作为Git hook、CI/CD流程的一部分，
 * 或由维护者手动运行。
 * 
 * 主要功能：
 * 1. 解析HTML文件
 * 2. 提取关键元数据（标题、分类、描述、发布日期、关键词）
 * 3. 可选功能：通过API调用LLM生成缺失元数据
 * 4. 验证元数据是否符合项目规范
 * 5. 生成报告或更新索引文件
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const chalk = require('chalk');

// 配置项
const CONFIG = {
  rootDir: path.resolve(__dirname, '../../html'),
  pagesDir: path.resolve(__dirname, '../../html/pages'),
  categories: ['科研辅助', 'AI技术与生态', '信息化升级', '知识报告'],
  requiredMetaTags: ['title', 'category', 'description', 'publish-date', 'keywords'],
  outputReportFile: path.resolve(__dirname, '../../metadata-report.json'),
  
  // 错误处理选项
  errorHandling: {
    continueOnError: true,     // 遇到错误时是否继续处理其他文件
    logErrors: true,           // 是否记录错误到日志
    errorLogFile: path.resolve(__dirname, '../../metadata-errors.log')
  }
};

// 主函数
async function main() {
  console.log(chalk.blue('=== HTML元数据提取工具 ==='));
  
  try {
    // 获取所有HTML文件路径
    const htmlFiles = await findAllHtmlFiles(CONFIG.pagesDir);
    console.log(chalk.green(`找到 ${htmlFiles.length} 个HTML文件`));
    
    // 处理每个文件并收集元数据
    const metadataCollection = {};
    const errors = [];
    
    for (const filePath of htmlFiles) {
      try {
        console.log(chalk.cyan(`处理文件: ${path.relative(CONFIG.rootDir, filePath)}`));
        const metadata = await extractMetadata(filePath);
        const relativePath = path.relative(CONFIG.rootDir, filePath);
        metadataCollection[relativePath] = metadata;
        
        // 验证元数据
        const validationResult = validateMetadata(metadata);
        if (!validationResult.valid) {
          console.log(chalk.yellow(`警告: ${relativePath} 元数据不完整:`));
          validationResult.missing.forEach(tag => {
            console.log(chalk.yellow(`  - 缺少: ${tag}`));
          });
          
          errors.push({
            file: relativePath,
            type: 'incomplete_metadata',
            details: `缺少元数据: ${validationResult.missing.join(', ')}`
          });
        }
      } catch (err) {
        console.error(chalk.red(`错误处理文件 ${filePath}: ${err.message}`));
        errors.push({
          file: path.relative(CONFIG.rootDir, filePath),
          type: 'processing_error',
          details: err.message
        });
        
        if (!CONFIG.errorHandling.continueOnError) {
          throw err;
        }
      }
    }
    
    // 保存元数据集合到输出文件
    fs.writeFileSync(
      CONFIG.outputReportFile, 
      JSON.stringify(metadataCollection, null, 2),
      'utf8'
    );
    console.log(chalk.green(`元数据报告已保存到: ${CONFIG.outputReportFile}`));
    
    // 记录错误（如果有）
    if (errors.length > 0 && CONFIG.errorHandling.logErrors) {
      const errorLog = errors.map(e => `[${e.type}] ${e.file}: ${e.details}`).join('\n');
      fs.writeFileSync(CONFIG.errorHandling.errorLogFile, errorLog, 'utf8');
      console.log(chalk.yellow(`发现 ${errors.length} 个问题，详情见: ${CONFIG.errorHandling.errorLogFile}`));
    }
    
    console.log(chalk.blue('=== 处理完成 ==='));
  } catch (err) {
    console.error(chalk.red(`运行时错误: ${err.message}`));
    console.error(err);
    process.exit(1);
  }
}

/**
 * 递归查找目录下所有HTML文件
 */
async function findAllHtmlFiles(directory) {
  const files = fs.readdirSync(directory);
  let htmlFiles = [];
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      const subDirFiles = await findAllHtmlFiles(fullPath);
      htmlFiles = htmlFiles.concat(subDirFiles);
    } else if (file.endsWith('.html')) {
      htmlFiles.push(fullPath);
    }
  }
  
  return htmlFiles;
}

/**
 * 从HTML文件中提取元数据
 */
async function extractMetadata(filePath) {
  // 读取文件内容
  const html = fs.readFileSync(filePath, 'utf8');
  
  // 使用JSDOM解析HTML
  const dom = new JSDOM(html);
  const { document } = dom.window;
  
  // 提取元数据
  const metadata = {
    title: document.title || '',
    url: path.relative(CONFIG.rootDir, filePath),
    metaTags: {}
  };
  
  // 提取所有meta标签
  const metaTags = document.querySelectorAll('meta');
  metaTags.forEach(meta => {
    const name = meta.getAttribute('name');
    const content = meta.getAttribute('content');
    
    if (name && content) {
      metadata.metaTags[name] = content;
    }
  });
  
  // 提取页面中可见的元数据（分类和发布日期）
  // 这里使用一个简单的文本匹配方法，实际项目可能需要更复杂的解析
  try {
    const bodyText = document.body.textContent;
    
    // 尝试提取可见的发布日期
    const publishDateMatch = bodyText.match(/发布日期[:：]\s*(\d{4}-\d{2}-\d{2})/);
    if (publishDateMatch && publishDateMatch[1]) {
      metadata.visiblePublishDate = publishDateMatch[1];
    }
    
    // 尝试提取可见的分类
    const categoryMatch = bodyText.match(/分类[:：]\s*([^\n,，.。]+)/);
    if (categoryMatch && categoryMatch[1]) {
      metadata.visibleCategory = categoryMatch[1].trim();
    }
  } catch (err) {
    console.warn(chalk.yellow(`提取可见元数据时出错: ${err.message}`));
  }
  
  return metadata;
}

/**
 * 验证元数据是否完整
 */
function validateMetadata(metadata) {
  const result = {
    valid: true,
    missing: []
  };
  
  // 检查必需的meta标签
  for (const requiredTag of CONFIG.requiredMetaTags) {
    if (requiredTag === 'title') {
      if (!metadata.title || metadata.title.trim() === '') {
        result.valid = false;
        result.missing.push('title');
      }
    } else if (!metadata.metaTags[requiredTag] || metadata.metaTags[requiredTag].trim() === '') {
      result.valid = false;
      result.missing.push(requiredTag);
    }
  }
  
  // 验证category的值是否在预定义列表中
  if (metadata.metaTags.category && !CONFIG.categories.includes(metadata.metaTags.category)) {
    result.valid = false;
    result.missing.push('valid-category');
  }
  
  return result;
}

// 执行主函数
if (require.main === module) {
  main().catch(err => {
    console.error(chalk.red('未捕获的错误:'), err);
    process.exit(1);
  });
}

module.exports = {
  extractMetadata,
  validateMetadata,
  findAllHtmlFiles
}; 