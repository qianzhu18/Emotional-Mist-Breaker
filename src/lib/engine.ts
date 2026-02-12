import { finalizeConversation } from "@/lib/battle";
import { generateOpponentReply, generateUserAIReply } from "@/lib/ai";
import { detectFogType } from "@/lib/fog";
import { getLevelById } from "@/lib/levels";
import {
  appendMessage,
  createConversation,
  getConversationById,
  saveConversation,
} from "@/lib/store";
import type { BattleMode, ConversationRecord, LevelConfig, UserRecord } from "@/types/domain";

function normalizeMode(mode: string | undefined): BattleMode {
  return mode === "real" ? "real" : "fast";
}

export function readBattleMode(mode: unknown): BattleMode {
  if (mode === "real" || mode === "fast") {
    return mode;
  }

  return "fast";
}

export async function openBattleSession(args: {
  userId: string;
  level: LevelConfig;
  mode: BattleMode;
}): Promise<ConversationRecord> {
  const { userId, level, mode } = args;
  const session = createConversation(userId, level);

  const openingOpponentLine = await generateOpponentReply({
    level,
    history: [],
    incomingUserLine: `关卡开始。背景：${level.background}。请发起一句操控式开场。`,
    mode,
  });

  return appendMessage(session, {
    sender: "opponent_ai",
    text: openingOpponentLine,
    fog_tag: detectFogType(openingOpponentLine),
  });
}

export async function advanceBattleSession(args: {
  session: ConversationRecord;
  user: UserRecord;
  mode: BattleMode;
}) {
  const { session, user, mode } = args;

  if (session.status === "completed") {
    return {
      completed: true as const,
      session,
      report: {
        total_score: session.total_score,
        grade: session.grade,
        breakdown: session.score_breakdown,
        fog_analysis: session.fog_analysis,
        exp_gained: session.exp_gained,
        key_moments: session.key_moments,
        learning_sheet: session.learning_sheet,
      },
    };
  }

  const level = getLevelById(session.level_id);

  if (!level) {
    throw new Error("会话关卡配置不存在");
  }

  const lastOpponentLine = [...session.messages]
    .reverse()
    .find((message) => message.sender === "opponent_ai")?.text;

  if (!lastOpponentLine) {
    throw new Error("当前会话缺少对手消息，无法继续");
  }

  const userLine = await generateUserAIReply({
    accessToken: user.access_token,
    level,
    opponentLine: lastOpponentLine,
    mode,
  });

  let updatedSession = appendMessage(session, {
    sender: "user_ai",
    text: userLine,
  });

  updatedSession = {
    ...updatedSession,
    current_round: updatedSession.current_round + 1,
  };
  saveConversation(updatedSession);

  if (updatedSession.current_round >= updatedSession.max_rounds) {
    const result = await finalizeConversation({ conversation: updatedSession, user });

    return {
      completed: true as const,
      session: result.conversation,
      report: result.report,
      user: result.rewardResult.user,
      progress: result.rewardResult.progress,
      levelUp: {
        leveledUp: result.rewardResult.leveledUp,
        oldLevel: result.rewardResult.oldLevel,
        newLevel: result.rewardResult.newLevel,
      },
    };
  }

  const opponentLine = await generateOpponentReply({
    level,
    history: updatedSession.messages,
    incomingUserLine: userLine,
    mode,
  });

  updatedSession = appendMessage(updatedSession, {
    sender: "opponent_ai",
    text: opponentLine,
    fog_tag: detectFogType(opponentLine),
  });

  return {
    completed: false as const,
    session: updatedSession,
  };
}

export async function autoRunBattle(args: {
  user: UserRecord;
  level: LevelConfig;
  modeInput?: string;
}) {
  const mode = normalizeMode(args.modeInput);
  let session = await openBattleSession({
    userId: args.user.id,
    level: args.level,
    mode,
  });

  while (session.status === "active") {
    const next = await advanceBattleSession({ session, user: args.user, mode });

    session = next.session;

    if (next.completed) {
      return {
        mode,
        ...next,
      };
    }
  }

  const persisted = getConversationById(session.id);

  if (persisted && persisted.status === "completed") {
    return {
      mode,
      completed: true as const,
      session: persisted,
      report: {
        total_score: persisted.total_score,
        grade: persisted.grade,
        breakdown: persisted.score_breakdown,
        fog_analysis: persisted.fog_analysis,
        exp_gained: persisted.exp_gained,
        key_moments: persisted.key_moments,
        learning_sheet: persisted.learning_sheet,
      },
    };
  }

  throw new Error("自动对战异常结束，请重试");
}
