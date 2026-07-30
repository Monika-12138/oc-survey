import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Add the database binding to wrangler.jsonc before using the survey database."
    );
  }

  return drizzle(env.DB, { schema });
}

export async function ensureSurveySchema() {
  if (!env.DB) {
    throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  }

  await env.DB.batch([
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS survey_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        response_id TEXT NOT NULL,
        screened_out INTEGER DEFAULT false NOT NULL,
        oc_status TEXT NOT NULL,
        ai_experience TEXT,
        ai_attitude TEXT,
        age_range TEXT,
        monthly_spend TEXT,
        beta_interest TEXT,
        contact TEXT,
        contact_consent INTEGER DEFAULT false NOT NULL,
        answers_json TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `),
    env.DB.prepare(`
      CREATE UNIQUE INDEX IF NOT EXISTS survey_responses_response_id_unique
      ON survey_responses (response_id)
    `),
  ]);
}
