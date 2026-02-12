import { getCurrentUser } from "@/lib/auth";
import { forbidden, notFound, ok, unauthorized } from "@/lib/http";
import { getConversationById } from "@/lib/store";

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
    return notFound("会话不存在");
  }

  if (session.user_id !== user.id) {
    return forbidden();
  }

  return ok({ session });
}
