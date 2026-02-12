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
      <main className="min-h-screen px-4 py-8 md:px-8">
        <section className="mx-auto max-w-2xl rounded-3xl border border-white/20 bg-[#0b1323] p-8 text-white shadow-[0_18px_42px_rgba(0,0,0,0.32)]">
          <h1 className="text-2xl font-black">关卡不存在</h1>
          <Link
            href="/levels"
            className="mt-5 inline-flex cursor-pointer items-center rounded-xl border border-white/70 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors duration-200 hover:bg-slate-100"
          >
            返回关卡列表
          </Link>
        </section>
      </main>
    );
  }

  if (!(await isLevelUnlocked(user.id, level.id))) {
    return (
      <main className="min-h-screen px-4 py-8 md:px-8">
        <section className="mx-auto max-w-2xl rounded-3xl border border-white/20 bg-[#0b1323] p-8 text-white shadow-[0_18px_42px_rgba(0,0,0,0.32)]">
          <h1 className="text-2xl font-black">关卡未解锁</h1>
          <p className="mt-2 text-sm text-white/75">请先完成前置关卡并获得 60 分以上。</p>
          <Link
            href="/levels"
            className="mt-5 inline-flex cursor-pointer items-center rounded-xl border border-white/70 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors duration-200 hover:bg-slate-100"
          >
            返回关卡列表
          </Link>
        </section>
      </main>
    );
  }

  return <BattleClient level={level} userAIName={user.ai_name} userAvatar={user.ai_avatar} />;
}
