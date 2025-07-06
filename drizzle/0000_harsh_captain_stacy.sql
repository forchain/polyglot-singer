CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"username" text NOT NULL,
	"email" text NOT NULL,
	"hashed_password" text NOT NULL,
	"display_name" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL,
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE "lyrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"artist" text,
	"original_lyrics" text NOT NULL,
	"processed_data" text NOT NULL,
	"source_language" text NOT NULL,
	"target_language" text NOT NULL,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE "analyzed_lyrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"title" text,
	"artist" text,
	"lyrics" text NOT NULL,
	"source_language" text NOT NULL,
	"target_language" text NOT NULL,
	"analysis_json" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE "learning_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"lyric_id" uuid NOT NULL,
	"practice_count" integer DEFAULT 0,
	"last_practiced_at" timestamp,
	"mastered_words" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE NO ACTION ON DELETE CASCADE,
	FOREIGN KEY ("lyric_id") REFERENCES "lyrics"("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"preferred_source_language" text DEFAULT 'en',
	"preferred_target_language" text DEFAULT 'zh',
	"phonetic_style" text DEFAULT 'ipa',
	"show_pinyin" boolean DEFAULT true,
	"auto_save" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
--> statement-breakpoint
CREATE UNIQUE INDEX "user_preferences_user_id_unique" ON "user_preferences" ("user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique" ON "users" ("username");
--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" ("email");