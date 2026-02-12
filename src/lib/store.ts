import { applyExperience } from "@/lib/experience";
import { isDatabaseConfigured, queryDatabase, withDatabaseTransaction } from "@/lib/db";
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

interface UserRow {
  id: string;
  secondme_user_id: string;
  access_token: string;
  ai_id: string;
  ai_name: string;
  ai_personality: string;
  ai_avatar: string;
  experience: number;
  level: number;
  created_at: string | Date;
}

interface UserProgressRow {
  user_id: string;
  unlocked_levels: number[];
  level_best_scores: unknown;
  updated_at: string | Date;
}

interface ConversationRow {
  id: string;
  user_id: string;
  level_id: number;
  messages: unknown;
  current_round: number;
  max_rounds: number;
  status: "active" | "completed";
  total_score: number | null;
  grade: BattleReport["grade"] | null;
  score_breakdown: unknown;
  fog_analysis: unknown;
  exp_gained: number | null;
  key_moments: unknown;
  learning_sheet: unknown;
  created_at: string | Date;
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

function toIso(input: string | Date): string {
  if (input instanceof Date) {
    return input.toISOString();
  }

  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? nowIso() : date.toISOString();
}

function toLevelBestScores(payload: unknown): Record<string, number> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  const entries = Object.entries(payload as Record<string, unknown>);
  const result: Record<string, number> = {};

  entries.forEach(([key, value]) => {
    const numericValue = Number(value);

    if (Number.isFinite(numericValue)) {
      result[key] = numericValue;
    }
  });

  return result;
}

function toUnlockedLevels(payload: unknown): number[] {
  if (!Array.isArray(payload)) {
    return [1];
  }

  const parsed = payload
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);

  return parsed.length > 0 ? [...new Set(parsed)].sort((a, b) => a - b) : [1];
}

function toMessages(payload: unknown): Message[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item) => item as Message)
    .filter((item) => item && typeof item.text === "string" && (item.sender === "user_ai" || item.sender === "opponent_ai"));
}

function mapUserRow(row: UserRow): UserRecord {
  return {
    id: row.id,
    secondme_user_id: row.secondme_user_id,
    access_token: row.access_token,
    ai_id: row.ai_id,
    ai_name: row.ai_name,
    ai_personality: row.ai_personality,
    ai_avatar: row.ai_avatar || "",
    experience: Number(row.experience) || 0,
    level: Number(row.level) || 1,
    created_at: toIso(row.created_at),
  };
}

function mapProgressRow(row: UserProgressRow): UserProgressRecord {
  return {
    user_id: row.user_id,
    unlocked_levels: toUnlockedLevels(row.unlocked_levels),
    level_best_scores: toLevelBestScores(row.level_best_scores),
    updated_at: toIso(row.updated_at),
  };
}

function mapConversationRow(row: ConversationRow): ConversationRecord {
  return {
    id: row.id,
    user_id: row.user_id,
    level_id: Number(row.level_id),
    messages: toMessages(row.messages),
    current_round: Number(row.current_round) || 0,
    max_rounds: Number(row.max_rounds) || 0,
    status: row.status === "completed" ? "completed" : "active",
    total_score: row.total_score ?? undefined,
    grade: row.grade ?? undefined,
    score_breakdown: (row.score_breakdown as ConversationRecord["score_breakdown"]) ?? undefined,
    fog_analysis: (row.fog_analysis as ConversationRecord["fog_analysis"]) ?? undefined,
    exp_gained: row.exp_gained ?? undefined,
    key_moments: (row.key_moments as ConversationRecord["key_moments"]) ?? undefined,
    learning_sheet: (row.learning_sheet as ConversationRecord["learning_sheet"]) ?? undefined,
    created_at: toIso(row.created_at),
  };
}

