const fs = require('fs');

// 读取当前的metadata.json
const metadata = JSON.parse(fs.readFileSync('metadata.json', 'utf8'));

// 新页面的元数据
const newPage = {
  "id": "pages/ai-tech/deepwiki-community-feedback.html",
  "path": "pages/ai-tech/deepwiki-community-feedback.html",
  "title": "DeepWiki 社区反馈概览",
  "lastModifiedDate": "2025-04-27T12:27:08+08:00",
  "category": "ai-tech",
  "description": "DeepWiki 社区反馈概览，总结了用户评价、核心特性、技术规模和潜在问题，包含可视化图表，帮助开发者快速了解该 AI 代码文档工具。",
  "keywords": [
    "DeepWiki", 
    "Cognition AI", 
    "AI文档生成", 
    "代码库", 
    "社区反馈", 
    "GitHub", 
    "开源", 
    "LLM", 
    "AI工具"
  ],
  "publish-date": "2025-04-27"
};

// 检查是否已有相同ID的页面
const existingPageIndex = metadata.pages.findIndex(page => page.id === newPage.id);

if (existingPageIndex !== -1) {
  // 如果存在，更新它
  metadata.pages[existingPageIndex] = newPage;
} else {
  // 如果不存在，添加新页面
  metadata.pages.push(newPage);
}

// 更新lastUpdated字段
metadata.lastUpdated = "2025-04-27T12:28:47+08:00";

// 将更新后的metadata写入临时文件
fs.writeFileSync('temp_metadata.json', JSON.stringify(metadata, null, 2), 'utf8');

// 验证JSON是否有效
try {
  JSON.parse(fs.readFileSync('temp_metadata.json', 'utf8'));
  console.log('JSON验证成功，元数据已更新');
  
  // 替换原文件
  fs.renameSync('temp_metadata.json', 'metadata.json');
  console.log('成功替换metadata.json');
} catch (error) {
  console.error('JSON验证失败:', error);
  process.exit(1);
} 