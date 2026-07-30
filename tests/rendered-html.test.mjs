import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import {
  firstCharacterQuestionIds,
  firstCharacterRequiredAnswerIds,
  getNoTargetQuestionIds,
  noTargetInterestAnswers,
} from "../app/survey-flow.mjs";
import {
  buildSurveyCsv,
  csvCell,
} from "../app/admin/response-format.mjs";

const projectRoot = new URL("../", import.meta.url);

function objectProperty(object, name) {
  return object.properties.find(
    (property) =>
      ts.isPropertyAssignment(property) &&
      ((ts.isIdentifier(property.name) && property.name.text === name) ||
        (ts.isStringLiteral(property.name) && property.name.text === name)),
  );
}

function findQuestionArray(source) {
  const file = ts.createSourceFile(
    "page.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let result;

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "questions" &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      result = node.initializer;
      return;
    }
    ts.forEachChild(node, visit);
  }

  visit(file);
  return result;
}

test("ships the finished OC survey introduction", async () => {
  const [page, layout] = await Promise.all([
    readFile(new URL("app/page.tsx", projectRoot), "utf8"),
    readFile(new URL("app/layout.tsx", projectRoot), "utf8"),
    access(new URL("dist/server/index.js", projectRoot)),
    access(new URL("dist/client/og.png", projectRoot)),
  ]);

  assert.match(layout, /title: "关于原创角色与互动方式的小调查"/);
  assert.match(page, /OC FIELD STUDY · 01/);
  assert.match(page, /最多 12 题/);
  assert.match(page, /任何年龄都可以自行决定是否留下联系方式/);
  assert.match(page, /后续体验邀请和反馈跟进/);
  assert.doesNotMatch(page, /Your site is taking shape|Building your site|codex-preview/);
});

test("keeps the clarified question order and every option set within seven choices", async () => {
  const source = await readFile(new URL("app/page.tsx", projectRoot), "utf8");
  const questions = findQuestionArray(source);
  assert.ok(questions, "questions array should exist");

  const entries = questions.elements.filter(ts.isObjectLiteralExpression);
  assert.equal(entries.length, 19);

  const ids = [];
  for (const entry of entries) {
    const idProperty = objectProperty(entry, "id");
    const optionsProperty = objectProperty(entry, "options");
    assert.ok(idProperty && ts.isStringLiteral(idProperty.initializer));
    assert.ok(optionsProperty && ts.isArrayLiteralExpression(optionsProperty.initializer));

    const id = idProperty.initializer.text;
    const optionCount = optionsProperty.initializer.elements.length;
    ids.push(id);
    assert.ok(optionCount <= 7, `${id} has ${optionCount} options`);

    const favoriteVariant = objectProperty(entry, "favoriteVariant");
    if (favoriteVariant && ts.isObjectLiteralExpression(favoriteVariant.initializer)) {
      const variantOptions = objectProperty(favoriteVariant.initializer, "options");
      if (variantOptions && ts.isArrayLiteralExpression(variantOptions.initializer)) {
        assert.ok(
          variantOptions.initializer.elements.length <= 7,
          `${id} favorite variant has too many options`,
        );
      }
    }
  }

  assert.deepEqual(ids, [
    "q1",
    "q1b",
    "q1d",
    "q1e",
    "q1f",
    "q1g",
    "q2",
    "q2f",
    "q7",
    "q3",
    "q4",
    "q5",
    "q6",
    "q8",
    "q9",
    "q10",
    "q11",
    "q12",
    "q1h",
  ]);

  const q1 = entries[0];
  const q1Options = objectProperty(q1, "options").initializer.elements;
  const q1OptionIds = q1Options.map((option) =>
    objectProperty(option, "id").initializer.text,
  );
  assert.deepEqual(q1OptionIds, [
    "one-active",
    "many-active",
    "creating",
    "favorite-only",
    "no-target",
  ]);
});

