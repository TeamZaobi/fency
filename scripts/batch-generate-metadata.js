#!/usr/bin/env node

/**
 * 凿壁项目 - 批量元数据生成命令行工具
 * 
 * 使用方法:
 * node batch-generate-metadata.js <directory> [options]
 * 
 * 选项:
 * --provider <provider>  指定LLM提供商 (openai, deepseek, local, baidu)
 * --save                 将生成的元数据保存到HTML文件中
 * --recursive            递归处理子目录
 * --help                 显示帮助信息
 * 
 * 示例:
 * node batch-generate-metadata.js pages/ai-tech --provider local --save --recursive
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { generateMetadataWithLLM, saveMetadataToHtml, loadConfig } = require('./metadata-llm-integration');

// 解析命令行参数
const args = process.argv.slice(2);
let directoryPath = null;
let provider = null;
let saveToFile = false;
let recursive = false;

// 显示帮助信息
function showHelp() {
  console.log(`
凿壁项目 - 批量元数据生成命令行工具

使用方法:
  node batch-generate-metadata.js <directory> [options]

选项:
  --provider <provider>  指定LLM提供商 (openai, deepseek, local, baidu)
  --save                 将生成的元数据保存到HTML文件中
  --recursive            递归处理子目录
  --help                 显示帮助信息

示例:
  node batch-generate-metadata.js pages/ai-tech --provider local --save --recursive
  `);
  process.exit(0);
}

// 解析参数
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--help') {
    showHelp();
  } else if (arg === '--provider') {
    provider = args[++i];
  } else if (arg === '--save') {
    saveToFile = true;
  } else if (arg === '--recursive') {
    recursive = true;
  } else if (!directoryPath && !arg.startsWith('--')) {
    directoryPath = arg;
  }
}

if (!directoryPath) {
  console.error('错误: 未指定目录路径');
  showHelp();
}

// 验证目录存在
if (!fs.existsSync(directoryPath) || !fs.statSync(directoryPath).isDirectory()) {
  console.error(`错误: ${directoryPath} 不是有效的目录`);
  process.exit(1);
}

// 加载配置
const config = loadConfig();
if (provider) {
  if (!config.providers[provider]) {
    console.error(`错误: 不支持的提供商 ${provider}`);
    process.exit(1);
  }
} else {
  provider = config.defaultProvider;
}

// 查找HTML文件
function findHtmlFiles(dir, recurse = false) {
  const files = fs.readdirSync(dir);
  let htmlFiles = [];
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && recurse) {
      htmlFiles = htmlFiles.concat(findHtmlFiles(filePath, true));
    } else if (file.endsWith('.html')) {
      htmlFiles.push(filePath);
    }
  }
  
  return htmlFiles;
}

// 提取现有元数据
async function extractExistingMetadata(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content);
    
    // 提取标题和元数据
    const title = $('title').text().trim();
    const metaTags = {};
    const missingFields = [];
    
    // 检查必需的元数据
    const requiredFields = ['category', 'description', 'publish-date', 'keywords'];
    
    requiredFields.forEach(field => {
      const meta = $(`meta[name="${field}"]`);
      if (meta.length > 0) {
        metaTags[field] = meta.attr('content').trim();
      } else {
        missingFields.push(field);
      }
    });
    
    // 提取页面内容
    const bodyText = $('body').text().trim();
    
    // 获取文件信息
    const stats = fs.statSync(filePath);
    const fileInfo = {
      filename: path.basename(filePath),
      path: filePath,
      createdDate: stats.birthtime ? stats.birthtime.toISOString() : stats.mtime.toISOString(),
      modifiedDate: stats.mtime.toISOString()
    };
    
    return {
      title,
      content: bodyText,
      metaTags,
      missingFields,
      fileInfo
    };
  } catch (error) {
    console.error(`提取文件 ${filePath} 的元数据失败: ${error.message}`);
    return null;
  }
}

// 处理单个文件
async function processFile(filePath, llmConfig) {
  try {
    console.log(`处理文件: ${filePath}`);
    
    // 提取现有元数据
    const existingData = await extractExistingMetadata(filePath);
    if (!existingData) {
      console.log(`跳过文件: ${filePath}`);
      return false;
    }
    
    console.log(`  - 缺失的元数据字段: ${existingData.missingFields.join(', ') || '无'}`);
    
    // 如果有缺失字段，使用LLM生成
    if (existingData.missingFields.length > 0) {
      console.log(`  - 使用 ${provider} 生成缺失的元数据...`);
      
      // 生成元数据
      const generatedMetadata = await generateMetadataWithLLM(existingData, llmConfig);
      
      // 保存到文件（如果启用）
      if (saveToFile) {
        console.log('  - 正在将元数据保存到HTML文件...');
        const success = await saveMetadataToHtml(filePath, generatedMetadata);
        
        if (success) {
          console.log('  - 元数据已成功保存');
          return true;
        } else {
          console.log('  - 保存元数据失败');
          return false;
        }
      } else {
        console.log(`  - 生成的元数据: ${JSON.stringify(generatedMetadata, null, 2)}`);
        return true;
      }
    } else {
      console.log('  - 文件已包含所有必需的元数据，无需生成');
      return true;
    }
  } catch (error) {
    console.error(`  - 处理文件 ${filePath} 时出错: ${error.message}`);
    return false;
  }
}

// 主函数
async function main() {
  try {
    console.log(`查找 ${directoryPath} 中的HTML文件${recursive ? '（包含子目录）' : ''}...`);
    
    // 查找所有HTML文件
    const htmlFiles = findHtmlFiles(directoryPath, recursive);
    console.log(`找到 ${htmlFiles.length} 个HTML文件`);
    
    if (htmlFiles.length === 0) {
      console.log('没有找到HTML文件，退出');
      return;
    }
    
    // 准备LLM配置
    const llmConfig = {
      provider,
      ...config.providers[provider]
    };
    
    // 处理统计
    let successCount = 0;
    let failureCount = 0;
    
    // 处理每个文件
    for (let i = 0; i < htmlFiles.length; i++) {
      const filePath = htmlFiles[i];
      console.log(`[${i + 1}/${htmlFiles.length}]`);
      
      const success = await processFile(filePath, llmConfig);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
      
      // 添加分隔线
      console.log('-'.repeat(50));
    }
    
    // 显示统计结果
    console.log('处理完成');
    console.log(`成功: ${successCount}`);
    console.log(`失败: ${failureCount}`);
  } catch (error) {
    console.error(`错误: ${error.message}`);
    process.exit(1);
  }
}

// 运行主函数
main(); 