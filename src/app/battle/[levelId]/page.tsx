import Link from "next/link";
import { redirect } from "next/navigation";

import BattleClient from "@/app/battle/[levelId]/BattleClient";
import { getCurrentUser } from "@/lib/auth";
import { getLevelById } from "@/lib/levels";
import { isLevelUnlocked } from "@/lib/store";

export default async function BattlePage({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const { levelId } = await params;
  const numericLevelId = Number(levelId);
  const level = getLevelById(numericLevelId);

  if (!level) {
    return (
      <main className="page-shell">
        <section className="surface-card-strong p-8">
          <h1 className="section-title text-2xl">关卡不存在</h1>
          <Link href="/levels" className="btn-primary mt-5">
            返回关卡列表
          </Link>
        </section>
      </main>
    );
  }

  if (!isLevelUnlocked(user.id, level.id)) {
    return (
      <main className="page-shell">
        <section className="surface-card-strong p-8">
          <h1 className="section-title text-2xl">关卡未解锁</h1>
          <p className="mt-2 text-sm text-[var(--ink-3)]">请先完成前置关卡并获得 60 分以上。</p>
          <Link href="/levels" className="btn-primary mt-5">
            返回关卡列表
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <BattleClient level={level} userAIName={user.ai_name} userAvatar={user.ai_avatar} />
    </main>
  );
}
