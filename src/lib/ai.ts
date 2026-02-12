import type { BattleMode, FogTag, LevelConfig, Message } from "@/types/domain";

const SECONDME_AUTH_URL = "https://go.second.me/oauth/";
const SECONDME_BASE = "https://app.mindos.com/gate/lab";
const SECONDME_TOKEN_URL = `${SECONDME_BASE}/api/oauth/token/code`;
const SECONDME_PROFILE_URL = `${SECONDME_BASE}/api/secondme/user/info`;
const SECONDME_CHAT_URL = `${SECONDME_BASE}/api/secondme/chat/stream`;
const SECONDME_NOTE_URL = `${SECONDME_BASE}/api/secondme/note/add`;

const SILICONFLOW_URL = "https://api.siliconflow.cn/v1/chat/completions";

interface SecondMeProfile {
  secondmeUserId: string;
  aiId: string;
  aiName: string;
  aiPersonality: string;
  avatar: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`缺少环境变量 ${name}`);
  }

  return value;
}

function jsonParseSafe(payload: string): Record<string, unknown> | null {
  try {
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function getFogTypeByLevel(level: LevelConfig): FogTag {
  if (level.fog_type === "combo") {
    const options: FogTag[] = ["fear", "obligation", "guilt"];
    return options[Math.floor(Math.random() * options.length)];
  }

  return level.fog_type;
}

function randomPick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function buildFastOpponentReply(level: LevelConfig): string {
  const fog = getFogTypeByLevel(level);

  if (fog === "fear") {
    return randomPick([
      "你现在都这样了，那我们还有必要继续吗？",
      "你再不回应我，我就当你默认要结束了。",
      "你是不是根本不在乎这段关系了？",
    ]);
  }

  if (fog === "obligation") {
    return randomPick([
      "如果你真的重视我，这件事你应该主动做到吧？",
      "别人都能做到，你为什么不愿意？",
      "作为伴侣，这不是最基本的吗？",
    ]);
  }

  return randomPick([
    "我会这样难过，不就是因为你吗？",
    "我为你付出了这么多，你就这样对我？",
    "每次都让我失望，你让我怎么不伤心？",
  ]);
}

function buildFastUserReply(level: LevelConfig, opponentLine: string): string {
  const boundaryLine = randomPick([
    "我愿意沟通，但不会在威胁或指责下做决定。",
    "我理解你现在很难受，但我也需要被尊重和理性对话。",
    "我们可以讨论问题本身，而不是用关系来施压。",
  ]);

  const verifyLine = randomPick([
    "你希望我具体做什么？标准是什么？",
    "我们先把事实说清楚，再决定下一步。",
    "如果要解决问题，我们约一个明确的沟通方案。",
  ]);

  const actionLine = randomPick([
    "今晚我们各自冷静30分钟后再沟通。",
    "我可以一起梳理方案，但不会接受情绪勒索。",
    "我愿意继续这段关系，前提是彼此都守边界。",
  ]);

  if (/分手|结束|离开|不爱/.test(opponentLine)) {
    return `${boundaryLine}${verifyLine}`;
  }

  return `${boundaryLine}${actionLine}`;
}

export function getSecondMeAuthUrl(state: string): string {
  const clientId = requireEnv("SECONDME_CLIENT_ID");
  const redirectUri = requireEnv("SECONDME_REDIRECT_URI");

  const url = new URL(SECONDME_AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "user.info chat note.add");
  url.searchParams.set("state", state);

  return url.toString();
}

export async function exchangeCodeForAccessToken(code: string): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: requireEnv("SECONDME_REDIRECT_URI"),
    client_id: requireEnv("SECONDME_CLIENT_ID"),
    client_secret: requireEnv("SECONDME_CLIENT_SECRET"),
  });

  const response = await fetchWithTimeout(
    SECONDME_TOKEN_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    },
    8000,
  );

  const text = await response.text();
  const data = jsonParseSafe(text);

  if (!data) {
    throw new Error(`Token交换返回非JSON: ${text.slice(0, 200)}`);
  }

  if (!response.ok || data.code !== 0) {
    const msg =
      (data.message as string) ||
      (data.subCode as string) ||
      text.slice(0, 200);
    throw new Error(`Token交换失败: ${msg}`);
  }

  const nested = data.data as Record<string, unknown> | undefined;
  const accessToken = (nested?.accessToken as string) || "";

  if (!accessToken) {
    throw new Error("SecondMe未返回accessToken");
  }

  return accessToken;
}

