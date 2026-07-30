import type { Metadata } from "next";
import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { ensureSurveySchema, getDb } from "../../db";
import { surveyResponses } from "../../db/schema";
import {
  formatAnswer,
  formatSingaporeTime,
  getAnswerRows,
  getBranchLabel,
  parseStoredPayload,
} from "./response-format.mjs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "答卷后台｜OC / Field Notes",
  robots: { index: false, follow: false },
};

export default async function SurveyAdminPage() {
  await ensureSurveySchema();
  const db = getDb();
  const [summaryRows, responses] = await Promise.all([
    db
      .select({
        total: sql<number>`count(*)`,
        willing: sql<number>`sum(case when ${surveyResponses.betaInterest} is not null and ${surveyResponses.betaInterest} <> 'no' then 1 else 0 end)`,
        contacts: sql<number>`sum(case when ${surveyResponses.contact} is not null and length(trim(${surveyResponses.contact})) > 0 then 1 else 0 end)`,
        screened: sql<number>`sum(case when ${surveyResponses.screenedOut} = 1 then 1 else 0 end)`,
      })
      .from(surveyResponses),
    db
      .select({
        id: surveyResponses.id,
        responseId: surveyResponses.responseId,
        screenedOut: surveyResponses.screenedOut,
        ocStatus: surveyResponses.ocStatus,
        aiExperience: surveyResponses.aiExperience,
        aiAttitude: surveyResponses.aiAttitude,
        ageRange: surveyResponses.ageRange,
        monthlySpend: surveyResponses.monthlySpend,
        betaInterest: surveyResponses.betaInterest,
        contact: surveyResponses.contact,
        contactConsent: surveyResponses.contactConsent,
        answersJson: surveyResponses.answersJson,
        createdAt: surveyResponses.createdAt,
      })
      .from(surveyResponses)
      .orderBy(desc(surveyResponses.id))
      .limit(200),
  ]);

  const summary = summaryRows[0];
  const total = Number(summary?.total ?? 0);

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="admin-kicker">OC / RESPONSE DESK</p>
          <h1>答卷后台</h1>
          <p className="admin-subtitle">
            这里仅供问卷管理员查看。页面展示最近 200 份，CSV 最多导出最近 5,000 份。
          </p>
        </div>
        <div className="admin-account">
          <span>当前身份</span>
          <strong>问卷管理员</strong>
        </div>
      </header>

      <nav className="admin-actions" aria-label="答卷后台操作">
        <Link className="admin-button secondary" href="/">
          打开问卷
        </Link>
        <a className="admin-button primary" href="/api/admin/responses.csv?limit=5000">
          导出 CSV
        </a>
      </nav>

      <section className="admin-stats" aria-label="答卷概览">
        <article>
          <span>全部答卷</span>
          <strong>{total}</strong>
        </article>
        <article>
          <span>愿意继续了解或测试</span>
          <strong>{Number(summary?.willing ?? 0)}</strong>
        </article>
        <article>
          <span>留下联系方式</span>
          <strong>{Number(summary?.contacts ?? 0)}</strong>
        </article>
        <article>
          <span>提前结束</span>
          <strong>{Number(summary?.screened ?? 0)}</strong>
        </article>
      </section>

      <section className="admin-responses" aria-labelledby="response-list-title">
        <div className="admin-section-heading">
          <div>
            <p className="admin-kicker">LATEST RESPONSES</p>
            <h2 id="response-list-title">最近答卷</h2>
          </div>
          <span>{Math.min(total, 200)} / {total}</span>
        </div>

        {responses.length === 0 ? (
          <div className="admin-empty">
            <strong>还没有收到答卷</strong>
            <p>公开链接发出后，新提交会自动出现在这里。</p>
          </div>
        ) : (
          <div className="admin-response-list">
            {responses.map((response) => {
              const payload = parseStoredPayload(response.answersJson);
              const answers = getAnswerRows(payload);
              const interestQuestion = payload.answers.q1h !== undefined ? "q1h" : "q12";
              const interestAnswer = payload.answers[interestQuestion];

              return (
                <article className="admin-response-card" key={response.id}>
                  <header>
                    <div>
                      <p className="admin-response-id">#{response.id} · {response.responseId.slice(0, 8)}</p>
                      <h3>{getBranchLabel(payload.branch)}</h3>
                    </div>
                    <time dateTime={response.createdAt}>{formatSingaporeTime(response.createdAt)}</time>
                  </header>

                  <div className="admin-response-meta">
                    <span>{formatAnswer("q1", response.ocStatus, payload)}</span>
                    <span>{response.ageRange ? formatAnswer("q10", response.ageRange, payload) : "年龄未记录"}</span>
                    <span>{interestAnswer ? formatAnswer(interestQuestion, interestAnswer, payload) : "测试意愿未记录"}</span>
                    {response.screenedOut ? <span className="muted">提前结束</span> : null}
                  </div>

                  <div className="admin-contact-line">
                    <span>联系方式</span>
                    <strong>{response.contact ?? "未留下"}</strong>
                  </div>

                  <details className="admin-details">
                    <summary>查看完整答案</summary>
                    <dl>
                      {answers.map((item) => (
                        <div key={item.id}>
                          <dt>{item.question}</dt>
                          <dd>{item.answer}</dd>
                        </div>
                      ))}
                    </dl>
                  </details>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
