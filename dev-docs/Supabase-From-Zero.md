# Supabase 从零接入（线上稳定版）

本指南用于把当前项目从「内存存储」升级为「Supabase Postgres 持久化」，解决线上会话和进度丢失问题。

## 0. 前置准备

- 你已经有 Supabase 账号
- 项目代码已包含数据库实现（`src/lib/store.ts` + `src/lib/db.ts`）
- 需要配置的关键环境变量：
  - `DATABASE_URL`
  - `SECONDME_CLIENT_ID`
  - `SECONDME_CLIENT_SECRET`
  - `SECONDME_REDIRECT_URI`

## 1. 创建 Supabase 项目

1. 打开 Supabase Dashboard，新建 Project。
2. 区域选离用户近的区域。
3. 等项目初始化完成。

## 2. 创建数据表

1. 进入 Supabase -> `SQL Editor`。
2. 打开仓库中的 `db/schema.sql`，复制全部 SQL。
3. 粘贴到 SQL Editor 执行。
4. 执行成功后，在 `Table Editor` 确认存在三张表：
   - `users`
   - `user_progress`
   - `conversations`

## 3. 获取 DATABASE_URL

1. Supabase -> `Project Settings` -> `Database`。
2. 找到连接串（Connection string）。
3. 推荐使用 `Transaction pooler` 连接串用于 Vercel。
4. 复制 URL，形如：

```bash
postgresql://postgres.xxxx:[PASSWORD]@aws-0-xxx.pooler.supabase.com:6543/postgres?sslmode=require
```

## 4. 本地环境变量配置

编辑 `.env.local`：

```bash
SECONDME_CLIENT_ID=...
SECONDME_CLIENT_SECRET=...
SECONDME_REDIRECT_URI=http://localhost:3006/api/auth/callback

SILICONFLOW_API_KEY=...
SILICONFLOW_MODEL=Pro/moonshotai/Kimi-K2.5

DATABASE_URL=postgresql://...supabase.../postgres?sslmode=require
```

然后重启本地服务：

```bash
npm run dev
```

## 5. 线上（Vercel）环境变量配置

在 Vercel Project -> Settings -> Environment Variables 添加：

- `DATABASE_URL` = Supabase 连接串
- `SECONDME_CLIENT_ID`
- `SECONDME_CLIENT_SECRET`
- `SECONDME_REDIRECT_URI` = `https://你的域名/api/auth/callback`
- `SILICONFLOW_API_KEY`（可选）
- `SILICONFLOW_MODEL`（可选）

加完后 **Redeploy** 一次最新 `main`。

## 6. SecondMe 回调配置

SecondMe 应用后台中的 Redirect URIs 建议同时放两条（每行一个）：

```text
http://localhost:3006/api/auth/callback
https://你的线上域名/api/auth/callback
```

要求逐字符匹配，不要额外空格或多余 `/`。

## 7. Demo 验证流程（完整）

1. 访问首页 -> 点击 `START LINK`。
2. 完成 OAuth 登录。
3. 进入 `/dashboard`，看到用户资料。
4. 进入 `/levels`，开打第 1 关。
5. 打完后刷新页面，确认战绩仍在。
6. 打开 `/api/me`，检查返回：
   - `user`
   - `progress`
   - `recentConversations`
7. 在 Supabase Table Editor 中确认三张表已有数据落库。

## 8. 常见问题

### Q1: 线上登录后又跳回首页
通常是 `DATABASE_URL` 未配置或配置后未 redeploy。

### Q2: 回调地址不匹配
检查：SecondMe 后台回调地址是否和 `SECONDME_REDIRECT_URI` 完全一致。

### Q3: 本地可用、线上不可用
本地若无 `DATABASE_URL` 会使用内存回退；线上必须配置 `DATABASE_URL` 才能稳定。

## 9. 安全建议

如果你在聊天或截图中泄露了以下信息，请立刻轮换：

- `SECONDME_CLIENT_SECRET`
- `SILICONFLOW_API_KEY`

