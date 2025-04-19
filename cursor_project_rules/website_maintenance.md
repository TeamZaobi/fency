# 凿壁网站维护规则

## 1. 网站文件结构

### 1.1 目录结构
```
/var/www/
├── html/                    # 主网站目录
│   ├── index.html           # 网站首页（动态索引页）
│   ├── metadata.json        # 网站页面元数据索引文件
│   └── pages/               # 页面内容目录
│       ├── ai-tech/         # AI技术与生态相关内容
│       ├── info-upgrade/    # 信息化升级相关内容
│       ├── knowledge/       # 知识报告相关内容
│       └── research/        # 科研辅助相关内容
└── dist/                    # 分发版本目录
    └── metadata.json        # 分发版本的元数据索引文件
```

### 1.2 关键文件
- `html/index.html`：网站首页，通过客户端JavaScript动态读取`metadata.json`生成内容卡片和知识图谱
- `html/metadata.json`：主要元数据文件，包含所有页面的元数据信息
- `dist/metadata.json`：分发版本的元数据文件，通常在部署时更新

## 2. 页面元数据规范

### 2.1 元数据结构
每个HTML页面在`metadata.json`中的条目应包含以下字段：

```json
{
  "id": "pages/分类目录/文件名.html",
  "path": "pages/分类目录/文件名.html",
  "title": "页面标题 | 凿壁",
  "lastModifiedDate": "YYYY-MM-DDTHH:MM:SS.sssZ",
  "category": "分类名称",
  "description": "页面内容简短描述...",
  "keywords": [
    "关键词1",
    "关键词2",
    "..."
  ],
  "publish-date": "YYYY-MM-DD"
}
```

### 2.2 分类目录对应
- `ai-tech`: AI技术与生态
- `info-upgrade`: 信息化升级
- `knowledge`: 知识报告
- `research`: 科研辅助

## 3. 页面文件规范

### 3.1 HTML页面结构要求
- 必须是完整的HTML5文档结构
- `<head>`中必须包含以下元标签：
  ```html
  <meta name="publish-date" content="YYYY-MM-DD">
  <meta name="category" content="分类名">
  <meta name="description" content="页面摘要...">
  <meta name="keywords" content="关键词1,关键词2,...">
  ```
- 分类名必须是以下四种之一：信息化升级、科研辅助、AI技术与生态、知识报告
- 页面内必须显示发布日期和分类名称
- 必须包含返回首页链接
- 必须在页面底部包含作者信息：
  ```
  作者姓名: 季晓康
  微信公众号：凿壁
  版权信息：国家健康医疗大数据研究院
  ```

### 3.2 文件命名规则
- 使用小写英文字母
- 单词间使用连字符`-`分隔
- 文件名应清晰反映内容主题（如`halicin.html`）
- 文件扩展名为`.html`

## 4. 文件操作流程

### 4.1 创建新页面
1. 确定页面分类和文件名
2. 在对应分类目录下创建HTML文件
3. 确保HTML文件符合3.1节的结构要求
4. 更新`metadata.json`添加新页面信息

### 4.2 修改现有页面
1. 编辑HTML文件内容
2. 确保修改后的HTML文件仍符合3.1节的结构要求
3. 如果修改了元数据（标题、描述、关键词等），需更新`metadata.json`

### 4.3 移动页面（更改分类）
1. 确认源文件位置和目标位置
2. 在HTML文件中更新分类元数据：
   ```html
   <meta name="category" content="新分类名">
   ```
3. 将文件从源目录移动到目标目录
4. 更新`metadata.json`中的相关条目：
   - 更新`id`和`path`字段
   - 更新`category`字段
   - 更新`lastModifiedDate`字段
5. 确认原始文件已被删除

### 4.4 更新metadata.json
1. 读取当前的`metadata.json`文件
2. 根据操作类型（添加、修改、移动）更新相应的条目
3. 更新`lastUpdated`字段为当前时间
4. 保存更新后的`metadata.json`
5. 验证JSON格式的有效性
6. 必要时同步更新`dist/metadata.json`

## 5. 网站维护最佳实践

### 5.1 文件备份
- 在进行重要操作前，先备份关键文件（如`metadata.json`）
- 可使用以下命令：
  ```bash
  cp html/metadata.json html/metadata.json.backup
  ```

### 5.2 元数据验证
- 在更新`metadata.json`后，验证JSON格式的有效性
- 可使用在线JSON验证工具或命令行工具

### 5.3 文件同步
- 确保`html/metadata.json`和`dist/metadata.json`保持同步
- 在重要更新后，检查两个文件的差异

### 5.4 分类一致性
- 确保HTML文件中的分类与其所在目录一致
- HTML文件中的`<meta name="category">`值与所在目录对应

### 5.5 链接检查
- 定期检查页面中的返回首页链接是否正确
- 相对路径应根据文件位置调整（如`../../index.html`）

## 6. 故障排除

### 6.1 首页不显示新页面
- 检查`metadata.json`是否包含新页面信息
- 验证JSON格式是否有效
- 检查页面元数据是否符合规范

### 6.2 页面分类错误
- 检查HTML文件中的分类元标签
- 检查文件是否放在正确的目录下
- 检查`metadata.json`中的分类信息

### 6.3 元数据更新失败
- 确认是否有足够的文件权限
- 检查JSON格式是否有效
- 尝试恢复备份文件

## 7. 元数据自动化管理

推荐通过自动化脚本或工具管理`metadata.json`，避免手动编辑可能导致的错误。可开发或使用以下功能：

1. 从HTML文件自动提取元数据
2. 自动更新`lastModifiedDate`字段
3. 自动更新`lastUpdated`字段
4. 验证JSON格式的有效性
5. 同步更新`dist/metadata.json`

## 8. 注意事项

1. 所有用户可见的内容必须使用简体中文
2. 确保网页文件符合W3C标准
3. 维护操作前后确认页面正常显示
4. 保持网站结构的一致性和完整性
5. 定期检查和更新网站内容 