# 单词语法分析功能

## 功能概述

Polyglot Singer 现在支持双击单词进行语法分析功能。用户可以双击任何单词来获取详细的语法信息，包括词性、语法规则和例句。

## 功能特性

### 1. 双击触发
- 用户双击单词即可触发语法分析
- 支持所有已分析的语言

### 2. 多层缓存机制
- **客户端缓存**: 浏览器内存中缓存已分析的单词
- **服务器内存缓存**: 服务器端内存缓存，提高响应速度
- **数据库缓存**: 持久化存储，避免重复分析

### 3. 智能分析流程
1. 检查客户端缓存
2. 检查服务器内存缓存
3. 查询数据库
4. 调用AI大模型分析
5. 保存到数据库和缓存

### 4. 分析内容
- **词性**: 单词的词性（名词、动词、形容词等）
- **语法规则**: 详细的语法使用规则
- **例句**: 实际使用例句

## 技术实现

### 数据库表结构

```sql
CREATE TABLE word_grammar_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word TEXT NOT NULL,
    language TEXT NOT NULL,
    part_of_speech TEXT,
    grammar_rules TEXT, -- JSON格式
    examples TEXT, -- JSON格式
    analysis_json TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### API端点

```
POST /api/word/grammar
Content-Type: application/json

{
    "word": "hello",
    "language": "en"
}
```

### 响应格式

```json
{
    "success": true,
    "analysis": {
        "id": "uuid",
        "word": "hello",
        "language": "en",
        "partOfSpeech": "interjection",
        "grammarRules": [
            {
                "rule": "问候语",
                "description": "用于打招呼的常用语",
                "examples": ["Hello, how are you?", "Hello there!"]
            }
        ],
        "examples": [
            "Hello, world!",
            "Hello, nice to meet you."
        ],
        "analysisJson": "...",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
    }
}
```

## 使用方法

### 用户操作
1. 在歌词分析页面，找到想要分析的单词
2. 双击该单词
3. 等待分析完成（会显示加载动画）
4. 查看弹出的语法分析模态框

### 开发者API使用

```javascript
// 分析单词语法
const response = await fetch('/api/word/grammar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        word: 'hello',
        language: 'en'
    })
});

const result = await response.json();
if (result.success) {
    console.log('语法分析结果:', result.analysis);
}
```

## 性能优化

### 缓存策略
- **客户端缓存**: 会话期间有效，减少网络请求
- **服务器缓存**: 内存缓存，提高响应速度
- **数据库缓存**: 持久化存储，避免重复AI调用

### 缓存键格式
```
${word.toLowerCase()}_${language}
```

### 缓存清理
- 服务器重启时自动清理内存缓存
- 可通过API手动清理缓存（管理员功能）

## 错误处理

### 常见错误
1. **网络错误**: 显示"请求失败，请稍后重试"
2. **AI服务错误**: 显示具体错误信息
3. **解析错误**: 自动尝试修复JSON格式

### 降级处理
- AI服务不可用时，返回基础分析结果
- 网络错误时，提示用户重试

## 配置要求

### 环境变量
确保以下环境变量已正确配置：
- `AI_API_KEY`: AI服务API密钥
- `AI_BASE_URL`: AI服务基础URL
- `DATABASE_URL`: 数据库连接URL

### 数据库迁移
运行以下命令创建必要的数据库表：
```bash
npm run db:generate
npm run db:migrate
```

## 测试

### 运行测试
```bash
npm test
```

### 测试覆盖
- 缓存机制测试
- API端点测试
- 错误处理测试
- 集成测试

## 未来改进

### 计划功能
1. **批量分析**: 支持批量分析多个单词
2. **离线模式**: 支持离线查看已缓存的语法分析
3. **用户收藏**: 允许用户收藏常用的语法分析
4. **学习进度**: 跟踪用户的语法学习进度
5. **多语言支持**: 支持更多语言的语法分析

### 性能优化
1. **预加载**: 预加载常用单词的语法分析
2. **压缩**: 压缩缓存数据以节省内存
3. **分布式缓存**: 使用Redis等分布式缓存系统 