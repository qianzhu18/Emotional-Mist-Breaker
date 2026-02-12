# 情感迷雾破解者

A2A（AI 对 AI）情感勒索识别训练应用。用户通过 SecondMe OAuth 登录后，让自己的 AI 在 8 个关卡中与对手角色对话博弈，并生成结构化学习复盘。

## 主要能力

- SecondMe OAuth 登录（用户信息读取）
- 8 关角色化挑战（每关独立角色图/封面图/场景图/色彩）
- A2A 对话引擎：
  - `fast` 模式：极速本地推演（推荐）
  - `real` 模式：调用外部 AI（SecondMe + 对手模型）
- 一键自动完成整关：`POST /api/battle/autoplay`
- 学习型战报：技巧拆解、适用场景、优势不足、下一步训练动作

## 关键页面

- `/` 首页
- `/dashboard` 我的 AI
- `/levels` 关卡大厅
- `/battle/[levelId]` 对战页
- `/report/[sessionId]` 学习复盘

## 环境变量

参考 `.env.example`：

- `SECONDME_CLIENT_ID`
- `SECONDME_CLIENT_SECRET`
- `SECONDME_REDIRECT_URI=http://localhost:3006/api/auth/callback`
- `SILICONFLOW_API_KEY`（对手 AI，可选）
- `SILICONFLOW_MODEL`（可选）

## 运行

```bash
npm install
npm run dev
```

默认端口：`3006`。

## 说明

- 当前数据存储是内存实现，重启服务会丢失会话。
- 数据库结构草案在 `db/schema.sql`，可继续接入 PostgreSQL。
- 重构文档见 `dev-docs/DevSpec.md`。
