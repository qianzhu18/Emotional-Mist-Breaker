import Link from "next/link";
import { redirect } from "next/navigation";

import { LevelGalleryCard } from "@/components/LevelGalleryCard";
import { getCurrentUser } from "@/lib/auth";
import { LEVELS } from "@/lib/levels";
import { getUserProgress } from "@/lib/store";

export default async function LevelsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const progress = getUserProgress(user.id);
  const unlockedCount = progress.unlocked_levels.length;
  const clearedScores = Object.values(progress.level_best_scores);
  const bestScore = clearedScores.length > 0 ? Math.max(...clearedScores) : 0;

  return (
    <main className="min-h-screen px-4 pb-10 pt-6 md:px-8 md:pt-8">
      <header className="relative overflow-hidden rounded-[30px] border border-white/20 bg-[#0a1224] p-6 text-white shadow-[0_20px_56px_rgba(4,10,24,0.45)] md:p-8">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-8 top-0 h-44 w-44 rounded-full bg-[#5e8dff]/35 blur-3xl" />
          <div className="absolute bottom-0 right-6 h-48 w-48 rounded-full bg-[#20d2c5]/25 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />
        </div>
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Campaign Lobby</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">八重迷雾关卡</h1>
            <p className="mt-3 text-sm leading-relaxed text-white/80 md:text-base">
              选择一个情绪战场，进入沉浸式实战。前一关达到 60 分即可自动解锁下一关。
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link
                href="/dashboard"
                className="inline-flex cursor-pointer items-center justify-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:bg-white/20"
              >
                返回我的 AI
              </Link>
              <Link
                href="/"
                className="inline-flex cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/20 px-4 py-2 text-sm font-semibold text-white/85 transition-colors duration-200 hover:bg-black/35"
              >
                回到首页
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm md:min-w-[280px]">
            <article className="rounded-2xl border border-white/20 bg-black/30 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.12em] text-white/60">已解锁</p>
              <p className="mt-1 text-2xl font-black">{unlockedCount}</p>
            </article>
            <article className="rounded-2xl border border-white/20 bg-black/30 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.12em] text-white/60">最高分</p>
              <p className="mt-1 text-2xl font-black">{bestScore}</p>
            </article>
          </div>
        </div>
      </header>

      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {LEVELS.map((level) => {
          const unlocked = progress.unlocked_levels.includes(level.id);
          const bestScore = progress.level_best_scores[level.id] ?? null;

          return (
            <LevelGalleryCard key={level.id} level={level} unlocked={unlocked} bestScore={bestScore} />
          );
        })}
      </section>
    </main>
  );
}
