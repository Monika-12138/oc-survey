export const surveyQuestionDictionary = Object.freeze({
  q1: {
    title: "角色现状",
    options: {
      "one-active": "有一个主要 OC",
      "many-active": "有多个 OC",
      creating: "正在构思自己的第一个 OC",
      "favorite-only": "目前没有 OC，但有一个特别喜欢的虚构角色",
      "no-target": "目前没有 OC，也没有特别喜欢的虚构角色",
    },
  },
  q1b: {
    title: "创作 OC 的意愿",
    options: {
      "clear-idea": "想过，而且已经有一些模糊想法",
      "interested-unsure": "有兴趣，但不知道该从哪里开始",
      "thought-no-plan": "偶尔想过，不过目前没有计划",
      "open-to-learn": "以前没想过，但愿意了解看看",
      "not-interested": "暂时完全没有兴趣",
    },
  },
  q1d: {
    title: "首版角色设定帮助",
    options: {
      summary: "根据我的几句话整理成一份角色资料",
      voice: "提供性格和说话方式的方案",
      background: "帮助补充背景经历",
      relationships: "帮助建立人物关系或世界观",
      variants: "提供几个不同版本让我选择和修改",
      "self-only": "我更想完全自己设计，不需要工具生成",
      other: "其他（请填写）",
    },
  },
  q1e: {
    title: "初步角色互动兴趣",
    options: {
      conversation: "可以直接与 TA 对话",
      memory: "TA 能记住以前与你的互动",
      story: "你和 TA 可以一起进入一段故事",
      characters: "TA 可以与其他角色共同经历剧情",
      choices: "TA 会根据不同选择展现新的反应",
      none: "暂时都不感兴趣",
      other: "其他（请填写）",
    },
  },
  q1f: {
    title: "从零塑造角色的尝试条件",
    options: {
      guided: "有简单的问题或模板一步步引导",
      editable: "提供多个版本，并且可以随时修改或删除",
      "draft-only": "生成内容默认只是草稿，不会自动成为正式设定",
      "no-reuse": "我的创作想法和互动记录不会未经同意另作他用",
      demo: "可以先看示例或进行一次短体验",
      never: "即使满足这些条件，我也不会愿意尝试",
      other: "其他（请填写）",
    },
  },
  q1g: {
    title: "AI 塑造角色的顾虑",
    options: {
      generic: "生成的角色太普通或缺少个人特色",
      "too-much": "AI 替我决定太多，角色不再像是我创作的",
      "lose-control": "角色设定或故事走向逐渐失去控制",
      "data-use": "我的创作想法或角色资料被用于其他用途",
      "ai-discomfort": "我对使用 AI 塑造角色这件事本身感到不舒服",
      "no-concern": "暂时没有明显顾虑",
      other: "其他（请填写）",
    },
  },
  q2: {
    title: "OC 投入行为",
    options: {
      settings: "完善人物设定、人物关系或世界观",
      visual: "画图、约稿、捏人或建模",
      writing: "写人物故事、同人文或角色小传",
      roleplay: "参加语 C、对戏、跑团或角色扮演",
      sharing: "发布作品，或与别人交流角色设定",
      "head-only": "暂时只在脑内构思，没有进行以上活动",
      other: "其他（请填写）",
    },
  },
  q2f: {
    title: "喜欢角色的参与行为",
    options: {
      source: "观看或重温角色所在的作品或剧情",
      fanworks: "浏览、收藏相关同人作品",
      creation: "画图、写文、剪辑或进行其他二创",
      merchandise: "购买周边或相关委托",
      community: "加入社群、参与讨论或角色互动",
      "favorite-passive": "过去半年主要只是喜欢 TA，没有进行以上活动",
      other: "其他（请填写）",
    },
  },
  q7: {
    title: "常用平台与工具",
    options: {
      communities: "社群（如 QQ 群、微信群、Discord）",
      content: "内容平台（如微博、LOFTER、小红书、B站）",
      "character-tools": "OC／角色资料卡、设定管理或捏人工具（如 Notion、捏咔、Picrew）",
      "creative-tools": "绘画、写作、音视频、动画或建模工具（如画世界、Procreate、MediBang、剪映）",
      "character-apps": "角色聊天、陪伴或互动剧情类应用（如猫箱、星野、Character.AI、SillyTavern）",
      none: "没有固定使用的平台或工具",
      other: "其他或想补充具体名称（请填写）",
    },
  },
  q3: {
    title: "OC 呈现重点",
    favoriteTitle: "喜欢角色的原作贴合重点",
    options: {
      voice: "说话时的语气和用词",
      values: "性格与价值观",
      decisions: "做决定或处理冲突的方式",
      relationships: "与其他角色之间的关系",
      canon: "已有经历和世界观设定",
      appearance: "外形与标志性细节",
      other: "其他（请填写）",
    },
  },
  q4: {
    title: "角色互动体验兴趣",
    options: {
      conversation: "TA 可以主动与你对话",
      memory: "TA 能记住以前的对话或共同经历",
      "ongoing-story": "TA 可以进入一个会持续推进的故事",
      "characters-together": "TA 可以与其他角色共同经历剧情",
      "invited-people": "可以让你指定的人与 TA 互动或体验故事",
      none: "暂时都不感兴趣",
      other: "其他（请填写）",
    },
  },
  q5: {
    title: "OC 新增内容边界",
    favoriteTitle: "喜欢角色的新增内容边界",
    options: {
      free: "只要符合设定，可以让 TA 自然发挥",
      "confirm-key": "可以补充，但关键内容需要先由我确认",
      "small-details": "只接受日常台词或不影响剧情的小细节",
      "within-outline": "只能按照我提供的剧情框架进行补充",
      "need-demo": "还不确定，需要先看实际效果",
      reject: "不接受工具替我的 OC 新增台词或行动",
      other: "其他（请填写）",
    },
    favoriteOptions: {
      free: "只要符合原作设定，可以让 TA 自然发挥",
      "confirm-key": "可以补充，但关键内容需要先由我确认",
      "small-details": "只接受日常台词或不影响剧情的小细节",
      "within-outline": "只能按照我提供的剧情框架进行补充",
      "need-demo": "还不确定，需要先看实际效果",
      reject: "不接受工具替这个角色新增台词或行动",
      other: "其他（请填写）",
    },
  },
  q6: {
    title: "OC 互动尝试条件",
    favoriteTitle: "喜欢角色互动的尝试条件",
    options: {
      accurate: "角色的性格、语言和行为足够符合设定",
      editable: "我可以随时修改、删除或重新生成内容",
      "not-canon": "新增内容默认不算角色的正式经历或正史",
      private: "内容可以完全私密，分享范围由我决定",
      "no-reuse": "角色资料和互动记录不会未经同意另作他用",
      never: "即使满足这些条件，我也不会愿意尝试",
      other: "其他（请填写）",
    },
    favoriteOptions: {
      accurate: "角色的性格、语言和行为足够符合原作设定",
      editable: "我可以随时修改、删除或重新生成内容",
      "not-canon": "新增内容明确只是非官方演绎，不会改变原作",
      private: "内容可以完全私密，分享范围由我决定",
      "no-reuse": "角色资料和互动记录不会未经同意另作他用",
      never: "即使满足这些条件，我也不会愿意尝试",
      other: "其他（请填写）",
    },
  },
  q8: {
    title: "OC 相关 AI 使用经验",
    favoriteTitle: "喜欢角色相关 AI 使用经验",
    options: {
      advanced: "经常使用，也会调整提示词、角色卡或参数，让结果更贴近我的 OC 设定",
      regular: "使用过多次，主要直接使用现成功能",
      occasional: "偶尔尝试过一两次",
      "tried-stopped": "尝试过，但结果不符合 OC 设定，所以没有继续",
      "never-open": "从未尝试，但愿意先了解或看看效果",
      avoid: "从未尝试，也不愿意用 AI 处理与我的 OC 有关的内容",
      other: "其他（请填写）",
    },
    favoriteOptions: {
      advanced: "经常使用，也会调整提示词、角色卡或参数，让结果更贴近原作中的角色",
      regular: "使用过多次，主要直接使用现成功能",
      occasional: "偶尔尝试过一两次",
      "tried-stopped": "尝试过，但结果不像原作中的 TA，所以没有继续",
      "never-open": "从未尝试，但愿意先了解或看看效果",
      avoid: "从未尝试，也不愿意用 AI 生成与这个角色有关的内容",
      other: "其他（请填写）",
    },
  },
  q9: {
    title: "AI 参与后的意愿变化",
    options: {
      more: "比之前更想尝试",
      same: "基本没有变化，仍然愿意尝试",
      conditional: "仍有兴趣，但需要先确认还原度和控制权",
      "assist-only": "只接受 AI 辅助整理或提供灵感，最终内容由我决定",
      less: "意愿有所下降，但看过实际效果后也许会尝试",
      reject: "不愿意让 AI 参与我的 OC",
      other: "其他（请填写）",
    },
    favoriteOptions: {
      more: "比之前更想尝试",
      same: "基本没有变化，仍然愿意尝试",
      conditional: "仍有兴趣，但需要先确认还原度和控制权",
      "assist-only": "只接受 AI 辅助整理或提供灵感，最终内容由我决定",
      less: "意愿有所下降，但看过实际效果后也许会尝试",
      reject: "不愿意让 AI 参与这个角色的互动内容",
      other: "其他（请填写）",
    },
  },
  q10: {
    title: "年龄",
    options: {
      "15-under": "15 岁及以下",
      "16-17": "16–17 岁",
      "18-22": "18–22 岁",
      "23-27": "23–27 岁",
      "28-plus": "28 岁及以上",
      private: "不方便透露",
    },
  },
  q11: {
    title: "每月相关爱好花费",
    options: {
      zero: "基本没有花费",
      "1-49": "1–49 元",
      "50-199": "50–199 元",
      "200-499": "200–499 元",
      "500-999": "500–999 元",
      "1000-plus": "1000 元及以上",
      private: "不方便透露",
    },
  },
  q12: {
    title: "OC 原型测试参与意愿",
    favoriteTitle: "喜欢角色原型测试参与意愿",
    options: {
      "multi-round": "愿意参加多轮测试，并提供详细反馈",
      "full-once": "愿意参加一次完整测试，并认真反馈",
      "short-first": "愿意先参加一次短体验，再决定是否继续",
      "details-first": "想先了解测试内容和时间安排",
      no: "暂时不考虑参加",
      other: "其他安排（请填写）",
    },
  },
  q1h: {
    title: "从零创角测试参与意愿",
    options: {
      "multi-round": "愿意参加多轮测试，并提供详细反馈",
      "full-once": "愿意参加一次完整测试，并认真反馈",
      "short-first": "愿意先进行一次短体验",
      "details-first": "想先了解具体内容和时间安排",
      no: "暂时不考虑参加",
      other: "其他安排（请填写）",
    },
  },
});

