import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
      return;
    }

    if (typeof value === "string") {
      query.set(key, value);
    }
  });

  const callbackHref = query.toString() ? `/api/auth/callback?${query.toString()}` : "/api/auth/callback";

  return (
    <main className="page-shell">
      <section className="surface-card-strong mx-auto max-w-xl p-6 text-center">
        <p className="kicker">OAuth Callback</p>
        <h1 className="section-title mt-1 text-2xl">正在处理授权回调</h1>
        <p className="mt-2 text-sm text-[var(--ink-3)]">
          若没有自动跳转，请点击下方按钮继续。
        </p>
        <Link href={callbackHref} className="btn-primary mt-4">
          继续处理授权
        </Link>
      </section>
    </main>
  );
}
