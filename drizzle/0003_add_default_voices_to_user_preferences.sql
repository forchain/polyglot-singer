-- 迁移：为 user_preferences 表添加 default_voices 字段，用于存储每种语言的默认发音 Voice（JSON）
ALTER TABLE user_preferences ADD COLUMN default_voices text; 