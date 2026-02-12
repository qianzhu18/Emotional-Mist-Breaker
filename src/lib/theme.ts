import type { CSSProperties } from "react";

import type { LevelConfig } from "@/types/domain";

export function buildLevelThemeStyle(level: LevelConfig): CSSProperties {
  return {
    ["--level-primary" as string]: level.visual.palette.primary,
    ["--level-secondary" as string]: level.visual.palette.secondary,
    ["--level-tertiary" as string]: level.visual.palette.tertiary,
    ["--level-neutral" as string]: level.visual.palette.neutral,
  };
}

export function fogTagClass(tag: LevelConfig["fog_type"] | "fear" | "obligation" | "guilt") {
  if (tag === "fear") return "tag-fear";
  if (tag === "obligation") return "tag-obligation";
  if (tag === "guilt") return "tag-guilt";
  return "tag-fear";
}
