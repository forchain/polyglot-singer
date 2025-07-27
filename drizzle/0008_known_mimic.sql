ALTER TABLE "recordings" DROP CONSTRAINT "recordings_lyric_id_lyrics_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recordings" ADD CONSTRAINT "recordings_lyric_id_analyzed_lyrics_id_fk" FOREIGN KEY ("lyric_id") REFERENCES "public"."analyzed_lyrics"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
