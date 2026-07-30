CREATE TABLE `survey_responses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`response_id` text NOT NULL,
	`screened_out` integer DEFAULT false NOT NULL,
	`oc_status` text NOT NULL,
	`ai_experience` text,
	`ai_attitude` text,
	`age_range` text,
	`monthly_spend` text,
	`beta_interest` text,
	`contact` text,
	`contact_consent` integer DEFAULT false NOT NULL,
	`answers_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `survey_responses_response_id_unique` ON `survey_responses` (`response_id`);