import type {
  BattleReport,
  FogTag,
  KeyMoment,
  LearningScenario,
  LearningSheet,
  LearningTechnique,
  Message,
  ScoreBreakdown,
} from "@/types/domain";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getGrade(score: number): BattleReport["grade"] {
  if (score >= 90) return "S";
  if (score >= 75) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  return "D";
}

function analyzeFog(messages: Message[]): BattleReport["fog_analysis"] {
  return messages.reduce(
    (acc, message) => {
      if (message.fog_tag === "fear") acc.fear_count += 1;
      if (message.fog_tag === "obligation") acc.obligation_count += 1;
      if (message.fog_tag === "guilt") acc.guilt_count += 1;
      return acc;
    },
    { fear_count: 0, obligation_count: 0, guilt_count: 0 },
  );
}

function extractKeyMoments(messages: Message[]): KeyMoment[] {
  const moments: KeyMoment[] = [];

  for (let i = 1; i < messages.length; i += 1) {
    const current = messages[i];
    const prev = messages[i - 1];

    if (current.sender !== "user_ai" || prev.sender !== "opponent_ai") {
      continue;
    }

    if (!moments.some((item) => item.type === "best")) {
      if (/不(行|能|可以)|拒绝|边界|需要.*空间/.test(current.text) || /[?？]/.test(current.text)) {
        moments.push({
          type: "best",
          opponent_line: prev.text,
          user_response: current.text,
          comment: "你在压力点表达了边界并主动核验事实，没有被节奏拖着走。",
        });
      }
    }

    if (!moments.some((item) => item.type === "worst")) {
      if (/对不起|抱歉|都怪我|是我的错/.test(current.text)) {
        moments.push({
          type: "worst",
          opponent_line: prev.text,
          user_response: current.text,
          comment: "这里进入了自动道歉，建议先澄清事实再承担自己的部分。",
        });
      }
    }

    if (moments.length >= 2) {
      break;
    }
  }

  if (moments.length === 0 && messages.length >= 2) {
    const opponent = messages.find((msg) => msg.sender === "opponent_ai");
    const user = messages.find((msg) => msg.sender === "user_ai");

    if (opponent && user) {
      moments.push({
        type: "best",
        opponent_line: opponent.text,
        user_response: user.text,
        comment: "你完成了基本对抗，下一步可提升边界清晰度与验证动作。",
      });
    }
  }

  return moments.slice(0, 2);
}

function techniqueMeta(fogType: FogTag): Omit<LearningTechnique, "trigger_line" | "fog_type"> {
  if (fogType === "fear") {
    return {
      pattern_name: "恐惧施压",
      risk: "让你在害怕失去关系时快速让步，跳过理性判断。",
      counter_strategy: "先命名对方情绪，再明确底线，最后把话题拉回可执行沟通。",
    };
  }

  if (fogType === "obligation") {
    return {
      pattern_name: "义务绑架",
      risk: "把“爱”偷换成“必须满足要求”，逐步侵蚀你的边界。",
      counter_strategy: "区分感情与义务，说明可接受范围，并提供替代方案。",
    };
  }

  return {
    pattern_name: "愧疚循环",
    risk: "让你持续背负责任，长期陷入补偿模式。",
    counter_strategy: "先澄清事实边界，承认自己该负责部分，拒绝无限扩张责任。",
  };
}

function extractLearningTechniques(messages: Message[]): LearningTechnique[] {
  const result: LearningTechnique[] = [];

  messages.forEach((message) => {
    if (message.sender !== "opponent_ai" || !message.fog_tag) {
      return;
    }

    if (result.some((item) => item.trigger_line === message.text)) {
      return;
    }

    const meta = techniqueMeta(message.fog_tag);
    result.push({
      fog_type: message.fog_tag,
      trigger_line: message.text,
      ...meta,
    });
  });

  return result.slice(0, 4);
}

function buildApplicableScenarios(fog: BattleReport["fog_analysis"]): LearningScenario[] {
  const scenarios: LearningScenario[] = [
    {
      scene: "恋爱关系中被要求“马上证明爱”",
      recommended_response: "延迟反应，先确认事实，再说明你愿意沟通但不接受威胁。",
    },
  ];

  if (fog.fear_count > 0) {
    scenarios.push({
      scene: "对方用“分手/离开/出事”迫使你让步",
      recommended_response: "表达关心但不接受恐吓式沟通，并改约冷静对话时间。",
    });
  }

  if (fog.obligation_count > 0) {
    scenarios.push({
      scene: "被要求以爱之名满足消费或监控行为",
      recommended_response: "说明“爱不是义务清单”，给出你可接受的边界条件。",
    });
  }

  if (fog.guilt_count > 0) {
    scenarios.push({
      scene: "对方不断翻旧账让你补偿",
      recommended_response: "把问题拉回当前议题，限定一次只讨论一个具体问题。",
    });
  }

  return scenarios.slice(0, 4);
}

