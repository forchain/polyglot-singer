-- 迁移：为 analyzed_lyrics 表添加 voice 字段，用于记住每首歌的发音模型
ALTER TABLE analyzed_lyrics ADD COLUMN voice text; 