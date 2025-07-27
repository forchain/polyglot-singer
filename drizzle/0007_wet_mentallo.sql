CREATE TABLE IF NOT EXISTS "recordings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lyric_id" uuid NOT NULL,
	"word" text,
	"line_number" integer,
	"audio_data" text NOT NULL,
	"audio_type" text DEFAULT 'audio/wav' NOT NULL,
	"duration" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recordings" ADD CONSTRAINT "recordings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recordings" ADD CONSTRAINT "recordings_lyric_id_lyrics_id_fk" FOREIGN KEY ("lyric_id") REFERENCES "public"."lyrics"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
