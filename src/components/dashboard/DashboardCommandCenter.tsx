"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { MistBackground } from "@/components/ui/MistBackground";

interface StatItem {
  label: string;
  value: number;
  colorClass: string;
}

interface RecentBattleItem {
  id: string;
  title: string;
  status: "completed" | "active";
  totalScore: number | null;
  href: string;
}

interface DashboardCommandCenterProps {
  aiName: string;
  aiAvatar?: string;
  aiPersonality: string;
  level: number;
  levelTitle: string;
  experience: number;
  expProgress: number;
  nextThreshold: number;
  unlockedCount: number;
  totalLevels: number;
  clearedCount: number;
  winRate: number;
  nextTarget: string;
  nextTargetHint: string;
  stats: StatItem[];
  recentBattles: RecentBattleItem[];
}

function StatusDot() {
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/80 opacity-70" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
    </span>
  );
}

export function DashboardCommandCenter(props: DashboardCommandCenterProps) {
  const {
    aiName,
    aiAvatar,
    aiPersonality,
    level,
    levelTitle,
    experience,
    expProgress,
    nextThreshold,
    unlockedCount,
    totalLevels,
    clearedCount,
    winRate,
    nextTarget,
    nextTargetHint,
    stats,
    recentBattles,
  } = props;

  const reduceMotion = useReducedMotion();

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-slate-100">
      <MistBackground intensity="storm" />

      <nav className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/45 px-4 py-3 backdrop-blur-md md:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.9)]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">Command Center</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
            <Link href="/levels" className="rounded-full border border-white/20 px-3 py-1.5 transition-colors duration-200 hover:bg-white/15">
              Missions
            </Link>
            <a href="/api/auth" className="rounded-full border border-white/20 px-3 py-1.5 transition-colors duration-200 hover:bg-white/15">
              Re-Auth
            </a>
            <Link href="/" className="rounded-full border border-white/20 px-3 py-1.5 transition-colors duration-200 hover:bg-white/15">
              Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 pb-8 pt-24 md:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-12">
          <motion.section
            className="relative overflow-hidden rounded-3xl border border-white/15 bg-black/40 p-6 backdrop-blur-xl lg:col-span-5 xl:col-span-4"
            initial={reduceMotion ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.6, ease: "easeOut" }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true">
              <div className="absolute inset-0 [background:linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.28)_50%),linear-gradient(90deg,rgba(56,189,248,0.08),rgba(255,255,255,0.02),rgba(56,189,248,0.08))] [background-size:100%_2px,3px_100%]" />
            </div>

            <div className="relative z-10">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Project Agent</p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">{aiName}</h1>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300/90">{aiPersonality}</p>
                </div>
                {aiAvatar ? (
                  <Image
                    src={aiAvatar}
                    alt={aiName}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full border border-white/30 object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/10 text-xl font-black text-cyan-200">
                    {aiName.slice(0, 1)}
                  </div>
                )}
              </div>

              <div className="space-y-5">
                {stats.map((stat, index) => (
                  <div key={stat.label}>
                    <div className="mb-1.5 flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-slate-300">
                      <span>{stat.label}</span>
                      <span>{stat.value}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className={`h-full ${stat.colorClass}`}
                        initial={reduceMotion ? false : { width: 0 }}
                        animate={{ width: `${stat.value}%` }}
                        transition={reduceMotion ? undefined : { duration: 0.8, delay: 0.2 + index * 0.12 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
                <article className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Level</p>
                  <p className="mt-1 text-2xl font-mono font-bold text-white">Lv.{level}</p>
                  <p className="text-xs text-cyan-200/85">{levelTitle}</p>
                </article>
                <article className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Exp</p>
                  <p className="mt-1 text-2xl font-mono font-bold text-white">{experience}</p>
                  <p className="text-xs text-slate-300/80">{expProgress}% / next {nextThreshold}</p>
                </article>
              </div>
            </div>
          </motion.section>

          <div className="flex flex-col gap-6 lg:col-span-7 xl:col-span-8">
            <motion.section
              className="grid grid-cols-2 gap-4 md:grid-cols-3"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? undefined : { duration: 0.55, delay: 0.1 }}
            >
              <article className="rounded-2xl border border-white/15 bg-black/35 px-5 py-4 backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Cleared</p>
                <p className="mt-1 text-3xl font-black text-white">
                  {clearedCount}
                  <span className="text-lg text-slate-400"> / {totalLevels}</span>
                </p>
              </article>
              <article className="rounded-2xl border border-white/15 bg-black/35 px-5 py-4 backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Win Rate</p>
                <p className="mt-1 text-3xl font-black text-emerald-400">{winRate}%</p>
              </article>
              <article className="col-span-2 rounded-2xl border border-white/15 bg-black/35 px-5 py-4 backdrop-blur-md md:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Unlocked</p>
                <p className="mt-1 text-3xl font-black text-white">
                  {unlockedCount}
                  <span className="text-lg text-slate-400"> / {totalLevels}</span>
                </p>
              </article>
            </motion.section>

            <motion.section
              className="group relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-sky-900/35 via-[#0b1325]/90 to-black px-6 py-7"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={reduceMotion ? undefined : { duration: 0.6, delay: 0.22 }}
            >
              <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.3),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(56,189,248,0.4),transparent_38%)]" />
              <div className="relative z-10 flex flex-col gap-8">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusDot />
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">Current Objective</span>
                  </div>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">{nextTarget}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300/90">{nextTargetHint}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/levels"
                    className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-white px-7 py-3 text-sm font-bold tracking-[0.12em] text-slate-900 transition-colors duration-200 hover:bg-slate-100"
                  >
                    DEPLOY TO BATTLE
                  </Link>
                  <Link
                    href="/levels"
                    className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-white/25 bg-black/30 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/12"
                  >
                    CONFIGURE
                  </Link>
                </div>
              </div>
            </motion.section>

            <motion.section
              className="rounded-3xl border border-white/15 bg-black/35 p-5 backdrop-blur-lg"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? undefined : { duration: 0.55, delay: 0.3 }}
            >
              <h3 className="text-lg font-bold tracking-tight text-white">Recent Battles</h3>
              {recentBattles.length === 0 ? (
                <p className="mt-3 text-sm text-slate-300/80">暂无战绩，建议先挑战第 1 关建立基线。</p>
              ) : (
                <ul className="mt-3 space-y-2.5">
                  {recentBattles.map((battle) => (
                    <li
                      key={battle.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/12 bg-black/30 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white/95">{battle.title}</p>
                        <p className="text-xs text-slate-300/70">
                          状态：{battle.status === "completed" ? "已结算" : "进行中"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-slate-200/90">
                          {battle.totalScore != null ? `分数 ${battle.totalScore}` : "未结算"}
                        </p>
                        <Link
                          href={battle.href}
                          className="inline-flex cursor-pointer items-center rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold transition-colors duration-200 hover:bg-white/20"
                        >
                          {battle.status === "completed" ? "查看复盘" : "继续战斗"}
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  );
}
