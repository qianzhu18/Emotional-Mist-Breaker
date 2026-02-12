"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { MistBackground } from "@/components/ui/MistBackground";

interface HomeLauncherProps {
  errorMessage?: string;
}

export function HomeLauncher({ errorMessage }: HomeLauncherProps) {
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 text-white md:px-6">
      <MistBackground intensity="normal" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center">
        <motion.div
          className="mx-auto flex w-full max-w-4xl flex-col items-center text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? undefined : { duration: 0.72, ease: "easeOut" }}
        >
          <motion.div
            className="mb-8 h-24 w-px bg-gradient-to-b from-transparent via-white/60 to-transparent"
            initial={reduceMotion ? false : { scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={reduceMotion ? undefined : { duration: 0.9, delay: 0.24 }}
          />

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200/85">A2A Emotional Training</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-7xl md:text-8xl">
            <span className="block bg-gradient-to-b from-white via-white/95 to-white/45 bg-clip-text text-transparent">
              EMOTIONAL
            </span>
            <span className="block text-white/80 [text-shadow:0_0_24px_rgba(56,189,248,0.35)]">MIST BREAKER</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-200/85 md:text-lg">
            在 AI 编织的情感迷雾中识别勒索、重铸边界、赢得博弈。你的智能体将通过 8 重关卡完成完整反制训练。
          </p>

          {errorMessage ? (
            <div className="mt-6 w-full max-w-xl rounded-2xl border border-rose-300/50 bg-rose-500/15 px-4 py-3 text-left text-sm text-rose-100">
              登录失败：{errorMessage}
            </div>
          ) : null}

          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.65, delay: 0.3 }}
          >
            <a
              href="/api/auth"
              className="group relative inline-flex cursor-pointer items-center gap-3 rounded-full border border-cyan-300/50 bg-white px-8 py-3 text-sm font-bold tracking-[0.16em] text-slate-900 transition-colors duration-200 hover:bg-cyan-50"
            >
              <span className="absolute -inset-0.5 -z-10 rounded-full bg-gradient-to-r from-cyan-400/50 via-sky-500/45 to-indigo-400/50 blur-md transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" />
              START LINK
              <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <Link
              href="/levels"
              className="inline-flex cursor-pointer items-center rounded-full border border-white/30 bg-black/25 px-7 py-3 text-sm font-semibold tracking-[0.08em] text-white transition-colors duration-200 hover:bg-white/12"
            >
              先看关卡
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex cursor-pointer items-center rounded-full border border-white/20 bg-white/10 px-7 py-3 text-sm font-semibold tracking-[0.08em] text-white transition-colors duration-200 hover:bg-white/20"
            >
              进入指挥中心
            </Link>
          </motion.div>
        </motion.div>

        <motion.section
          className="relative z-10 mt-10 grid gap-3 sm:grid-cols-3"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? undefined : { duration: 0.6, delay: 0.42 }}
        >
          <article className="rounded-2xl border border-white/15 bg-black/35 p-4 backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/90">One Click</p>
            <p className="mt-2 text-sm leading-relaxed text-white/85">一键自动推演整关，保留完整对话与战报。</p>
          </article>
          <article className="rounded-2xl border border-white/15 bg-black/35 p-4 backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/90">8 Characters</p>
            <p className="mt-2 text-sm leading-relaxed text-white/85">八位对手、八种话术、八层心理战场。</p>
          </article>
          <article className="rounded-2xl border border-white/15 bg-black/35 p-4 backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/90">Study Material</p>
            <p className="mt-2 text-sm leading-relaxed text-white/85">自动生成复盘要点与下一步行动建议。</p>
          </article>
        </motion.section>
      </div>
    </main>
  );
}
