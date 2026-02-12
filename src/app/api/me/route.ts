import { getCurrentUser } from "@/lib/auth";
import { ok, unauthorized } from "@/lib/http";
import { getUserProgress, listConversationsByUser } from "@/lib/store";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const progress = await getUserProgress(user.id);
  const recentConversations = (await listConversationsByUser(user.id)).slice(0, 5);

  return ok({
    user,
    progress,
    recentConversations,
  });
}
