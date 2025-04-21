# 凿壁项目 - 元数据处理工具集

本目录包含一系列用于管理和生成HTML页面元数据的工具，支持多种LLM提供商集成，包括OpenAI、DeepSeek、本地LLM和百度文心一言等。

## 安装

首先，确保已安装所有必要的依赖：

```bash
cd scripts
npm install
```

## 工具说明

### 1. metadata-processor.js

用于检查和修复HTML文件的元数据，确保所有必需的元数据标签都存在且有效。

**用法**：
```bash
node metadata-processor.js [目录路径]
```

**示例**：
```bash
# 处理单个分类目录下的所有HTML文件
node metadata-processor.js ../pages/ai-tech

# 处理所有页面
node metadata-processor.js ../pages
```

### 2. metadata-llm-integration.js

核心LLM集成模块，提供了与各种LLM提供商的集成功能，用于生成高质量的HTML元数据。

此模块通常不直接调用，而是由其他工具集成使用。

### 3. generate-metadata.js

单文件元数据生成工具，用于使用LLM为单个HTML文件生成缺失的元数据。

**用法**：
```bash
node generate-metadata.js <html-file> [选项]
```

**选项**：
- `--provider <provider>` 指定LLM提供商 (openai, deepseek, local, baidu)
- `--save` 将生成的元数据保存到HTML文件中
- `--help` 显示帮助信息

**示例**：
```bash
# 使用OpenAI生成元数据（不保存）
node generate-metadata.js ../pages/ai-tech/example.html --provider openai

# 使用本地LLM生成元数据并保存
node generate-metadata.js ../pages/ai-tech/example.html --provider local --save
```

### 4. batch-generate-metadata.js

批量元数据生成工具，用于为目录中的多个HTML文件生成缺失的元数据。

**用法**：
```bash
node batch-generate-metadata.js <directory> [选项]
```

**选项**：
- `--provider <provider>` 指定LLM提供商 (openai, deepseek, local, baidu)
- `--save` 将生成的元数据保存到HTML文件中
- `--recursive` 递归处理子目录
- `--help` 显示帮助信息

**示例**：
```bash
# 递归处理目录，使用DeepSeek生成元数据并保存
node batch-generate-metadata.js ../pages/ai-tech --provider deepseek --save --recursive
```

## 配置

在 `config/llm-config.json` 文件中，可以配置各个LLM提供商的参数：

```json
{
  "defaultProvider": "openai",
  "providers": {
    "openai": {
      "apiKey": "YOUR_OPENAI_API_KEY",
      "model": "gpt-4o",
      "temperature": 0.3
    },
    "deepseek": {
      "apiKey": "YOUR_DEEPSEEK_API_KEY",
      "endpoint": "https://api.deepseek.com/v1/chat/completions",
      "model": "deepseek-chat",
      "temperature": 0.3
    },
    "local": {
      "endpoint": "http://localhost:11434/api/chat",
      "model": "llama3",
      "temperature": 0.3
    },
    "baidu": {
      "apiKey": "YOUR_BAIDU_API_KEY",
      "secretKey": "YOUR_BAIDU_SECRET_KEY",
      "endpoint": "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro",
      "model": "ERNIE-Bot-4",
      "temperature": 0.3
    }
  }
}
```

可以通过以下方式设置API密钥：

1. 直接在配置文件中设置
2. 使用环境变量：
   - OpenAI: `OPENAI_API_KEY`
   - DeepSeek: `DEEPSEEK_API_KEY`
   - 百度: `BAIDU_API_KEY` 和 `BAIDU_SECRET_KEY`

## 使用本地LLM

如果要使用本地LLM，需要确保本地LLM服务正在运行。例如，对于使用Ollama运行的本地模型：

1. 安装Ollama：https://ollama.com/download
2. 拉取并运行模型：
   ```bash
   ollama pull llama3
   ollama run llama3
   ```
3. 使用`--provider local`选项运行工具

## 作为NPM包使用

可以将此工具集安装为全局NPM包：

```bash
cd scripts
npm install -g
```

安装后可以使用以下命令：

- `zb-process` - 对应 metadata-processor.js
- `zb-generate` - 对应 generate-metadata.js
- `zb-batch` - 对应 batch-generate-metadata.js

## 元数据字段说明

工具生成和验证的元数据字段包括：

- `title` - 页面标题
- `category` - 分类，必须是以下之一：信息化升级、科研辅助、AI技术与生态、知识报告
- `description` - 页面描述，100-200字符
- `keywords` - 关键词，逗号分隔的列表
- `publish-date` - 发布日期，格式为YYYY-MM-DD

## 开发流程

1. 创建HTML页面
2. 使用工具生成缺失的元数据
3. 验证元数据是否符合项目规范
4. 如果需要，手动调整生成的元数据
5. 更新项目索引 