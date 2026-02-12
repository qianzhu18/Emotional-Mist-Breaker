import { getCurrentUser } from "@/lib/auth";
import { autoRunBattle } from "@/lib/engine";
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

  if (!isLevelUnlocked(user.id, levelId)) {
    const progress = getUserProgress(user.id);
    return forbidden(`关卡未解锁。已解锁关卡：${progress.unlocked_levels.join(", ")}`);
  }

  try {
    const result = await autoRunBattle({
      user,
      level,
      modeInput: body?.mode,
    });

    return ok(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "自动对战失败";
    return badRequest(message);
  }
}