async function ensureUserProgressMemory(userId: string): Promise<UserProgressRecord> {
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

async function upsertUserMemory(payload: {
  secondme_user_id: string;
  access_token: string;
  ai_id: string;
  ai_name: string;
  ai_personality: string;
  ai_avatar?: string;
}): Promise<UserRecord> {
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
    await ensureUserProgressMemory(updated.id);
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
  await ensureUserProgressMemory(created.id);

  return created;
}

function shouldUseDatabase(): boolean {
  return isDatabaseConfigured();
}

export async function upsertUser(payload: {
  secondme_user_id: string;
  access_token: string;
  ai_id: string;
  ai_name: string;
  ai_personality: string;
  ai_avatar?: string;
}): Promise<UserRecord> {
  if (!shouldUseDatabase()) {
    return upsertUserMemory(payload);
  }

  const result = await queryDatabase<UserRow>(
    `
      INSERT INTO users (
        secondme_user_id,
        access_token,
        ai_id,
        ai_name,
        ai_personality,
        ai_avatar
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (secondme_user_id)
      DO UPDATE SET
        access_token = EXCLUDED.access_token,
        ai_id = EXCLUDED.ai_id,
        ai_name = EXCLUDED.ai_name,
        ai_personality = EXCLUDED.ai_personality,
        ai_avatar = CASE
          WHEN EXCLUDED.ai_avatar <> '' THEN EXCLUDED.ai_avatar
          ELSE users.ai_avatar
        END
      RETURNING *
    `,
    [
      payload.secondme_user_id,
      payload.access_token,
      payload.ai_id,
      payload.ai_name,
      payload.ai_personality,
      payload.ai_avatar ?? "",
    ],
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error("创建或更新用户失败");
  }

  await queryDatabase(
    `
      INSERT INTO user_progress (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING
    `,
    [user.id],
  );

  return mapUserRow(user);
}

export async function getUserById(userId: string): Promise<UserRecord | null> {
  if (!shouldUseDatabase()) {
    return getStore().users.get(userId) ?? null;
  }

  const result = await queryDatabase<UserRow>(
    `
      SELECT *
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId],
  );

  const row = result.rows[0];
  return row ? mapUserRow(row) : null;
}

export async function getUserProgress(userId: string): Promise<UserProgressRecord> {
  if (!shouldUseDatabase()) {
    return ensureUserProgressMemory(userId);
  }

  const existing = await queryDatabase<UserProgressRow>(
    `
      SELECT *
      FROM user_progress
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId],
  );

  if (existing.rows[0]) {
    return mapProgressRow(existing.rows[0]);
  }

  const inserted = await queryDatabase<UserProgressRow>(
    `
      INSERT INTO user_progress (user_id)
      VALUES ($1)
      ON CONFLICT (user_id)
      DO UPDATE SET updated_at = NOW()
      RETURNING *
    `,
    [userId],
  );

  const row = inserted.rows[0];

  if (!row) {
    throw new Error("初始化用户进度失败");
  }

  return mapProgressRow(row);
}

