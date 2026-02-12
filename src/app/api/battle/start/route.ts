import { getCurrentUser } from "@/lib/auth";
import { openBattleSession, readBattleMode } from "@/lib/engine";
import { badRequest, forbidden, notFound, ok, unauthorized } from "@/lib/http";
import { getLevelById } from "@/lib/levels";
import { getUserProgress, isLevelUnlocked } from "@/lib/store";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const body = (await request.json().catch(() => null)) as {
    levelId?: number | string;
    mode?: "fast" | "real";
  } | null;
  const levelId = Number(body?.levelId);

  if (!Number.isInteger(levelId) || levelId < 1) {
    return badRequest("请提供正确的关卡ID");
  }

  const level = getLevelById(levelId);

  if (!level) {
    return notFound("关卡不存在");
  }

  if (!(await isLevelUnlocked(user.id, levelId))) {
    const progress = await getUserProgress(user.id);
    return forbidden(`关卡未解锁。已解锁关卡：${progress.unlocked_levels.join(", ")}`);
  }

  const mode = readBattleMode(body?.mode);
  const session = await openBattleSession({
    userId: user.id,
    level,
    mode,
  });

  return ok({
    mode,
    session,
    level,
  });
}
