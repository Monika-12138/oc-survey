import { ensureSurveySchema, getDb } from "../../../db";
import { surveyResponses } from "../../../db/schema";
import {
  firstCharacterQuestionIds,
  firstCharacterRequiredAnswerIds,
  isNoTargetInterestAnswer,
} from "../../survey-flow.mjs";

type SurveyAnswer = string | string[];
type SurveyAnswers = Record<string, SurveyAnswer>;

const optionIds: Record<string, Set<string>> = {
  q1: new Set(["one-active", "many-active", "creating", "favorite-only", "no-target"]),
  q1b: new Set(["clear-idea", "interested-unsure", "thought-no-plan", "open-to-learn", "not-interested"]),
  q1d: new Set(["summary", "voice", "background", "relationships", "variants", "self-only", "other"]),
  q1e: new Set(["conversation", "memory", "story", "characters", "choices", "none", "other"]),
  q1f: new Set(["guided", "editable", "draft-only", "no-reuse", "demo", "never", "other"]),
  q1g: new Set(["generic", "too-much", "lose-control", "data-use", "ai-discomfort", "no-concern", "other"]),
  q1h: new Set(["multi-round", "full-once", "short-first", "details-first", "no", "other"]),
  q2: new Set(["settings", "visual", "writing", "roleplay", "sharing", "head-only", "other"]),
  q2f: new Set(["source", "fanworks", "creation", "merchandise", "community", "favorite-passive", "other"]),
  q3: new Set(["voice", "values", "decisions", "relationships", "canon", "appearance", "other"]),
  q4: new Set(["conversation", "memory", "ongoing-story", "characters-together", "invited-people", "none", "other"]),
  q5: new Set(["free", "confirm-key", "small-details", "within-outline", "need-demo", "reject", "other"]),
  q6: new Set(["accurate", "editable", "not-canon", "private", "no-reuse", "never", "other"]),
  q7: new Set(["communities", "content", "character-tools", "creative-tools", "character-apps", "none", "other"]),
  q8: new Set(["advanced", "regular", "occasional", "tried-stopped", "never-open", "avoid", "other"]),
  q9: new Set(["more", "same", "conditional", "assist-only", "less", "reject", "other"]),
  q10: new Set(["15-under", "16-17", "18-22", "23-27", "28-plus", "private"]),
  q11: new Set(["zero", "1-49", "50-199", "200-499", "500-999", "1000-plus", "private"]),
  q12: new Set(["multi-round", "full-once", "short-first", "details-first", "no", "other"]),
};

