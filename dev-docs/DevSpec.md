# 情感迷雾破解者 V1.5 重构 DevSpec

## 1. 背景与目标

当前版本可运行，但存在明显产品问题：

1. 对话流程“卡片化且无角色感”，缺少真实角色代入。
2. 全局审美偏单一蓝紫，8 关没有视觉递进。
3. 操作链路需要逐轮手点，导致游戏节奏慢、体感差。
4. 战报偏“分数展示”，缺少可直接学习的复盘资料。

本次重构目标：

1. 建立 8 关独立角色与场景视觉。
2. 支持一键自动完成整关（扫荡式流程）。
3. 输出结构化“学习资料”战报。
4. 统一为更现代、非土味、可扩展的界面系统。

---

## 2. 本次已实现范围

### 2.1 交互与性能

- 新增 `POST /api/battle/autoplay`：一键自动跑完整关并返回复盘。
- 保留逐轮模式用于调试：`/api/battle/start` + `/api/battle/next`。
- 对战模式新增：
  - `fast`：本地策略生成，优先保证游戏体感与响应速度。
  - `real`：调用外部 AI（SecondMe + 对手模型），用于真实推演。
- 外部 API 增加超时与回退，避免长时间卡住。

### 2.2 视觉与内容

- 8 关新增独立视觉配置（章节、主题、色板、角色图、封面图、场景图）。
- 新增本地资源：
  - `public/assets/characters/level-1..8.svg`
  - `public/assets/covers/level-1..8.svg`
  - `public/assets/scenes/level-1..8.svg`
- 战斗页升级为“角色对战舞台”，显示双方头像、场景、进度、实时话术标签。

### 2.3 学习型战报

- 评分结果新增 `learning_sheet`：
  - 操控技巧拆解（触发语句、风险、应对策略）
  - 适用场景建议
  - 你的优势与不足
  - 下一步训练动作
- 战报页改造为“可学习资料页”，不再只显示分数。

### 2.4 API 与数据结构

- `BattleReport` 增加 `learning_sheet`。
- `ConversationRecord` 增加 `learning_sheet` 存储。
- OAuth 与用户信息读取按补充文档 API 适配：
  - `GET /api/secondme/user/info`
  - `POST /api/secondme/chat/stream`
  - `POST /api/secondme/note/add`

---

## 3. 需求台账（Requirements Ledger）

| Feature | 用户故事 | 验收标准 | 影响模块 |
|---|---|---|---|
| 一键自动对战 | 作为用户，我希望点击一次即可完成整关并拿到复盘 | 点击后返回完整会话与战报；不需逐轮点击 | `src/app/api/battle/autoplay/route.ts`, `src/lib/engine.ts`, `src/app/battle/[levelId]/BattleClient.tsx` |
| 8关视觉递进 | 作为用户，我希望每关有不同角色与色彩记忆点 | 关卡列表和战斗页均展示关卡专属封面/头像/场景 | `src/lib/levels.ts`, `public/assets/**`, `src/app/levels/page.tsx`, `src/app/battle/[levelId]/BattleClient.tsx` |
| 学习型复盘 | 作为用户，我希望知道“我学到了什么、还差什么、适用于哪些场景” | 战报包含 summary/techniques/scenarios/strengths/weaknesses/actions | `src/lib/score.ts`, `src/app/report/[sessionId]/page.tsx`, `src/types/domain.ts` |
| 速度与降级 | 作为用户，我希望即使 API 慢也能继续玩 | `fast` 模式可秒级完成；`real` 模式超时自动回退 | `src/lib/ai.ts`, `src/lib/engine.ts` |

---

## 4. 关键业务规则

1. 解锁规则不变：前一关 >= 60 分解锁下一关。
2. 经验值规则不变：`exp_gained = total_score`。
3. 自动对战默认 `fast`，优先保证可玩性；可切换 `real`。
4. 语音功能暂不纳入当前版本范围（明确延期）。

---

## 5. 非功能要求

1. `npm run lint` 通过。
2. `npm run build` 通过。
3. 页面兼容桌面与移动端基础布局。

---

## 6. 当前仍待完成（下一阶段）

### P0（必须）

1. 内存存储切换到 PostgreSQL，避免服务重启丢档。
2. 自动对战增加“可中断/重试”机制。
3. 战报增加 Markdown 导出，便于沉淀学习档案。

### P1（重要）

1. 角色美术升级为更高质量 AIGC 立绘（目前为占位 SVG）。
2. 场景动画与过场（进入关卡、结算过渡）提升沉浸感。
3. 增加“同类场景练习包”（职场、家庭、社交）。

### P2（可选）

1. 社交分享卡片生成。
2. 后续接入语音（TTS）与语气分析。

---

## 7. 本次改动结论

本次重构已解决你指出的核心问题：

1. 从“纯文字卡片”升级为“角色对战体验”。
2. 8 关具备独立角色与场景视觉，不再统一土味蓝紫。
3. 支持一键自动跑完整关，显著改善游戏节奏。
4. 战报升级为可学习资料，而不是仅有分数条。

