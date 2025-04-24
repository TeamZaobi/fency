/**
 * 凿壁项目 - HTML元数据处理自动化脚本
 * 
 * 此脚本用于自动检查HTML文件的元数据标签，并在需要时添加缺失的元数据。
 * 可以作为命令行工具运行，或集成到Git钩子或CI/CD流程中。
 * 
 * 用法:
 *   node metadata-processor.js [目录路径]
 * 
 * 示例:
 *   node metadata-processor.js ./pages/knowledge
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const util = require('util');

// 配置项
const CONFIG = {
  // HTML文件扩展名
  htmlExtension: '.html',
  
  // 必需的元数据标签
  requiredMetaTags: [
    'category',
    'description',
    'publish-date',
    'keywords'
  ],
  
  // 有效的分类列表
  validCategories: [
    '信息化升级',
    '科研辅助',
    'AI技术与生态',
    '知识报告'
  ],
  
  // 作者信息模板
  authorInfo: {
    name: '季晓康',
    email: 'jixiaokang@example.com',
    role: '教育心理学研究员',
    wechat: '凿壁偶得'
  },
  
  // 是否进行修改（如为false，则只进行检查不进行修改）
  makeChanges: true,
  
  // 日志级别: 'info', 'warn', 'error', 'debug'
  logLevel: 'info'
};

// 日志工具
const logger = {
  debug: (msg) => CONFIG.logLevel === 'debug' && console.log(`[DEBUG] ${msg}`),
  info: (msg) => ['info', 'debug'].includes(CONFIG.logLevel) && console.log(`[INFO] ${msg}`),
  warn: (msg) => ['info', 'warn', 'debug'].includes(CONFIG.logLevel) && console.warn(`[WARN] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`)
};

/**
 * 从目录中查找所有HTML文件
 * @param {string} directory 目录路径
 * @returns {Promise<string[]>} HTML文件路径列表
 */
async function findHtmlFiles(directory) {
  const results = [];
  
  // 递归遍历目录
  async function scanDirectory(dir) {
    try {
      const files = await fs.promises.readdir(dir);
      
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = await fs.promises.stat(fullPath);
        
        if (stat.isDirectory()) {
          await scanDirectory(fullPath);
        } else if (path.extname(file).toLowerCase() === CONFIG.htmlExtension) {
          results.push(fullPath);
        }
      }
    } catch (error) {
      logger.error(`扫描目录 ${dir} 时出错: ${error.message}`);
    }
  }
  
  await scanDirectory(directory);
  return results;
}

/**
 * 检查HTML文件的元数据
 * @param {string} filePath HTML文件路径
 * @returns {Promise<{filePath: string, missing: string[], invalid: Object}>} 检查结果
 */
async function checkHtmlMetadata(filePath) {
  try {
    // 读取文件内容
    const content = await fs.promises.readFile(filePath, 'utf8');
    const $ = cheerio.load(content);
    
    // 检查必需的元数据标签
    const missing = [];
    const invalid = {};
    
    // 检查标题
    if ($('title').length === 0) {
      missing.push('title');
    }
    
    // 检查必需的meta标签
    for (const metaName of CONFIG.requiredMetaTags) {
      const meta = $(`meta[name="${metaName}"]`);
      
      if (meta.length === 0) {
        missing.push(metaName);
      } else {
        // 检查元数据值的有效性
        const metaContent = meta.attr('content');
        
        if (!metaContent || metaContent.trim() === '') {
          invalid[metaName] = '空值';
        } else if (metaName === 'category' && !CONFIG.validCategories.includes(metaContent)) {
          invalid[metaName] = `无效分类: ${metaContent}`;
        } else if (metaName === 'publish-date') {
          // 验证日期格式YYYY-MM-DD
          if (!/^\d{4}-\d{2}-\d{2}$/.test(metaContent)) {
            invalid[metaName] = `无效日期格式: ${metaContent}`;
          }
        }
      }
    }
    
    // 检查可见元数据
    const hasVisibleCategory = $('body').text().includes('分类:') || $('body').text().includes('分类：');
    const hasVisibleDate = $('body').text().includes('发布日期:') || $('body').text().includes('发布日期：');
    
    if (!hasVisibleCategory) {
      missing.push('visible-category');
    }
    
    if (!hasVisibleDate) {
      missing.push('visible-date');
    }
    
    // 检查返回首页链接
    const hasHomeLink = $('a[href*="index.html"]').length > 0;
    if (!hasHomeLink) {
      missing.push('home-link');
    }
    
    // 检查作者信息
    const hasAuthorInfo = $('body').text().includes(CONFIG.authorInfo.name);
    if (!hasAuthorInfo) {
      missing.push('author-info');
    }
    
    return {
      filePath,
      missing,
      invalid
    };
  } catch (error) {
    logger.error(`检查文件 ${filePath} 时出错: ${error.message}`);
    return {
      filePath,
      missing: ['ERROR'],
      invalid: { error: error.message }
    };
  }
}

