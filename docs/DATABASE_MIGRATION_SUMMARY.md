# 数据库迁移总结

## 完成的工作

### 1. 多数据库支持架构
- ✅ 添加了 SQLite 和 PostgreSQL/Supabase 双数据库支持
- ✅ 创建了两套独立的数据库 schema
- ✅ 实现了动态数据库连接配置
- ✅ 更新了 Drizzle 配置以支持多种数据库

### 2. 新增文件
- `src/lib/server/database/schema-pg.ts` - PostgreSQL 版本的数据库 schema
- `scripts/setup-database.js` - 自动化数据库设置脚本
- `docs/SUPABASE_SETUP.md` - Supabase 设置详细指南
- `docs/DATABASE_MIGRATION_SUMMARY.md` - 本文档

### 3. 修改的文件
- `src/lib/server/database/connection.ts` - 支持多数据库连接
- `drizzle.config.ts` - 动态配置支持
- `env.example` - 添加数据库配置选项
- `package.json` - 添加数据库管理脚本
- `README.md` - 更新文档说明

### 4. API 路由更新
- `src/routes/api/analyze/+server.ts` - 使用动态 schema
- `src/routes/api/analyze/history/+server.ts` - 使用动态 schema
- `src/routes/api/analyze/history/[id]/+server.ts` - 使用动态 schema

### 5. 类型系统更新
- `src/app.d.ts` - 更新用户类型定义
- `src/lib/components/Navigation.svelte` - 修复用户显示字段

## 数据库架构差异

### SQLite vs PostgreSQL 主要差异

| 特性 | SQLite | PostgreSQL |
|------|--------|------------|
| **ID 字段** | `text` | `uuid` with `gen_random_uuid()` |
| **时间戳** | `integer` | `timestamp` |
| **布尔值** | `integer` | `boolean` |
| **默认值** | `CURRENT_TIMESTAMP` | `now()` |
| **连接** | 本地文件 | 网络连接 |

### 表结构

两种数据库都包含相同的表：

1. **users** - 用户表
2. **sessions** - 会话表 (Lucia Auth)
3. **lyrics** - 歌词表
4. **learning_progress** - 学习进度表
5. **user_preferences** - 用户偏好表
6. **analyzed_lyrics** - 分析历史表

## 使用方法

### 本地开发 (SQLite)

```bash
# 1. 配置环境变量
DATABASE_TYPE=sqlite
DATABASE_URL=sqlite:dev.db

# 2. 设置数据库
npm run db:setup

# 3. 启动开发服务器
npm run dev
```

### 生产部署 (Supabase)

```bash
# 1. 配置环境变量
DATABASE_TYPE=postgres
DATABASE_URL=postgresql://user:password@host:port/database

# 2. 生成迁移
npm run db:generate

# 3. 应用迁移
npm run db:migrate

# 4. 部署到 Vercel
npm run build
```

## 数据库管理脚本

```bash
npm run db:setup     # 自动设置数据库（生成+迁移）
npm run db:generate  # 生成迁移文件
npm run db:migrate   # 应用迁移
npm run db:studio    # 打开 Drizzle Studio
npm run db:reset     # 重置 SQLite 数据库（仅开发环境）
```

## 当前限制

### 认证系统
- 目前 Lucia Auth 适配器只支持 SQLite
- PostgreSQL 认证支持需要进一步配置
- 临时解决方案：在 PostgreSQL 模式下抛出错误

### 解决方案
1. 安装 PostgreSQL 专用的 Lucia 适配器
2. 配置适当的类型定义
3. 测试完整的认证流程

## 验证状态

### ✅ 已验证
- SQLite 数据库创建和迁移
- PostgreSQL 迁移文件生成
- API 路由兼容性
- 构建流程正常
- 动态配置加载

### ⚠️ 待验证
- Supabase 实际连接测试
- PostgreSQL 认证系统
- 生产环境部署
- 数据迁移流程

## 下一步计划

1. **完善认证系统**
   - 修复 PostgreSQL Lucia 适配器
   - 测试完整的用户注册/登录流程

2. **生产环境测试**
   - 实际 Supabase 连接测试
   - Vercel 部署验证
   - 性能优化

3. **数据迁移工具**
   - SQLite 到 PostgreSQL 迁移脚本
   - 数据备份和恢复工具

4. **监控和日志**
   - 数据库连接监控
   - 错误日志收集
   - 性能指标追踪

## 技术栈

- **框架**: SvelteKit
- **ORM**: Drizzle ORM
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **认证**: Lucia Auth
- **部署**: Vercel
- **云数据库**: Supabase

## 文档链接

- [Supabase 设置指南](./SUPABASE_SETUP.md)
- [环境变量配置](../env.example)
- [项目 README](../README.md)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [Supabase 文档](https://supabase.com/docs) 