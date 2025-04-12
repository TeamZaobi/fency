/**
 * 凿壁项目 - LLM API集成模块
 * 
 * 此模块提供与LLM API的集成功能，用于生成高质量的HTML元数据
 * 支持OpenAI和本地LLM API
 */

const { OpenAI } = require('openai');

// LLM工厂，根据配置创建适当的LLM客户端
class LLMFactory {
  /**
   * 创建LLM客户端
   * @param {Object} config LLM配置
   * @returns {Object} LLM客户端
   */
  static createLLM(config) {
    const { provider = 'openai' } = config;
    
    switch (provider.toLowerCase()) {
      case 'openai':
        return new OpenAILLM(config);
      default:
        throw new Error(`不支持的LLM提供商: ${provider}`);
    }
  }
}

// OpenAI LLM客户端
class OpenAILLM {
  /**
   * 创建OpenAI客户端
   * @param {Object} config OpenAI配置
   */
  constructor(config) {
    const { apiKey, model = 'gpt-4o', temperature = 0.3 } = config;
    
    if (!apiKey) {
      throw new Error('未提供OpenAI API密钥');
    }
    
    this.client = new OpenAI({
      apiKey: apiKey
    });
    
    this.model = model;
    this.temperature = temperature;
  }
  
  /**
   * 生成元数据
   * @param {Object} data 输入数据
   * @returns {Promise<Object>} 生成的元数据
   */
  async generateMetadata(data) {
    const { title, content, missingFields, fileInfo } = data;
    
    // 构建提示信息
    const prompt = this.buildPrompt(title, content, missingFields, fileInfo);
    
    try {
      // 调用OpenAI
      const response = await this.client.chat.completions.create({
        model: this.model,
        temperature: this.temperature,
        messages: [
          { role: 'system', content: '你是一个专业的内容分析专家，擅长从HTML内容中提取关键信息并生成准确的元数据标签。请仔细分析提供的内容，并按照要求返回JSON格式的元数据。' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      });
      
      // 解析响应
      const result = JSON.parse(response.choices[0].message.content);
      console.log(`成功生成元数据: ${JSON.stringify(result, null, 2)}`);
      
      return result;
    } catch (error) {
      console.error(`生成元数据失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 构建LLM提示信息
   * @param {string} title 页面标题
   * @param {string} content 页面内容
   * @param {string[]} missingFields 缺失的元数据字段
   * @param {Object} fileInfo 文件信息
   * @returns {string} 提示信息
   */
  buildPrompt(title, content, missingFields, fileInfo) {
    // 文件信息部分
    const fileInfoText = fileInfo ? `
文件信息:
- 文件名: ${fileInfo.filename}
- 文件路径: ${fileInfo.path}
- 创建日期: ${fileInfo.createdDate || '未知'}
- 修改日期: ${fileInfo.modifiedDate || '未知'}
` : '';
    
    // 构建提示信息
    return `请分析以下HTML页面的标题和内容，生成缺失的元数据字段：${missingFields.join(', ')}。

页面标题: ${title}

页面内容摘要: 
${content.substring(0, 3000)}...

${fileInfoText}

请为上述内容生成以下元数据，必须采用下面指定的JSON格式返回:
{
  ${missingFields.includes('category') ? '"category": "选择最匹配的分类 [信息化升级|科研辅助|AI技术与生态|知识报告]",' : ''}
  ${missingFields.includes('description') ? '"description": "100-200字符的内容摘要，清晰准确地描述页面内容的核心要点",' : ''}
  ${missingFields.includes('keywords') ? '"keywords": "5-10个逗号分隔的关键词，按重要性排序",' : ''}
  ${missingFields.includes('publish-date') ? '"publish-date": "YYYY-MM-DD格式的发布日期，如无法确定，可使用今天的日期"' : ''}
}

请注意：
1. category只能是以下四个分类之一: 信息化升级、科研辅助、AI技术与生态、知识报告
2. description应简洁清晰，不超过200字符
3. keywords应选择与内容最相关的术语和概念
4. publish-date应采用YYYY-MM-DD格式

你的响应必须是一个有效的JSON对象，不要包含额外的文本或解释。`;
  }
}

/**
 * 使用LLM生成HTML元数据
 * @param {Object} htmlData HTML数据
 * @param {Object} config LLM配置
 * @returns {Promise<Object>} 生成的元数据
 */
async function generateMetadataWithLLM(htmlData, config) {
  try {
    // 创建LLM客户端
    const llm = LLMFactory.createLLM(config);
    
    // 生成元数据
    return await llm.generateMetadata(htmlData);
  } catch (error) {
    console.error(`使用LLM生成元数据失败: ${error.message}`);
    
    // 返回基本元数据作为备用
    return generateFallbackMetadata(htmlData);
  }
}

/**
 * 生成备用元数据（当LLM生成失败时）
 * @param {Object} htmlData HTML数据
 * @returns {Object} 生成的备用元数据
 */
function generateFallbackMetadata(htmlData) {
  const { title, fileInfo, missingFields } = htmlData;
  const result = {};
  
  if (missingFields.includes('category')) {
    // 根据文件路径推断分类
    if (fileInfo && fileInfo.path) {
      if (fileInfo.path.includes('/research/')) {
        result.category = '科研辅助';
      } else if (fileInfo.path.includes('/ai-tech/')) {
        result.category = 'AI技术与生态';
      } else if (fileInfo.path.includes('/info-upgrade/')) {
        result.category = '信息化升级';
      } else {
        result.category = '知识报告';
      }
    } else {
      result.category = '知识报告';
    }
  }
  
  if (missingFields.includes('description')) {
    // 使用标题作为基本描述
    result.description = `关于${title}的详细内容`;
  }
  
  if (missingFields.includes('keywords')) {
    // 从标题中提取关键词
    const keywordCandidates = title.split(/[ ,，\-_]+/).filter(k => k.length > 1);
    result.keywords = keywordCandidates.slice(0, 5).join(', ');
  }
  
  if (missingFields.includes('publish-date')) {
    // 使用当前日期
    const today = new Date().toISOString().split('T')[0];
    result['publish-date'] = today;
  }
  
  return result;
}

// 导出模块接口
module.exports = {
  generateMetadataWithLLM
}; 