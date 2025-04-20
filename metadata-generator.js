const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const HTML_DIR = 'pages';
const OUTPUT_FILE = 'metadata.json';
const CATEGORIES = ['ai-tech', 'info-upgrade', 'knowledge', 'research'];

// 从HTML文件中提取元数据
function extractMetadataFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 提取标题
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : path.basename(filePath, '.html');
    
    // 提取元数据标签
    const categoryMatch = content.match(/<meta\s+name="category"\s+content="(.*?)"/i);
    const publishDateMatch = content.match(/<meta\s+name="publish-date"\s+content="(.*?)"/i);
    const descriptionMatch = content.match(/<meta\s+name="description"\s+content="(.*?)"/i);
    const keywordsMatch = content.match(/<meta\s+name="keywords"\s+content="(.*?)"/i);
    
    // 获取文件最后修改时间
    const stats = fs.statSync(filePath);
    const lastModifiedDate = stats.mtime.toISOString();
    
    // 获取相对路径
    const relativePath = filePath;
    
    // 解析类别
    let category = categoryMatch ? categoryMatch[1].trim() : '';
    switch (category.toLowerCase()) {
      case '信息化升级':
        category = 'info-upgrade';
        break;
      case '科研辅助':
        category = 'research';
        break;
      case 'ai技术与生态':
      case 'ai技术':
        category = 'ai-tech';
        break;
      case '知识报告':
        category = 'knowledge';
        break;
    }
    
    // 如果没有提取到category，从路径推断
    if (!category) {
      CATEGORIES.forEach(cat => {
        if (relativePath.includes(cat)) {
          category = cat;
        }
      });
    }
    
    // 解析关键词
    let keywords = [];
    if (keywordsMatch) {
      keywords = keywordsMatch[1].split(',').map(k => k.trim());
    }
    
    // 返回元数据对象
    return {
      id: relativePath,
      path: relativePath,
      title,
      lastModifiedDate,
      publishDate: '', // 保留空字段以兼容旧格式
      category,
      description: descriptionMatch ? descriptionMatch[1].trim() : '',
      keywords,
      'publish-date': publishDateMatch ? publishDateMatch[1].trim() : getDefaultPublishDate(category)
    };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return null;
  }
}

// 为未设置发布日期的文件生成一个默认日期
function getDefaultPublishDate(category) {
  const currentYear = new Date().getFullYear();
  const month = Math.floor(Math.random() * 3) + 1; // 1-3月
  const day = Math.floor(Math.random() * 28) + 1; // 1-28日
  
  return `${currentYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

// 递归查找目录中的所有HTML文件
function findHtmlFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      results = results.concat(findHtmlFiles(fullPath));
    } else if (item.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  
  return results;
}

// 主函数
function generateMetadata() {
  console.log('开始生成metadata.json...');
  
  // 查找所有HTML文件
  const htmlFiles = findHtmlFiles(HTML_DIR);
  console.log(`找到 ${htmlFiles.length} 个HTML文件`);
  
  // 分类统计
  const categoryCounts = {
    'ai-tech': 0,
    'info-upgrade': 0,
    'knowledge': 0,
    'research': 0
  };
  
  // 提取元数据
  const pages = [];
  
  for (const file of htmlFiles) {
    const metadata = extractMetadataFromFile(file);
    if (metadata) {
      pages.push(metadata);
      
      // 统计分类
      if (categoryCounts[metadata.category] !== undefined) {
        categoryCounts[metadata.category]++;
      }
    }
  }
  
  // 创建最终的metadata对象
  const metadata = {
    lastUpdated: new Date().toISOString(),
    pages
  };
  
  // 写入文件
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(metadata, null, 2));
  
  console.log('metadata.json 生成完成');
  console.log('分类统计:');
  for (const [category, count] of Object.entries(categoryCounts)) {
    console.log(`- ${category}: ${count} 个文件`);
  }
  console.log(`共 ${pages.length} 个页面`);
}

// 运行主函数
generateMetadata(); 