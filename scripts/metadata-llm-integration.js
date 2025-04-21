/**
 * 凿壁项目 - LLM API集成模块
 * 
 * 此模块提供与LLM API的集成功能，用于生成高质量的HTML元数据
 * 支持OpenAI和本地LLM API（如DeepSeek，文心一言等）
 */

const { OpenAI } = require('openai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

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
      case 'deepseek':
        return new DeepSeekLLM(config);
      case 'local':
        return new LocalLLM(config);
      case 'baidu':
        return new BaiduLLM(config);
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
      console.log(`成功使用OpenAI生成元数据: ${JSON.stringify(result, null, 2)}`);
      
      return result;
    } catch (error) {
      console.error(`使用OpenAI生成元数据失败: ${error.message}`);
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

// DeepSeek LLM客户端
class DeepSeekLLM {
  /**
   * 创建DeepSeek客户端
   * @param {Object} config DeepSeek配置
   */
  constructor(config) {
    const { apiKey, endpoint = 'https://api.deepseek.com/v1/chat/completions', model = 'deepseek-chat', temperature = 0.3 } = config;
    
    if (!apiKey) {
      throw new Error('未提供DeepSeek API密钥');
    }
    
    this.apiKey = apiKey;
    this.endpoint = endpoint;
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
      // 调用DeepSeek API
      const response = await axios.post(
        this.endpoint,
        {
          model: this.model,
          messages: [
            { role: 'system', content: '你是一个专业的内容分析专家，擅长从HTML内容中提取关键信息并生成准确的元数据标签。请仔细分析提供的内容，并按照要求返回JSON格式的元数据。' },
            { role: 'user', content: prompt }
          ],
          temperature: this.temperature,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // 解析响应
      const responseData = response.data;
      const result = JSON.parse(responseData.choices[0].message.content);
      console.log(`成功使用DeepSeek生成元数据: ${JSON.stringify(result, null, 2)}`);
      
      return result;
    } catch (error) {
      console.error(`使用DeepSeek生成元数据失败: ${error.message}`);
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
    // 与OpenAI的提示信息相同
    const fileInfoText = fileInfo ? `
文件信息:
- 文件名: ${fileInfo.filename}
- 文件路径: ${fileInfo.path}
- 创建日期: ${fileInfo.createdDate || '未知'}
- 修改日期: ${fileInfo.modifiedDate || '未知'}
` : '';
    
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

// 本地LLM客户端
class LocalLLM {
  /**
   * 创建本地LLM客户端
   * @param {Object} config 本地LLM配置
   */
  constructor(config) {
    const { endpoint = 'http://localhost:11434/api/chat', model = 'llama3', temperature = 0.3 } = config;
    this.endpoint = endpoint;
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
      // 调用本地LLM API
      const response = await axios.post(
        this.endpoint,
        {
          model: this.model,
          messages: [
            { role: 'system', content: '你是一个专业的内容分析专家，擅长从HTML内容中提取关键信息并生成准确的元数据标签。请仔细分析提供的内容，并按照要求返回JSON格式的元数据。' },
            { role: 'user', content: prompt }
          ],
          temperature: this.temperature,
          format: 'json'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // 解析响应
      let result;
      try {
        result = JSON.parse(response.data.message.content);
      } catch (error) {
        // 尝试从文本中提取JSON
        const content = response.data.message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('无法从响应中解析JSON');
        }
      }
      
      console.log(`成功使用本地LLM生成元数据: ${JSON.stringify(result, null, 2)}`);
      return result;
    } catch (error) {
      console.error(`使用本地LLM生成元数据失败: ${error.message}`);
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
    // 对于本地LLM，使用更简洁的提示
    const fileInfoText = fileInfo ? `
文件信息:
- 文件名: ${fileInfo.filename}
- 文件路径: ${fileInfo.path}
` : '';
    
    return `生成HTML页面元数据。
页面标题: ${title}
页面内容摘要: ${content.substring(0, 2000)}...
${fileInfoText}

需要生成以下元数据：${missingFields.join(', ')}
必须使用JSON格式：
{
  ${missingFields.includes('category') ? '"category": "选择一个[信息化升级|科研辅助|AI技术与生态|知识报告]",' : ''}
  ${missingFields.includes('description') ? '"description": "100-200字符摘要",' : ''}
  ${missingFields.includes('keywords') ? '"keywords": "关键词1,关键词2,关键词3,...",' : ''}
  ${missingFields.includes('publish-date') ? '"publish-date": "YYYY-MM-DD"' : ''}
}

只返回有效的JSON，不要包含其他文本。`;
  }
}

// 百度文心一言LLM客户端
class BaiduLLM {
  /**
   * 创建百度文心一言客户端
   * @param {Object} config 百度文心一言配置
   */
  constructor(config) {
    const { apiKey, secretKey, endpoint = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro', model = 'ERNIE-Bot-4', temperature = 0.3 } = config;
    
    if (!apiKey || !secretKey) {
      throw new Error('未提供百度文心一言API密钥或密钥');
    }
    
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.endpoint = endpoint;
    this.model = model;
    this.temperature = temperature;
    this.accessToken = null;
    this.tokenExpires = 0;
  }
  
  /**
   * 获取访问令牌
   * @returns {Promise<string>} 访问令牌
   */
  async getAccessToken() {
    // 如果令牌有效，直接返回
    if (this.accessToken && Date.now() < this.tokenExpires) {
      return this.accessToken;
    }
    
    try {
      const response = await axios.post(
        'https://aip.baidubce.com/oauth/2.0/token',
        `grant_type=client_credentials&client_id=${this.apiKey}&client_secret=${this.secretKey}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      this.accessToken = response.data.access_token;
      this.tokenExpires = Date.now() + (response.data.expires_in * 1000 * 0.9); // 设置为过期前10%的时间
      return this.accessToken;
    } catch (error) {
      console.error(`获取百度访问令牌失败: ${error.message}`);
      throw error;
    }
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
      // 获取访问令牌
      const accessToken = await this.getAccessToken();
      
      // 调用百度文心一言API
      const response = await axios.post(
        `${this.endpoint}?access_token=${accessToken}`,
        {
          messages: [
            { role: 'system', content: '你是一个专业的内容分析专家，擅长从HTML内容中提取关键信息并生成准确的元数据标签。请仔细分析提供的内容，并按照要求返回JSON格式的元数据。' },
            { role: 'user', content: prompt }
          ],
          temperature: this.temperature
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // 解析响应
      const content = response.data.result;
      let result;
      
      try {
        // 首先尝试直接解析完整响应
        result = JSON.parse(content);
      } catch (error) {
        // 尝试从文本中提取JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('无法从响应中解析JSON');
        }
      }
      
      console.log(`成功使用百度文心一言生成元数据: ${JSON.stringify(result, null, 2)}`);
      return result;
    } catch (error) {
      console.error(`使用百度文心一言生成元数据失败: ${error.message}`);
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
    // 与OpenAI的提示信息相同但更简化
    const fileInfoText = fileInfo ? `
文件信息:
- 文件名: ${fileInfo.filename}
- 文件路径: ${fileInfo.path}
` : '';
    
    return `请分析以下HTML页面的标题和内容，生成缺失的元数据字段：${missingFields.join(', ')}。

页面标题: ${title}

页面内容摘要: 
${content.substring(0, 2000)}...

${fileInfoText}

请为上述内容生成以下元数据，必须采用JSON格式返回:
{
  ${missingFields.includes('category') ? '"category": "选择最匹配的分类 [信息化升级|科研辅助|AI技术与生态|知识报告]",' : ''}
  ${missingFields.includes('description') ? '"description": "100-200字符的内容摘要",' : ''}
  ${missingFields.includes('keywords') ? '"keywords": "5-10个逗号分隔的关键词",' : ''}
  ${missingFields.includes('publish-date') ? '"publish-date": "YYYY-MM-DD格式的发布日期"' : ''}
}

只返回JSON，不包含额外说明。`;
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

/**
 * 将LLM生成的元数据保存到HTML文件
 * @param {string} htmlFilePath HTML文件路径
 * @param {Object} metadata 元数据
 * @returns {Promise<boolean>} 是否成功保存
 */
async function saveMetadataToHtml(htmlFilePath, metadata) {
  try {
    // 读取HTML文件
    const content = fs.readFileSync(htmlFilePath, 'utf8');
    
    // 使用正则表达式更新元数据
    let updatedContent = content;
    
    // 更新标题
    if (metadata.title) {
      updatedContent = updatedContent.replace(/<title>.*?<\/title>/i, `<title>${metadata.title}</title>`);
    }
    
    // 更新meta标签
    for (const [key, value] of Object.entries(metadata)) {
      if (key === 'title') continue;
      
      const metaRegex = new RegExp(`<meta\\s+name="${key}"\\s+content=".*?"\\s*\\/?>`, 'i');
      const newMeta = `<meta name="${key}" content="${value}" />`;
      
      if (metaRegex.test(updatedContent)) {
        // 更新现有meta标签
        updatedContent = updatedContent.replace(metaRegex, newMeta);
      } else {
        // 添加新meta标签
        updatedContent = updatedContent.replace('</head>', `  ${newMeta}\n</head>`);
      }
    }
    
    // 备份原文件
    const backupPath = `${htmlFilePath}.bak`;
    fs.writeFileSync(backupPath, content);
    
    // 写入更新后的内容
    fs.writeFileSync(htmlFilePath, updatedContent);
    
    console.log(`成功将元数据更新到: ${htmlFilePath}`);
    return true;
  } catch (error) {
    console.error(`保存元数据到HTML文件失败: ${error.message}`);
    return false;
  }
}

// 加载配置文件（如果存在）
function loadConfig() {
  const configPath = path.resolve(__dirname, './config/llm-config.json');
  
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (error) {
    console.warn(`加载配置文件失败: ${error.message}`);
  }
  
  // 返回默认配置
  return {
    defaultProvider: 'openai',
    providers: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4o'
      },
      deepseek: {
        apiKey: process.env.DEEPSEEK_API_KEY,
        model: 'deepseek-chat'
      },
      local: {
        endpoint: 'http://localhost:11434/api/chat',
        model: 'llama3'
      },
      baidu: {
        apiKey: process.env.BAIDU_API_KEY,
        secretKey: process.env.BAIDU_SECRET_KEY,
        model: 'ERNIE-Bot-4'
      }
    }
  };
}

// 导出模块接口
module.exports = {
  generateMetadataWithLLM,
  saveMetadataToHtml,
  loadConfig
}; 