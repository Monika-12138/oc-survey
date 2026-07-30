import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const surveyResponses = sqliteTable("survey_responses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  responseId: text("response_id").notNull().unique(),
  screenedOut: integer("screened_out", { mode: "boolean" }).notNull().default(false),
  ocStatus: text("oc_status").notNull(),
  aiExperience: text("ai_experience"),
  aiAttitude: text("ai_attitude"),
  ageRange: text("age_range"),
  monthlySpend: text("monthly_spend"),
  betaInterest: text("beta_interest"),
  contact: text("contact"),
  contactConsent: integer("contact_consent", { mode: "boolean" })
    .notNull()
    .default(false),
  answersJson: text("answers_json").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
