import { applyExperience } from "@/lib/experience";
import type {
  BattleReport,
  ConversationRecord,
  LevelConfig,
  Message,
  UserProgressRecord,
  UserRecord,
} from "@/types/domain";

interface RuntimeStore {
  users: Map<string, UserRecord>;
  usersBySecondMeId: Map<string, string>;
  progressByUserId: Map<string, UserProgressRecord>;
  conversations: Map<string, ConversationRecord>;
}

declare global {
  var __EFB_STORE__: RuntimeStore | undefined;
}

function nowIso(): string {
  return new Date().toISOString();
}

function getStore(): RuntimeStore {
  if (!global.__EFB_STORE__) {
    global.__EFB_STORE__ = {
      users: new Map(),
      usersBySecondMeId: new Map(),
      progressByUserId: new Map(),
      conversations: new Map(),
    };
  }

  return global.__EFB_STORE__;
}

export function ensureUserProgress(userId: string): UserProgressRecord {
  const store = getStore();
  const existing = store.progressByUserId.get(userId);

  if (existing) {
    return existing;
  }

  const created: UserProgressRecord = {
    user_id: userId,
    unlocked_levels: [1],
    level_best_scores: {},
    updated_at: nowIso(),
  };

  store.progressByUserId.set(userId, created);
  return created;
}

export function upsertUser(payload: {
  secondme_user_id: string;
  access_token: string;
  ai_id: string;
  ai_name: string;
  ai_personality: string;
  ai_avatar?: string;
}): UserRecord {
  const store = getStore();
  const existingId = store.usersBySecondMeId.get(payload.secondme_user_id);

  if (existingId) {
    const user = store.users.get(existingId);

    if (!user) {
      throw new Error("用户索引损坏，请重启服务后重试");
    }

    const updated: UserRecord = {
      ...user,
      access_token: payload.access_token,
      ai_id: payload.ai_id,
      ai_name: payload.ai_name,
      ai_personality: payload.ai_personality,
      ai_avatar: payload.ai_avatar || user.ai_avatar,
    };

    store.users.set(updated.id, updated);
    ensureUserProgress(updated.id);
    return updated;
  }

  const created: UserRecord = {
    id: crypto.randomUUID(),
    secondme_user_id: payload.secondme_user_id,
    access_token: payload.access_token,
    ai_id: payload.ai_id,
    ai_name: payload.ai_name,
    ai_personality: payload.ai_personality,
    ai_avatar: payload.ai_avatar || "",
    experience: 0,
    level: 1,
    created_at: nowIso(),
  };

  store.users.set(created.id, created);
  store.usersBySecondMeId.set(created.secondme_user_id, created.id);
  ensureUserProgress(created.id);

  return created;
}

export function getUserById(userId: string): UserRecord | null {
  return getStore().users.get(userId) ?? null;
}

export function getUserProgress(userId: string): UserProgressRecord {
  return ensureUserProgress(userId);
}

export function listConversationsByUser(userId: string): ConversationRecord[] {
  return Array.from(getStore().conversations.values())
    .filter((conversation) => conversation.user_id === userId)
    .sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
}

export function createConversation(userId: string, level: LevelConfig): ConversationRecord {
  const conversation: ConversationRecord = {
    id: crypto.randomUUID(),
    user_id: userId,
    level_id: level.id,
    messages: [],
    current_round: 0,
    max_rounds: level.rounds,
    status: "active",
    created_at: nowIso(),
  };

  getStore().conversations.set(conversation.id, conversation);
  return conversation;
}

export function getConversationById(sessionId: string): ConversationRecord | null {
  return getStore().conversations.get(sessionId) ?? null;
}

export function saveConversation(conversation: ConversationRecord): void {
  getStore().conversations.set(conversation.id, conversation);
}

export function appendMessage(
  conversation: ConversationRecord,
  message: Omit<Message, "timestamp">,
): ConversationRecord {
  const updated: ConversationRecord = {
    ...conversation,
    messages: [...conversation.messages, { ...message, timestamp: nowIso() }],
  };

  saveConversation(updated);
  return updated;
}

export function isLevelUnlocked(userId: string, levelId: number): boolean {
  const progress = ensureUserProgress(userId);
  return progress.unlocked_levels.includes(levelId);
}

export function applyBattleRewards(args: {
  userId: string;
  levelId: number;
  report: BattleReport;
}): {
  user: UserRecord;
  progress: UserProgressRecord;
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
} {
  const { userId, levelId, report } = args;
  const store = getStore();
  const user = store.users.get(userId);

  if (!user) {
    throw new Error("用户不存在或会话已过期");
  }

  const expResult = applyExperience(user.experience, report.exp_gained);
  const updatedUser: UserRecord = {
    ...user,
    experience: expResult.experience,
    level: expResult.level,
  };

  store.users.set(updatedUser.id, updatedUser);

  const progress = ensureUserProgress(userId);
  const bestScore = progress.level_best_scores[levelId] ?? 0;

  const updatedProgress: UserProgressRecord = {
    ...progress,
    level_best_scores: {
      ...progress.level_best_scores,
      [levelId]: Math.max(bestScore, report.total_score),
    },
    unlocked_levels: [...progress.unlocked_levels],
    updated_at: nowIso(),
  };

  if (report.total_score >= 60 && levelId < 8 && !updatedProgress.unlocked_levels.includes(levelId + 1)) {
    updatedProgress.unlocked_levels.push(levelId + 1);
    updatedProgress.unlocked_levels.sort((a, b) => a - b);
  }

  store.progressByUserId.set(userId, updatedProgress);

  return {
    user: updatedUser,
    progress: updatedProgress,
    leveledUp: expResult.leveledUp,
    oldLevel: expResult.oldLevel,
    newLevel: expResult.level,
  };
}
