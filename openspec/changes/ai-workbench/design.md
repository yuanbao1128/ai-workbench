# Design: AI 工作台

## Context

AI 工作台是一个面向产品经理的个人效率工具，从零开始构建的全栈 Web 应用。当前项目目录为空（仅 OpenSpec 脚手架），无现有代码、无数据库、无部署管线。

**约束**：
- 个人使用，初期无需多用户/权限系统
- PC + 移动端双端，云端部署
- AI 能力依赖 Claude API
- 部署需尽量简单，优先考虑平台即服务（PaaS）

**参考文档**：
- [PRD](../../../docs/prd.md) — 功能需求与数据模型
- [Prototype](../../../docs/prototype.html) — 交互原型与 UI 参考
- [UI Spec](../../../docs/prototype.md) — 设计系统与组件规范

## Goals / Non-Goals

**Goals：**
- 全栈 Next.js 应用，一套代码覆盖 PC + 移动端
- 响应式布局 + PWA 支持（可安装到手机桌面）
- Claude API 驱动的自然语言意图识别
- 自动日报/周报生成（定时任务）
- 推送通知（Web Push）
- 云端一键部署（Vercel）

**Non-Goals：**
- 多用户/团队协作（V1.0 排除）
- 原生 iOS/Android App（PWA 替代）
- 离线编辑（PWA 仅缓存已加载内容）
- 第三方日历同步（Google/Outlook）
- 数据导入（从零开始）

## Decisions

### 1. 技术栈

| 决策 | 选择 | 理由 |
|------|------|------|
| 框架 | Next.js 15 (App Router) | 全栈能力，API Routes + 前端同一项目，Vercel 原生支持 |
| 语言 | TypeScript | 类型安全，减少运行时错误 |
| 样式 | Tailwind CSS | 响应式开发效率高，与原型一致 |
| 数据库 | PostgreSQL | 结构化数据，JSONB 支持灵活字段 |
| ORM | Prisma | 类型安全，迁移管理，适合个人项目 |
| AI | Claude API (Anthropic SDK) | 用户指定，中文理解能力强 |
| 部署 | Vercel | 零配置部署，Cron Jobs 内置，免费额度够用 |
| PWA | next-pwa + Service Worker | 开箱即用，manifest + 离线缓存 |
| 推送 | Web Push API + web-push | 浏览器原生，无需第三方推送服务 |

**替代方案**：
- Railway vs Vercel：Vercel 的 Cron Jobs 和免费额度更适合个人项目
- SQLite vs PostgreSQL：PostgreSQL 支持 JSONB 和更丰富的查询，云端部署更稳定
- NextAuth vs 无认证：初期个人使用无认证，未来扩展时添加 NextAuth

### 2. 架构模式

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js App Router                        │
│                                                                 │
│  app/                                                           │
│  ├── layout.tsx          # 根布局（响应式框架）                   │
│  ├── page.tsx            # 仪表盘首页                             │
│  ├── knowledge/          # 知识库                                 │
│  │   ├── page.tsx        # 卡片网格列表                           │
│  │   └── [id]/page.tsx   # 卡片详情                               │
│  ├── tasks/              # 日程表 + 遗留问题                      │
│  │   └── page.tsx                                                │
│  ├── delegation/         # 委托跟进                               │
│  │   └── page.tsx                                                │
│  ├── reports/            # 日报/周报                              │
│  │   └── page.tsx                                                │
│  ├── chat/               # AI 对话                                │
│  │   └── page.tsx                                                │
│  └── api/                # 后端 API Routes                        │
│      ├── knowledge/      # CRUD 知识卡片                          │
│      ├── tasks/          # CRUD 任务 + 遗留问题                   │
│      ├── delegation/     # CRUD 委托                              │
│      ├── reports/        # 日报/周报生成                          │
│      ├── ai/chat/        # AI 对话（意图识别 + 路由）             │
│      ├── cron/           # 定时任务触发                            │
│      └── settings/       # 系统配置                                │
│                                                                 │
│  组件层（components/）                                            │
│  ├── layout/             # Sidebar, BottomNav, Header            │
│  ├── knowledge/          # CardGrid, CardDetail, KnowledgeCard   │
│  ├── tasks/              # WeekCalendar, DayDetail, LegacyList   │
│  ├── delegation/         # DelegationCard, Timeline, ConclusionModal│
│  ├── reports/            # ReportViewer, ReportList              │
│  ├── chat/               # ChatPanel, ChatBubble, IntentCard     │
│  └── ui/                 # Badge, Button, Input, Modal, Tag, Tab │
│                                                                 │
│  服务层（lib/）                                                   │
│  ├── db.ts               # Prisma client                         │
│  ├── ai/                 # Claude API 调用                        │
│  │   ├── client.ts       # Anthropic SDK 封装                    │
│  │   └── intent.ts       # 意图识别 + 实体提取                   │
│  ├── reports/            # 日报/周报生成逻辑                      │
│  │   ├── daily.ts                                               │
│  │   └── weekly.ts                                              │
│  ├── notifications/      # Web Push 推送                         │
│  └── utils.ts                                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3. 数据模型设计

