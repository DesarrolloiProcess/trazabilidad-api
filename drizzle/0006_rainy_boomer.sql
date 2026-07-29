ALTER TABLE `deliveries` ADD `alistamiento_started_at` datetime;--> statement-breakpoint
ALTER TABLE `deliveries` ADD `alistamiento_ended_at` datetime;--> statement-breakpoint
ALTER TABLE `deliveries` ADD `verifier_signature_url` longtext;--> statement-breakpoint
ALTER TABLE `deliveries` ADD `verified_by` binary(16);--> statement-breakpoint
ALTER TABLE `deliveries` ADD CONSTRAINT `deliveries_verified_by_users_id_fk` FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;