export async function fetchSecondMeProfile(accessToken: string): Promise<SecondMeProfile> {
  const response = await fetchWithTimeout(
    SECONDME_PROFILE_URL,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    8000,
  );

  const text = await response.text();
  const data = jsonParseSafe(text);

  if (!data) {
    throw new Error(`获取用户资料返回非JSON: ${text.slice(0, 200)}`);
  }

  if (!response.ok || data.code !== 0) {
    const msg = (data.message as string) || text.slice(0, 200);
    throw new Error(`获取用户资料失败: ${msg}`);
  }

  const profile = (data.data || {}) as Record<string, unknown>;
  const userId = String(profile.userId || "");

  if (!userId) {
    throw new Error("SecondMe资料中缺少userId");
  }

  return {
    secondmeUserId: userId,
    aiId: userId,
    aiName: (profile.name as string) || "未命名AI",
    aiPersonality:
      (profile.selfIntroduction as string) ||
      (profile.bio as string) ||
      "暂无描述",
    avatar: (profile.avatar as string) || "",
  };
}

function buildOpponentFallback(level: LevelConfig): string {
  return buildFastOpponentReply(level);
}

export async function generateOpponentReply(args: {
  level: LevelConfig;
  history: Message[];
  incomingUserLine: string;
  mode?: BattleMode;
}): Promise<string> {
  const { level, history, incomingUserLine, mode = "real" } = args;

  if (mode === "fast") {
    return buildFastOpponentReply(level);
  }

  const apiKey = process.env.SILICONFLOW_API_KEY;
  const model = process.env.SILICONFLOW_MODEL || "Pro/moonshotai/Kimi-K2.5";

  if (!apiKey) {
    return buildOpponentFallback(level);
  }

  try {
    const messages: { role: string; content: string }[] = [
      { role: "system", content: level.opponent_ai.system_prompt },
    ];

    history.forEach((msg) => {
      messages.push({
        role: msg.sender === "user_ai" ? "user" : "assistant",
        content: msg.text,
      });
    });

    messages.push({ role: "user", content: incomingUserLine });

    const response = await fetchWithTimeout(
      SILICONFLOW_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 180,
          temperature: 0.8,
        }),
      },
      4500,
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SiliconFlow调用失败:", response.status, errorText);
      return buildOpponentFallback(level);
    }

    const data = (await response.json()) as Record<string, unknown>;
    const choices = data.choices as
      | { message?: { content?: string } }[]
      | undefined;
    const text = choices?.[0]?.message?.content?.trim();

    return text || buildOpponentFallback(level);
  } catch (error) {
    console.error("对手AI生成异常:", error);
    return buildOpponentFallback(level);
  }
}

async function collectSSEResponse(response: Response): Promise<string> {
  const reader = response.body?.getReader();

  if (!reader) {
    return "";
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let result = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      lines.forEach((line) => {
        const trimmed = line.trim();

        if (!trimmed.startsWith("data:")) {
          return;
        }

        const payload = trimmed.slice(5).trim();

        if (!payload || payload === "[DONE]") {
          return;
        }

        const parsed = jsonParseSafe(payload);

        if (!parsed) {
          return;
        }

        const choices = parsed.choices as
          | { delta?: { content?: string } }[]
          | undefined;

        const delta = choices?.[0]?.delta?.content;

        if (delta) {
          result += delta;
        }
      });
    }
  } finally {
    reader.releaseLock();
  }

  return result.trim();
}

function buildUserFallback(level: LevelConfig, opponentLine: string): string {
  return buildFastUserReply(level, opponentLine);
}

export async function generateUserAIReply(args: {
  accessToken: string;
  level: LevelConfig;
  opponentLine: string;
  mode?: BattleMode;
}): Promise<string> {
  const { accessToken, level, opponentLine, mode = "real" } = args;

  if (mode === "fast") {
    return buildFastUserReply(level, opponentLine);
  }

  try {
    const systemPrompt = `你正在进行情感勒索识别训练。\n关卡：${level.title}\n目标：保持情绪稳定、表达边界、提出验证问题和可执行方案。\n限制：不超过55字。`;

    const response = await fetchWithTimeout(
      SECONDME_CHAT_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: opponentLine,
          systemPrompt,
        }),
      },
      5200,
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SecondMe对话失败:", response.status, errorText);
      return buildUserFallback(level, opponentLine);
    }

    const reply = await collectSSEResponse(response);

    return reply || buildUserFallback(level, opponentLine);
  } catch (error) {
    console.error("SecondMe对话异常:", error);
    return buildUserFallback(level, opponentLine);
  }
}

export async function appendSecondMeMemory(args: {
  accessToken: string;
  memoryAppend: string;
}): Promise<void> {
  const { accessToken, memoryAppend } = args;

  try {
    const response = await fetchWithTimeout(
      SECONDME_NOTE_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: memoryAppend,
          title: "情感迷雾破解者 - 学习笔记",
          memoryType: "TEXT",
        }),
      },
      5000,
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error("SecondMe记忆写入失败:", detail);
    }
  } catch (error) {
    console.error("SecondMe记忆写入异常:", error);
  }
}
