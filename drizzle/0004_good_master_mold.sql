CREATE TABLE `delivery_status_history` (
	`id` binary(16) NOT NULL,
	`delivery_id` binary(16) NOT NULL,
	`status` enum('creado','alistado','entregado_transportador','entregado_cliente','no_entregado') NOT NULL,
	`changed_at` datetime NOT NULL,
	CONSTRAINT `delivery_status_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `delivery_status_history` ADD CONSTRAINT `delivery_status_history_delivery_id_deliveries_id_fk` FOREIGN KEY (`delivery_id`) REFERENCES `deliveries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `delivery_status_history_delivery_id_idx` ON `delivery_status_history` (`delivery_id`);