-- 迁移：删除 analyzed_lyrics 表的 voice 字段（已改为全局配置）
ALTER TABLE analyzed_lyrics DROP COLUMN voice; 