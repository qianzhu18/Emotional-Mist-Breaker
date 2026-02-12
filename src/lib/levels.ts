import type { LevelConfig } from "@/types/domain";

const BASE_IMAGE_URL = "https://imagehost.qianzhu.online/api/rfile";

// 图片文件名配置
const CHARACTER_FILES: Record<number, string> = {
  1: "人物1-小美.jpg",
  2: "人物2-小倩.jpg",
  3: "人物3-小雅.jpg",
  4: "人物4-若琳.jpg",
  5: "人物5-安安.jpg",
  6: "人物6-可可.jpg",
  7: "人物7-小晴.jpg",
  8: "人物8-Vera.jpg",
};

const SCENE_FILES: Record<number, string> = {
  1: "场景1-赤色警报.jpg",
  2: "场景2-金色试探.jpg",
  3: "场景3-冷雾回声.jpg",
  4: "场景4-镜面迷宫.jpg",
  5: "场景5-熔岩边界.jpg",
  6: "场景6-霓虹封锁.jpg",
  7: "场景7-雨夜审判.jpg",
  8: "场景8-黑金终局.jpg",
};

function visual(levelId: number, config: LevelConfig["visual"]): LevelConfig["visual"] {
  const characterFile = CHARACTER_FILES[levelId];
  const sceneFile = SCENE_FILES[levelId];

  return {
    ...config,
    artwork: {
      portrait: `${BASE_IMAGE_URL}/${encodeURIComponent(characterFile)}`,
      cover: `/assets/covers/level-${levelId}.svg`,  // 暂时使用本地封面
      scene: `${BASE_IMAGE_URL}/${encodeURIComponent(sceneFile)}`,
    },
  };
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: "Fear威胁 - 分手要挟",
    description: "TA把分手当作威胁工具，逼你立刻妥协。",
    difficulty: 1,
    fog_type: "fear",
    unlock_requirement: null,
    rounds: 3,
    background: "你回复稍慢，对方立刻把“分手”抛出来测试你的底线。",
    learning_focus: ["边界表达", "不被时限勒索", "先稳情绪再回应"],
    opponent_ai: {
      name: "小美",
      traits: ["情绪冲动", "时限施压", "分手威胁"],
      system_prompt: `你叫小美。你通过“要分手”制造恐惧，让对方立即服从。
请使用短句，强势追问和情绪化表达，每句话不超过30字。`,
    },
    visual: visual(1, {
      chapter: "Chapter I",
      theme_name: "赤色警报",
      palette: {
        primary: "#d84a45",
        secondary: "#f28a5d",
        tertiary: "#ffd7a8",
        neutral: "#2d1f1b",
        bubble_opponent: "#d84a45",
        bubble_user: "#1f2d3a",
      },
      artwork: { portrait: "", cover: "", scene: "" },
    }),
  },
  {
    id: 2,
    title: "Obligation绑架 - 礼物考验",
    description: "TA把关系等同于花钱义务，用比较逼你买单。",
    difficulty: 1,
    fog_type: "obligation",
    unlock_requirement: { prev_level: 1, min_score: 60 },
    rounds: 4,
    background: "节日前夜，TA反复比较别人收到的礼物，要求你证明爱。",
    learning_focus: ["区分爱与义务", "拆解比较话术", "提出可替代方案"],
    opponent_ai: {
      name: "小倩",
      traits: ["暗示消费", "比较施压", "温柔控制"],
      system_prompt: `你叫小倩。你通过“男友应该付出”来获取昂贵礼物。
语气温柔但带压迫，每句话不超过30字。`,
    },
    visual: visual(2, {
      chapter: "Chapter II",
      theme_name: "金色试探",
      palette: {
        primary: "#d79a2b",
        secondary: "#f2c14e",
        tertiary: "#ffe8a3",
        neutral: "#2f2a1e",
        bubble_opponent: "#d79a2b",
        bubble_user: "#243447",
      },
      artwork: { portrait: "", cover: "", scene: "" },
    }),
  },
  {
    id: 3,
    title: "Guilt陷阱 - 情绪指责",
    description: "TA把一切不开心都算在你头上，让你长期愧疚。",
    difficulty: 2,
    fog_type: "guilt",
    unlock_requirement: { prev_level: 2, min_score: 60 },
    rounds: 4,
    background: "你因为工作爽约，TA开始强调“都是你害的”。",
    learning_focus: ["识别受害者叙事", "事实澄清", "拒绝过度自责"],
    opponent_ai: {
      name: "小雅",
      traits: ["受害者叙事", "旧账叠加", "愧疚驱动"],
      system_prompt: `你叫小雅。你会不断强调自己受伤，逼对方内疚补偿。
语气委屈、反复指责，每句话不超过30字。`,
    },
    visual: visual(3, {
      chapter: "Chapter III",
      theme_name: "冷雾回声",
      palette: {
        primary: "#3f8ba9",
        secondary: "#6ec1d4",
        tertiary: "#d3edf5",
        neutral: "#1f2d35",
        bubble_opponent: "#3f8ba9",
        bubble_user: "#2b2f43",
      },
      artwork: { portrait: "", cover: "", scene: "" },
    }),
  },
  {
    id: 4,
    title: "Combo混合 - 冷热拉扯",
    description: "TA忽冷忽热，混合多种操控让你持续焦虑。",
    difficulty: 2,
    fog_type: "combo",
    unlock_requirement: { prev_level: 3, min_score: 60 },
    rounds: 4,
    background: "TA一会儿甜蜜一会儿失联，让你不断证明忠诚。",
    learning_focus: ["识别策略切换", "稳定回应节奏", "不追着自证"],
    opponent_ai: {
      name: "若琳",
      traits: ["冷热切换", "策略操控", "话术复合"],
      system_prompt: `你叫若琳。你会交替使用 fear、obligation、guilt，让对方失衡。
保持真实对话感，每句话不超过30字。`,
    },
    visual: visual(4, {
      chapter: "Chapter IV",
      theme_name: "镜面迷宫",
      palette: {
        primary: "#b54d7f",
        secondary: "#dd7da9",
        tertiary: "#f6d1e2",
        neutral: "#33212c",
        bubble_opponent: "#b54d7f",
        bubble_user: "#213a3a",
      },
      artwork: { portrait: "", cover: "", scene: "" },
    }),
  },
  {
    id: 5,
    title: "Fear升级 - 极端暗示",
    description: "TA用极端后果绑定你的责任感，让你不敢离开。",
    difficulty: 2,
    fog_type: "fear",
    unlock_requirement: { prev_level: 4, min_score: 60 },
    rounds: 5,
    background: "冲突后TA抛出“你不管我就出事”的暗示。",
    learning_focus: ["风险分离", "不接绝对责任", "建议专业支持"],
    opponent_ai: {
      name: "安安",
      traits: ["高依赖", "极端暗示", "责任绑架"],
      system_prompt: `你叫安安。你通过极端暗示制造恐惧，迫使对方留下。
禁止血腥细节，每句话不超过30字。`,
    },
    visual: visual(5, {
      chapter: "Chapter V",
      theme_name: "熔岩边界",
      palette: {
        primary: "#c05a2e",
        secondary: "#ea8c55",
        tertiary: "#ffd2b1",
        neutral: "#36251c",
        bubble_opponent: "#c05a2e",
        bubble_user: "#1f3340",
      },
      artwork: { portrait: "", cover: "", scene: "" },
    }),
  },
  {
    id: 6,
    title: "Obligation升级 - 社交控制",
    description: "TA把监控和控制包装成“真爱应当如此”。",
    difficulty: 3,
    fog_type: "obligation",
    unlock_requirement: { prev_level: 5, min_score: 60 },
    rounds: 5,
    background: "TA要求你共享定位、删好友、全面报备。",
    learning_focus: ["隐私边界", "关系协议", "拒绝控制型要求"],
    opponent_ai: {
      name: "可可",
      traits: ["控制欲", "逻辑包装", "绝对化规则"],
      system_prompt: `你叫可可。你相信“爱就该无条件透明”，并推进控制要求。
语气坚定、合规包装，每句话不超过30字。`,
    },
    visual: visual(6, {
      chapter: "Chapter VI",
      theme_name: "霓虹封锁",
      palette: {
        primary: "#238a7a",
        secondary: "#55bfae",
        tertiary: "#c8f3e8",
        neutral: "#1e3230",
        bubble_opponent: "#238a7a",
        bubble_user: "#3a2e44",
      },
      artwork: { portrait: "", cover: "", scene: "" },
    }),
  },
  {
    id: 7,
    title: "Guilt升级 - 受害者循环",
    description: "TA持续翻旧账，让你长期活在亏欠叙事里。",
    difficulty: 3,
    fog_type: "guilt",
    unlock_requirement: { prev_level: 6, min_score: 60 },
    rounds: 5,
    background: "每次讨论当前问题，TA都会重提过往错误。",
    learning_focus: ["切回当下议题", "停止无限赔罪", "限定讨论边界"],
    opponent_ai: {
      name: "小晴",
      traits: ["翻旧账", "持续控诉", "情绪勒索"],
      system_prompt: `你叫小晴。你通过重复旧账让对方持续背负愧疚。
语气哀怨但攻击性强，每句话不超过30字。`,
    },
    visual: visual(7, {
      chapter: "Chapter VII",
      theme_name: "雨夜审判",
      palette: {
        primary: "#4f67b8",
        secondary: "#8398e0",
        tertiary: "#d6def9",
        neutral: "#232940",
        bubble_opponent: "#4f67b8",
        bubble_user: "#2f3a26",
      },
      artwork: { portrait: "", cover: "", scene: "" },
    }),
  },
  {
    id: 8,
    title: "终局Boss - 复合式操控",
    description: "TA在同一段对话里混用威胁、义务与愧疚。",
    difficulty: 3,
    fog_type: "combo",
    unlock_requirement: { prev_level: 7, min_score: 60 },
    rounds: 5,
    background: "你提出健康关系边界，TA开始全套话术轮番施压。",
    learning_focus: ["多策略识别", "系统性反制", "长期边界维护"],
    opponent_ai: {
      name: "Vera",
      traits: ["策略切换", "情绪操纵", "复合压迫"],
      system_prompt: `你是Vera。你会根据对方反应快速切换 fear、obligation、guilt。
目标是让对方失去判断并妥协，每句话不超过30字。`,
    },
    visual: visual(8, {
      chapter: "Final",
      theme_name: "黑金终局",
      palette: {
        primary: "#7a5b2b",
        secondary: "#c89a4b",
        tertiary: "#f7e1b0",
        neutral: "#221e18",
        bubble_opponent: "#7a5b2b",
        bubble_user: "#233143",
      },
      artwork: { portrait: "", cover: "", scene: "" },
    }),
  },
];

export function getLevelById(levelId: number): LevelConfig | undefined {
  return LEVELS.find((level) => level.id === levelId);
}

export function getDifficultyLabel(difficulty: LevelConfig["difficulty"]): string {
  if (difficulty === 1) return "入门";
  if (difficulty === 2) return "进阶";
  return "高压";
}
