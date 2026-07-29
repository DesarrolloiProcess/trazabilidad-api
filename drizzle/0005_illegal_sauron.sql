CREATE TABLE `patients` (
	`id` binary(16) NOT NULL,
	`name` varchar(150) NOT NULL,
	`phone` varchar(20),
	`email` varchar(150),
	`document_number` varchar(30),
	`active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` binary(16),
	`updated_by` binary(16),
	CONSTRAINT `patients_id` PRIMARY KEY(`id`),
	CONSTRAINT `patients_phone_unique_idx` UNIQUE(`phone`)
);
--> statement-breakpoint
ALTER TABLE `deliveries` ADD `patient_id` binary(16);--> statement-breakpoint
ALTER TABLE `deliveries` ADD CONSTRAINT `deliveries_patient_id_patients_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `deliveries_patient_id_idx` ON `deliveries` (`patient_id`);