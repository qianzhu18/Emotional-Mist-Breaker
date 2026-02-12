import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { EXP_THRESHOLDS } from "@/lib/experience";
import { getLevelById } from "@/lib/levels";
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

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const progress = getUserProgress(user.id);
  const recentBattles = listConversationsByUser(user.id).slice(0, 6);

  const nextThreshold = EXP_THRESHOLDS[user.level] ?? EXP_THRESHOLDS[EXP_THRESHOLDS.length - 1];
  const previousThreshold = EXP_THRESHOLDS[user.level - 1] ?? 0;
  const expProgress =
    nextThreshold > previousThreshold
      ? Math.round(((user.experience - previousThreshold) / (nextThreshold - previousThreshold)) * 100)
      : 100;

  return (
    <main className="page-shell">
      <header className="surface-card-strong p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-4">
          {user.ai_avatar ? (
            <Image
              src={user.ai_avatar}
              alt={user.ai_name}
              width={72}
              height={72}
              className="rounded-full border border-[#ced6e2] object-cover"
            />
          ) : (
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-[#ced6e2] bg-[#edf3ff] text-2xl font-black text-[#2d6cdf]">
              {user.ai_name.slice(0, 1)}
            </div>
          )}

          <div className="flex-1">
            <p className="kicker">My Agent</p>
            <h1 className="section-title mt-1 text-3xl">{user.ai_name}</h1>
            <p className="mt-1 text-sm text-[var(--ink-3)]">{user.ai_personality}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/levels" className="btn-primary">
              进入关卡
            </Link>
            <a href="/api/auth" className="btn-ghost">
              重新授权
            </a>
          </div>
        </div>
      </header>

      <section className="mt-4 grid gap-3 md:grid-cols-3">
        <article className="surface-card p-4">
          <p className="kicker">Level</p>
          <p className="mt-1 text-3xl font-black">Lv.{user.level}</p>
          <p className="text-sm text-[var(--ink-3)]">{LEVEL_TITLE[user.level] || "修炼中"}</p>
        </article>

        <article className="surface-card p-4">
          <p className="kicker">Experience</p>
          <p className="mt-1 text-3xl font-black">{user.experience}</p>
          <div className="progress-track mt-2">
            <div className="progress-fill" style={{ width: `${expProgress}%` }} />
          </div>
          <p className="mt-1 text-xs text-[var(--ink-3)]">
            进度 {Math.max(expProgress, 0)}% · 下一等级阈值 {nextThreshold}
          </p>
        </article>

        <article className="surface-card p-4">
          <p className="kicker">Campaign</p>
          <p className="mt-1 text-3xl font-black">{progress.unlocked_levels.length}/8</p>
          <p className="text-sm text-[var(--ink-3)]">已解锁关卡</p>
        </article>
      </section>

      <section className="mt-4 surface-card p-4 md:p-5">
        <h2 className="section-title text-2xl">最近战绩</h2>
        {recentBattles.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--ink-3)]">暂无战绩，建议先挑战第 1 关建立基线。</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {recentBattles.map((battle) => {
              const level = getLevelById(battle.level_id);

              return (
                <li key={battle.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#d7dce4] bg-white p-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--ink-2)]">{level?.title ?? `关卡 ${battle.level_id}`}</p>
                    <p className="text-xs text-[var(--ink-3)]">
                      状态：{battle.status === "completed" ? "已结算" : "进行中"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-sm text-[var(--ink-2)]">
                      {battle.total_score != null ? `分数 ${battle.total_score}` : "未结算"}
                    </p>
                    <Link
                      href={battle.status === "completed" ? `/report/${battle.id}` : `/battle/${battle.level_id}`}
                      className="btn-ghost"
                    >
                      {battle.status === "completed" ? "查看复盘" : "继续战斗"}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
