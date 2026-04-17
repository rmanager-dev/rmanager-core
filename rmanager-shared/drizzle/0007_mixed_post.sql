CREATE TABLE `invitation` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`inviter_id` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inviter_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `invitation_organizationId_idx` ON `invitation` (`organization_id`);--> statement-breakpoint
CREATE INDEX `invitation_email_idx` ON `invitation` (`email`);--> statement-breakpoint
CREATE TABLE `member` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `member_organizationId_idx` ON `member` (`organization_id`);--> statement-breakpoint
CREATE INDEX `member_userId_idx` ON `member` (`user_id`);--> statement-breakpoint
CREATE TABLE `organization` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`logo` text,
	`created_at` integer NOT NULL,
	`metadata` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organization_slug_unique` ON `organization` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `organization_slug_uidx` ON `organization` (`slug`);--> statement-breakpoint
DROP TABLE `team`;--> statement-breakpoint
DROP TABLE `team_member`;--> statement-breakpoint
CREATE TABLE `project_new` (
    `id` text PRIMARY KEY NOT NULL,
    `name` text NOT NULL,
    `slug` text NOT NULL,
    `organization_id` text NOT NULL,
    `created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
    FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
DROP INDEX `project_team_id_slug_unique`;--> statement-breakpoint
DROP TABLE `project`;--> statement-breakpoint
ALTER TABLE `project_new` RENAME TO `project`;--> statement-breakpoint
CREATE UNIQUE INDEX `project_organization_id_slug_unique` ON `project` (`organization_id`,`slug`);--> statement-breakpoint
CREATE TABLE `database_new` (
  `id` text PRIMARY KEY NOT NULL,
  `organization_id` text NOT NULL,
  `status` text DEFAULT 'healthy' NOT NULL,
  `error_message` text,
  `type` text DEFAULT 'S3' NOT NULL,
  `name` text NOT NULL,
  `endpoint` text NOT NULL,
  `region` text NOT NULL,
  `bucket_name` text NOT NULL,
  `ak_ciphertext` text NOT NULL,
  `ak_iv` text NOT NULL,
  `ak_tag` text NOT NULL,
  `sk_ciphertext` text NOT NULL,
  `sk_iv` text NOT NULL,
  `sk_tag` text NOT NULL,
  `last_used` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  `last_refreshed_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  `createdAt` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  `created_by` text,
  FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);--> statement-breakpoint
DROP TABLE `database`;--> statement-breakpoint
ALTER TABLE `database_new` RENAME TO `database`;--> statement-breakpoint
CREATE TABLE `roblox_credentials_new` (
    `id` text PRIMARY KEY NOT NULL,
    `organization_id` text NOT NULL,
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
    FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);--> statement-breakpoint
DROP TABLE `roblox_credentials`;--> statement-breakpoint
ALTER TABLE `roblox_credentials_new` RENAME TO `roblox_credentials`;--> statement-breakpoint
ALTER TABLE `session` ADD `active_organization_id` text;