```prisma
model Card {
  id            String   @id @default(cuid())
  title         String
  type          CardType // TERM, DESIGN, INSPIRATION, MEETING, QUESTION
  status        CardStatus? // UNKNOWN, KNOWN (仅 TERM 类型)
  content       String?  // 我的理解 / 方案内容
  keyConcepts   String[] // 关键概念标签
  relatedCards  String[] // 关联卡片 ID
  source        String?  // 来源
  history       Json[]   // [{ timestamp, action, content }]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Task {
  id            String    @id @default(cuid())
  title         String
  priority      Priority  // MUST, FOCUS, NORMAL
  status        TaskStatus // TODO, IN_PROGRESS, DONE
  dueDate       DateTime?
  relatedCards  String[]
  createdAt     DateTime  @default(now())
  completedAt   DateTime?
}

model LegacyIssue {
  id            String   @id @default(cuid())
  title         String
  plannedDate   DateTime? // 计划解决时间
  status        IssueStatus // PENDING, RESOLVED
  tags          String[]
  createdAt     DateTime @default(now())
  resolvedAt    DateTime?
}

model Delegation {
  id              String        @id @default(cuid())
  title           String
  assignee        String        // 转交给谁
  source          String?       // 来源
  status          DelegationStatus // WAITING, ASKED, REPLIED, RESOLVED
  priority        Priority
  followUpTimes   DateTime[]    // 追问时间列表
  customFollowUp  String?       // 用户自定义追问
  conclusion      String?       // 结论
  timeline        Json[]        // [{ timestamp, action, detail }]
  createdAt       DateTime      @default(now())
  resolvedAt      DateTime?
}

model Activity {
  id          String   @id @default(cuid())
  type        ActivityType // TASK_DONE, CARD_ADDED, CARD_LEARNED, DELEGATION_CREATED, DELEGATION_RESOLVED, MEETING, DESIGN
  description String
  refId       String?  // 关联实体 ID
  refType     String?  // 关联实体类型
  timestamp   DateTime @default(now())
}

model Report {
  id          String   @id @default(cuid())
  type        ReportType // DAILY, WEEKLY
  dateRange   String   // "2026-07-06" 或 "2026-07-06-2026-07-10"
  content     String   // Markdown
  createdAt   DateTime @default(now())
}

model Setting {
  id          String   @id @default("app-settings")
  apiProvider String   // anthropic, openai, custom
  apiKey      String   // encrypted
  model       String   // claude-sonnet-5, etc.
  baseUrl     String?  // custom API base URL
  updatedAt   DateTime @updatedAt
}

enum CardType    { TERM DESIGN INSPIRATION MEETING QUESTION }
enum CardStatus  { UNKNOWN KNOWN }
enum Priority    { MUST FOCUS NORMAL }
enum TaskStatus  { TODO IN_PROGRESS DONE }
enum IssueStatus { PENDING RESOLVED }
enum DelegationStatus { WAITING ASKED REPLIED RESOLVED }
enum ActivityType { TASK_DONE CARD_ADDED CARD_LEARNED DELEGATION_CREATED DELEGATION_RESOLVED MEETING DESIGN }
enum ReportType  { DAILY WEEKLY }
```

