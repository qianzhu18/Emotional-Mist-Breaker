import { getCurrentUser } from "@/lib/auth";
import { ok, unauthorized } from "@/lib/http";
import { LEVELS } from "@/lib/levels";
import { getUserProgress } from "@/lib/store";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const progress = getUserProgress(user.id);

  const levels = LEVELS.map((level) => ({
    ...level,
    unlocked: progress.unlocked_levels.includes(level.id),
    best_score: progress.level_best_scores[level.id] ?? null,
  }));

  return ok({ levels, progress });
}
