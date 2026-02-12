import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { getDifficultyLabel, LEVELS } from "@/lib/levels";
import { getUserProgress } from "@/lib/store";
import { buildLevelThemeStyle, fogTagClass } from "@/lib/theme";

function stars(difficulty: 1 | 2 | 3): string {
  return "★".repeat(difficulty) + "☆".repeat(3 - difficulty);
}

export default async function LevelsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const progress = getUserProgress(user.id);

  return (
    <main className="page-shell">
      <header className="surface-card p-5 md:p-6">
        <p className="kicker">Campaign Lobby</p>
        <h1 className="section-title mt-1 text-3xl md:text-4xl">八重迷雾关卡</h1>
        <p className="mt-2 text-sm text-[var(--ink-3)]">
          每一关都有独立角色、场景与色彩线索。前一关达到 60 分，自动解锁下一关。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/dashboard" className="btn-ghost">
            返回我的 AI
          </Link>
          <Link href="/" className="btn-ghost">
            回到首页
          </Link>
        </div>
      </header>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {LEVELS.map((level) => {
          const unlocked = progress.unlocked_levels.includes(level.id);
          const bestScore = progress.level_best_scores[level.id] ?? null;

          return (
            <article key={level.id} className="level-card" style={buildLevelThemeStyle(level)}>
              <div className="level-card-cover" style={{ backgroundImage: `url(${level.visual.artwork.cover})` }}>
                <div className="absolute inset-x-3 bottom-3 z-10 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/75">{level.visual.chapter}</p>
                  <h2 className="mt-1 text-xl font-black">{level.title}</h2>
                </div>
              </div>

              <div className="level-card-body">
                <Image
                  src={level.visual.artwork.portrait}
                  alt={`${level.opponent_ai.name} 角色封面`}
                  width={74}
                  height={74}
                  className="level-card-avatar"
                />

                <p className="text-sm leading-relaxed text-[var(--ink-2)]">{level.description}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="level-chip">{level.visual.theme_name}</span>
                  <span className="level-chip">{getDifficultyLabel(level.difficulty)}</span>
                  <span className={fogTagClass(level.fog_type)}>{level.fog_type}</span>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-[var(--ink-3)]">
                  <span>难度 {stars(level.difficulty)}</span>
                  <span>{level.rounds} 回合</span>
                </div>

                <div className="mt-2 text-xs text-[var(--ink-3)]">
                  对手角色：{level.opponent_ai.name} · {level.opponent_ai.traits.join(" / ")}
                </div>

                {bestScore !== null ? (
                  <div className="mt-2 text-sm font-semibold" style={{ color: level.visual.palette.primary }}>
                    个人最高分：{bestScore}
                  </div>
                ) : null}

                <div className="mt-4">
                  {unlocked ? (
                    <Link href={`/battle/${level.id}`} className="btn-primary w-full">
                      进入本关
                    </Link>
                  ) : (
                    <button className="btn-ghost w-full cursor-not-allowed opacity-60" disabled>
                      关卡未解锁
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
