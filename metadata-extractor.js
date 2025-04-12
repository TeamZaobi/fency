const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio'); // 需要 npm install cheerio

// --- 配置 ---
const baseHtmlDir = path.join(__dirname, 'html'); // 基准 HTML 目录
const pagesBaseDir = path.join(baseHtmlDir, 'pages'); // pages 目录
const outputFilePath = path.join(baseHtmlDir, 'metadata.json'); // 输出文件路径
const categories = ['info-upgrade', 'research', 'ai-tech', 'knowledge']; // 预定义的分类目录
const requiredMeta = ['publish-date', 'category', 'description', 'keywords']; // 必填的 meta 标签 name

// --- 辅助函数 ---

/**
 * 递归查找指定目录下所有 HTML 文件
 * @param {string} currentPath 当前目录
 * @returns {string[]} HTML 文件路径数组
 */
function findHtmlFilesRecursive(currentPath) {
    let results = [];
    try {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
            if (entry.isDirectory()) {
                // 只递归查找在 categories 中定义的目录，或者 pagesBaseDir 本身
                const shouldRecurse = currentPath === pagesBaseDir ? categories.includes(entry.name) : true;
                if (shouldRecurse) {
                     results = results.concat(findHtmlFilesRecursive(fullPath));
                }
            } else if (entry.isFile() && entry.name.endsWith('.html')) {
                // 确保文件直接位于分类目录下，而不是 pages 根目录或其他深层未知目录
                const parentDirName = path.basename(path.dirname(fullPath));
                if (categories.includes(parentDirName)) {
                    results.push(fullPath);
                }
            }
        }
    } catch (error) {
        // 如果 pages 目录不存在，则不报错，返回空数组
        if (error.code === 'ENOENT' && currentPath === pagesBaseDir) {
            console.warn(`[警告] 页面目录 ${pagesBaseDir} 不存在。`);
            return [];
        }
        console.error(`[错误] 无法读取目录 ${currentPath}: ${error.message}`);
    }
    return results;
}


/**
 * 解析单个 HTML 文件并提取元数据
 * @param {string} filePath HTML 文件路径
 * @returns {object | null} 包含元数据的对象，或在失败时返回 null
 */
function parseHtmlFile(filePath) {
    let relativePath = 'unknown/path'; // Default in case of early error
    try {
        relativePath = path.relative(baseHtmlDir, filePath).replace(/\\\\/g, '/'); // 相对 html 目录的路径
        const fileStats = fs.statSync(filePath);
        const htmlContent = fs.readFileSync(filePath, 'utf-8');
        const $ = cheerio.load(htmlContent);

        // Initialize metadata object WITHOUT the empty 'publishDate' field
        const metadata = {
            id: relativePath, // 使用相对路径作为唯一 ID
            path: relativePath,
            title: $('title').text().trim(),
            lastModifiedDate: fileStats.mtime.toISOString(), // 文件最后修改时间
            // 'publish-date', category, description, keywords will be added from meta tags
            category: '', // Keep initial placeholders for validation later if needed
            description: '',
            keywords: [],
        };

        let missingMeta = [];

        // 提取必填 meta 标签
        for (const name of requiredMeta) {
            const value = $(`meta[name="${name}"]`).attr('content');
            if (!value) {
                missingMeta.push(name);
            } else {
                if (name === 'keywords') {
                    // 处理关键词：分割、去空格、去重（可选）
                    metadata.keywords = [...new Set(value.split(',') // 使用 Set 去重
                                                   .map(k => k.trim())
                                                   .filter(k => k !== ''))]; // 过滤空关键词
                    // 检查处理后关键词数量是否足够（例如至少1个），否则也算缺失
                    if (metadata.keywords.length === 0) {
                         missingMeta.push(name + ' (有效关键词不足)');
                    }
                } else if (name === 'publish-date') { // Explicitly handle publish-date
                    metadata['publish-date'] = value.trim(); // Ensure hyphenated key is used
                } else {
                    // Assign to other properties like category, description
                    metadata[name] = value.trim(); 
                }
            }
        }
        
        // Double-check and remove any accidental 'publishDate' property (belt and suspenders)
        if (metadata.hasOwnProperty('publishDate')) {
            delete metadata['publishDate'];
            console.warn(`[修正] 在处理 ${relativePath} 时移除了意外的 'publishDate' 字段。`);
        }

        // 验证 title
        if (!metadata.title) {
             missingMeta.push('title');
        }

        // 检查是否有缺失的必填元数据
        if (missingMeta.length > 0) {
            console.warn(`[警告] 文件 ${relativePath} 缺少或无效的必填元数据: ${missingMeta.join(', ')}。已跳过。`);
            return null;
        }

        // 验证 category 是否有效
        const extractedCategory = metadata.category.toLowerCase().replace(/\s+/g, '-');
        if (!categories.includes(extractedCategory)) {
             console.warn(`[警告] 文件 ${relativePath} 的分类 "${metadata.category}" 不在预定义列表中 [${categories.join(', ')}].`);
             // 可以选择不跳过，但这是个比较严重的问题，可能导致索引页无法正确分类
             // return null; // 考虑在这里返回 null 使其更严格
        }
        // 检查分类是否与其目录匹配
        const expectedCategory = path.basename(path.dirname(filePath)).toLowerCase();
        if (extractedCategory !== expectedCategory) {
            console.warn(`[警告] 文件 ${relativePath} 的分类 "${metadata.category}" 与其所在目录 "${expectedCategory}" 不符.`);
            // 这也可能导致索引页分类错误，考虑返回 null
            // return null;
        }


        return metadata;
    } catch (error) {
        console.error(`[错误] 处理文件 ${relativePath} 时出错: ${error.message}`);
        return null;
    }
}

