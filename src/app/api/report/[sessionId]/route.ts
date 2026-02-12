import { getCurrentUser } from "@/lib/auth";
import { forbidden, notFound, ok, unauthorized } from "@/lib/http";
import { getConversationById } from "@/lib/store";
import { getLevelById } from "@/lib/levels";

export async function GET(
  _: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const { sessionId } = await context.params;
  const session = await getConversationById(sessionId);

  if (!session) {
    return notFound("战报不存在");
  }

  if (session.user_id !== user.id) {
    return forbidden();
  }

  if (session.status !== "completed") {
    return notFound("对话尚未结算");
  }

  const level = getLevelById(session.level_id);

  return ok({
    session,
    level,
    report: {
      total_score: session.total_score,
      grade: session.grade,
      breakdown: session.score_breakdown,
      fog_analysis: session.fog_analysis,
      exp_gained: session.exp_gained,
      key_moments: session.key_moments,
      learning_sheet: session.learning_sheet,
    },
  });
}