export const questionOrder = Object.freeze([
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

const branchLabels = Object.freeze({
  oc: "OC 用户",
  "favorite-character": "喜欢角色",
  "no-target-interested": "暂无角色·有兴趣",
  "no-target-uninterested": "暂无角色·无兴趣",
  "no-target": "暂无角色（旧版）",
});

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function parseStoredPayload(value) {
  try {
    const parsed = JSON.parse(value);
    if (!isPlainObject(parsed)) throw new Error("Invalid payload");
    return {
      surveyVersion:
        typeof parsed.surveyVersion === "string" ? parsed.surveyVersion : "未知版本",
      branch: typeof parsed.branch === "string" ? parsed.branch : "unknown",
      answers: isPlainObject(parsed.answers) ? parsed.answers : {},
      otherText: isPlainObject(parsed.otherText) ? parsed.otherText : {},
    };
  } catch {
    return {
      surveyVersion: "无法解析",
      branch: "unknown",
      answers: {},
      otherText: {},
    };
  }
}

export function getBranchLabel(branch) {
  return branchLabels[branch] ?? branch ?? "未知分支";
}

function isFavoriteResponse(payload) {
  return (
    payload.branch === "favorite-character" ||
    payload.answers?.q1 === "favorite-only"
  );
}

function questionTitle(questionId, payload) {
  const dictionary = surveyQuestionDictionary[questionId];
  if (!dictionary) return questionId;
  return isFavoriteResponse(payload) && dictionary.favoriteTitle
    ? dictionary.favoriteTitle
    : dictionary.title;
}

export function formatAnswer(questionId, answer, payload) {
  const dictionary = surveyQuestionDictionary[questionId];
  const options =
    isFavoriteResponse(payload) && dictionary?.favoriteOptions
      ? dictionary.favoriteOptions
      : dictionary?.options ?? {};
  const values = Array.isArray(answer) ? answer : [answer];
  const labels = values
    .filter((value) => typeof value === "string")
    .map((value) => options[value] ?? value);
  const other = payload.otherText?.[questionId];
  if (typeof other === "string" && other.trim()) {
    labels.push(`补充：${other.trim()}`);
  }
  return labels.join("；") || "—";
}

export function getAnswerRows(payload) {
  return questionOrder
    .filter((questionId) => payload.answers?.[questionId] !== undefined)
    .map((questionId) => ({
      id: questionId,
      question: questionTitle(questionId, payload),
      answer: formatAnswer(questionId, payload.answers[questionId], payload),
    }));
}

export function formatSingaporeTime(value) {
  if (!value) return "—";
  const normalized = /(?:Z|[+-]\d\d:?\d\d)$/.test(value)
    ? value
    : `${value.replace(" ", "T")}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function csvCell(value) {
  let text = value == null ? "" : String(value).replaceAll("\0", "");
  if (/^[\t\r]/.test(text) || /^\s*[=+\-@]/.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replaceAll('"', '""')}"`;
}

export function buildSurveyCsv(rows) {
  const headers = [
    "数据库ID",
    "提交时间（新加坡）",
    "答卷编号",
    "分支",
    "是否提前结束",
    "联系方式",
    "联系方式同意",
    "问卷版本",
    ...questionOrder.map((questionId) => surveyQuestionDictionary[questionId].title),
    "其他填写JSON",
    "答案ID JSON",
  ];

  const lines = [headers.map(csvCell).join(",")];
  for (const row of rows) {
    const payload = parseStoredPayload(row.answersJson);
    const values = [
      row.id,
      formatSingaporeTime(row.createdAt),
      row.responseId,
      getBranchLabel(payload.branch),
      row.screenedOut ? "是" : "否",
      row.contact ?? "",
      row.contactConsent ? "是" : "否",
      payload.surveyVersion,
      ...questionOrder.map((questionId) =>
        payload.answers?.[questionId] === undefined
          ? ""
          : formatAnswer(questionId, payload.answers[questionId], payload),
      ),
      JSON.stringify(payload.otherText),
      JSON.stringify(payload.answers),
    ];
    lines.push(values.map(csvCell).join(","));
  }

  return `\uFEFF${lines.join("\r\n")}`;
}
