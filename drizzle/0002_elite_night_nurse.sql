CREATE TABLE `listing_portals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`priority` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`isPaid` varchar(50) NOT NULL,
	`paidPlanInfo` text,
	`smsVerification` varchar(50) NOT NULL,
	`portalStatus` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
	`portalUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `listing_portals_id` PRIMARY KEY(`id`)
);
