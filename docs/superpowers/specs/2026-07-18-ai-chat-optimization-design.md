# AI 聊天优化方案设计文档

**版本**：v1.0 草案
**作者**：郭红军 + Claude
**日期**：2026-07-18
**目标**：解决语音识别差、移动端无反馈、历史丢失、AI 意图识别边界四大问题

---

## 一、当前痛点回顾

| # | 痛点 | 用户描述 | 影响范围 |
|---|------|---------|---------|
| P1 | 语音识别能力差 | 用户说 "todo"，识别不到英文 | 移动端 + PC 端 |
| P2 | 移动端语音无响应 | 录完音页面没反应 | 移动端 chat 页 |
| P3 | 历史会话丢失 | 刷新页面就看不到之前的对话 | 全部 |
| P4 | AI 意图边界识别差 | 不同人说同一意图说法多样，AI 不一定能命中 | 全部 |
| P5 | 相对日期解析弱 | "明天上午10:00" 解析成当前时间，而非明天 | AI 行为 |

---

## 二、优化方案设计

### 2.1 语音识别扩展（P1）

**当前实现问题**：
- `lang: 'zh-CN'` 固定，不识别英文/中英混合
- 关键词匹配只识别中文（如 "记一下"、"不懂"），对英文 `todo` `meeting` 无反应

**优化方案：中文为底+关键英文术语扩展词表**

```
Web Speech API: lang = 'zh-CN' (保持不变)
                  ↓ 语音文本
              前处理层（新加）：中英术语归一化
                  ↓ 归一化文本
              LLM 意图识别
```

**关键英文术语词典**（新增 `src/lib/voice/term-dict.ts`）：

| 触发关键词 (英文) | 归一化为 | 对应意图 |
|---|---|---|
| `todo`、`to-do`、`task` | `任务` | ADD_TODO |
| `meeting`、`meet`、`sync` | `会议` | ADD_MEETING |
| `delegate`、`assign to` | `转委托` | ADD_DELEGATION |
| `log`、`note down`、`jot` | `记一下` | ADD_TERM |
| `remind`、`reminder`、`alert` | `提醒` | ADD_TODO(priority=MUST) |
| `tomorrow`、`next week` | `明天/下周` | dueDate 实体 |
| `eod`、`asap` | `今天下班前 / 尽快` | dueDate 实体 |

**前处理函数**：在 `intent.ts` 的 `parseIntentResponse` 之前调用 `normalizeVoiceText(text)`，先把英文术语替换成 LLM 友好的中文，再传给 LLM。

---

### 2.2 移动端语音反馈（P2）

**当前实现问题**：
- `onerror` 静默吞掉，UI 没有任何提示
- `onend` 触发 `clearRecognition`，但如果 `onresult` 没触发就识别失败，用户看到的是"按钮变红又变灰，没结果"

**优化方案：录音状态机 + 错误 toast**

新增三态可视化反馈：

| 状态 | UI | 提示文案 |
|------|------|---------|
| IDLE | 灰底 + 🎤 | "按住 说话" |
| LISTENING | 红底脉动 + 🎤 | "松开 发送，上滑取消" |
| NO_SPEECH | 橙色警告 + ! | "未检测到声音，请重试" |
| ERROR | 红色提示 + ! | "识别失败：{error}" |
| SUCCESS | ✓ 闪一下 | "已识别：{text}" |

**错误分类**（参考 Web Speech API 错误码）：
- `no-speech` → 提示"未检测到声音"
- `audio-capture` → 提示"麦克风权限被拒绝，请在浏览器设置中开启"
- `network` → 提示"网络异常，请稍后重试"
- `not-allowed` → 提示"麦克风权限被拒绝"
- 其他 → 通用错误提示

**实现细节**：
```ts
recognition.onerror = (event: any) => {
  setListening(false)
  const hint = ERROR_HINTS[event.error] || '识别失败，请重试'
  onError(hint)  // 触发 Toast
}
```

Toast 复用现有的 `ToastProvider`，无需新增。

---

### 2.3 会话历史持久化（P3）

**当前实现问题**：
- `useState<Message[]>([])` 只在内存
- 刷新页面全部丢失

**优化方案：localStorage 持久化**

```
src/lib/chat/storage.ts    // 新增
├── saveMessages(userId, msgs)
├── loadMessages(userId): Message[]
└── clearMessages(userId)
```

**Storage Key 规范**：
```
ai-workbench:chat:messages:v1
ai-workbench:chat:messages:v1:meta  // 上次活跃时间
```

**数据模型**：
```ts
interface PersistedMessage {
  id: string            // uuid
  role: 'user' | 'assistant'
  content: string
  results?: any
  timestamp: number     // ms epoch
}
```

**生命周期**：
1. 首次打开 chat 页 → 从 localStorage 加载历史 → 渲染
2. 发送新消息 → 推入 state → 同步 save 到 localStorage
3. 超过 100 条自动截断保留最新 100 条（FIFO）
4. 提供"清空历史"按钮在页头

**为什么不用数据库**：用户已明确选 localStorage（单端、轻量、无需登录态）。

---

### 2.4 AI 意图识别增强（P4 + P5）

#### 2.4.1 Intent 大类与实体扩展

**现有 8 种意图**：
- `ADD_TERM`、`ADD_DESIGN`、`ADD_INSPIRATION`、`ADD_MEETING`、`ADD_QUESTION`
- `ADD_TODO`、`ADD_DELEGATION`、`QUERY`、`GENERATE_REPORT`、`UNKNOWN`

**扩展实体**（在 `IntentResult` 加字段）：