// --- 主逻辑 ---

/**
 * 全量模式：扫描所有文件并生成 metadata.json
 */
function runFullMode() {
    console.log('执行全量模式：扫描所有页面文件并生成 metadata.json...');
    const allMetadata = [];

    // 从 pagesBaseDir 开始查找所有分类目录下的 HTML 文件
    const htmlFiles = findHtmlFilesRecursive(pagesBaseDir);
    console.log(`在分类目录 [${categories.join(', ')}] 下发现 ${htmlFiles.length} 个 HTML 文件。开始提取元数据...`);

    for (const filePath of htmlFiles) {
        const metadata = parseHtmlFile(filePath);
        if (metadata) {
            allMetadata.push(metadata);
        }
    }

    // 按发布日期降序排序
    try {
       allMetadata.sort((a, b) => {
           // Use the correct hyphenated field 'publish-date' for sorting
           const dateStrA = a['publish-date'];
           const dateStrB = b['publish-date'];
           
           const dateA = dateStrA ? new Date(dateStrA).getTime() : 0; 
           const dateB = dateStrB ? new Date(dateStrB).getTime() : 0;
           
           // 处理无效日期，将它们排在后面
           if (isNaN(dateA)) return 1; // Treat invalid/missing A as older
           if (isNaN(dateB)) return -1; // Treat invalid/missing B as older
           
           return dateB - dateA; // Descending order
       });
    } catch(e) {
        console.warn("[警告] 按日期排序时出错，可能存在无效日期格式。列表可能未排序或排序不正确。");
    }


    const finalOutput = {
        lastUpdated: new Date().toISOString(),
        pages: allMetadata,
    };

    try {
        // 确保 html 目录存在
        if (!fs.existsSync(baseHtmlDir)) {
            fs.mkdirSync(baseHtmlDir, { recursive: true });
        }
        fs.writeFileSync(outputFilePath, JSON.stringify(finalOutput, null, 2), 'utf-8');
        console.log(`\n元数据提取完成！结果已保存到 ${outputFilePath}`);
        console.log(`共提取并保存了 ${allMetadata.length} 个页面的元数据。`);
    } catch (error) {
        console.error(`\n[错误] 无法写入输出文件 ${outputFilePath}: ${error.message}`);
        process.exit(1); // 写入失败则退出
    }
}

/**
 * 单文件模式：提取指定文件的元数据并输出到 stdout
 * @param {string} targetFilePath 目标文件路径
 */
function runSingleMode(targetFilePath) {
    console.log(`执行单文件模式：提取 ${targetFilePath} 的元数据...`);
    const absolutePath = path.resolve(targetFilePath); // 获取绝对路径

    if (!fs.existsSync(absolutePath)) {
       console.error(`[错误] 文件 ${targetFilePath} (解析为 ${absolutePath}) 不存在。`);
       process.exit(1);
    }
    if (!fs.lstatSync(absolutePath).isFile()) {
         console.error(`[错误] ${targetFilePath} 不是一个文件。`);
         process.exit(1);
    }

    if (!absolutePath.endsWith('.html')) {
         console.error(`[错误] 文件 ${targetFilePath} 不是一个 HTML 文件。`);
         process.exit(1);
    }
    // 确保文件在 pagesBaseDir 目录下
    if (!absolutePath.startsWith(pagesBaseDir)) {
         console.error(`[错误] 文件 ${targetFilePath} 不在预期的 ${pagesBaseDir} 目录下。`);
         process.exit(1); // 强制要求在 pages 目录下
    }
     // 确保文件在其声称的分类目录下
    const parentDirName = path.basename(path.dirname(absolutePath)).toLowerCase();
    if (!categories.includes(parentDirName)) {
        console.error(`[错误] 文件 ${targetFilePath} 不在其分类目录 (${parentDirName} 无效) 下。`);
        process.exit(1);
    }

    const metadata = parseHtmlFile(absolutePath);

    if (metadata) {
        // 将结果输出到 stdout
        try {
            process.stdout.write(JSON.stringify(metadata, null, 2) + '\\n'); // 添加换行符以便管道处理
            // console.log(`\n成功提取元数据并输出到 stdout。`); // 避免干扰 JSON 输出
        } catch (error) {
             console.error(`\n[错误] 序列化或写入 stdout 时出错: ${error.message}`);
             process.exit(1);
        }

    } else {
        console.error(`\n[错误] 未能提取文件 ${targetFilePath} 的有效元数据。`);
        process.exit(1); // 提取失败则退出
    }
}

/**
 * 解析命令行参数并执行相应模式
 */
function main() {
    const args = process.argv.slice(2); // 获取命令行参数 (忽略 node 和脚本路径)
    const modeIndex = args.indexOf('--mode');
    const fileIndex = args.indexOf('--file');

    let mode = 'full'; // 默认模式
    let targetFile = null;

    if (modeIndex !== -1 && args[modeIndex + 1]) {
        mode = args[modeIndex + 1];
    }

    if (fileIndex !== -1 && args[fileIndex + 1]) {
        targetFile = args[fileIndex + 1];
    }

    if (mode === 'single') {
        if (!targetFile) {
            console.error('[错误] 单文件模式 (--mode single) 需要指定目标文件 (--file <filepath>)。');
            process.exit(1);
        }
        runSingleMode(targetFile);
    } else if (mode === 'full') {
        runFullMode();
    } else {
        console.error(`[错误] 未知的模式: ${mode}。有效模式为 'full' 或 'single'。`);
        process.exit(1);
    }
}

// --- 执行 ---
main(); 