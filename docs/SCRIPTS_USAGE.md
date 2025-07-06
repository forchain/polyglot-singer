# 脚本使用说明

本项目提供了多个自动化脚本来简化开发和部署流程。

## 🚀 快速启动

### 方法一：使用 Shell 脚本（推荐）

```bash
# 给脚本添加执行权限（首次使用）
chmod +x start.sh

# 启动应用
./start.sh
```

### 方法二：使用 npm 命令

```bash
# 智能启动（包含环境检查和数据库设置）
npm run start

# 或者使用 shell 版本
npm run start:shell
```

## 📋 可用脚本

### 启动脚本

| 命令 | 描述 | 功能 |
|------|------|------|
| `./start.sh` | Shell 启动脚本 | 检查环境 → 设置数据库 → 启动应用 |
| `npm run start` | Node.js 启动脚本 | 同 shell 脚本，但使用 Node.js |
| `npm run start:shell` | 调用 shell 脚本 | 通过 npm 调用 shell 脚本 |

### 环境配置脚本

| 命令 | 描述 | 功能 |
|------|------|------|
| `npm run env:check` | 环境配置检查 | 检查 env.example 与 .env 的差异 |
| `node scripts/check-env.js` | 直接运行检查脚本 | 同上 |

### 数据库管理脚本

| 命令 | 描述 | 功能 |
|------|------|------|
| `npm run db:setup` | 数据库设置 | 生成迁移 + 应用迁移 |
| `npm run db:generate` | 生成迁移 | 根据 schema 生成迁移文件 |
| `npm run db:migrate` | 应用迁移 | 将迁移应用到数据库 |
| `npm run db:studio` | 数据库管理界面 | 打开 Drizzle Studio |
| `npm run db:reset` | 重置数据库 | 删除 SQLite 数据库并重新设置 |

## 🔧 脚本功能详解

### 1. 环境配置检查 (`check-env.js`)

**功能：**
- 比较 `env.example` 和 `.env` 文件
- 自动添加新增的配置项
- 提示需要更新的配置项
- 提供配置说明和文档链接

**使用场景：**
- 项目更新后检查新配置
- 首次设置项目环境
- 部署前验证配置完整性

**输出示例：**
```
🔍 检查环境配置...

🔧 环境配置检查结果：

📝 发现 2 个新增配置项：
  DATABASE_TYPE - 数据库类型配置
  DATABASE_URL - 数据库连接字符串

💡 建议操作：
1. 检查新增的配置项，根据注释说明进行配置
2. 更新需要修改的配置项（如 API 密钥、数据库连接等）
3. 确保 SESSION_SECRET 是随机生成的 32+ 字符字符串
4. 配置正确的数据库连接信息（如果使用 Supabase）

✅ .env 文件已更新！
```

### 2. 智能启动脚本 (`start.js`)

**功能：**
- 自动检查环境配置
- 验证必要文件存在
- 检查并设置数据库
- 安装缺失的依赖
- 启动开发服务器

**执行流程：**
1. 运行环境配置检查
2. 验证 `.env` 文件存在
3. 检查数据库文件，不存在则设置
4. 检查 `node_modules`，不存在则安装依赖
5. 启动开发服务器

**错误处理：**
- 提供详细的错误信息
- 给出故障排除建议
- 链接相关文档

### 3. Shell 启动脚本 (`start.sh`)

**功能：**
- 检查系统环境（Node.js、npm）
- 验证项目文件完整性
- 调用 Node.js 启动脚本

**系统要求检查：**
- Node.js 版本
- npm 版本
- 项目文件完整性

## 🎯 使用建议

### 首次设置项目

```bash
# 1. 克隆项目
git clone <repository-url>
cd polyglot-singer

# 2. 使用智能启动脚本
./start.sh
```

脚本会自动：
- 检查环境配置并创建 `.env` 文件
- 设置数据库
- 安装依赖
- 启动应用

### 日常开发

```bash
# 直接启动（如果环境已配置）
npm run dev

# 或者使用智能启动（推荐）
./start.sh
```

### 项目更新后

```bash
# 检查环境配置变更
npm run env:check

# 如果数据库 schema 有变更
npm run db:setup

# 启动应用
./start.sh
```

### 部署前检查

```bash
# 1. 检查环境配置
npm run env:check

# 2. 验证数据库设置
npm run db:setup

# 3. 构建项目
npm run build

# 4. 预览构建结果
npm run preview
```

## 🔍 故障排除

### 常见问题

**1. 权限错误**
```bash
# 给脚本添加执行权限
chmod +x start.sh
```

**2. Node.js 未安装**
```bash
# 下载并安装 Node.js
# https://nodejs.org/
```

**3. 环境配置错误**
```bash
# 重新检查环境配置
npm run env:check

# 手动编辑 .env 文件
nano .env
```

**4. 数据库连接失败**
```bash
# 重置数据库
npm run db:reset

# 检查数据库配置
cat .env | grep DATABASE
```

### 调试模式

```bash
# 查看详细日志
DEBUG=* npm run start

# 或者直接运行脚本查看输出
node scripts/check-env.js
node scripts/start.js
```

## 📖 相关文档

- [环境变量配置](../env.example)
- [Supabase 设置指南](./SUPABASE_SETUP.md)
- [数据库迁移总结](./DATABASE_MIGRATION_SUMMARY.md)
- [项目 README](../README.md)

## 🤝 贡献

如果您发现脚本中的问题或有改进建议，请：

1. 检查现有 issue
2. 创建新的 issue 描述问题
3. 提交 pull request 包含修复

## 📝 脚本维护

### 添加新的检查项

在 `scripts/check-env.js` 中：
1. 在 `importantKeys` 数组中添加新的关键配置项
2. 在 `showUpdatePrompt` 函数中添加相应的提示信息

### 添加新的启动步骤

在 `scripts/start.js` 中：
1. 在 `main` 函数中添加新的检查步骤
2. 使用 `runCommand` 函数执行命令
3. 添加相应的错误处理

### 更新文档

修改脚本后，请同时更新：
- 本文档
- README.md
- package.json 中的脚本描述 