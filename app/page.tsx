"use client";

import { useMemo, useState } from "react";
import {
  firstCharacterQuestionIds,
  isNoTargetInterestAnswer,
} from "./survey-flow.mjs";

type Option = {
  id: string;
  label: string;
};

type Answer = string | string[];
type Answers = Record<string, Answer | undefined>;

type QuestionVariant = {
  title?: string;
  description?: string;
  options?: Option[];
  otherPlaceholder?: string;
};

type Question = {
  id: string;
  section: string;
  kind: "single" | "multi";
  title: string;
  description?: string;
  required?: boolean;
  options: Option[];
  max?: number;
  exclusive?: string[];
  otherOptionId?: string;
  otherPlaceholder?: string;
  show?: (answers: Answers) => boolean;
  favoriteVariant?: QuestionVariant;
};

function selectedList(value: Answer | undefined) {
  return Array.isArray(value) ? value : [];
}

const ocPathStatuses = new Set(["one-active", "many-active", "creating"]);
const showForOcPath = (answers: Answers) =>
  typeof answers.q1 === "string" && ocPathStatuses.has(answers.q1);
const showForFavoritePath = (answers: Answers) => answers.q1 === "favorite-only";
const showForMainSurvey = (answers: Answers) =>
  showForOcPath(answers) || showForFavoritePath(answers);
const showForNoTarget = (answers: Answers) => answers.q1 === "no-target";
const showForNoTargetInterest = (answers: Answers) =>
  answers.q1 === "no-target" &&
  isNoTargetInterestAnswer(answers.q1b);
const showStoryFidelity = (answers: Answers) =>
  showForMainSurvey(answers) && selectedList(answers.q7).includes("character-apps");

const mainProgressSteps: Record<string, number> = {
  q1: 1,
  q2: 2,
  q2f: 2,
  q7: 3,
  q3: 4,
  q4: 5,
  q5: 6,
  q6: 7,
  q8: 8,
  q9: 9,
  q10: 10,
  q11: 11,
  q12: 12,
};

const firstCharacterProgressSteps: Record<string, number> = Object.fromEntries(
  firstCharacterQuestionIds.map((id, index) => [id, index + 1]),
);