/**
 * 修复HTML文件的元数据
 * @param {string} filePath HTML文件路径
 * @param {Object} checkResult 检查结果
 * @returns {Promise<boolean>} 是否成功修复
 */
async function fixHtmlMetadata(filePath, checkResult) {
  // 如果配置为不进行修改，则只返回检查结果
  if (!CONFIG.makeChanges) {
    logger.info(`[DRY RUN] 文件 ${filePath} 需要修复以下问题: ${checkResult.missing.join(', ')}`);
    return false;
  }
  
  try {
    // 备份原文件
    const backupPath = `${filePath}.bak`;
    await fs.promises.copyFile(filePath, backupPath);
    
    // 读取文件内容
    const content = await fs.promises.readFile(filePath, 'utf8');
    let $ = cheerio.load(content);
    
    // 修复缺失的元数据标签
    for (const missing of checkResult.missing) {
      switch (missing) {
        case 'category':
          // 根据文件路径猜测分类
          let category = '知识报告'; // 默认分类
          if (filePath.includes('/research/')) {
            category = '科研辅助';
          } else if (filePath.includes('/ai-tech/')) {
            category = 'AI技术与生态';
          } else if (filePath.includes('/info-upgrade/')) {
            category = '信息化升级';
          }
          $('head').append(`<meta name="category" content="${category}">`);
          logger.info(`添加分类元数据: ${category}`);
          break;
          
        case 'publish-date':
          // 使用当前日期
          const today = new Date().toISOString().split('T')[0];
          $('head').append(`<meta name="publish-date" content="${today}">`);
          logger.info(`添加发布日期元数据: ${today}`);
          break;
          
        case 'description':
          // 从文档内容生成简短描述
          let description = '';
          const title = $('title').text() || path.basename(filePath, '.html');
          const firstParagraph = $('p').first().text();
          
          if (firstParagraph && firstParagraph.length > 20) {
            description = firstParagraph.substring(0, 150) + (firstParagraph.length > 150 ? '...' : '');
          } else {
            description = `关于${title}的内容`;
          }
          
          $('head').append(`<meta name="description" content="${description}">`);
          logger.info(`添加描述元数据`);
          break;
          
        case 'keywords':
          // 从文档标题生成基本关键词
          const pageTitle = $('title').text() || path.basename(filePath, '.html');
          const keywords = pageTitle.split(/[ ,，\-_]+/).filter(k => k.length > 1).join(', ');
          
          $('head').append(`<meta name="keywords" content="${keywords}">`);
          logger.info(`添加关键词元数据: ${keywords}`);
          break;
          
        case 'home-link':
          // 计算到index.html的相对路径
          const relativePath = path.relative(path.dirname(filePath), path.resolve('./'));
          const homePath = path.join(relativePath, 'index.html').replace(/\\/g, '/');
          
          // 在导航或头部区域添加首页链接
          const nav = $('nav').first();
          if (nav.length > 0) {
            nav.prepend(`<a href="${homePath}" title="返回首页"><i class="fas fa-home"></i> 首页</a> `);
          } else {
            // 如果没有导航，在body开始处添加
            $('body').prepend(`<div style="margin: 10px;"><a href="${homePath}" title="返回首页"><i class="fas fa-home"></i> 返回首页</a></div>`);
          }
          logger.info(`添加返回首页链接`);
          break;
          
        case 'visible-category':
        case 'visible-date':
          // 如果两者都缺失，一次性添加
          if (checkResult.missing.includes('visible-category') && checkResult.missing.includes('visible-date')) {
            const category = $('meta[name="category"]').attr('content') || '未分类';
            const date = $('meta[name="publish-date"]').attr('content') || new Date().toISOString().split('T')[0];
            
            // 在内容顶部添加可见元数据信息
            const metadataHTML = `
            <div class="metadata-info" style="margin: 20px 0; font-size: 0.9em; color: #666;">
              <span style="margin-right: 15px;"><i class="fas fa-folder"></i> 分类: ${category}</span>
              <span><i class="fas fa-calendar"></i> 发布日期: ${date}</span>
            </div>`;
            
            // 尝试找到内容的开始位置
            const mainContent = $('main').first();
            if (mainContent.length > 0) {
              mainContent.prepend(metadataHTML);
            } else {
              // 如果没有main标签，尝试在第一个标题后添加
              const firstHeading = $('h1, h2, h3').first();
              if (firstHeading.length > 0) {
                firstHeading.after(metadataHTML);
              } else {
                // 最后尝试在body开始处添加
                $('body').prepend(metadataHTML);
              }
            }
            logger.info(`添加可见分类和日期信息`);
          }
          break;
          
        case 'author-info':
          // 在页脚添加作者信息
          const footer = $('footer').first();
          const { name, email, role, wechat } = CONFIG.authorInfo;
          
          const authorHTML = `
          <div class="author-info" style="margin-top: 20px;">
            <h3>关于作者</h3>
            <p><strong>作者：</strong>${name}</p>
            <p><strong>电子邮件：</strong>${email}</p>
            <p><strong>职位：</strong>${role}</p>
            <p><strong>微信公众号：</strong>${wechat}</p>
          </div>`;
          
          if (footer.length > 0) {
            footer.prepend(authorHTML);
          } else {
            // 如果没有footer标签，在body结束前添加
            $('body').append(`<footer style="margin-top: 40px; padding: 20px; border-top: 1px solid #eee;">${authorHTML}</footer>`);
          }
          logger.info(`添加作者信息`);
          break;
      }
    }
    
    // 保存修改后的内容
    await fs.promises.writeFile(filePath, $.html());
    logger.info(`已修复文件: ${filePath}`);
    return true;
  } catch (error) {
    logger.error(`修复文件 ${filePath} 时出错: ${error.message}`);
    return false;
  }
}

