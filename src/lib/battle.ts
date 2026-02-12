import { appendSecondMeMemory } from "@/lib/ai";
import { getLevelById } from "@/lib/levels";
import { calculateScore, buildLessons } from "@/lib/score";
import { applyBattleRewards, saveConversation } from "@/lib/store";
import type { ConversationRecord, UserRecord } from "@/types/domain";

export async function finalizeConversation(args: {
  conversation: ConversationRecord;
  user: UserRecord;
}) {
  const { conversation, user } = args;
  const level = getLevelById(conversation.level_id);

  if (!level) {
    throw new Error(`关卡 ${conversation.level_id} 不存在`);
  }

  const report = calculateScore(conversation.messages);
  const rewardResult = await applyBattleRewards({
    userId: user.id,
    levelId: level.id,
    report,
  });

  const completedConversation: ConversationRecord = {
    ...conversation,
    status: "completed",
    total_score: report.total_score,
    grade: report.grade,
    score_breakdown: report.breakdown,
    fog_analysis: report.fog_analysis,
    exp_gained: report.exp_gained,
    key_moments: report.key_moments,
    learning_sheet: report.learning_sheet,
  };

  await saveConversation(completedConversation);

  const fogCount =
    report.fog_analysis.fear_count +
    report.fog_analysis.obligation_count +
    report.fog_analysis.guilt_count;

  const memoryAppend = `我刚完成了情感勒索测试第${level.id}关：${level.title}。\n对手使用了${fogCount}次情感勒索话术。\n我的表现得分${report.total_score}/100。\n我学到了：${buildLessons(report)}。\n本轮总结：${report.learning_sheet.summary}`;

  await appendSecondMeMemory({
    accessToken: user.access_token,
    memoryAppend,
  });

  return {
    conversation: completedConversation,
    report,
    rewardResult,
    level,
  };
}
