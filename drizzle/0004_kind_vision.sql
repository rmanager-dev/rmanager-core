ALTER TABLE `project` RENAME COLUMN "teamId" TO "team_id";--> statement-breakpoint
DROP INDEX `project_teamId_slug_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `project_team_id_slug_unique` ON `project` (`team_id`,`slug`);--> statement-breakpoint
ALTER TABLE `project` ALTER COLUMN "team_id" TO "team_id" text NOT NULL REFERENCES team(id) ON DELETE cascade ON UPDATE no action;