test("implements the requested branching without replacing the screenshot questions", async () => {
  const [page, route] = await Promise.all([
    readFile(new URL("app/page.tsx", projectRoot), "utf8"),
    readFile(new URL("app/api/responses/route.ts", projectRoot), "utf8"),
  ]);

  assert.match(page, /你以前有没有想过，创作一个属于自己的原创角色（OC）/);
  assert.match(page, /showForNoTarget/);
  assert.match(page, /showForNoTargetInterest/);
  assert.match(page, /isNoTargetInterestAnswer\(answers\.q1b\)/);
  assert.match(page, /question\.id === "q1" && answers\.q1 === "no-target"/);
  assert.match(page, /showForNoTarget = \(answers: Answers\) => answers\.q1 === "no-target"/);
  assert.ok(
    page.indexOf('if (question.id === "q1" && answers.q1 === "no-target")') <
      page.indexOf("if (index >= visibleQuestions.length - 1)"),
    "the no-target follow-up must run before the generic final-question submission",
  );
  assert.match(page, /你是否使用过 AI 工具，生成或辅助创作与你的 OC 有关的内容/);
  assert.match(page, /你是否使用过 AI 工具，生成或辅助创作与你喜欢的这个角色有关的内容/);
  assert.match(page, /尝试过，但结果不像原作中的 TA，所以没有继续/);
  assert.doesNotMatch(page, /如果开始塑造自己的第一个原创角色，你最想先确定哪一部分/);
  assert.match(page, /如果有一个平台或工具可以帮你完成第一版角色设定/);
  assert.match(page, /这只是假设；即使现在还没有具体想法/);
  assert.match(page, /角色有了初步设定后，哪些体验最能让你想继续认识或完善 TA/);
  assert.match(page, /可能由 AI 参与实现后，你最担心什么/);
  assert.match(page, /让你从零塑造第一个角色，并尝试与 TA 对话或进入故事/);
  assert.match(page, /selectedList\(answers\.q7\)\.includes\("character-apps"\)/);
  assert.match(page, /当你的 OC 出现在新的互动或故事中时，你最在意哪些方面被准确呈现/);
  assert.match(page, /当你喜欢的角色出现在原作之外的新互动或故事中时，你最在意哪些方面贴合原作/);
  assert.doesNotMatch(page, /这还是 TA|仍然像原作中的 TA/);
  assert.doesNotMatch(page, /没有使用这类平台.*原因|未使用角色应用/);
  assert.match(page, /Notion、捏咔、Picrew/);
  assert.match(page, /猫箱、星野、Character\.AI、SillyTavern/);
  assert.match(page, /mainProgressSteps[\s\S]*q12: 12/);
  assert.match(page, /firstCharacterQuestionIds\.map\(\(id, index\) => \[id, index \+ 1\]\)/);
  assert.match(page, /firstCharacterQuestionIds\.length/);
  assert.doesNotMatch(page, /\/ visibleQuestions\.length\) \* 100/);

  assert.match(route, /answers\.q1 === "no-target"/);
  assert.match(route, /answers\.q1b === undefined/);
  assert.match(route, /usedCharacterApps && answers\.q3 === undefined/);
  assert.match(route, /if \(!usedCharacterApps\) delete answers\.q3/);
  assert.match(route, /no-target-interested/);
  assert.match(route, /no-target-uninterested/);
  assert.match(route, /firstCharacterRequiredAnswerIds\.some/);
  assert.doesNotMatch(route, /q1c/);
  assert.match(route, /q1h/);
  assert.match(route, /2026-07-30-first-character-discovery-v6/);
});

test("keeps every interested no-target answer on the complete nine-question path", () => {
  assert.deepEqual(noTargetInterestAnswers, [
    "clear-idea",
    "interested-unsure",
    "thought-no-plan",
    "open-to-learn",
  ]);
  assert.deepEqual(firstCharacterQuestionIds, [
    "q1",
    "q1b",
    "q1d",
    "q1e",
    "q1f",
    "q1g",
    "q10",
    "q11",
    "q1h",
  ]);
  assert.deepEqual(firstCharacterRequiredAnswerIds, [
    "q1d",
    "q1e",
    "q1f",
    "q1g",
    "q10",
    "q11",
    "q1h",
  ]);

  for (const answer of noTargetInterestAnswers) {
    assert.deepEqual(getNoTargetQuestionIds(answer), firstCharacterQuestionIds);
  }
  assert.deepEqual(getNoTargetQuestionIds("not-interested"), ["q1", "q1b"]);
});

