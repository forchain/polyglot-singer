# Supabase 数据库设置指南

本项目支持两种数据库模式：SQLite（本地开发）和PostgreSQL/Supabase（生产部署）。

## 本地开发 (SQLite)

默认配置，无需额外设置：

```bash
# .env 文件
DATABASE_TYPE=sqlite
DATABASE_URL=sqlite:dev.db
```

## 生产部署 (Supabase)

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 等待项目初始化完成

### 2. 获取数据库连接信息

1. 在 Supabase 项目控制台中，进入 **Settings** → **Database**
2. 找到 **Connection string** 部分
3. 选择 **URI** 格式
4. 复制连接字符串（类似：`postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres`）

### 3. 配置环境变量

更新你的 `.env` 文件：

```bash
# 数据库配置
DATABASE_TYPE=postgres
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres

# 其他配置保持不变...
```

### 4. 运行数据库迁移

```bash
# 生成并运行迁移
npm run db:setup
```

### 5. 验证设置

```bash
# 启动开发服务器
npm run dev
```

## 部署到 Vercel

### 1. 环境变量设置

在 Vercel 项目设置中添加以下环境变量：

- `DATABASE_TYPE`: `postgres`
- `DATABASE_URL`: 你的 Supabase 连接字符串
- `AI_PROVIDER`: 你选择的 AI 提供商
- `[AI_PROVIDER]_API_KEY`: 对应的 API 密钥
- `SESSION_SECRET`: 随机生成的 32+ 字符字符串

### 2. 部署

```bash
# 构建并部署
npm run build
```

或者通过 Vercel CLI：

```bash
vercel --prod
```

## 数据库迁移

### 生成新的迁移

```bash
npm run db:generate
```

### 应用迁移

```bash
npm run db:migrate
```

### 重置数据库（仅限开发环境）

```bash
npm run db:reset
```

## 故障排除

### 连接错误

1. 确认 Supabase 项目状态正常
2. 检查连接字符串格式是否正确
3. 确认密码中的特殊字符已正确编码

### 权限错误

1. 确认 Supabase 项目的数据库用户有足够权限
2. 检查 IP 白名单设置（如果有）

### 迁移失败

1. 检查数据库连接是否正常
2. 确认目标数据库为空或兼容当前 schema
3. 查看 Supabase 日志获取详细错误信息

## 数据库 Schema 差异

项目维护两套 schema：

- `src/lib/server/database/schema.ts` - SQLite 版本
- `src/lib/server/database/schema-pg.ts` - PostgreSQL 版本

主要差异：

1. **ID 字段**：SQLite 使用 `text`，PostgreSQL 使用 `uuid`
2. **时间戳**：SQLite 使用 `integer`，PostgreSQL 使用 `timestamp`
3. **布尔值**：SQLite 使用 `integer`，PostgreSQL 使用 `boolean`

## 性能优化

### Supabase 优化建议

1. **索引**：为经常查询的字段添加索引
2. **连接池**：配置合适的连接池大小
3. **缓存**：考虑使用 Redis 或其他缓存解决方案
4. **分页**：对大数据集使用分页查询

### 监控

1. 使用 Supabase Dashboard 监控数据库性能
2. 设置告警通知
3. 定期检查慢查询日志 