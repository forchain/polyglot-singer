CREATE TABLE IF NOT EXISTS "word_grammar_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"word" text NOT NULL,
	"language" text NOT NULL,
	"part_of_speech" text,
	"grammar_rules" text,
	"examples" text,
	"analysis_json" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
