CREATE TABLE `departments` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `departments_name_unique` ON `departments` (`name`);--> statement-breakpoint
CREATE TABLE `employees` (
	`id` text PRIMARY KEY NOT NULL,
	`nik` text(16) NOT NULL,
	`no_kk` text(16),
	`full_name` text NOT NULL,
	`gender` text NOT NULL,
	`birth_place` text,
	`birth_date` text NOT NULL,
	`address` text,
	`religion` text,
	`marital_status` text,
	`department_id` text NOT NULL,
	`position` text NOT NULL,
	`employment_status` text NOT NULL,
	`join_date` text NOT NULL,
	`end_contract_date` text,
	`is_active` integer DEFAULT true NOT NULL,
	`ktp_image_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `employees_nik_unique` ON `employees` (`nik`);--> statement-breakpoint
CREATE UNIQUE INDEX `employees_nik_idx` ON `employees` (`nik`);--> statement-breakpoint
CREATE INDEX `employees_is_active_idx` ON `employees` (`is_active`);--> statement-breakpoint
CREATE INDEX `employees_department_idx` ON `employees` (`department_id`);--> statement-breakpoint
CREATE INDEX `employees_status_idx` ON `employees` (`employment_status`);