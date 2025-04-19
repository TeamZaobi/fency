const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

// --- 配置 ---
const metadataPath = path.resolve(process.cwd(), 'html/metadata.json');
// ---

async function syncHtmlFiles() {
  try {
    // 1. 安装 cheerio（如果尚未安装）
    // 这里不执行安装，需要手动运行 npm install cheerio

    // 2. 读取修正后的metadata.json
    const metadataRaw = await readFile(metadataPath, 'utf8');
    const metadata = JSON.parse(metadataRaw);
    
    console.log(`读取到${metadata.pages.length}个页面的元数据`);
    
    // 3. 处理每个页面
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (const page of metadata.pages) {
      try {
        // 构建HTML文件的完整路径 - 添加html/前缀
        const htmlPath = path.resolve(process.cwd(), 'html', page.path);
        
        // 检查文件是否存在
        try {
          await stat(htmlPath);
        } catch (err) {
          console.error(`文件不存在: ${htmlPath}`);
          errorCount++;
          errors.push({ path: htmlPath, error: 'File not found' });
          continue;
        }
        
        // 读取HTML文件
        const htmlContent = await readFile(htmlPath, 'utf8');
        
        // 使用cheerio加载HTML
        const $ = cheerio.load(htmlContent);
        
        // 更新<title>
        $('title').text(page.title);
        
        // 更新或添加meta标签
        updateMetaTag($, 'publish-date', page['publish-date']);
        updateMetaTag($, 'category', page.category);
        updateMetaTag($, 'description', page.description);
        
        // 处理keywords（数组转为字符串）
        const keywordsStr = Array.isArray(page.keywords) 
          ? page.keywords.join(',') 
          : page.keywords;
        updateMetaTag($, 'keywords', keywordsStr);
        
        // 尝试更新<body>中可见的日期和分类
        // 注意：这部分高度依赖于HTML的结构，可能需要根据实际情况调整
        updateVisibleInfo($, page);
        
        // 获取更新后的HTML
        const updatedHtml = $.html();
        
        // 写入更新后的HTML
        await writeFile(htmlPath, updatedHtml, 'utf8');
        successCount++;
        console.log(`成功更新: ${htmlPath}`);
        
      } catch (error) {
        console.error(`处理文件${page.path}时出错:`, error);
        errorCount++;
        errors.push({ path: page.path, error: error.message });
      }
    }
    
    // 4. 输出统计信息
    console.log('\n===== 更新完成 =====');
    console.log(`总页面数: ${metadata.pages.length}`);
    console.log(`成功更新: ${successCount}`);
    console.log(`更新失败: ${errorCount}`);
    
    if (errorCount > 0) {
      console.log('\n失败详情:');
      errors.forEach(err => {
        console.log(`- ${err.path}: ${err.error}`);
      });
    }
    
  } catch (error) {
    console.error('更新过程中发生错误:', error);
  }
}

// 辅助函数：更新或添加meta标签
function updateMetaTag($, name, content) {
  // 查找meta标签
  const metaTag = $(`meta[name="${name}"]`);
  
  if (metaTag.length > 0) {
    // 更新现有标签
    metaTag.attr('content', content);
  } else {
    // 添加新标签
    $('head').append(`<meta name="${name}" content="${content}">`);
  }
}

// 辅助函数：尝试更新可见的日期和分类信息
function updateVisibleInfo($, page) {
  // 这个函数尝试多种可能的选择器，以适应不同HTML结构
  // 根据项目的实际HTML结构，这里可能需要更多的定制
  
  // 尝试找日期显示元素 (多种可能的选择器)
  const dateSelectors = [
    '[data-type="publish-date"]', // 数据属性
    '.publish-date', // 类
    '#publish-date', // ID
    '.date',
    '.meta-date',
    'time',
    '.time',
    '.post-date',
    'span:contains("发布日期")',
    'p:contains("发布日期")'
  ];
  
  // 尝试找分类显示元素 (多种可能的选择器)
  const categorySelectors = [
    '[data-type="category"]', // 数据属性
    '.category', // 类
    '#category', // ID
    '.meta-category',
    '.post-category',
    'span:contains("分类")',
    'p:contains("分类")'
  ];
  
  // 尝试更新日期
  let dateElementFound = false;
  for (const selector of dateSelectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      // 根据元素类型处理
      if (elements.is('time')) {
        elements.attr('datetime', page['publish-date']).text(page['publish-date']);
      } else if (elements.text().includes('发布日期')) {
        // 如果文本包含"发布日期"，假设是标签+值的形式
        const text = elements.text();
        const labelPart = text.split(':')[0];
        elements.text(`${labelPart}: ${page['publish-date']}`);
      } else {
        elements.text(page['publish-date']);
      }
      dateElementFound = true;
      break;
    }
  }
  
  // 尝试更新分类
  let categoryElementFound = false;
  for (const selector of categorySelectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      // 根据元素类型处理
      if (elements.text().includes('分类')) {
        // 如果文本包含"分类"，假设是标签+值的形式
        const text = elements.text();
        const labelPart = text.split(':')[0];
        elements.text(`${labelPart}: ${page.category}`);
      } else {
        elements.text(page.category);
      }
      categoryElementFound = true;
      break;
    }
  }
  
  // 记录未找到的情况
  if (!dateElementFound) {
    console.warn(`警告: 在 ${page.path} 中未找到可见日期元素`);
  }
  if (!categoryElementFound) {
    console.warn(`警告: 在 ${page.path} 中未找到可见分类元素`);
  }
}

syncHtmlFiles(); 