| 实体名 | 类型 | 说明 |
|--------|------|------|
| `dueDate` | ISO 8601 string | 相对日期解析为绝对日期（"明天上午10:00" → `2026-07-19T10:00:00`） |
| `priority` | `MUST`/`FOCUS`/`NORMAL` | 从"重要/紧急/一般"映射 |
| `recurrence` | `daily`/`weekly`/`none` | 从"每天/每周/不重复"映射 |
| `remindBefore` | ISO 8601 string | "开会前 15 分钟" → `dueDate - 15min` |

#### 2.4.2 相对日期解析器

新增 `src/lib/chat/relative-date.ts`：

```ts
export function parseRelativeDate(text: string, now = new Date()): string | null {
  // 规则：
  // 1. "明天下午3点" → 明天的 15:00
  // 2. "后天上午10点" → 后天的 10:00
  // 3. "下周三下午2点" → 下周三 14:00
  // 4. "今晚8点" → 今天 20:00
  // 5. "10分钟后" → now + 10min
  // 6. ISO 格式 "2026-07-25 09:00" 直接解析
  // ...
}
```

**实现策略**：纯函数 + 规则列表，覆盖 80% 常见表达。LLM 兜底（如果规则未命中，让 LLM 输出 ISO 字符串）。

#### 2.4.3 IntentSystemPrompt 升级

```diff
- 你是一个意图识别助手。分析用户的中文输入...
+ 你是一个意图识别助手。分析用户的中文或中英混合输入...

支持的意图：... (扩展)
实体提取：
+
+ - dueDate: ISO 8601 字符串，相对日期需转换为绝对时间
+ - priority: MUST/FOCUS/NORMAL，"紧急"=MUST，"关注"=FOCUS
+ - recurrence: "每天"=daily, "每周"=weekly, 默认 none
+ - remindBefore: 提醒前置时间 ISO 8601

返回格式：
{ "intents": [{ "type": "...", "confidence": 0.95, "entities": { ... } }] }

+ 多意图识别：单条消息可能包含多个意图，例如：
+ "记一下 K8s 不要懂"（ADD_TERM）
+ + "明天下午3点王工汇报"（ADD_MEETING）
+ → 返回两个 intents
```

---

### 2.5 路由执行层增强（router.ts）

针对测试用例揭示的场景，调整执行行为：

| 场景 | 当前行为 | 目标行为 |
|------|---------|---------|
| ADD_TODO 无 dueDate | 创建任务，dueDate=现在 | 必须有 dueDate，否则返回错误要求用户补充 |
| ADD_MEETING | 与 ADD_DESIGN/INSPIRATION 合并处理 | 独立处理，自动标 status=UNKNOWN（待消化） |
| ADD_DELEGATION 无 assignee | 默认 "待指定" | 保留 "待指定"，但提示"未指定被委托人" |
| 多意图 | LLM 返回多 intents 时循环执行 | 必须确保幂等：同一消息不能重复创建 |
| ADD_TERM 重复 | 无校验，可能重复 | 模糊匹配已存在术语，给"已存在"提示而非创建 |

---

### 2.6 测试用例体系

详见配套文档 `tests/intent-test-cases.md`（独立 markdown 文件）。

**测试维度覆盖**：
1. **8 种意图** × **5-8 种表述变体** ≈ 50 条正向用例
2. **多意图组合** 约 10 条
3. **模糊/无效输入** 约 15 条（错别字、纯表情、英文未翻译等）
4. **相对日期解析** 约 15 条（明天下午3点/下周三/10分钟后/今晚8点 等）
5. **边缘 case** 约 10 条（极长输入、重复标题、跨意图边界）

**每个用例字段**：
| 字段 | 说明 |
|------|------|
| 用例编号 | IT-001 |
| 场景 | 简述 |
| 用户输入 | 5-8 个不同表述（考虑口音/方言/英文混入） |
| 期望意图 | IntentType |
| 期望实体 | entities |
| 验证方式 | API 调用 / Playwright 模拟 |
| 验证项 | 在仪表盘/知识库/日程表里的位置 |

---

## 三、本次交付与下次迭代

### 本次交付（本轮）
✅ 优化方案设计文档（本文件）
✅ 完整边界测试用例文档（`tests/intent-test-cases.md`）

### 下次迭代
- 2.1 语音扩展词表 + 前处理层
- 2.2 录音状态机 + 错误 toast
- 2.3 localStorage 持久化
- 2.4 相对日期解析器 + Intent 系统提示升级
- 2.5 路由层鲁棒性增强
- 2.6 把测试用例文档中的每条用例跑通（前端/API 自动化）

### 验收标准
- 所有用例 100% 命中（用户视角：AI 做了正确的动作 + 数据出现在正确的页面）
- 移动端按 5 次录音至少 4 次成功识别
- 刷新页面历史保留完整

---

## 四、风险与权衡

| 风险 | 应对 |
|------|------|
| localStorage 容量（5MB）限制 | 100 条上限 + 老消息 FIFO 截断 |
| iOS Safari Web Speech API 不支持 | 自动隐藏按钮，不崩溃 |
| LLM 解析失败 | 关键词回退方案已存在，需扩展英文关键词 |
| 相对日期歧义（"下周"指下周一开始还是下周当前日？） | LLM 意图识别 prompt 中要求 LLM 输出明确 ISO |
| 多意图幂等 | router 层加 timestamp 校验 |

---

## 五、技术债务

- 当前 `parseIntentResponse` 失败才走关键词，缺失 LLM 与关键词混合仲裁
- `routeIntent` 中对未知 `type` 静默返回成功，实际应该返回 error
- `VoiceInput` 没有 unmount 时清理 recognition，可能导致内存泄露

---