const multiQuestions = new Set(["q1d", "q1e", "q1f", "q1g", "q2", "q2f", "q3", "q4", "q6", "q7"]);
const selectionLimits: Record<string, number> = {
  q1d: 2,
  q1e: 2,
  q1f: 3,
  q1g: 2,
  q3: 2,
  q4: 2,
  q6: 3,
};
const exclusiveOptions: Record<string, string> = {
  q1d: "self-only",
  q1e: "none",
  q1f: "never",
  q1g: "no-concern",
  q2: "head-only",
  q2f: "favorite-passive",
  q4: "none",
  q6: "never",
  q7: "none",
};
const ocPathStatuses = new Set(["one-active", "many-active", "creating"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cleanAnswers(raw: unknown): SurveyAnswers | null {
  if (!isRecord(raw)) return null;

  const cleaned: SurveyAnswers = {};
  for (const [questionId, allowed] of Object.entries(optionIds)) {
    const answer = raw[questionId];
    if (answer === undefined) continue;

    if (multiQuestions.has(questionId)) {
      if (!Array.isArray(answer) || answer.length === 0) return null;
      const values = [...new Set(answer)];
      if (!values.every((value): value is string => typeof value === "string" && allowed.has(value))) {
        return null;
      }
      if (selectionLimits[questionId] && values.length > selectionLimits[questionId]) {
        return null;
      }
      const exclusive = exclusiveOptions[questionId];
      if (exclusive && values.includes(exclusive) && values.length > 1) return null;
      cleaned[questionId] = values;
    } else {
      if (typeof answer !== "string" || !allowed.has(answer)) return null;
      cleaned[questionId] = answer;
    }
  }

  return cleaned;
}

function answerIncludes(answer: SurveyAnswer | undefined, value: string) {
  return Array.isArray(answer) ? answer.includes(value) : answer === value;
}

function toRouteErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  if (message.includes("no such table") || message.includes("survey_responses")) {
    return "答卷存储正在初始化，请稍后再试。";
  }
  return "提交暂时没有成功，请稍后再试。";
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as unknown;
    if (!isRecord(payload)) {
      return Response.json({ error: "提交内容格式不正确。" }, { status: 400 });
    }

    const submissionToken =
      typeof payload.submissionToken === "string" ? payload.submissionToken.trim() : "";
    if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(submissionToken)) {
      return Response.json({ error: "答卷编号无效，请刷新后重试。" }, { status: 400 });
    }

    const answers = cleanAnswers(payload.answers);
    if (!answers || typeof answers.q1 !== "string") {
      return Response.json({ error: "请先完成当前问卷。" }, { status: 400 });
    }

    const noTarget = answers.q1 === "no-target";
    let screenedOut = false;
    let branch:
      | "oc"
      | "favorite-character"
      | "no-target-interested"
      | "no-target-uninterested";

    if (noTarget) {
      if (answers.q1b === undefined) {
        return Response.json({ error: "请先回答是否想过创作自己的角色。" }, { status: 400 });
      }

      if (answers.q1b === "not-interested") {
        screenedOut = true;
        branch = "no-target-uninterested";
        for (const id of Object.keys(answers)) {
          if (id !== "q1" && id !== "q1b") delete answers[id];
        }
      } else if (isNoTargetInterestAnswer(answers.q1b)) {
        branch = "no-target-interested";
        const allowedDiscoveryIds = new Set(firstCharacterQuestionIds);
        for (const id of Object.keys(answers)) {
          if (!allowedDiscoveryIds.has(id)) delete answers[id];
        }
        if (firstCharacterRequiredAnswerIds.some((id) => answers[id] === undefined)) {
          return Response.json({ error: "还有题目没有完成，请返回检查。" }, { status: 400 });
        }
      } else {
        return Response.json({ error: "第二题的选择无效，请重新选择。" }, { status: 400 });
      }
    } else {
      delete answers.q1b;
      delete answers.q1d;
      delete answers.q1e;
      delete answers.q1f;
      delete answers.q1g;
      delete answers.q1h;
      const isOcPath = ocPathStatuses.has(answers.q1);
      const isFavoritePath = answers.q1 === "favorite-only";
      if (!isOcPath && !isFavoritePath) {
        return Response.json({ error: "第一题的选择无效，请重新选择。" }, { status: 400 });
      }

      branch = isOcPath ? "oc" : "favorite-character";
      if (isOcPath) {
        delete answers.q2f;
        if (answers.q2 === undefined) {
          return Response.json({ error: "还有题目没有完成，请返回检查。" }, { status: 400 });
        }
      } else {
        delete answers.q2;
        if (answers.q2f === undefined) {
          return Response.json({ error: "还有题目没有完成，请返回检查。" }, { status: 400 });
        }
      }

      const requiredForMain = ["q7", "q4", "q5", "q6", "q8", "q9", "q10", "q11", "q12"];
      if (requiredForMain.some((id) => answers[id] === undefined)) {
        return Response.json({ error: "还有题目没有完成，请返回检查。" }, { status: 400 });
      }

      const usedCharacterApps = answerIncludes(answers.q7, "character-apps");
      if (usedCharacterApps && answers.q3 === undefined) {
        return Response.json({ error: "还有题目没有完成，请返回检查。" }, { status: 400 });
      }
      if (!usedCharacterApps) delete answers.q3;
    }

    const rawOtherText = isRecord(payload.otherText) ? payload.otherText : {};
    const otherText: Record<string, string> = {};
    for (const questionId of Object.keys(optionIds)) {
      if (!answerIncludes(answers[questionId], "other")) continue;
      const value = rawOtherText[questionId];
      if (typeof value !== "string" || !value.trim()) {
        return Response.json(
          { error: "选择“其他”后，请填写补充内容。" },
          { status: 400 },
        );
      }
      otherText[questionId] = value.trim().slice(0, 500);
    }

    const ageRange = typeof answers.q10 === "string" ? answers.q10 : null;
    const betaInterest =
      typeof answers.q12 === "string"
        ? answers.q12
        : typeof answers.q1h === "string"
          ? answers.q1h
          : null;
    const mayStoreContact = Boolean(betaInterest && betaInterest !== "no");
    const requestedContact =
      typeof payload.contact === "string" ? payload.contact.trim().slice(0, 250) : "";
    const contact = mayStoreContact && requestedContact ? requestedContact : null;
    const contactConsent = contact ? payload.contactConsent === true : false;

    if (contact && !contactConsent) {
      return Response.json(
        { error: "留下联系方式前，需要确认联系方式的使用范围。" },
        { status: 400 },
      );
    }

    await ensureSurveySchema();
    const db = getDb();
    const inserted = await db
      .insert(surveyResponses)
      .values({
        responseId: submissionToken,
        screenedOut,
        ocStatus: answers.q1,
        aiExperience: typeof answers.q8 === "string" ? answers.q8 : null,
        aiAttitude: typeof answers.q9 === "string" ? answers.q9 : null,
        ageRange,
        monthlySpend: typeof answers.q11 === "string" ? answers.q11 : null,
        betaInterest,
        contact,
        contactConsent,
        answersJson: JSON.stringify({
          surveyVersion: "2026-07-30-first-character-discovery-v6",
          branch,
          answers,
          otherText,
        }),
      })
      .onConflictDoNothing({ target: surveyResponses.responseId })
      .returning({ responseId: surveyResponses.responseId });

    return Response.json(
      { responseId: inserted[0]?.responseId ?? submissionToken },
      { status: inserted.length ? 201 : 200 },
    );
  } catch (error) {
    return Response.json({ error: toRouteErrorMessage(error) }, { status: 500 });
  }
}
