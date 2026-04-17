CREATE TABLE `roblox_credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'healthy' NOT NULL,
	`error_message` text,
	`key_ciphertext` text NOT NULL,
	`key_iv` text NOT NULL,
	`key_tag` text NOT NULL,
	`key_owner_roblox_id` integer NOT NULL,
	`expiration_date` integer,
	`last_used` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`last_refreshed_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`created_by` text,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
ALTER TABLE `database` ADD `status` text DEFAULT 'healthy' NOT NULL;--> statement-breakpoint
ALTER TABLE `database` ADD `error_message` text;--> statement-breakpoint
ALTER TABLE `database` ADD `last_used` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL;--> statement-breakpoint
ALTER TABLE `database` ADD `last_refreshed_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL;