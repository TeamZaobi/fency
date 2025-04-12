/**
 * 更新HTML页面的publish-date元标签脚本
 * 此脚本读取metadata.json文件，然后更新所有HTML页面的publish-date元标签
 */

const fs = require('fs');
const path = require('path');

// 配置
const METADATA_PATH = 'html/metadata.json';
const HTML_BASE_DIR = 'html/';

// 读取metadata.json
function loadMetadata() {
  try {
    const data = fs.readFileSync(METADATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取metadata.json失败:', error.message);
    process.exit(1);
  }
}

// 更新HTML文件中的publish-date
function updateHtmlPublishDate(filePath, publishDate) {
  try {
    // 读取文件
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 检查文件是否已经包含publish-date元标签
    const hasPublishDate = /<meta\s+name="publish-date"\s+content="[^"]*">/i.test(content);
    
    if (hasPublishDate) {
      // 替换现有的publish-date
      content = content.replace(
        /<meta\s+name="publish-date"\s+content="[^"]*">/i,
        `<meta name="publish-date" content="${publishDate}">`
      );
    } else {
      // 如果没有publish-date元标签，在</head>之前添加
      content = content.replace(
        /<\/head>/i,
        `  <meta name="publish-date" content="${publishDate}">\n</head>`
      );
    }
    
    // 保存文件
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`更新文件 ${filePath} 失败:`, error.message);
    return false;
  }
}

// 主函数
async function main() {
  console.log('开始更新HTML页面的publish-date元标签...');
  
  // 加载metadata.json
  const metadata = loadMetadata();
  console.log(`已加载metadata.json, 共${metadata.pages.length}个页面`);
  
  // 统计
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;
  
  // 更新每个页面
  for (const page of metadata.pages) {
    const filePath = path.join(HTML_BASE_DIR, page.path);
    const publishDate = page['publish-date'];
    
    if (!publishDate) {
      console.log(`跳过 ${page.path} (没有publish-date)`);
      skipped++;
      continue;
    }
    
    if (!fs.existsSync(filePath)) {
      console.log(`跳过 ${page.path} (文件不存在)`);
      skipped++;
      continue;
    }
    
    console.log(`正在更新 ${page.path} 的发布日期为 ${publishDate}`);
    const success = updateHtmlPublishDate(filePath, publishDate);
    
    if (success) {
      succeeded++;
    } else {
      failed++;
    }
  }
  
  // 输出统计
  console.log('\n更新完成!');
  console.log(`成功: ${succeeded} 页面`);
  console.log(`失败: ${failed} 页面`);
  console.log(`跳过: ${skipped} 页面`);
}

// 运行主函数
main().catch(error => {
  console.error('发生错误:', error);
  process.exit(1);
}); 