const questions: Question[] = [
  {
    id: "q1",
    section: "角色现状",
    kind: "single",
    required: true,
    title: "你目前与原创角色（OC）的关系，最接近下面哪一种？",
    description:
      "已经有 OC 的用户请优先选择前两项，即使你也有喜欢的其他角色。",
    options: [
      { id: "one-active", label: "有一个主要 OC" },
      { id: "many-active", label: "有多个 OC" },
      { id: "creating", label: "正在构思自己的第一个 OC" },
      { id: "favorite-only", label: "目前没有 OC，但有一个特别喜欢的虚构角色" },
      { id: "no-target", label: "目前没有 OC，也没有特别喜欢的虚构角色" },
    ],
  },
  {
    id: "q1b",
    section: "角色想法",
    kind: "single",
    required: true,
    title: "你以前有没有想过，创作一个属于自己的原创角色（OC）？",
    description: "不需要现在就有完整设定，只要选择最接近你目前想法的一项。",
    options: [
      { id: "clear-idea", label: "想过，而且已经有一些模糊想法" },
      { id: "interested-unsure", label: "有兴趣，但不知道该从哪里开始" },
      { id: "thought-no-plan", label: "偶尔想过，不过目前没有计划" },
      { id: "open-to-learn", label: "以前没想过，但愿意了解看看" },
      { id: "not-interested", label: "暂时完全没有兴趣" },
    ],
    show: showForNoTarget,
  },
  {
    id: "q1d",
    section: "工具帮助",
    kind: "multi",
    required: true,
    max: 2,
    title: "如果有一个平台或工具可以帮你完成第一版角色设定，你最希望它提供哪些帮助？",
    description: "这只是假设；即使现在还没有具体想法，也可以想象自己第一次尝试时会需要什么帮助。最多选择 2 项。",
    options: [
      { id: "summary", label: "根据我的几句话整理成一份角色资料" },
      { id: "voice", label: "提供性格和说话方式的方案" },
      { id: "background", label: "帮助补充背景经历" },
      { id: "relationships", label: "帮助建立人物关系或世界观" },
      { id: "variants", label: "提供几个不同版本让我选择和修改" },
      { id: "self-only", label: "我更想完全自己设计，不需要工具生成" },
      { id: "other", label: "其他（请填写）" },
    ],
    exclusive: ["self-only"],
    otherOptionId: "other",
    otherPlaceholder: "你还希望工具提供什么帮助？",
    show: showForNoTargetInterest,
  },
  {
    id: "q1e",
    section: "互动想象",
    kind: "multi",
    required: true,
    max: 2,
    title: "角色有了初步设定后，哪些体验最能让你想继续认识或完善 TA？",
    description: "最多选择 2 项。",
    options: [
      { id: "conversation", label: "可以直接与 TA 对话" },
      { id: "memory", label: "TA 能记住以前与你的互动" },
      { id: "story", label: "你和 TA 可以一起进入一段故事" },
      { id: "characters", label: "TA 可以与其他角色共同经历剧情" },
      { id: "choices", label: "TA 会根据不同选择展现新的反应" },
      { id: "none", label: "暂时都不感兴趣" },
      { id: "other", label: "其他（请填写）" },
    ],
    exclusive: ["none"],
    otherOptionId: "other",
    otherPlaceholder: "还有什么体验会吸引你？",
    show: showForNoTargetInterest,
  },
  {
    id: "q1f",
    section: "尝试条件",
    kind: "multi",
    required: true,
    max: 3,
    title: "哪些条件会让你更愿意尝试这种从零塑造并与角色互动的工具？",
    description: "最多选择 3 项。",
    options: [
      { id: "guided", label: "有简单的问题或模板一步步引导" },
      { id: "editable", label: "提供多个版本，并且可以随时修改或删除" },
      { id: "draft-only", label: "生成内容默认只是草稿，不会自动成为正式设定" },
      { id: "no-reuse", label: "我的创作想法和互动记录不会未经同意另作他用" },
      { id: "demo", label: "可以先看示例或进行一次短体验" },
      { id: "never", label: "即使满足这些条件，我也不会愿意尝试" },
      { id: "other", label: "其他（请填写）" },
    ],
    exclusive: ["never"],
    otherOptionId: "other",
    otherPlaceholder: "请补充你需要的条件",
    show: showForNoTargetInterest,
  },
  {
    id: "q1g",
    section: "AI 顾虑",
    kind: "multi",
    required: true,
    max: 2,
    title: "知道前面提到的性格、背景、对话和故事功能可能由 AI 参与实现后，你最担心什么？",
    description: "最多选择 2 项。",
    options: [
      { id: "generic", label: "生成的角色太普通或缺少个人特色" },
      { id: "too-much", label: "AI 替我决定太多，角色不再像是我创作的" },
      { id: "lose-control", label: "角色设定或故事走向逐渐失去控制" },
      { id: "data-use", label: "我的创作想法或角色资料被用于其他用途" },
      { id: "ai-discomfort", label: "我对使用 AI 塑造角色这件事本身感到不舒服" },
      { id: "no-concern", label: "暂时没有明显顾虑" },
      { id: "other", label: "其他（请填写）" },
    ],
    exclusive: ["no-concern"],
    otherOptionId: "other",
    otherPlaceholder: "请补充你担心的问题",
    show: showForNoTargetInterest,
  },
  {
    id: "q2",
    section: "角色投入",
    kind: "multi",
    required: true,
    title: "过去半年，你为自己的 OC 做过哪些事情？",
    description: "可以多选。请继续以刚才想到的那个 OC 为准。",
    options: [
      { id: "settings", label: "完善人物设定、人物关系或世界观" },
      { id: "visual", label: "画图、约稿、捏人或建模" },
      { id: "writing", label: "写人物故事、同人文或角色小传" },
      { id: "roleplay", label: "参加语 C、对戏、跑团或角色扮演" },
      { id: "sharing", label: "发布作品，或与别人交流角色设定" },
      { id: "head-only", label: "暂时只在脑内构思，没有进行以上活动" },
      { id: "other", label: "其他（请填写）" },
    ],
    exclusive: ["head-only"],
    otherOptionId: "other",
    otherPlaceholder: "请补充你为 OC 做过的事情",
    show: showForOcPath,
  },
  {
    id: "q2f",
    section: "角色投入",
    kind: "multi",
    required: true,
    title: "过去半年，你通常通过哪些方式关注或参与自己喜欢的角色相关内容？",
    description: "可以多选。请以你最喜欢或最熟悉的那个角色为准。",
    options: [
      { id: "source", label: "观看或重温角色所在的作品或剧情" },
      { id: "fanworks", label: "浏览、收藏相关同人作品" },
      { id: "creation", label: "画图、写文、剪辑或进行其他二创" },
      { id: "merchandise", label: "购买周边或相关委托" },
      { id: "community", label: "加入社群、参与讨论或角色互动" },
      { id: "favorite-passive", label: "过去半年主要只是喜欢 TA，没有进行以上活动" },
      { id: "other", label: "其他（请填写）" },
    ],
    exclusive: ["favorite-passive"],
    otherOptionId: "other",
    otherPlaceholder: "请补充你围绕这个角色做过的事情",
    show: showForFavoritePath,
  },
  {
    id: "q7",
    section: "使用习惯",
    kind: "multi",
    required: true,
    title: "过去半年，你使用过哪些与 OC、同人或角色互动有关的平台或工具？",
    description: "可以多选。括号内只是举例，不需要每个都用过。",
    options: [
      { id: "communities", label: "社群（如 QQ 群、微信群、Discord）" },
      { id: "content", label: "内容平台（如微博、LOFTER、小红书、B站）" },
      { id: "character-tools", label: "OC／角色资料卡、设定管理或捏人工具（如 Notion、捏咔、Picrew）" },
      { id: "creative-tools", label: "绘画、写作、音视频、动画或建模工具（如画世界、Procreate、MediBang、剪映）" },
      { id: "character-apps", label: "角色聊天、陪伴或互动剧情类应用（如猫箱、星野、Character.AI、SillyTavern）" },
      { id: "none", label: "没有固定使用的平台或工具" },
      { id: "other", label: "其他或想补充具体名称（请填写）" },
    ],
    exclusive: ["none"],
    otherOptionId: "other",
    otherPlaceholder: "请填写平台、应用或工具名称",
    show: showForMainSurvey,
  },
  {
    id: "q3",
    section: "角色呈现",
    kind: "multi",
    required: true,
    max: 2,
    title: "当你的 OC 出现在新的互动或故事中时，你最在意哪些方面被准确呈现？",
    description: "最多选择 2 项。",
    options: [
      { id: "voice", label: "说话时的语气和用词" },
      { id: "values", label: "性格与价值观" },
      { id: "decisions", label: "做决定或处理冲突的方式" },
      { id: "relationships", label: "与其他角色之间的关系" },
      { id: "canon", label: "已有经历和世界观设定" },
      { id: "appearance", label: "外形与标志性细节" },
      { id: "other", label: "其他（请填写）" },
    ],
    otherOptionId: "other",
    otherPlaceholder: "还有哪些方面需要被准确呈现？",
    show: showStoryFidelity,
    favoriteVariant: {
      title: "当你喜欢的角色出现在原作之外的新互动或故事中时，你最在意哪些方面贴合原作？",
      otherPlaceholder: "还有哪些方面需要贴合原作？",
    },
  },
  {
    id: "q4",
    section: "互动想象",
    kind: "multi",
    required: true,
    max: 2,
    title: "如果有一种新的角色互动方式，下面哪些体验最吸引你？",
    description: "先只考虑体验本身，不用考虑它如何实现。最多选择 2 项。",
    options: [
      { id: "conversation", label: "TA 可以主动与你对话" },
      { id: "memory", label: "TA 能记住以前的对话或共同经历" },
      { id: "ongoing-story", label: "TA 可以进入一个会持续推进的故事" },
      { id: "characters-together", label: "TA 可以与其他角色共同经历剧情" },
      { id: "invited-people", label: "可以让你指定的人与 TA 互动或体验故事" },
      { id: "none", label: "暂时都不感兴趣" },
      { id: "other", label: "其他（请填写）" },
    ],
    exclusive: ["none"],
    otherOptionId: "other",
    otherPlaceholder: "请写下更吸引你的角色体验",
    show: showForMainSurvey,
  },
  {
    id: "q5",
    section: "互动边界",
    kind: "single",
    required: true,
    title: "假设互动过程中，工具为 OC 补充了你没有事先写好的台词或行动，你更希望它做到什么程度？",
    options: [
      { id: "free", label: "只要符合设定，可以让 TA 自然发挥" },
      { id: "confirm-key", label: "可以补充，但关键内容需要先由我确认" },
      { id: "small-details", label: "只接受日常台词或不影响剧情的小细节" },
      { id: "within-outline", label: "只能按照我提供的剧情框架进行补充" },
      { id: "need-demo", label: "还不确定，需要先看实际效果" },
      { id: "reject", label: "不接受工具替我的 OC 新增台词或行动" },
      { id: "other", label: "其他（请填写）" },
    ],
    otherOptionId: "other",
    otherPlaceholder: "请说明你能接受的边界",
    show: showForMainSurvey,
    favoriteVariant: {
      title: "假设互动过程中，工具为你喜欢的角色补充了原作中没有的台词或行动，你更希望它做到什么程度？",
      options: [
        { id: "free", label: "只要符合原作设定，可以让 TA 自然发挥" },
        { id: "confirm-key", label: "可以补充，但关键内容需要先由我确认" },
        { id: "small-details", label: "只接受日常台词或不影响剧情的小细节" },
        { id: "within-outline", label: "只能按照我提供的剧情框架进行补充" },
        { id: "need-demo", label: "还不确定，需要先看实际效果" },
        { id: "reject", label: "不接受工具替这个角色新增台词或行动" },
        { id: "other", label: "其他（请填写）" },
      ],
    },
  },
  {
    id: "q6",
    section: "尝试条件",
    kind: "multi",
    required: true,
    max: 3,
    title: "哪些条件会明显提高你尝试这种角色互动方式的意愿？",
    description: "最多选择 3 项。",
    options: [
      { id: "accurate", label: "角色的性格、语言和行为足够符合设定" },
      { id: "editable", label: "我可以随时修改、删除或重新生成内容" },
      { id: "not-canon", label: "新增内容默认不算角色的正式经历或正史" },
      { id: "private", label: "内容可以完全私密，分享范围由我决定" },
      { id: "no-reuse", label: "角色资料和互动记录不会未经同意另作他用" },
      { id: "never", label: "即使满足这些条件，我也不会愿意尝试" },
      { id: "other", label: "其他（请填写）" },
    ],
    exclusive: ["never"],
    otherOptionId: "other",
    otherPlaceholder: "请补充你需要的条件",
    show: showForMainSurvey,
    favoriteVariant: {
      options: [
        { id: "accurate", label: "角色的性格、语言和行为足够符合原作设定" },
        { id: "editable", label: "我可以随时修改、删除或重新生成内容" },
        { id: "not-canon", label: "新增内容明确只是非官方演绎，不会改变原作" },
        { id: "private", label: "内容可以完全私密，分享范围由我决定" },
        { id: "no-reuse", label: "角色资料和互动记录不会未经同意另作他用" },
        { id: "never", label: "即使满足这些条件，我也不会愿意尝试" },
        { id: "other", label: "其他（请填写）" },
      ],
    },
  },
  {
    id: "q8",
    section: "AI 使用经验",
    kind: "single",
    required: true,
    title: "你是否使用过 AI 工具，生成或辅助创作与你的 OC 有关的内容？",
    description:
      "包括角色对话、故事、设定、图片等；只考虑与你的 OC 相关的使用经历。",
    options: [
      { id: "advanced", label: "经常使用，也会调整提示词、角色卡或参数，让结果更贴近我的 OC 设定" },
      { id: "regular", label: "使用过多次，主要直接使用现成功能" },
      { id: "occasional", label: "偶尔尝试过一两次" },
      { id: "tried-stopped", label: "尝试过，但结果不符合 OC 设定，所以没有继续" },
      { id: "never-open", label: "从未尝试，但愿意先了解或看看效果" },
      { id: "avoid", label: "从未尝试，也不愿意用 AI 处理与我的 OC 有关的内容" },
      { id: "other", label: "其他（请填写）" },
    ],
    otherOptionId: "other",
    otherPlaceholder: "请简单说明你用 AI 处理 OC 内容的经历",
    show: showForMainSurvey,
    favoriteVariant: {
      title: "你是否使用过 AI 工具，生成或辅助创作与你喜欢的这个角色有关的内容？",
      description: "包括角色对话、故事、图片等；只考虑与这个角色相关的使用经历。",
      options: [
        { id: "advanced", label: "经常使用，也会调整提示词、角色卡或参数，让结果更贴近原作中的角色" },
        { id: "regular", label: "使用过多次，主要直接使用现成功能" },
        { id: "occasional", label: "偶尔尝试过一两次" },
        { id: "tried-stopped", label: "尝试过，但结果不像原作中的 TA，所以没有继续" },
        { id: "never-open", label: "从未尝试，但愿意先了解或看看效果" },
        { id: "avoid", label: "从未尝试，也不愿意用 AI 生成与这个角色有关的内容" },
        { id: "other", label: "其他（请填写）" },
      ],
      otherPlaceholder: "请简单说明你用 AI 处理这个角色相关内容的经历",
    },
  },
  {
    id: "q9",
    section: "你的态度",
    kind: "single",
    required: true,
    title: "知道前面描述的功能可能由 AI 参与实现后，你的尝试意愿有什么变化？",
    options: [
      { id: "more", label: "比之前更想尝试" },
      { id: "same", label: "基本没有变化，仍然愿意尝试" },
      { id: "conditional", label: "仍有兴趣，但需要先确认还原度和控制权" },
      { id: "assist-only", label: "只接受 AI 辅助整理或提供灵感，最终内容由我决定" },
      { id: "less", label: "意愿有所下降，但看过实际效果后也许会尝试" },
      { id: "reject", label: "不愿意让 AI 参与我的 OC" },
      { id: "other", label: "其他（请填写）" },
    ],
    otherOptionId: "other",
    otherPlaceholder: "请写下你的真实看法",
    show: showForMainSurvey,
    favoriteVariant: {
      options: [
        { id: "more", label: "比之前更想尝试" },
        { id: "same", label: "基本没有变化，仍然愿意尝试" },
        { id: "conditional", label: "仍有兴趣，但需要先确认还原度和控制权" },
        { id: "assist-only", label: "只接受 AI 辅助整理或提供灵感，最终内容由我决定" },
        { id: "less", label: "意愿有所下降，但看过实际效果后也许会尝试" },
        { id: "reject", label: "不愿意让 AI 参与这个角色的互动内容" },
        { id: "other", label: "其他（请填写）" },
      ],
    },
  },
  {
    id: "q10",
    section: "基本信息",
    kind: "single",
    required: true,
    title: "你的年龄范围是？",
    options: [
      { id: "15-under", label: "15 岁及以下" },
      { id: "16-17", label: "16–17 岁" },
      { id: "18-22", label: "18–22 岁" },
      { id: "23-27", label: "23–27 岁" },
      { id: "28-plus", label: "28 岁及以上" },
      { id: "private", label: "不方便透露" },
    ],
    show: (answers) => showForMainSurvey(answers) || showForNoTargetInterest(answers),
  },
  {
    id: "q11",
    section: "基本信息",
    kind: "single",
    required: true,
    title: "过去三个月，你平均每月在相关爱好上的花费大约是？",
    description: "包括 OC、同人、动漫、游戏、约稿、周边或创作工具等现有花费；这不是在询问产品付费意愿。",
    options: [
      { id: "zero", label: "基本没有花费" },
      { id: "1-49", label: "1–49 元" },
      { id: "50-199", label: "50–199 元" },
      { id: "200-499", label: "200–499 元" },
      { id: "500-999", label: "500–999 元" },
      { id: "1000-plus", label: "1000 元及以上" },
      { id: "private", label: "不方便透露" },
    ],
    show: (answers) => showForMainSurvey(answers) || showForNoTargetInterest(answers),
  },
  {
    id: "q12",
    section: "测试邀请",
    kind: "single",
    required: true,
    title: "如果后续有一次约 30–45 分钟的原型体验，需要你带着自己的 OC 完成几项任务并提供反馈，你愿意参与到什么程度？",
    options: [
      { id: "multi-round", label: "愿意参加多轮测试，并提供详细反馈" },
      { id: "full-once", label: "愿意参加一次完整测试，并认真反馈" },
      { id: "short-first", label: "愿意先参加一次短体验，再决定是否继续" },
      { id: "details-first", label: "想先了解测试内容和时间安排" },
      { id: "no", label: "暂时不考虑参加" },
      { id: "other", label: "其他安排（请填写）" },
    ],
    otherOptionId: "other",
    otherPlaceholder: "请说明你更合适的参与方式",
    show: showForMainSurvey,
    favoriteVariant: {
      title: "如果后续有一次约 30–45 分钟的原型体验，需要你围绕一个喜欢的虚构角色完成几项任务并提供反馈，你愿意参与到什么程度？",
    },
  },
  {
    id: "q1h",
    section: "测试邀请",
    kind: "single",
    required: true,
    title: "如果后续有一次约 30–45 分钟的原型体验，让你从零塑造第一个角色，并尝试与 TA 对话或进入故事，你愿意参与到什么程度？",
    options: [
      { id: "multi-round", label: "愿意参加多轮测试，并提供详细反馈" },
      { id: "full-once", label: "愿意参加一次完整测试，并认真反馈" },
      { id: "short-first", label: "愿意先进行一次短体验" },
      { id: "details-first", label: "想先了解具体内容和时间安排" },
      { id: "no", label: "暂时不考虑参加" },
      { id: "other", label: "其他安排（请填写）" },
    ],
    otherOptionId: "other",
    otherPlaceholder: "请说明你更合适的参与方式",
    show: showForNoTargetInterest,
  },
];

