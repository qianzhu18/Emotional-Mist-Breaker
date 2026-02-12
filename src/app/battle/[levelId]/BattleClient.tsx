"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { buildLevelThemeStyle, fogTagClass } from "@/lib/theme";
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

function UserAvatar({ name, avatar }: { name: string; avatar?: string }) {
  if (avatar) {
    return (
      <Image
        src={avatar}
        alt={name}
        width={84}
        height={84}
        className="portrait-face"
      />
    );
  }

  return (
    <div className="portrait-face flex items-center justify-center bg-[#edf3ff] text-2xl font-black text-[#2d6cdf]">
      {name.slice(0, 1)}
    </div>
  );
}

export default function BattleClient({ level, userAIName, userAvatar }: BattleClientProps) {
  const [session, setSession] = useState<ConversationRecord | null>(null);
  const [report, setReport] = useState<BattleReport | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<BattleMode>("fast");
  const [levelUp, setLevelUp] = useState<BattleResult["levelUp"]>();

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

  return (
    <section className="battle-stage p-4 md:p-6" style={buildLevelThemeStyle(level)}>
      {/* 场景背景横幅 */}
      <div className="scene-banner" style={{ backgroundImage: `url(${level.visual.artwork.scene})` }}>
        <div className="scene-banner-content">
          <p className="kicker text-white/70">{level.visual.chapter}</p>
          <h1 className="section-title mt-1 text-2xl text-white md:text-3xl">{level.title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-white/85">{level.background}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="level-chip">{level.visual.theme_name}</span>
            {level.learning_focus.map((focus) => (
              <span key={focus} className="level-chip">
                {focus}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 对战双方卡片 */}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <article className="portrait-card flex items-center gap-3">
          <div className="relative">
            <Image
              src={level.visual.artwork.portrait}
              alt={`${level.opponent_ai.name} 角色头像`}
              width={84}
              height={84}
              className="portrait-face"
            />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 border-2 border-white text-[10px] font-bold text-white shadow-lg">
              VS
            </span>
          </div>
          <div>
            <p className="kicker">对手角色</p>
            <h2 className="text-lg font-black" style={{ color: level.visual.palette.primary }}>
              {level.opponent_ai.name}
            </h2>
            <p className="text-sm text-[var(--ink-3)]">{level.opponent_ai.traits.join(" / ")}</p>
          </div>
        </article>

        <article className="portrait-card flex items-center gap-3">
          <UserAvatar name={userAIName} avatar={userAvatar} />
          <div>
            <p className="kicker">你的 AI</p>
            <h2 className="text-lg font-black text-[#20406f]">{userAIName}</h2>
            <p className="text-sm text-[var(--ink-3)]">目标：稳情绪、立边界、提问题、给方案</p>
          </div>
        </article>
      </div>

      {/* 回合进度 */}
      <div className="mt-4 surface-card p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p>
            回合进度：
            <strong>
              {session?.current_round ?? 0}/{level.rounds}
            </strong>
          </p>
          <p className="text-[var(--ink-3)]">
            FOG：fear {fogSummary.fear} · obligation {fogSummary.obligation} · guilt {fogSummary.guilt}
          </p>
        </div>
        <div className="progress-track mt-2">
          <div className="progress-fill" style={{ width: `${progressRatio}%` }} />
        </div>
      </div>

      {/* 对话区域 */}
      <div className="mt-4 chat-box">
        <div className="chat-background" style={{ backgroundImage: `url(${level.visual.artwork.scene})`, opacity: 0.08 }} />
        <div className="relative z-10">
          {(session?.messages ?? []).map((message, index) => {
            const isOpponent = message.sender === "opponent_ai";
            const roleName = isOpponent ? level.opponent_ai.name : userAIName;

            return (
              <article
                key={`${message.timestamp}-${index}`}
                className={`chat-entry ${isOpponent ? "opponent" : "self"}`}
              >
                {isOpponent ? (
                  <div className="chat-avatar-wrapper">
                    <Image
                      src={level.visual.artwork.portrait}
                      alt={level.opponent_ai.name}
                      width={42}
                      height={42}
                      className="chat-avatar"
                    />
                  </div>
                ) : (
                  <div className="chat-avatar-wrapper">
                    {userAvatar ? (
                      <Image src={userAvatar} alt={userAIName} width={42} height={42} className="chat-avatar" />
                    ) : (
                      <div className="chat-avatar flex items-center justify-center text-xs font-bold text-[#2d6cdf]">
                        {userAIName.slice(0, 1)}
                      </div>
                    )}
                  </div>
                )}

                <div className="chat-bubble">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] opacity-75">{roleName}</p>
                  <p className="text-[15px] leading-relaxed">{message.text}</p>
                  {isOpponent && message.fog_tag ? (
                    <span className={`mt-2 inline-flex ${fogTagClass(message.fog_tag)}`}>
                      {fogLabel(message.fog_tag)}
                    </span>
                  ) : null}
                </div>
              </article>
            );
          })}

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[var(--ink-3)]">
              <div className="animate-spin w-4 h-4 border-2 border-[var(--ink-3)] border-t-transparent rounded-full" style={{ borderTopColor: level.visual.palette.primary }} />
              系统正在推演本关对话...
            </div>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-[#e2bdc0] bg-[#fff4f5] px-3 py-2 text-sm text-[#8f2831]">
          {error}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={oneClickBattle} disabled={loading} className="btn-primary disabled:cursor-not-allowed disabled:opacity-65">
          一键自动完成本关
        </button>

        {!session ? (
          <button onClick={startManualBattle} disabled={loading} className="btn-ghost disabled:cursor-not-allowed disabled:opacity-65">
            逐轮模式（调试）
          </button>
        ) : session.status === "active" ? (
          <button onClick={nextManualRound} disabled={loading} className="btn-ghost disabled:cursor-not-allowed disabled:opacity-65">
            手动下一轮
          </button>
        ) : null}

        <div className="ml-auto flex items-center gap-2 text-sm">
          <label htmlFor="battle-mode" className="text-[var(--ink-3)]">
            推演模式
          </label>
          <select
            id="battle-mode"
            value={mode}
            onChange={(event) => setMode(event.target.value as BattleMode)}
            className="rounded-lg border border-[#c7ced8] bg-white px-2 py-1 text-sm"
          >
            <option value="fast">fast（推荐，游戏感）</option>
            <option value="real">real（调用外部AI）</option>
          </select>
        </div>
      </div>

      {session?.status === "completed" && report ? (
        <div className="mt-4 surface-card p-4">
          <p className="text-sm">
            本关完成：<strong>{report.total_score}</strong> 分，评级 <strong>{report.grade}</strong>
          </p>
          {levelUp?.leveledUp ? (
            <p className="mt-1 text-sm text-[var(--ink-3)]">
              等级提升：Lv.{levelUp.oldLevel} → Lv.{levelUp.newLevel}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={`/report/${session.id}`} className="btn-primary">
              查看学习复盘
            </Link>
            <Link href="/levels" className="btn-ghost">
              返回关卡大厅
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
