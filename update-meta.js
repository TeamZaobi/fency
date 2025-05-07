const fs = require('fs');
const path = require('path');
const htmlFilePath = 'pages/ai-tech/added-tokens-llm-agent-protocol.html';
const metadataPath = 'metadata.json';

// 读取HTML文件
const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

// 从HTML中提取元数据
const extractMetaContent = (content, name) => {
  const regex = new RegExp(`<meta\\s+name=[\\\"\\'']${name}[\\\"\\'']\\s+content=[\\\"\\'']([^\\\"\\'']*)[\\\"\\'']`, 'i');
  const match = content.match(regex);
  return match ? match[1] : null;
};

const title = htmlContent.match(/<title>([^<]*)<\/title>/i)[1];
const publishDate = extractMetaContent(htmlContent, 'publish-date');
const category = extractMetaContent(htmlContent, 'category');
const description = extractMetaContent(htmlContent, 'description');
const keywords = extractMetaContent(htmlContent, 'keywords')?.split(',') || [];

// 创建新的元数据条目
const newEntry = {
  id: htmlFilePath,
  path: htmlFilePath,
  title: title,
  lastModifiedDate: new Date().toISOString(),
  category: category,
  description: description,
  keywords: keywords,
  'publish-date': publishDate
};

// 读取现有的metadata.json
let metadata;
try {
  metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
} catch (error) {
  metadata = { lastUpdated: new Date().toISOString(), pages: [] };
}

// 检查是否已存在相同ID的条目
const existingIndex = metadata.pages.findIndex(p => p.id === newEntry.id);
if (existingIndex >= 0) {
  // 更新现有条目
  metadata.pages[existingIndex] = newEntry;
} else {
  // 添加新条目
  metadata.pages.push(newEntry);
}

// 按publish-date降序排序
metadata.pages.sort((a, b) => new Date(b['publish-date']) - new Date(a['publish-date']));

// 更新lastUpdated
metadata.lastUpdated = new Date().toISOString();

// 写入文件
fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');

// 同步到dist目录
try {
  const distMetadataPath = path.join('dist', 'metadata.json');
  fs.writeFileSync(distMetadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  console.log('元数据更新完成，已同步到dist目录');
} catch (error) {
  console.log('元数据已更新，但同步到dist目录失败:', error.message);
}

console.log('完成！新条目已添加/更新:', newEntry.id); 