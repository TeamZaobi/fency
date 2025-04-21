#!/usr/bin/env node

/**
 * 凿壁项目 - 元数据生成命令行工具
 * 
 * 使用方法:
 * node generate-metadata.js <html-file> [options]
 * 
 * 选项:
 * --provider <provider>  指定LLM提供商 (openai, deepseek, local, baidu)
 * --save                 将生成的元数据保存到HTML文件中
 * --help                 显示帮助信息
 * 
 * 示例:
 * node generate-metadata.js pages/ai-tech/example.html --provider local --save
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { generateMetadataWithLLM, saveMetadataToHtml, loadConfig } = require('./metadata-llm-integration');

// 解析命令行参数
const args = process.argv.slice(2);
let htmlFilePath = null;
let provider = null;
let saveToFile = false;

// 显示帮助信息
function showHelp() {
  console.log(`
凿壁项目 - 元数据生成命令行工具

使用方法:
  node generate-metadata.js <html-file> [options]

选项:
  --provider <provider>  指定LLM提供商 (openai, deepseek, local, baidu)
  --save                 将生成的元数据保存到HTML文件中
  --help                 显示帮助信息

示例:
  node generate-metadata.js pages/ai-tech/example.html --provider local --save
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
  } else if (!htmlFilePath && !arg.startsWith('--')) {
    htmlFilePath = arg;
  }
}

if (!htmlFilePath) {
  console.error('错误: 未指定HTML文件路径');
  showHelp();
}

// 验证文件存在
if (!fs.existsSync(htmlFilePath)) {
  console.error(`错误: 文件 ${htmlFilePath} 不存在`);
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
      createdDate: stats.birthtime.toISOString(),
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
    console.error(`提取现有元数据失败: ${error.message}`);
    throw error;
  }
}

// 主函数
async function main() {
  try {
    console.log(`正在处理文件: ${htmlFilePath}`);
    
    // 提取现有元数据
    const existingData = await extractExistingMetadata(htmlFilePath);
    console.log(`提取到现有元数据: ${JSON.stringify(existingData.metaTags, null, 2)}`);
    console.log(`缺失的元数据字段: ${existingData.missingFields.join(', ') || '无'}`);
    
    // 如果有缺失字段，使用LLM生成
    if (existingData.missingFields.length > 0) {
      console.log(`使用 ${provider} 生成缺失的元数据...`);
      
      // 准备LLM配置
      const llmConfig = {
        provider,
        ...config.providers[provider]
      };
      
      // 生成元数据
      const generatedMetadata = await generateMetadataWithLLM(existingData, llmConfig);
      console.log(`生成的元数据: ${JSON.stringify(generatedMetadata, null, 2)}`);
      
      // 保存到文件（如果启用）
      if (saveToFile) {
        console.log('正在将元数据保存到HTML文件...');
        const success = await saveMetadataToHtml(htmlFilePath, generatedMetadata);
        
        if (success) {
          console.log('元数据已成功保存到HTML文件');
        } else {
          console.log('保存元数据失败');
        }
      }
    } else {
      console.log('文件已包含所有必需的元数据，无需生成');
    }
    
    console.log('处理完成');
  } catch (error) {
    console.error(`错误: ${error.message}`);
    process.exit(1);
  }
}

// 运行主函数
main(); 