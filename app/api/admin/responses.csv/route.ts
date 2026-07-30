import { desc } from "drizzle-orm";
import { ensureSurveySchema, getDb } from "../../../../db";
import { surveyResponses } from "../../../../db/schema";
import { buildSurveyCsv } from "../../../admin/response-format.mjs";

export const dynamic = "force-dynamic";

const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Vary: "Authorization",
  "X-Content-Type-Options": "nosniff",
  "Cross-Origin-Resource-Policy": "same-origin",
};

function privateText(message: string, status: number) {
  return new Response(message, {
    status,
    headers: {
      ...privateHeaders,
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawLimit = url.searchParams.get("limit");
  let limit = 1000;
  if (rawLimit !== null) {
    if (!/^\d+$/.test(rawLimit)) return privateText("导出数量格式不正确。", 400);
    limit = Number(rawLimit);
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 5000) {
      return privateText("导出数量必须在 1 到 5000 之间。", 400);
    }
  }

  try {
    await ensureSurveySchema();
    const db = getDb();
    const rows = await db
      .select({
        id: surveyResponses.id,
        responseId: surveyResponses.responseId,
        screenedOut: surveyResponses.screenedOut,
        contact: surveyResponses.contact,
        contactConsent: surveyResponses.contactConsent,
        answersJson: surveyResponses.answersJson,
        createdAt: surveyResponses.createdAt,
      })
      .from(surveyResponses)
      .orderBy(desc(surveyResponses.id))
      .limit(limit);

    return new Response(buildSurveyCsv(rows), {
      status: 200,
      headers: {
        ...privateHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="oc-survey-responses.csv"',
      },
    });
  } catch {
    return privateText("答卷导出暂时不可用，请稍后重试。", 500);
  }
}
