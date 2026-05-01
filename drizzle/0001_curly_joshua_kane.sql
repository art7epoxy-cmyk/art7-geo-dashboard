CREATE TABLE `geolocation_pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(2) NOT NULL,
	`status` enum('active','pending') NOT NULL DEFAULT 'pending',
	`url` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `geolocation_pages_id` PRIMARY KEY(`id`)
);
