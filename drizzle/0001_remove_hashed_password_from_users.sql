-- 迁移：删除 users 表的 hashed_password 字段（因 Supabase Auth 负责认证，业务表无需此字段）
ALTER TABLE users DROP COLUMN hashed_password; 