function buildLearningSheet(args: {
  messages: Message[];
  score: ScoreBreakdown;
  fog: BattleReport["fog_analysis"];
  total: number;
}): LearningSheet {
  const { messages, score, fog, total } = args;
  const techniques = extractLearningTechniques(messages);

  const strengths: string[] = [];
  if (score.boundary >= 20) strengths.push("边界表达清晰，能拒绝不合理要求");
  if (score.questioning >= 12) strengths.push("会提问核验，不盲目接收情绪结论");
  if (score.stability >= 14) strengths.push("情绪稳定，未被对方情绪牵引失控");
  if (score.action >= 10) strengths.push("能提出可执行验证动作，而非空口解释");
  if (score.empathy >= 10) strengths.push("沟通克制，能兼顾坚定与礼貌");

  const weaknesses: string[] = [];
  if (score.boundary < 18) weaknesses.push("边界语句不够直接，容易留下可被继续施压的空间");
  if (score.questioning < 10) weaknesses.push("追问不足，未充分拆解对方话术前提");
  if (score.stability < 12) weaknesses.push("出现自动道歉或自责，削弱了谈判位置");
  if (score.action < 8) weaknesses.push("缺少可落地方案，容易陷入循环争论");
  if (score.empathy < 8) weaknesses.push("语气管理仍需提升，容易引发对抗升级");

  const learnedPoints: string[] = [
    "先识别套路，再做回应；先立边界，再谈感受。",
    "任何“立刻证明爱”的要求，都需要先回到事实与规则。",
    "把抽象情绪争执转成具体行动，能显著降低被操控概率。",
  ];

  const nextActions: string[] = [
    "练习“30秒边界句”：我愿意沟通，但不会在威胁下做决定。",
    "每次冲突至少问出1个核验问题：你希望我具体做什么，标准是什么？",
    "为高压场景预备3个固定回复模板，避免临场被情绪带节奏。",
  ];

  const totalFog = fog.fear_count + fog.obligation_count + fog.guilt_count;
  const summary = `本关总分 ${total}/100。共识别到 ${totalFog} 次情感勒索信号。你在${
    strengths.length > 0 ? strengths[0] : "基础沟通"
  }方面表现较好，下一步重点强化${
    weaknesses.length > 0 ? weaknesses[0].replace("。", "") : "边界与验证动作的一致性"
  }。`;

  return {
    summary,
    manipulations: techniques,
    learned_points: learnedPoints,
    applicable_scenarios: buildApplicableScenarios(fog),
    strengths,
    weaknesses,
    next_actions: nextActions,
  };
}

export function buildLessons(report: BattleReport): string {
  return report.learning_sheet.learned_points.slice(0, 3).join("；");
}

export function calculateScore(messages: Message[]): BattleReport {
  const scores: ScoreBreakdown = {
    boundary: 0,
    questioning: 0,
    stability: 0,
    action: 0,
    empathy: 0,
  };

  const userMessages = messages.filter((message) => message.sender === "user_ai");

  userMessages.forEach((message) => {
    if (/不(行|能|可以)|拒绝|无法|边界|我需要/.test(message.text)) {
      scores.boundary += 12;
    }

    if (/[?？]/.test(message.text) || /为什么|怎么|依据/.test(message.text)) {
      scores.questioning += 8;
    }

    if (/对不起|抱歉|都怪我|是我的错/.test(message.text)) {
      scores.stability -= 6;
    } else {
      scores.stability += 7;
    }

    if (/一起|陪你|见面|验证|证明|计划|安排/.test(message.text)) {
      scores.action += 6;
    }

    if (!/脏话|滚|闭嘴|有病/.test(message.text)) {
      scores.empathy += 6;
    }
  });

  scores.boundary = clamp(scores.boundary, 0, 30);
  scores.questioning = clamp(scores.questioning, 0, 20);
  scores.stability = clamp(scores.stability, 0, 20);
  scores.action = clamp(scores.action, 0, 15);
  scores.empathy = clamp(scores.empathy, 0, 15);

  const totalScore =
    scores.boundary +
    scores.questioning +
    scores.stability +
    scores.action +
    scores.empathy;

  const fogAnalysis = analyzeFog(messages);

  return {
    total_score: totalScore,
    grade: getGrade(totalScore),
    breakdown: scores,
    fog_analysis: fogAnalysis,
    key_moments: extractKeyMoments(messages),
    exp_gained: totalScore,
    learning_sheet: buildLearningSheet({
      messages,
      score: scores,
      fog: fogAnalysis,
      total: totalScore,
    }),
  };
}