### 4. AI 意图识别设计

```
用户输入 → Claude API（带 system prompt 定义意图 schema）
  → 返回 JSON: { intent, entities, confidence }
  → 路由到对应模块 API

意图定义：
- ADD_TERM:      新增名词 → 提取 title, explanation?
- ADD_DESIGN:    新增方案 → 提取 title, content?
- ADD_INSPIRATION: 新增灵感 → 提取 title, content?
- ADD_MEETING:   新增纪要 → 提取 title, content?
- ADD_QUESTION:  新增问题 → 提取 title, content?
- ADD_TODO:      新增任务 → 提取 title, priority?, dueDate?
- ADD_DELEGATION: 新增委托 → 提取 title, assignee, source?, followUpTime?
- QUERY:         查询 → 提取 query, target(名词/任务/委托/日程)
- GENERATE_REPORT: 生成报告 → 提取 type(日报/周报)
- UNKNOWN:       通用对话 → 自由回答

多意图处理：
- 一句话包含多个意图 → 识别所有意图 → 逐一执行 → 汇总告知
- 例如："记一下K8s不懂，顺便提醒我明天问王工那个bug"
  → [ADD_TERM(K8s), ADD_DELEGATION(那个bug→王工, 明天)]
```

### 5. 定时任务设计

```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/check-reminders", "schedule": "* * * * *" },
    { "path": "/api/cron/daily-report", "schedule": "0 18 * * 1-5" },
    { "path": "/api/cron/weekly-report", "schedule": "0 18 * * 5" },
    { "path": "/api/cron/morning-brief", "schedule": "0 9 * * 1-5" }
  ]
}
```

- `check-reminders`：每分钟检查委托追问时间，到达时推送通知
- `daily-report`：工作日 18:00 自动生成日报
- `weekly-report`：周五 18:00 自动生成周报
- `morning-brief`：工作日 9:00 推送今日重点提醒

### 6. 响应式设计策略

```
断点：
- 手机 < 768px：单列布局，底部导航栏，侧边栏隐藏
- 平板 768px-1023px：单列布局，侧边栏可折叠
- PC ≥ 1024px：侧边栏 + 主内容区

关键适配：
- 知识库网格：PC 3列 → 手机 2列
- 日历：PC 7列宽格 → 手机 7列小格（横向滚动）
- 聊天：PC 侧边面板 → 手机全屏
- 筛选栏：PC 横排 → 手机横向滚动
```

### 7. PWA 配置

```json
// public/manifest.json
{
  "name": "AI 工作台",
  "short_name": "工作台",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F8FAFC",
  "theme_color": "#2563EB",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192" },
    { "src": "/icon-512.png", "sizes": "512x512" }
  ]
}
```

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Claude API 调用延迟 | 意图识别慢，用户体验差 | 前端 loading 状态 + 流式响应 + 超时降级为通用对话 |
| 定时任务精度 | Vercel Cron 免费额度有限（Hobby 2个） | Pro 计划 $20/月可到 40 个；或合并 check-reminders 和 morning-brief 为 1 个 cron + 自调度 |
| PWA 推送兼容性 | 部分旧 iOS 设备不支持 | 降级为应用内红点提醒 |
| 单用户无认证 | 任何人访问 URL 可操作 | 初期添加简单访问密码；V2.0 加 NextAuth |
| 数据丢失 | 云端数据库故障 | Supabase 自动备份；定期导出 |
| LLM 意图识别错误 | 名词被识别为任务，或反之 | 用户可在聊天中纠正；手动操作作为后备 |

## Open Questions

- [ ] 初始访问密码：是否需要简单的登录密码保护？
- [ ] 数据备份：是否需要定期导出功能？
- [ ] API Key 加密：使用环境变量还是数据库加密存储？（建议：环境变量 + 数据库加密存储，弹窗配置写入数据库）
- [ ] 日报留存策略：是否支持删除/编辑历史日报？