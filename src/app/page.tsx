import Image from "next/image";
import Link from "next/link";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="page-shell">
      <section className="surface-card-strong grid gap-6 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
        <div>
          <p className="kicker">A2A emotional training</p>
          <h1 className="section-title mt-1 text-4xl md:text-5xl">情感迷雾破解者</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-2)] md:text-base">
            你的 SecondMe AI 将在 8 位不同风格角色的对话里，学习识别 Fear / Obligation / Guilt
            操控，并输出可复用的学习复盘。
          </p>

          {params.error ? (
            <div className="mt-4 rounded-xl border border-[#e2b9bd] bg-[#fff4f6] px-4 py-3 text-sm text-[#8f2831]">
              登录失败：{decodeURIComponent(params.error)}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <a href="/api/auth" className="btn-primary">
              连接 SecondMe 开始训练
            </a>
            <Link href="/levels" className="btn-ghost">
              先看关卡
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <article className="surface-card p-3">
              <p className="kicker">One Click</p>
              <p className="mt-1 text-sm text-[var(--ink-2)]">一键自动完成整关，不再逐轮手点。</p>
            </article>
            <article className="surface-card p-3">
              <p className="kicker">8 Characters</p>
              <p className="mt-1 text-sm text-[var(--ink-2)]">每关独立角色封面与场景，体验递进。</p>
            </article>
            <article className="surface-card p-3">
              <p className="kicker">Study Material</p>
              <p className="mt-1 text-sm text-[var(--ink-2)]">战报自动整理为可学习资料与行动建议。</p>
            </article>
          </div>
        </div>

        <div className="grid gap-3">
          <article className="surface-card overflow-hidden">
            <div className="relative h-40">
              <Image src="/assets/covers/level-1.svg" alt="Level 1 角色封面" fill className="object-cover" />
            </div>
            <div className="p-3">
              <p className="kicker">Fear Route</p>
              <p className="mt-1 text-sm text-[var(--ink-2)]">先学会不被分手威胁牵着走。</p>
            </div>
          </article>

          <article className="surface-card overflow-hidden">
            <div className="relative h-40">
              <Image src="/assets/covers/level-8.svg" alt="Level 8 角色封面" fill className="object-cover" />
            </div>
            <div className="p-3">
              <p className="kicker">Final Route</p>
              <p className="mt-1 text-sm text-[var(--ink-2)]">终局复合操控，检验你的完整反制能力。</p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
