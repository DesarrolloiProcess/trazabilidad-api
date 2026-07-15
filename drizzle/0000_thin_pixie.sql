CREATE TABLE `users` (
	`id` binary(16) NOT NULL,
	`email` varchar(150) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`name` varchar(150) NOT NULL,
	`role` enum('CEDI','CONDUCTOR','ADMIN') NOT NULL,
	`distribution_center_id` binary(16),
	`otp_code` varchar(10),
	`otp_expires_at` datetime,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` binary(16),
	`updated_by` binary(16),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `distribution_centers` (
	`id` binary(16) NOT NULL,
	`name` varchar(150) NOT NULL,
	`city` varchar(100) NOT NULL,
	`address` varchar(255) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` binary(16),
	`updated_by` binary(16),
	CONSTRAINT `distribution_centers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `routes` (
	`id` binary(16) NOT NULL,
	`code` varchar(50) NOT NULL,
	`distribution_center_id` binary(16) NOT NULL,
	`driver_id` binary(16),
	`date` datetime NOT NULL,
	`status` enum('creada','entregada_transportador','en_curso','completada','con_novedad') NOT NULL DEFAULT 'creada',
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` binary(16),
	`updated_by` binary(16),
	CONSTRAINT `routes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` binary(16) NOT NULL,
	`nit` varchar(30) NOT NULL,
	`name` varchar(150) NOT NULL,
	`phone` varchar(20),
	`active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` binary(16),
	`updated_by` binary(16),
	CONSTRAINT `clients_id` PRIMARY KEY(`id`),
	CONSTRAINT `clients_nit_unique` UNIQUE(`nit`)
);
--> statement-breakpoint
CREATE TABLE `deliveries` (
	`id` binary(16) NOT NULL,
	`route_id` binary(16) NOT NULL,
	`client_id` binary(16) NOT NULL,
	`tracking_number` varchar(50) NOT NULL,
	`address` varchar(255) NOT NULL,
	`recipient_name` varchar(150) NOT NULL,
	`recipient_phone` varchar(20) NOT NULL,
	`status` enum('creado','alistado','entregado_transportador','entregado_cliente','no_entregado') NOT NULL DEFAULT 'creado',
	`destination_latitude` decimal(10,7),
	`destination_longitude` decimal(10,7),
	`signature_url` varchar(255),
	`photo_url` varchar(255),
	`receiver_name` varchar(150),
	`receiver_id_number` varchar(20),
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`observation` varchar(500),
	`delivered_at` datetime,
	`invoiced` boolean NOT NULL DEFAULT false,
	`invoiced_at` datetime,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` binary(16),
	`updated_by` binary(16),
	CONSTRAINT `deliveries_id` PRIMARY KEY(`id`),
	CONSTRAINT `deliveries_tracking_number_unique` UNIQUE(`tracking_number`)
);
--> statement-breakpoint
CREATE TABLE `delivery_products` (
	`id` binary(16) NOT NULL,
	`delivery_id` binary(16) NOT NULL,
	`code` varchar(50) NOT NULL,
	`description` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`price` decimal(12,2) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` binary(16),
	`updated_by` binary(16),
	CONSTRAINT `delivery_products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_distribution_center_id_distribution_centers_id_fk` FOREIGN KEY (`distribution_center_id`) REFERENCES `distribution_centers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `routes` ADD CONSTRAINT `routes_distribution_center_id_distribution_centers_id_fk` FOREIGN KEY (`distribution_center_id`) REFERENCES `distribution_centers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `routes` ADD CONSTRAINT `routes_driver_id_users_id_fk` FOREIGN KEY (`driver_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `deliveries` ADD CONSTRAINT `deliveries_route_id_routes_id_fk` FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `deliveries` ADD CONSTRAINT `deliveries_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `delivery_products` ADD CONSTRAINT `delivery_products_delivery_id_deliveries_id_fk` FOREIGN KEY (`delivery_id`) REFERENCES `deliveries`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `users_distribution_center_id_idx` ON `users` (`distribution_center_id`);--> statement-breakpoint
CREATE INDEX `routes_distribution_center_id_idx` ON `routes` (`distribution_center_id`);--> statement-breakpoint
CREATE INDEX `routes_driver_id_idx` ON `routes` (`driver_id`);--> statement-breakpoint
CREATE INDEX `deliveries_route_id_idx` ON `deliveries` (`route_id`);--> statement-breakpoint
CREATE INDEX `deliveries_client_id_idx` ON `deliveries` (`client_id`);--> statement-breakpoint
CREATE INDEX `delivery_products_delivery_id_idx` ON `delivery_products` (`delivery_id`);