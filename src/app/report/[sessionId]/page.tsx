import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { getLevelById } from "@/lib/levels";
import { getConversationById } from "@/lib/store";
import { buildLevelThemeStyle, fogTagClass } from "@/lib/theme";

function barWidth(value: number, max: number): string {
  return `${Math.max(0, Math.min(100, Math.round((value / max) * 100)))}%`;
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const { sessionId } = await params;
  const session = getConversationById(sessionId);

  if (!session || session.user_id !== user.id) {
    redirect("/levels");
  }

  if (session.status !== "completed") {
    redirect(`/battle/${session.level_id}`);
  }

  const level = getLevelById(session.level_id);
  const breakdown = session.score_breakdown;

  if (!breakdown || !session.fog_analysis || !session.grade || !level || !session.learning_sheet) {
    redirect(`/battle/${session.level_id}`);
  }

  const scoreItems = [
    { label: "边界意识", value: breakdown.boundary, max: 30 },
    { label: "质疑能力", value: breakdown.questioning, max: 20 },
    { label: "情绪稳定", value: breakdown.stability, max: 20 },
    { label: "主动验证", value: breakdown.action, max: 15 },
    { label: "同理沟通", value: breakdown.empathy, max: 15 },
  ];

  const sheet = session.learning_sheet;

  return (
    <main className="page-shell">
      <section className="surface-card-strong p-5 md:p-7" style={buildLevelThemeStyle(level)}>
        <header className="scene-banner" style={{ backgroundImage: `url(${level.visual.artwork.scene})` }}>
          <div className="scene-banner-content">
            <p className="kicker text-white/75">Report · {level.visual.chapter}</p>
            <h1 className="section-title mt-1 text-2xl text-white md:text-3xl">{level.title}</h1>
            <p className="mt-1 text-sm text-white/88">总分 {session.total_score}/100 · 评级 {session.grade}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={fogTagClass("fear")}>fear {session.fog_analysis.fear_count}</span>
              <span className={fogTagClass("obligation")}>obligation {session.fog_analysis.obligation_count}</span>
              <span className={fogTagClass("guilt")}>guilt {session.fog_analysis.guilt_count}</span>
            </div>
          </div>
        </header>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <article className="surface-card p-4">
            <h2 className="section-title text-xl">五维评分</h2>
            <ul className="score-grid mt-3">
              {scoreItems.map((item) => (
                <li key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{item.label}</span>
                    <span>
                      <strong>{item.value}</strong>/{item.max}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: barWidth(item.value, item.max) }} />
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="surface-card p-4">
            <h2 className="section-title text-xl">关键时刻</h2>
            <div className="mt-3 space-y-3">
              {(session.key_moments ?? []).map((moment, index) => (
                <article key={`${moment.type}-${index}`} className="study-block">
                  <p className="kicker">{moment.type === "best" ? "最佳回应" : "待优化回应"}</p>
                  <p className="mt-1 text-sm text-[var(--ink-2)]">对手：{moment.opponent_line}</p>
                  <p className="mt-1 text-sm text-[var(--ink-2)]">你的AI：{moment.user_response}</p>
                  <p className="mt-2 text-sm text-[var(--ink-3)]">点评：{moment.comment}</p>
                </article>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <article className="surface-card p-4">
            <h2 className="section-title text-xl">本关学习资料</h2>
            <p className="mt-2 text-sm text-[var(--ink-2)]">{sheet.summary}</p>

            <div className="mt-3 space-y-3">
              {sheet.manipulations.map((item, index) => (
                <article key={`${item.trigger_line}-${index}`} className="study-block">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={fogTagClass(item.fog_type)}>{item.fog_type}</span>
                    <p className="text-sm font-semibold">{item.pattern_name}</p>
                  </div>
                  <p className="mt-1 text-sm text-[var(--ink-2)]">触发话术：{item.trigger_line}</p>
                  <p className="mt-1 text-sm text-[var(--ink-3)]">风险：{item.risk}</p>
                  <p className="mt-1 text-sm text-[var(--ink-3)]">应对：{item.counter_strategy}</p>
                </article>
              ))}
            </div>
          </article>

          <article className="surface-card p-4">
            <h2 className="section-title text-xl">训练建议</h2>

            <div className="mt-3 study-block">
              <p className="kicker">你做得好的地方</p>
              <ul className="study-list mt-1">
                {sheet.strengths.length > 0 ? (
                  sheet.strengths.map((item) => <li key={item}>{item}</li>)
                ) : (
                  <li>当前优势不明显，建议先重点练习边界表达。</li>
                )}
              </ul>
            </div>

            <div className="mt-3 study-block">
              <p className="kicker">还需改进</p>
              <ul className="study-list mt-1">
                {sheet.weaknesses.length > 0 ? (
                  sheet.weaknesses.map((item) => <li key={item}>{item}</li>)
                ) : (
                  <li>本关表现均衡，建议提升高压场景复用能力。</li>
                )}
              </ul>
            </div>

            <div className="mt-3 study-block">
              <p className="kicker">适用场景</p>
              <ul className="study-list mt-1">
                {sheet.applicable_scenarios.map((item) => (
                  <li key={item.scene}>
                    {item.scene}：{item.recommended_response}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3 study-block">
              <p className="kicker">下一步行动</p>
              <ul className="study-list mt-1">
                {sheet.next_actions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </article>
        </section>

        <section className="mt-4 surface-card p-4">
          <h2 className="section-title text-xl">角色复盘视角</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Image
              src={level.visual.artwork.portrait}
              alt={`${level.opponent_ai.name} 角色`}
              width={72}
              height={72}
              className="rounded-full border border-[#d4dae4]"
            />
            <div>
              <p className="text-sm font-semibold" style={{ color: level.visual.palette.primary }}>
                {level.opponent_ai.name} · {level.visual.theme_name}
              </p>
              <p className="text-sm text-[var(--ink-3)]">本关学习焦点：{level.learning_focus.join(" / ")}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/battle/${session.level_id}`} className="btn-ghost">
              再次挑战
            </Link>
            <Link href="/levels" className="btn-primary">
              前往下一关
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
