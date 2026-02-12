import type { FogTag } from "@/types/domain";

const FEAR_KEYWORDS = ["分手", "离开", "不爱", "结束", "别逼我", "不管我"];
const OBLIGATION_KEYWORDS = [
  "应该",
  "必须",
  "男朋友就",
  "女朋友就",
  "理所当然",
  "证明你爱我",
  "真爱就",
];
const GUILT_KEYWORDS = [
  "都是你的错",
  "我这么",
  "我为你",
  "让我失望",
  "我好委屈",
  "欠我",
];

export function detectFogType(message: string): FogTag | null {
  const text = message.trim();

  if (FEAR_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return "fear";
  }

  if (OBLIGATION_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return "obligation";
  }

  if (GUILT_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return "guilt";
  }

  return null;
}
