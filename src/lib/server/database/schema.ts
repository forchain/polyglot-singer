import { pgTable, text, integer, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	username: text('username').notNull().unique(),
	email: text('email').notNull().unique(),
	hashedPassword: text('hashed_password').notNull(),
	display_name: text('display_name'),
	created_at: timestamp('created_at').notNull().defaultNow()
});

// Sessions table for Lucia Auth
export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at').notNull()
});

// Lyrics table for storing processed songs
export const lyrics = pgTable('lyrics', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	artist: text('artist'),
	originalLyrics: text('original_lyrics').notNull(),
	processedData: text('processed_data').notNull(), // JSON string of analysis
	sourceLanguage: text('source_language').notNull(),
	targetLanguage: text('target_language').notNull(),
	isPublic: boolean('is_public').default(false),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

// Learning progress table
export const learningProgress = pgTable('learning_progress', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	lyricId: uuid('lyric_id')
		.notNull()
		.references(() => lyrics.id, { onDelete: 'cascade' }),
	practiceCount: integer('practice_count').default(0),
	lastPracticedAt: timestamp('last_practiced_at'),
	masteredWords: text('mastered_words'), // JSON array of mastered word indices
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

// User preferences table
export const userPreferences = pgTable('user_preferences', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
		.unique(),
	preferredSourceLanguage: text('preferred_source_language').default('en'),
	preferredTargetLanguage: text('preferred_target_language').default('zh'),
	phoneticStyle: text('phonetic_style').default('ipa'), // 'ipa' or 'simplified'
	showPinyin: boolean('show_pinyin').default(true),
	autoSave: boolean('auto_save').default(true),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

// 历史分析结果表
export const analyzedLyrics = pgTable('analyzed_lyrics', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id'), // 允许匿名用户，使用文本类型
	title: text('title'),
	artist: text('artist'),
	lyrics: text('lyrics').notNull(),
	sourceLanguage: text('source_language').notNull(),
	targetLanguage: text('target_language').notNull(),
	analysisJson: text('analysis_json').notNull(), // JSON string
	createdAt: timestamp('created_at').defaultNow()
});

// Types derived from schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Lyric = typeof lyrics.$inferSelect;
export type NewLyric = typeof lyrics.$inferInsert;
export type LearningProgress = typeof learningProgress.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect; 
export type AnalyzedLyric = typeof analyzedLyrics.$inferSelect;
export type NewAnalyzedLyric = typeof analyzedLyrics.$inferInsert; 