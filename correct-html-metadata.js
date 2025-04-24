const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// --- 配置 ---
const distMetadataPath = path.resolve(process.cwd(), 'dist/metadata.json');
const htmlMetadataPath = path.resolve(process.cwd(), 'metadata.json');
const backupHtmlMetadataPath = path.resolve(process.cwd(), 'metadata.json.backup');
// ---

async function correctMetadataJson() {
  try {
    console.log(`读取旧的正确元数据: ${distMetadataPath}`);
    const distMetadataRaw = await readFile(distMetadataPath, 'utf8');
    const distMetadata = JSON.parse(distMetadataRaw);
    const distPagesMap = new Map(distMetadata.pages.map(p => [p.id || p.path, p])); // 使用 id 或 path 作为 key
    console.log(`读取到 ${distPagesMap.size} 条旧元数据。`);

    console.log(`读取当前的 HTML 元数据: ${htmlMetadataPath}`);
    const htmlMetadataRaw = await readFile(htmlMetadataPath, 'utf8');
    const htmlMetadata = JSON.parse(htmlMetadataRaw);
    console.log(`读取到 ${htmlMetadata.pages.length} 条当前元数据。`);

    // 创建备份
    console.log(`创建备份文件: ${backupHtmlMetadataPath}`);
    await writeFile(backupHtmlMetadataPath, htmlMetadataRaw, 'utf8');

    let correctedCount = 0;
    let preservedCount = 0;

    // 遍历当前 HTML 元数据，进行修正
    const correctedPages = htmlMetadata.pages.map(htmlPage => {
      const pageKey = htmlPage.id || htmlPage.path; // 必须与 distPagesMap 的 key 一致
      const distPageData = distPagesMap.get(pageKey);

      if (distPageData) {
        // 找到对应条目，用 dist 的数据修正 html 的数据
        // 保留 html 中的 lastModifiedDate，因为它更可能是最新的
        const correctedPage = {
          ...htmlPage, // 保留 htmlPage 的所有字段作为基础
          title: distPageData.title ?? htmlPage.title,
          category: distPageData.category ?? htmlPage.category,
          description: distPageData.description ?? htmlPage.description,
          keywords: distPageData.keywords ?? htmlPage.keywords, // 确保 keywords 格式一致
          'publish-date': distPageData['publish-date'] ?? htmlPage['publish-date'],
        };
        correctedCount++;
        return correctedPage;
      } else {
        // 在 dist 中未找到，说明是新增的，保留原样
        preservedCount++;
        return htmlPage;
      }
    });

    // 更新 pages 数组和 lastUpdated 时间戳
    const finalHtmlMetadata = {
      lastUpdated: new Date().toISOString(), // 更新为当前修正时间
      pages: correctedPages,
    };

    // 写回修正后的 metadata.json
    console.log(`写回修正后的元数据到: ${htmlMetadataPath}`);
    await writeFile(htmlMetadataPath, JSON.stringify(finalHtmlMetadata, null, 2), 'utf8');

    console.log('\n===== metadata.json 修正完成 =====');
    console.log(`总条目数: ${finalHtmlMetadata.pages.length}`);
    console.log(`从 dist/metadata.json 修正的条目数: ${correctedCount}`);
    console.log(`保留的新增条目数: ${preservedCount}`);

  } catch (error) {
    console.error('修正 metadata.json 过程中发生错误:', error);
  }
}

correctMetadataJson(); 