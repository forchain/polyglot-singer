CREATE TABLE `analyzed_lyrics` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text,
	`artist` text,
	`lyrics` text NOT NULL,
	`source_language` text NOT NULL,
	`target_language` text NOT NULL,
	`analysis_json` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
