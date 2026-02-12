import { redirect } from "next/navigation";

import { DashboardCommandCenter } from "@/components/dashboard/DashboardCommandCenter";
import { getCurrentUser } from "@/lib/auth";
import { EXP_THRESHOLDS } from "@/lib/experience";
import { getLevelById, LEVELS } from "@/lib/levels";
import { getUserProgress, listConversationsByUser } from "@/lib/store";

const LEVEL_TITLE: Record<number, string> = {
  1: "情感小白",
  2: "初涉江湖",
  3: "初窥门径",
  4: "略有心得",
  5: "经验丰富",
  6: "洞察秋毫",
  7: "火眼金睛",
  8: "情场智者",
  9: "反套路大师",
  10: "反PUA宗师",
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const progress = getUserProgress(user.id);
  const allBattles = listConversationsByUser(user.id);
  const recentBattles = allBattles.slice(0, 6);
  const completedBattles = allBattles.filter((battle) => battle.status === "completed");
  const winCount = completedBattles.filter((battle) => (battle.total_score ?? 0) >= 60).length;
  const winRate = completedBattles.length > 0 ? Math.round((winCount / completedBattles.length) * 100) : 0;
  const clearedCount = Object.keys(progress.level_best_scores).length;

  const nextThreshold = EXP_THRESHOLDS[user.level] ?? EXP_THRESHOLDS[EXP_THRESHOLDS.length - 1];
  const previousThreshold = EXP_THRESHOLDS[user.level - 1] ?? 0;
  const expProgress =
    nextThreshold > previousThreshold
      ? Math.round(((user.experience - previousThreshold) / (nextThreshold - previousThreshold)) * 100)
      : 100;

  const averageScore =
    completedBattles.length > 0
      ? Math.round(
          completedBattles.reduce((total, battle) => total + (battle.total_score ?? 0), 0) / completedBattles.length,
        )
      : 0;

  const logic = clamp(Math.round(38 + user.level * 6 + averageScore * 0.22), 20, 99);
  const empathy = clamp(Math.round(30 + completedBattles.length * 5 + averageScore * 0.12), 18, 98);
  const defense = clamp(Math.round(34 + expProgress * 0.58 + user.level * 3), 24, 99);

  const nextLevel = LEVELS.find((level) => !progress.unlocked_levels.includes(level.id));
  const currentLevel = nextLevel ?? LEVELS[LEVELS.length - 1];
  const nextTargetTitle = `${currentLevel.visual.chapter} · ${currentLevel.title}`;
  const nextTargetHint = currentLevel.background;

  return (
    <DashboardCommandCenter
      aiName={user.ai_name}
      aiAvatar={user.ai_avatar}
      aiPersonality={user.ai_personality}
      level={user.level}
      levelTitle={LEVEL_TITLE[user.level] || "修炼中"}
      experience={user.experience}
      expProgress={Math.max(expProgress, 0)}
      nextThreshold={nextThreshold}
      unlockedCount={progress.unlocked_levels.length}
      totalLevels={LEVELS.length}
      clearedCount={clearedCount}
      winRate={winRate}
      nextTarget={nextTargetTitle}
      nextTargetHint={nextTargetHint}
      stats={[
        { label: "Logic", value: logic, colorClass: "bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.55)]" },
        { label: "Empathy", value: empathy, colorClass: "bg-indigo-400 shadow-[0_0_18px_rgba(129,140,248,0.45)]" },
        { label: "Defense", value: defense, colorClass: "bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.5)]" },
      ]}
      recentBattles={recentBattles.map((battle) => {
        const level = getLevelById(battle.level_id);
        return {
          id: battle.id,
          title: level?.title ?? `关卡 ${battle.level_id}`,
          status: battle.status,
          totalScore: battle.total_score ?? null,
          href: battle.status === "completed" ? `/report/${battle.id}` : `/battle/${battle.level_id}`,
        };
      })}
    />
  );
}