function optionIsSelected(question: Question, answer: Answer | undefined, optionId: string) {
  return question.kind === "multi"
    ? selectedList(answer).includes(optionId)
    : answer === optionId;
}

export default function SurveyPage() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [otherText, setOtherText] = useState<Record<string, string>>({});
  const [contact, setContact] = useState("");
  const [contactConsent, setContactConsent] = useState(false);
  const [submissionToken, setSubmissionToken] = useState("");
  const [responseCode, setResponseCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const visibleQuestions = useMemo(
    () =>
      questions
        .filter((item) => !item.show || item.show(answers))
        .map((item) =>
          answers.q1 === "favorite-only" && item.favoriteVariant
            ? { ...item, ...item.favoriteVariant }
            : item,
        ),
    [answers],
  );

  const question = visibleQuestions[index] ?? visibleQuestions[visibleQuestions.length - 1];
  const noTargetPath = answers.q1 === "no-target";
  const noTargetInterested = showForNoTargetInterest(answers);
  const screenedOut = noTargetPath && answers.q1b === "not-interested";
  const progressTotal = noTargetPath
    ? screenedOut
      ? 2
      : firstCharacterQuestionIds.length
    : 12;
  const activeProgressSteps = noTargetPath
    ? firstCharacterProgressSteps
    : mainProgressSteps;
  const progress = ((activeProgressSteps[question.id] ?? index + 1) / progressTotal) * 100;
  const contactInterest =
    typeof answers.q12 === "string"
      ? answers.q12
      : typeof answers.q1h === "string"
        ? answers.q1h
        : "";
  const canCollectContact = Boolean(contactInterest && contactInterest !== "no");

  function beginSurvey() {
    setSubmissionToken(crypto.randomUUID());
    setStarted(true);
  }

  function chooseSingle(id: string, value: string) {
    if (id === "q1") {
      setAnswers({ q1: value });
      setOtherText({});
      setContact("");
      setContactConsent(false);
      setIndex(0);
    } else if (id === "q1b" && value === "not-interested") {
      setAnswers((current) => ({ q1: current.q1, q1b: value }));
      setOtherText({});
      setContact("");
      setContactConsent(false);
      setIndex(1);
    } else {
      setAnswers((current) => ({ ...current, [id]: value }));
    }

    if ((id === "q12" || id === "q1h") && value === "no") {
      setContact("");
      setContactConsent(false);
    }

    if (question.otherOptionId && value !== question.otherOptionId) {
      setOtherText((current) => ({ ...current, [id]: "" }));
    }
    setError("");
  }

  function toggleMulti(questionItem: Question, value: string) {
    const current = selectedList(answers[questionItem.id]);
    const exclusive = questionItem.exclusive ?? [];
    let next: string[];

    if (exclusive.includes(value)) {
      next = current.includes(value) ? [] : [value];
    } else {
      const withoutExclusive = current.filter((item) => !exclusive.includes(item));
      next = withoutExclusive.includes(value)
        ? withoutExclusive.filter((item) => item !== value)
        : [...withoutExclusive, value];

      if (questionItem.max && next.length > questionItem.max) {
        setError(`这道题最多选择 ${questionItem.max} 项。`);
        return;
      }
    }

    if (questionItem.otherOptionId && !next.includes(questionItem.otherOptionId)) {
      setOtherText((all) => ({ ...all, [questionItem.id]: "" }));
    }

    setAnswers((all) => {
      const updated = { ...all, [questionItem.id]: next };
      if (questionItem.id === "q7" && !next.includes("character-apps")) {
        delete updated.q3;
      }
      return updated;
    });
    if (questionItem.id === "q7" && !next.includes("character-apps")) {
      setOtherText((all) => ({ ...all, q3: "" }));
    }
    setError("");
  }

  function validateCurrent() {
    const value = answers[question.id];

    if (question.required) {
      if (question.kind === "multi" && selectedList(value).length === 0) {
        setError("请至少选择一项。 ");
        return false;
      }

      if (question.kind === "single" && (typeof value !== "string" || !value)) {
        setError("请选择一个最符合你的选项。 ");
        return false;
      }
    }

    if (
      question.otherOptionId &&
      optionIsSelected(question, value, question.otherOptionId) &&
      !otherText[question.id]?.trim()
    ) {
      setError("你选择了“其他”，请补充一点说明。 ");
      return false;
    }

    if (
      (question.id === "q12" || question.id === "q1h") &&
      contact.trim() &&
      !contactConsent
    ) {
      setError("留下联系方式前，请确认它只用于后续体验邀请和反馈跟进。 ");
      return false;
    }

    return true;
  }

  async function submitSurvey() {
    setSubmitting(true);
    setError("");

    const visibleIds = new Set(visibleQuestions.map((item) => item.id));
    const cleanedAnswers = Object.fromEntries(
      Object.entries(answers).filter(([id]) => visibleIds.has(id)),
    );
    const cleanedOtherText = Object.fromEntries(
      Object.entries(otherText)
        .filter(([id, value]) => visibleIds.has(id) && value.trim())
        .map(([id, value]) => [id, value.trim()]),
    );

    try {
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          submissionToken,
          answers: cleanedAnswers,
          otherText: cleanedOtherText,
          contact: canCollectContact ? contact.trim() : "",
          contactConsent: canCollectContact && contact.trim() ? contactConsent : false,
        }),
      });

      const payload = (await response.json()) as { responseId?: string; error?: string };
      if (!response.ok || !payload.responseId) {
        throw new Error(payload.error || "提交失败，请稍后重试。");
      }

      setResponseCode(payload.responseId.slice(0, 8).toUpperCase());
      setFinished(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "提交没有成功，请检查网络后再试一次。",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function next() {
    if (!validateCurrent()) return;

    if (question.id === "q1" && answers.q1 === "no-target") {
      setIndex(1);
      setError("");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (index >= visibleQuestions.length - 1) {
      await submitSurvey();
      return;
    }

    setIndex((value) => value + 1);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function previous() {
    setIndex((value) => Math.max(0, value - 1));
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    setAnswers({});
    setOtherText({});
    setContact("");
    setContactConsent(false);
    setSubmissionToken("");
    setResponseCode("");
    setFinished(false);
    setStarted(false);
    setIndex(0);
    setError("");
  }

  if (!started) {
    return (
      <main className="survey-shell intro-shell">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <section className="intro-panel">
          <div className="eyebrow">OC FIELD STUDY · 01</div>
          <p className="chapter-mark" aria-hidden="true">OC</p>
          <h1>关于原创角色与<br />互动方式的小调查</h1>
          <p className="intro-copy">
            我们想了解大家平时如何创作、关注和陪伴自己在意的角色，
            以及对新型角色互动方式的看法。没有标准答案，请按真实想法作答。
          </p>
          <div className="intro-meta" aria-label="问卷信息">
            <span>约 4 分钟</span>
            <span>最多 12 题</span>
            <span>联系方式选填</span>
          </div>
          <p className="privacy-note">
            除最后自愿填写的联系方式外，本问卷不收集姓名。任何年龄都可以自行决定是否留下联系方式，
            仅用于后续体验邀请和反馈跟进，不用于广告。开始填写即表示你同意按上述用途记录答案。
          </p>
          <button className="primary-button start-button" onClick={beginSurvey}>
            开始填写 <span aria-hidden="true">→</span>
          </button>
        </section>
      </main>
    );
  }

  if (finished) {
    return (
      <main className="survey-shell finish-shell">
        <section className="finish-panel">
          <div className="finish-symbol" aria-hidden="true">✓</div>
          <div className="eyebrow">回答已记录</div>
          {screenedOut ? (
            <>
              <h1>谢谢你的关注</h1>
              <p>
                你关于是否想过创作自己角色的回答已经记录，这次问卷先到这里。
              </p>
            </>
          ) : noTargetInterested ? (
            <>
              <h1>谢谢你认真想象<br />自己的第一个角色</h1>
              <p>
                你对角色塑造、互动方式和 AI 参与边界的想法已经记录。
                如果你留下了联系方式，我们只会为后续体验邀请或反馈跟进与你联系。
              </p>
            </>
          ) : (
            <>
              <h1>谢谢你的<br />真实回答</h1>
              <p>
                无论你对 AI 持欢迎、谨慎还是拒绝态度，你的真实看法都对我们有帮助。
                如果你留下了联系方式，我们只会为后续体验邀请或反馈跟进与你联系。
              </p>
            </>
          )}
          {responseCode && (
            <div className="response-card">
              <span>答卷编号</span>
              <strong>{responseCode}</strong>
            </div>
          )}
          <button className="secondary-button" onClick={restart}>重新填写</button>
        </section>
      </main>
    );
  }

  const isOtherSelected = Boolean(
    question.otherOptionId &&
      optionIsSelected(question, answers[question.id], question.otherOptionId),
  );

  return (
    <main className="survey-shell">
      <header className="topbar">
        <div className="brand">OC / FIELD NOTES</div>
        <div className="step-count">第 {String(index + 1).padStart(2, "0")} 题</div>
      </header>

      <div
        className="progress-track"
        role="progressbar"
        aria-label="填写进度"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <section className="question-panel" key={question.id}>
        <div className="section-label">{question.section}</div>
        <h1>{question.title}{question.required && <sup>*</sup>}</h1>
        {question.description && <p className="question-description">{question.description}</p>}

        <fieldset className="options-fieldset">
          <legend className="sr-only">{question.title}</legend>
          <div className="options">
            {question.options.map((option) => {
              const checked = optionIsSelected(
                question,
                answers[question.id],
                option.id,
              );
              return (
                <label className={`option ${checked ? "selected" : ""}`} key={option.id}>
                  <input
                    type={question.kind === "multi" ? "checkbox" : "radio"}
                    name={question.id}
                    checked={checked}
                    onChange={() =>
                      question.kind === "multi"
                        ? toggleMulti(question, option.id)
                        : chooseSingle(question.id, option.id)
                    }
                  />
                  <span
                    className={`choice-mark ${question.kind === "multi" ? "square" : ""}`}
                    aria-hidden="true"
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {isOtherSelected && (
          <label className="other-field">
            <span>请补充说明</span>
            <input
              autoFocus
              type="text"
              value={otherText[question.id] ?? ""}
              placeholder={question.otherPlaceholder}
              onChange={(event) => {
                setOtherText((current) => ({
                  ...current,
                  [question.id]: event.target.value,
                }));
                setError("");
              }}
            />
          </label>
        )}

        {(question.id === "q12" || question.id === "q1h") && canCollectContact && (
          <div className="contact-panel">
            <div className="contact-heading">
              <span>选填</span>
              <strong>接受后续联系</strong>
            </div>
            <p>可留下 QQ、微信、邮箱、Discord 或其他方便联系的方式，用于后续体验邀请和反馈跟进。</p>
            <input
              className="contact-input"
              type="text"
              value={contact}
              placeholder="联系方式类型 + 账号"
              onChange={(event) => {
                setContact(event.target.value);
                if (!event.target.value.trim()) setContactConsent(false);
                setError("");
              }}
            />
            {contact.trim() && (
              <label className="consent-row">
                <input
                  type="checkbox"
                  checked={contactConsent}
                  onChange={(event) => {
                    setContactConsent(event.target.checked);
                    setError("");
                  }}
                />
                <span>我同意该联系方式仅用于后续体验邀请和反馈跟进，不用于广告或其他用途。</span>
              </label>
            )}
          </div>
        )}

        <div className={`error-message ${error ? "visible" : ""}`} role="alert">
          {error || "占位"}
        </div>

        <footer className="question-actions">
          <button className="back-button" onClick={previous} disabled={index === 0 || submitting}>
            ← 上一题
          </button>
          <button className="primary-button" onClick={next} disabled={submitting}>
            {submitting
              ? "正在提交…"
              : question.id === "q1b" && typeof answers.q1b !== "string"
                ? "下一题"
              : index === visibleQuestions.length - 1
                ? screenedOut
                  ? "完成"
                  : "提交问卷"
                : "下一题"}
            {!submitting && <span aria-hidden="true">→</span>}
          </button>
        </footer>
      </section>
    </main>
  );
}