test("keeps the response dashboard and CSV export behind the Worker admin gate", async () => {
  const [adminPage, exportRoute, worker] = await Promise.all([
    readFile(new URL("app/admin/page.tsx", projectRoot), "utf8"),
    readFile(new URL("app/api/admin/responses.csv/route.ts", projectRoot), "utf8"),
    readFile(new URL("worker/index.ts", projectRoot), "utf8"),
  ]);

  assert.match(adminPage, /export const dynamic = "force-dynamic"/);
  assert.match(adminPage, /export const revalidate = 0/);
  assert.match(adminPage, /robots: \{ index: false, follow: false \}/);
  assert.doesNotMatch(adminPage, /ChatGPT|oai-authenticated-user-email/);

  const protectedExport = exportRoute.slice(exportRoute.indexOf("export async function GET"));
  assert.ok(protectedExport.indexOf("searchParams") < protectedExport.indexOf("ensureSurveySchema"));
  assert.match(exportRoute, /private, no-store, max-age=0, must-revalidate/);
  assert.match(exportRoute, /Vary: "Authorization"/);
  assert.match(exportRoute, /Cross-Origin-Resource-Policy/);
  assert.match(exportRoute, /limit > 5000/);
  assert.doesNotMatch(exportRoute, /Access-Control-Allow-Origin/);

  assert.match(worker, /ADMIN_USERNAME\?: string/);
  assert.match(worker, /ADMIN_PASSWORD\?: string/);
  assert.match(worker, /pathname\.startsWith\(`\$\{prefix\}\/`\)/);
  assert.match(worker, /WWW-Authenticate/);
  assert.match(worker, /Vary: "Authorization"/);
  assert.match(worker, /constantTimeEqual/);
  const fetchHandler = worker.slice(worker.indexOf("async fetch"));
  assert.ok(fetchHandler.indexOf("hasAdminAccess") < fetchHandler.indexOf("handler.fetch"));
});

test("exports Excel-friendly CSV while neutralizing spreadsheet formulas", () => {
  assert.equal(csvCell("=1+1"), '"\'=1+1"');
  assert.equal(csvCell("  +SUM(A1:A2)"), '"\'  +SUM(A1:A2)"');
  assert.equal(csvCell("\t@command"), '"\'\t@command"');
  assert.equal(csvCell('a"b'), '"a""b"');
  assert.equal(csvCell("a\0b"), '"ab"');

  const csv = buildSurveyCsv([
    {
      id: 1,
      responseId: "test-response",
      screenedOut: false,
      contact: "=HYPERLINK(\"https://example.com\")",
      contactConsent: true,
      answersJson: JSON.stringify({
        surveyVersion: "test",
        branch: "no-target-interested",
        answers: { q1: "no-target", q1d: ["other"] },
        otherText: { q1d: "@malicious" },
      }),
      createdAt: "2026-07-30 08:00:00",
    },
  ]);

  assert.ok(csv.startsWith("\uFEFF"));
  assert.match(csv, /"'=HYPERLINK\(""https:\/\/example\.com""\)"/);
  assert.match(csv, /补充：@malicious/);
});

test("includes durable submission, privacy guards, and the legacy URL redirect", async () => {
  const [page, route, schema, wrangler, redirect] = await Promise.all([
    readFile(new URL("app/page.tsx", projectRoot), "utf8"),
    readFile(new URL("app/api/responses/route.ts", projectRoot), "utf8"),
    readFile(new URL("db/schema.ts", projectRoot), "utf8"),
    readFile(new URL("wrangler.jsonc", projectRoot), "utf8"),
    readFile(new URL("index.html", projectRoot), "utf8"),
  ]);

  assert.match(page, /fetch\("\/api\/responses"/);
  assert.doesNotMatch(page, /adultAgeGroups/);
  assert.match(route, /contactConsent/);
  assert.match(route, /mayStoreContact/);
  assert.doesNotMatch(route, /adultAgeGroups/);
  assert.match(route, /mayStoreContact = Boolean\(betaInterest && betaInterest !== "no"\)/);
  assert.match(schema, /surveyResponses/);
  const config = JSON.parse(wrangler);
  assert.equal(config.workers_dev, true);
  assert.equal(config.preview_urls, false);
  assert.equal(config.d1_databases[0].binding, "DB");
  assert.equal(config.d1_databases[0].database_name, "oc-survey-responses");
  assert.match(redirect, /https:\/\/oc-survey\.liuzicheng357\.workers\.dev\//);
});