/**
 * 生成处理报告
 * @param {Array} results 处理结果
 */
function generateReport(results) {
  let totalFiles = results.length;
  let needFixes = results.filter(r => r.missing.length > 0 || Object.keys(r.invalid).length > 0);
  let fixedFiles = results.filter(r => r.fixed);
  
  console.log('\n===== 元数据处理报告 =====');
  console.log(`总文件数: ${totalFiles}`);
  console.log(`需要修复的文件: ${needFixes.length}`);
  console.log(`已修复的文件: ${fixedFiles.length}`);
  
  if (needFixes.length > 0) {
    console.log('\n需要修复的文件详情:');
    needFixes.forEach(result => {
      console.log(`\n文件: ${result.filePath}`);
      
      if (result.missing.length > 0) {
        console.log(`  缺失元素: ${result.missing.join(', ')}`);
      }
      
      if (Object.keys(result.invalid).length > 0) {
        console.log('  无效元素:');
        for (const [key, value] of Object.entries(result.invalid)) {
          console.log(`    ${key}: ${value}`);
        }
      }
      
      if (result.fixed) {
        console.log('  状态: 已修复');
      } else {
        console.log('  状态: 未修复');
      }
    });
  }
  
  console.log('\n处理完成!');
}

/**
 * 主函数
 */
async function main() {
  try {
    // 获取命令行参数
    const directoryPath = process.argv[2] || './pages';
    
    logger.info(`开始处理目录: ${directoryPath}`);
    
    // 查找所有HTML文件
    const htmlFiles = await findHtmlFiles(directoryPath);
    logger.info(`找到 ${htmlFiles.length} 个HTML文件`);
    
    // 处理每个文件
    const results = [];
    
    for (const filePath of htmlFiles) {
      logger.info(`处理文件: ${filePath}`);
      
      // 检查元数据
      const checkResult = await checkHtmlMetadata(filePath);
      
      // 如果有问题，尝试修复
      if (checkResult.missing.length > 0 || Object.keys(checkResult.invalid).length > 0) {
        logger.warn(`文件 ${filePath} 需要修复`);
        const fixed = await fixHtmlMetadata(filePath, checkResult);
        results.push({ ...checkResult, fixed });
      } else {
        logger.info(`文件 ${filePath} 元数据完整，无需修复`);
        results.push({ ...checkResult, fixed: false });
      }
    }
    
    // 生成处理报告
    generateReport(results);
  } catch (error) {
    logger.error(`处理过程中出错: ${error.message}`);
    process.exit(1);
  }
}

// 运行主函数
main(); 