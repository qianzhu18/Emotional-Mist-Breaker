import { getCurrentUser } from "@/lib/auth";
import { advanceBattleSession, readBattleMode } from "@/lib/engine";
import { badRequest, forbidden, notFound, ok, unauthorized } from "@/lib/http";
import { getConversationById } from "@/lib/store";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const body = (await request.json().catch(() => null)) as {
    sessionId?: string;
    mode?: "fast" | "real";
  } | null;

  if (!body?.sessionId) {
    return badRequest("缺少sessionId");
  }

  const session = await getConversationById(body.sessionId);

  if (!session) {
    return notFound("对话会话不存在");
  }

  if (session.user_id !== user.id) {
    return forbidden();
  }

  const mode = readBattleMode(body.mode);

  try {
    const result = await advanceBattleSession({
      session,
      user,
      mode,
    });

    return ok({ mode, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "推进回合失败";
    return badRequest(message);
  }
}
