"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import type {
  BattleMode,
  BattleReport,
  ConversationRecord,
  LevelConfig,
  Message,
} from "@/types/domain";

interface BattleClientProps {
  level: LevelConfig;
  userAIName: string;
  userAvatar?: string;
}

interface BattleResult {
  completed: boolean;
  session: ConversationRecord;
  report?: BattleReport;
  levelUp?: {
    leveledUp: boolean;
    oldLevel: number;
    newLevel: number;
  };
  mode?: BattleMode;
}

function normalizeResponse(response: Response): Promise<BattleResult> {
  return response.json().then((payload) => {
    if (!response.ok) {
      throw new Error((payload as { error?: string }).error || "请求失败");
    }

    return payload as BattleResult;
  });
}

function fogLabel(fog?: Message["fog_tag"]): string {
  if (fog === "fear") return "fear";
  if (fog === "obligation") return "obligation";
  if (fog === "guilt") return "guilt";
  return "none";
}

function fogChipClass(fog?: Message["fog_tag"]): string {
  if (fog === "fear") return "border-rose-300/60 bg-rose-500/15 text-rose-100";
  if (fog === "obligation") return "border-amber-300/60 bg-amber-500/15 text-amber-100";
  if (fog === "guilt") return "border-teal-300/60 bg-teal-500/15 text-teal-100";
  return "border-white/30 bg-white/10 text-white/70";
}

function UserBadge({ name, avatar }: { name: string; avatar?: string }) {
  if (avatar) {
    return (
      <Image
        src={avatar}
        alt={name}
        width={34}
        height={34}
        className="h-[34px] w-[34px] rounded-full border border-white/25 object-cover"
      />
    );
  }

  return (
    <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/25 bg-white/10 text-sm font-bold">
      {name.slice(0, 1)}
    </span>
  );
}

const actionButtonClass =
  "inline-flex cursor-pointer items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-55";

