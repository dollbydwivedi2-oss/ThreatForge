CREATE TABLE "scan_results" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL,
	"message" text NOT NULL,
	"verdict" text NOT NULL,
	"score" integer NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
