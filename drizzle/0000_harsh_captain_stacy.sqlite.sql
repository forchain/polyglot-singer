CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"hashed_password" text NOT NULL,
	"display_name" text,
	"created_at" integer DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" integer NOT NULL,
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE TABLE "lyrics" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"artist" text,
	"original_lyrics" text NOT NULL,
	"processed_data" text NOT NULL,
	"source_language" text NOT NULL,
	"target_language" text NOT NULL,
	"is_public" integer DEFAULT 0,
	"created_at" integer DEFAULT CURRENT_TIMESTAMP,
	"updated_at" integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE TABLE "analyzed_lyrics" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text,
	"artist" text,
	"lyrics" text NOT NULL,
	"source_language" text NOT NULL,
	"target_language" text NOT NULL,
	"analysis_json" text NOT NULL,
	"created_at" integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE TABLE "learning_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"lyric_id" text NOT NULL,
	"practice_count" integer DEFAULT 0,
	"last_practiced_at" integer,
	"mastered_words" text,
	"created_at" integer DEFAULT CURRENT_TIMESTAMP,
	"updated_at" integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE NO ACTION ON DELETE CASCADE,
	FOREIGN KEY ("lyric_id") REFERENCES "lyrics"("id") ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE TABLE "user_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"preferred_source_language" text DEFAULT 'en',
	"preferred_target_language" text DEFAULT 'zh',
	"phonetic_style" text DEFAULT 'ipa',
	"show_pinyin" integer DEFAULT 1,
	"auto_save" integer DEFAULT 1,
	"created_at" integer DEFAULT CURRENT_TIMESTAMP,
	"updated_at" integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE UNIQUE INDEX "user_preferences_user_id_unique" ON "user_preferences" ("user_id");

CREATE UNIQUE INDEX "users_username_unique" ON "users" ("username");

CREATE UNIQUE INDEX "users_email_unique" ON "users" ("email"); 