export default function BattleClient({ level, userAIName, userAvatar }: BattleClientProps) {
  const [session, setSession] = useState<ConversationRecord | null>(null);
  const [report, setReport] = useState<BattleReport | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<BattleMode>("fast");
  const [levelUp, setLevelUp] = useState<BattleResult["levelUp"]>();

  const shouldReduceMotion = useReducedMotion();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const progressRatio =
    session && session.max_rounds > 0
      ? Math.min(100, Math.round((session.current_round / session.max_rounds) * 100))
      : 0;

  const fogSummary = useMemo(() => {
    const summary = { fear: 0, obligation: 0, guilt: 0 };

    (session?.messages ?? []).forEach((item) => {
      if (item.fog_tag === "fear") summary.fear += 1;
      if (item.fog_tag === "obligation") summary.obligation += 1;
      if (item.fog_tag === "guilt") summary.guilt += 1;
    });

    return summary;
  }, [session?.messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
  }, [session?.messages, loading, shouldReduceMotion]);

  async function oneClickBattle() {
    try {
      setError("");
      setLoading(true);

      const response = await fetch("/api/battle/autoplay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levelId: level.id, mode }),
      });

      const data = await normalizeResponse(response);
      setSession(data.session);
      setReport(data.report ?? null);
      setLevelUp(data.levelUp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "自动对战失败");
    } finally {
      setLoading(false);
    }
  }

  async function startManualBattle() {
    try {
      setError("");
      setLoading(true);
      setReport(null);

      const response = await fetch("/api/battle/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levelId: level.id, mode }),
      });

      const data = await normalizeResponse(response);
      setSession(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "初始化战斗失败");
    } finally {
      setLoading(false);
    }
  }

  async function nextManualRound() {
    if (!session) {
      return;
    }

    try {
      setError("");
      setLoading(true);

      const response = await fetch("/api/battle/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, mode }),
      });

      const data = await normalizeResponse(response);
      setSession(data.session);

      if (data.completed && data.report) {
        setReport(data.report);
        setLevelUp(data.levelUp);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "推进回合失败");
    } finally {
      setLoading(false);
    }
  }

  const messages = session?.messages ?? [];

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#040912] text-white">
      <motion.div
        className="absolute inset-0 z-0"
        initial={shouldReduceMotion ? false : { scale: 1.06 }}
        animate={shouldReduceMotion ? { scale: 1 } : { scale: [1.06, 1, 1.06] }}
        transition={
          shouldReduceMotion
            ? undefined
            : {
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }
        }
      >
        <Image
          src={level.visual.artwork.scene}
          alt={`${level.title} 战斗场景`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.18),transparent_32%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/55 to-black/90" />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 z-[5]" aria-hidden="true">
        <div
          className="absolute -left-16 top-16 h-56 w-56 rounded-full blur-3xl"
          style={{ backgroundColor: `${level.visual.palette.primary}66` }}
        />
        <div
          className="absolute bottom-10 right-10 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: `${level.visual.palette.secondary}66` }}
        />
      </div>

      <header className="absolute inset-x-0 top-0 z-20 px-4 pb-3 pt-4 md:px-8 md:pt-6">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/20 bg-black/35 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/levels"
              className="inline-flex cursor-pointer items-center rounded-full border border-white/30 bg-black/25 px-3 py-1.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/20"
            >
              返回关卡大厅
            </Link>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/65">{level.visual.chapter}</p>
              <h1 className="text-lg font-black tracking-tight text-white md:text-xl">{level.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right md:block">
              <p className="text-xs text-white/65">FOG</p>
              <p className="text-sm font-semibold text-white/90">
                fear {fogSummary.fear} · obligation {fogSummary.obligation} · guilt {fogSummary.guilt}
              </p>
            </div>
            <div className="min-w-[150px]">
              <p className="text-right text-xs font-mono text-white/70">
                ROUND {session?.current_round ?? 0} / {level.rounds}
              </p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/20">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: level.visual.palette.primary }}
                  initial={false}
                  animate={{ width: `${progressRatio}%` }}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.35 }}
                />
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2 py-1 text-xs text-white/85 md:flex">
              <UserBadge name={userAIName} avatar={userAvatar} />
              <span>{userAIName}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-full items-end justify-center px-2 md:justify-end md:pr-12">
        <motion.div
          className="relative h-[66vh] w-[92vw] md:h-[88vh] md:w-[40vw]"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24, x: 18 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: "easeOut" }}
        >
          <Image
            src={level.visual.artwork.portrait}
            alt={`${level.opponent_ai.name} 立绘`}
            fill
            sizes="(max-width: 768px) 95vw, 40vw"
            className="object-contain object-bottom drop-shadow-[0_0_32px_rgba(0,0,0,0.55)]"
          />
        </motion.div>
      </div>

      <section className="absolute inset-x-0 bottom-0 z-30 pb-4 md:pb-8">
        <div className="mx-auto w-full max-w-5xl px-3 md:px-6">
          <div className="rounded-3xl border border-white/20 bg-black/40 p-3 backdrop-blur-xl shadow-[0_22px_48px_rgba(0,0,0,0.45)] md:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white/85">对话流（Visual Novel 模式）</p>
              <p className="text-xs text-white/65">对手：{level.opponent_ai.name}</p>
            </div>

            <div
              className="mt-3 h-[34vh] space-y-3 overflow-y-auto pr-1 md:h-[38vh] md:pr-2"
              style={{ maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 92%, transparent 100%)" }}
            >
              {messages.length === 0 && !loading ? (
                <div className="rounded-2xl border border-white/15 bg-black/35 px-4 py-5 text-sm text-white/75">
                  点击「一键自动完成本关」或「逐轮模式」开始战斗。
                </div>
              ) : null}

              <AnimatePresence initial={false}>
                {messages.map((message, index) => {
                  const isOpponent = message.sender === "opponent_ai";
                  const roleName = isOpponent ? level.opponent_ai.name : userAIName;

                  return (
                    <motion.article
                      key={`${message.timestamp}-${index}`}
                      className={`flex w-full ${isOpponent ? "justify-start" : "justify-end"}`}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
                      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.22 }}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl border px-4 py-3 md:max-w-[74%] md:px-5 md:py-4 ${
                          isOpponent
                            ? "rounded-tl-sm border-white/20 bg-black/60 text-white"
                            : "rounded-tr-sm border-white/45 bg-white/92 text-slate-900"
                        }`}
                        style={
                          isOpponent
                            ? {
                                borderLeftWidth: 4,
                                borderLeftColor: level.visual.palette.primary,
                              }
                            : undefined
                        }
                      >
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.09em] opacity-70">{roleName}</p>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed md:text-base">{message.text}</p>
                        {isOpponent && message.fog_tag ? (
                          <span
                            className={`mt-2 inline-flex rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${fogChipClass(
                              message.fog_tag
                            )}`}
                          >
                            {fogLabel(message.fog_tag)}
                          </span>
                        ) : null}
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>

              {loading ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/45 px-3 py-1.5 text-xs text-white/80">
                  <span
                    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/60 border-t-transparent"
                    aria-hidden="true"
                  />
                  系统正在推演本关对话...
                </div>
              ) : null}

              <div ref={messagesEndRef} />
            </div>

            {error ? (
              <div className="mt-3 rounded-xl border border-rose-300/55 bg-rose-500/15 px-3 py-2 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={oneClickBattle}
                  disabled={loading}
                  className={`${actionButtonClass} border-white/70 bg-white text-slate-900 hover:bg-slate-100`}
                >
                  一键自动完成本关
                </button>

                {!session ? (
                  <button
                    onClick={startManualBattle}
                    disabled={loading}
                    className={`${actionButtonClass} border-white/35 bg-black/30 text-white hover:bg-white/15`}
                  >
                    逐轮模式（调试）
                  </button>
                ) : session.status === "active" ? (
                  <button
                    onClick={nextManualRound}
                    disabled={loading}
                    className={`${actionButtonClass} border-white/35 bg-black/30 text-white hover:bg-white/15`}
                  >
                    手动下一轮
                  </button>
                ) : null}

                <Link
                  href="/levels"
                  className={`${actionButtonClass} border-white/25 bg-transparent text-white/85 hover:bg-white/15`}
                >
                  退出本局
                </Link>
              </div>

              <label htmlFor="battle-mode" className="flex items-center gap-2 text-sm text-white/80 lg:justify-self-end">
                推演模式
                <select
                  id="battle-mode"
                  value={mode}
                  onChange={(event) => setMode(event.target.value as BattleMode)}
                  className="cursor-pointer rounded-lg border border-white/35 bg-black/35 px-2.5 py-1.5 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  <option value="fast">fast（推荐，游戏感）</option>
                  <option value="real">real（调用外部AI）</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </section>

      {session?.status === "completed" && report ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/20 bg-[#0b1322]/95 p-6 text-white shadow-[0_18px_42px_rgba(0,0,0,0.45)]">
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">Battle Finished</p>
            <h2 className="mt-2 text-3xl font-black">评分 {report.total_score}</h2>
            <p className="mt-1 text-base text-white/85">评级 {report.grade}</p>
            {levelUp?.leveledUp ? (
              <p className="mt-2 text-sm text-white/75">等级提升：Lv.{levelUp.oldLevel} → Lv.{levelUp.newLevel}</p>
            ) : null}
            <div className="mt-5 grid gap-2">
              <Link
                href={`/report/${session.id}`}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-white/70 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition-colors duration-200 hover:bg-slate-100"
              >
                查看学习复盘
              </Link>
              <Link
                href="/levels"
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/20"
              >
                返回关卡大厅
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