export async function listConversationsByUser(userId: string): Promise<ConversationRecord[]> {
  if (!shouldUseDatabase()) {
    return Array.from(getStore().conversations.values())
      .filter((conversation) => conversation.user_id === userId)
      .sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
  }

  const result = await queryDatabase<ConversationRow>(
    `
      SELECT *
      FROM conversations
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId],
  );

  return result.rows.map(mapConversationRow);
}

export async function createConversation(userId: string, level: LevelConfig): Promise<ConversationRecord> {
  if (!shouldUseDatabase()) {
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

  const result = await queryDatabase<ConversationRow>(
    `
      INSERT INTO conversations (
        user_id,
        level_id,
        messages,
        current_round,
        max_rounds,
        status
      )
      VALUES ($1, $2, $3::jsonb, $4, $5, $6)
      RETURNING *
    `,
    [userId, level.id, JSON.stringify([]), 0, level.rounds, "active"],
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error("创建会话失败");
  }

  return mapConversationRow(row);
}

export async function getConversationById(sessionId: string): Promise<ConversationRecord | null> {
  if (!shouldUseDatabase()) {
    return getStore().conversations.get(sessionId) ?? null;
  }

  const result = await queryDatabase<ConversationRow>(
    `
      SELECT *
      FROM conversations
      WHERE id = $1
      LIMIT 1
    `,
    [sessionId],
  );

  const row = result.rows[0];
  return row ? mapConversationRow(row) : null;
}

export async function saveConversation(conversation: ConversationRecord): Promise<void> {
  if (!shouldUseDatabase()) {
    getStore().conversations.set(conversation.id, conversation);
    return;
  }

  await queryDatabase(
    `
      UPDATE conversations
      SET
        messages = $2::jsonb,
        current_round = $3,
        max_rounds = $4,
        status = $5,
        total_score = $6,
        grade = $7,
        score_breakdown = $8::jsonb,
        fog_analysis = $9::jsonb,
        exp_gained = $10,
        key_moments = $11::jsonb,
        learning_sheet = $12::jsonb
      WHERE id = $1
    `,
    [
      conversation.id,
      JSON.stringify(conversation.messages ?? []),
      conversation.current_round,
      conversation.max_rounds,
      conversation.status,
      conversation.total_score ?? null,
      conversation.grade ?? null,
      conversation.score_breakdown ? JSON.stringify(conversation.score_breakdown) : null,
      conversation.fog_analysis ? JSON.stringify(conversation.fog_analysis) : null,
      conversation.exp_gained ?? null,
      conversation.key_moments ? JSON.stringify(conversation.key_moments) : null,
      conversation.learning_sheet ? JSON.stringify(conversation.learning_sheet) : null,
    ],
  );
}

export async function appendMessage(
  conversation: ConversationRecord,
  message: Omit<Message, "timestamp">,
): Promise<ConversationRecord> {
  const updated: ConversationRecord = {
    ...conversation,
    messages: [...conversation.messages, { ...message, timestamp: nowIso() }],
  };

  await saveConversation(updated);
  return updated;
}

export async function isLevelUnlocked(userId: string, levelId: number): Promise<boolean> {
  const progress = await getUserProgress(userId);
  return progress.unlocked_levels.includes(levelId);
}

export async function applyBattleRewards(args: {
  userId: string;
  levelId: number;
  report: BattleReport;
}): Promise<{
  user: UserRecord;
  progress: UserProgressRecord;
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
}> {
  const { userId, levelId, report } = args;

  if (!shouldUseDatabase()) {
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

    const progress = await ensureUserProgressMemory(userId);
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

  return withDatabaseTransaction(async (client) => {
    const userResult = await client.query<UserRow>(
      `
        SELECT *
        FROM users
        WHERE id = $1
        FOR UPDATE
      `,
      [userId],
    );

    const userRow = userResult.rows[0];

    if (!userRow) {
      throw new Error("用户不存在或会话已过期");
    }

    const expResult = applyExperience(Number(userRow.experience) || 0, report.exp_gained);

    const updatedUserResult = await client.query<UserRow>(
      `
        UPDATE users
        SET experience = $2, level = $3
        WHERE id = $1
        RETURNING *
      `,
      [userId, expResult.experience, expResult.level],
    );

    const updatedUser = updatedUserResult.rows[0];

    if (!updatedUser) {
      throw new Error("更新用户经验失败");
    }

    await client.query(
      `
        INSERT INTO user_progress (user_id)
        VALUES ($1)
        ON CONFLICT (user_id) DO NOTHING
      `,
      [userId],
    );

    const progressResult = await client.query<UserProgressRow>(
      `
        SELECT *
        FROM user_progress
        WHERE user_id = $1
        FOR UPDATE
      `,
      [userId],
    );

    const progressRow = progressResult.rows[0];

    if (!progressRow) {
      throw new Error("获取用户进度失败");
    }

    const progress = mapProgressRow(progressRow);
    const bestScore = progress.level_best_scores[levelId] ?? 0;
    const levelBestScores: Record<string, number> = {
      ...progress.level_best_scores,
      [levelId]: Math.max(bestScore, report.total_score),
    };

    const unlockedLevels = [...progress.unlocked_levels];

    if (report.total_score >= 60 && levelId < 8 && !unlockedLevels.includes(levelId + 1)) {
      unlockedLevels.push(levelId + 1);
      unlockedLevels.sort((a, b) => a - b);
    }

    const updatedProgressResult = await client.query<UserProgressRow>(
      `
        UPDATE user_progress
        SET
          unlocked_levels = $2,
          level_best_scores = $3::jsonb,
          updated_at = NOW()
        WHERE user_id = $1
        RETURNING *
      `,
      [userId, unlockedLevels, JSON.stringify(levelBestScores)],
    );

    const updatedProgress = updatedProgressResult.rows[0];

    if (!updatedProgress) {
      throw new Error("更新用户进度失败");
    }

    return {
      user: mapUserRow(updatedUser),
      progress: mapProgressRow(updatedProgress),
      leveledUp: expResult.leveledUp,
      oldLevel: expResult.oldLevel,
      newLevel: expResult.level,
    };
  });
}
