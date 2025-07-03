import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	email: text('email').notNull().unique(),
	hashedPassword: text('hashed_password').notNull(),
	display_name: text('display_name'),
	created_at: integer('created_at').notNull()
});

// Sessions table for Lucia Auth
export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at').notNull()
});

// Lyrics table for storing processed songs
export const lyrics = sqliteTable('lyrics', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	artist: text('artist'),
	originalLyrics: text('original_lyrics').notNull(),
	processedData: text('processed_data').notNull(), // JSON string of analysis
	sourceLanguage: text('source_language').notNull(),
	targetLanguage: text('target_language').notNull(),
	isPublic: integer('is_public', { mode: 'boolean' }).default(false),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// Learning progress table
export const learningProgress = sqliteTable('learning_progress', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	lyricId: text('lyric_id')
		.notNull()
		.references(() => lyrics.id, { onDelete: 'cascade' }),
	practiceCount: integer('practice_count').default(0),
	lastPracticedAt: integer('last_practiced_at', { mode: 'timestamp' }),
	masteredWords: text('mastered_words'), // JSON array of mastered word indices
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// User preferences table
export const userPreferences = sqliteTable('user_preferences', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
		.unique(),
	preferredSourceLanguage: text('preferred_source_language').default('en'),
	preferredTargetLanguage: text('preferred_target_language').default('zh'),
	phoneticStyle: text('phonetic_style').default('ipa'), // 'ipa' or 'simplified'
	showPinyin: integer('show_pinyin', { mode: 'boolean' }).default(true),
	autoSave: integer('auto_save', { mode: 'boolean' }).default(true),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// Types derived from schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Lyric = typeof lyrics.$inferSelect;
export type NewLyric = typeof lyrics.$inferInsert;
export type LearningProgress = typeof learningProgress.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect; 