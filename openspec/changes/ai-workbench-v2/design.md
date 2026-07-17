# Design: AI 工作台 v2.0 重构

> **关联文档：**
> - [proposal.md](proposal.md) — 变更提案
> - [PRD v2.0](../../../docs/prd-v2.md) — 产品需求文档（权威来源）
> - [原型 v2.0](../../../docs/prototype-v2.html) — 高保真交互原型（权威来源）

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    Next.js 15 App Router                  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ layout.tsx (Root Layout)                          │   │
│  │                                                    │   │
│  │  PC (≥1024px):               Mobile (<768px):      │   │
│  │  ┌──────┬──────────┬──────┐  ┌──────────────────┐  │   │
│  │  │Sideba│ Content  │ AI   │  │ Content (full)   │  │   │
│  │  │224px │ flex-1   │Panel │  │                  │  │   │
│  │  │      │          │380px │  ├──────────────────┤  │   │
│  │  │      │          │sticky│  │ BottomNav (64px) │  │   │
│  │  └──────┴──────────┴──────┘  └──────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ API Layer (/api/*)                                │   │
│  │                                                    │   │
│  │  dashboard  knowledge  tasks  delegation          │   │
│  │  follow-ups reports   ai      settings  cron      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Services                                          │   │
│  │                                                    │   │
│  │  Claude API    Prisma ORM    Web Speech API       │   │
│  │  (intent+gen)  (PostgreSQL)  (voice input)        │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

## 2. Component Tree

```
layout.tsx
├── Sidebar (PC only, 224px)
│   ├── Logo + UserInfo
│   ├── NavItem × 5 (仪表盘/知识库/日程表/日报/周报)
│   └── SettingsButton → SettingsModal
├── Main Content Area (flex-1, overflow-y-auto)
│   ├── DashboardView (path: /)
│   │   ├── ThresholdReminder
│   │   ├── PriorityCard (必须解决)
│   │   ├── PriorityCard (重点关注)
│   │   ├── FollowUpCard (待跟进折叠面板)
│   │   │   ├── AIQuickInput
│   │   │   ├── FollowUpTab (全部/委托追问/我的TODO/已完成)
│   │   │   └── FollowUpItem[] (DelegationItem | TodoItem)
│   │   └── UnknownTermsCloud (待了解名词)
│   ├── KnowledgePage (path: /knowledge)
│   │   ├── FilterBar (类型Tab + 状态Tab + 搜索框)
│   │   ├── KnowledgeGrid (3×3 grid)
│   │   │   └── KnowledgeCard[] (aspect-square)
│   │   └── Pagination
│   ├── TasksPage (path: /tasks)
│   │   ├── TabSwitch (日程表 / 遗留问题)
│   │   ├── WeekCalendar
│   │   │   └── DayCell[] (7 columns)
│   │   ├── DayDetail
│   │   │   └── TaskGroup[] (by priority + 待跟进)
│   │   └── LegacyIssueList
│   ├── ReportsPage (path: /reports)
│   │   ├── FilterTab (全部/日报/周报)
│   │   ├── ReportGrid (3×3 grid)
│   │   │   └── ReportCard[]
│   │   └── Pagination
│   └── WeeklyPage (path: /weekly)
│       ├── WeekSelector (历史周报切换)
│       └── WeeklyReportView
│           ├── CoreSummary
│           ├── ProjectProgress
│           ├── LearningSection
│           ├── NextWeekPlan
│           └── ReportActions (复制/编辑/下载)
├── AIPanel (PC only, 380px sticky)
│   ├── ChatHeader
│   ├── ChatMessages
│   │   ├── ChatBubble[] (user=blue-right, assistant=gray-left)
│   │   ├── TermResearchCard (嵌入式术语检索卡片)
│   │   └── FollowUpCard (嵌入式待跟进结果卡片)
│   ├── QuickSuggestions (根据当前页面动态切换)
│   ├── FileUpload (📎 button)
│   └── ChatInput
├── BottomNav (Mobile only, 64px)
│   └── NavTab × 5 (仪表/知识/日程/日报/AI)
├── MobileAIPage (Mobile AI tab, full-screen)
│   ├── ChatMessages
│   ├── QuickSuggestions
│   ├── ChatInput
│   └── VoiceInput (长按麦克风)
├── Toast (fixed top-right)
├── ConfirmDialog
├── SettingsModal
├── KnowledgeDetailModal
├── KnowledgeEditModal
├── ReportDetailModal
└── QuickAddModal
```

## 3. Data Flow

### 3.1 AI Chat Flow

```
User Input (text/voice/file)
    │
    ▼
POST /api/ai/chat { message, context?, files? }
    │
    ▼
Claude Intent Recognition (src/lib/ai/intent.ts)
    │
    ├── ADD_TERM → createCard + aiResearch → return TermResearchCard
    ├── ADD_TODO → createTask(type=TODO) → return TodoCard
    ├── ADD_DELEGATION → createDelegation + calcFollowUp → return DelegationCard
    ├── QUERY → queryKnowledge/queryTasks → return result cards
    ├── GENERATE_REPORT → generateDaily/generateWeekly → return report link
    └── UNKNOWN → free-text Claude response
    │
    ▼
Response { message, results: [{ type, success, message, card? }] }
    │
    ▼
ChatPanel renders bubbles + embedded cards
```

### 3.2 FollowUp Aggregation Flow

```
GET /api/follow-ups?tab=all|delegation|todo|done&page=1&pageSize=10
    │
    ▼
Server: UNION Delegation + Task(type=TODO)
    │
    ├── Delegation rows → { type: "delegation", status, assignee, followUpTime, ... }
    └── Task(TODO) rows → { type: "todo", status, dueDate, source, ... }
    │
    ▼
Response { items: FollowUpItem[], counts: {all, delegation, todo, done}, pagination }
    │
    ▼
FollowUpCard renders unified list with Tab filtering
```

### 3.3 Calendar Sync Flow

```
Task created/updated (with dueDate) ──┐
Delegation created/updated ───────────┤
                                       ▼
                            Calendar auto-includes items
                            in DayDetail under "待跟进" group
                            
GET /api/tasks?date=2026-07-17&include=follow-ups
    │
    ▼
Returns: SCHEDULE tasks + TODO tasks (with dueDate) + Delegation follow-ups (with followUpTime)
```

## 4. Route Design

| Path | Page | Components | API Calls |
|------|------|------------|-----------|
| `/` | DashboardView | ThresholdReminder, PriorityCard×2, FollowUpCard, UnknownTermsCloud, DashboardChat | `GET /api/dashboard/overview` |
| `/knowledge` | KnowledgePage | FilterBar, KnowledgeGrid, Pagination | `GET /api/knowledge?page=&type=&status=&q=` |
| `/knowledge/[id]` | (modal) | KnowledgeDetail, KnowledgeEdit | `GET /api/knowledge/[id]` |
| `/tasks` | TasksPage | TabSwitch, WeekCalendar, DayDetail, LegacyIssueList | `GET /api/tasks?week=&date=` |
| `/reports` | ReportsPage | FilterTab, ReportGrid, Pagination | `GET /api/reports?type=&page=` |
| `/weekly` | WeeklyPage | WeekSelector, WeeklyReportView | `GET /api/reports?type=WEEKLY` |
| `/settings` | (modal) | SettingsModal | `GET/PUT /api/settings` |

## 5. Data Model Changes

### 5.1 Task Model — Add `type` field

```prisma
model Task {
  // ... existing fields ...
  type  TaskType @default(SCHEDULE)  // NEW: SCHEDULE | TODO
}
```

**Migration:** Add column with default `SCHEDULE` to preserve existing data.

### 5.2 FollowUp View (logical)

Not a database model — a query-time aggregation:

```typescript
// GET /api/follow-ups
const [delegations, todos] = await Promise.all([
  prisma.delegation.findMany({ where: { status: { not: 'RESOLVED' } } }),
  prisma.task.findMany({ where: { type: 'TODO', status: { not: 'DONE' } } }),
])
// Merge, sort, paginate in application layer
```

### 5.3 Report Model — Add weekNumber

```prisma
model Report {
  // ... existing fields ...
  weekNumber Int?  // NEW: for WEEKLY reports, e.g. 27
}
```

## 6. Key Component Designs

### 6.1 AIPanel (PC fixed panel)

```
Props: none (uses context for messages, currentPage from URL)
State:
  - messages: Message[]
  - input: string
  - loading: boolean
  - uploadedFiles: File[]

Layout:
  - height: calc(100vh - header)
  - position: sticky, top: 0
  - display: flex, flex-direction: column
  
  ┌──────────────────┐
  │ ChatHeader       │  ← fixed top
  ├──────────────────┤
  │ ChatMessages     │  ← flex-1, overflow-y-auto
  │   - bubbles      │
  │   - cards        │
  ├──────────────────┤
  │ QuickSuggestions │  ← horizontal scroll
  ├──────────────────┤
  │ ChatInput        │  ← fixed bottom
  │ [📎][input][🎤]  │
  └──────────────────┘
```

### 6.2 KnowledgeGrid (3×3 with pagination)

```
Props: cards: Card[], pagination: PaginationMeta, onPageChange
State: (managed by parent)

Layout:
  grid-template-columns: repeat(3, 1fr)
  gap: 12px
  aspect-ratio: 1 (square cards)

Card internals (top → bottom):
  ┌──────────────────┐
  │ [Type Badge] [Status Dot] │
  │                          │
  │      Title (bold)        │
  │      Subtitle (truncate) │
  │                          │
  │ ─────────────────────── │
  │ Date / Source            │
  └──────────────────┘
```

### 6.3 FollowUpCard (collapsible panel)

```
Props: none (fetches data internally)
State:
  - expanded: boolean (default false)
  - activeTab: 'all' | 'delegation' | 'todo' | 'done'
  - items: FollowUpItem[]
  - loading: boolean

Collapsed: shows first 2 items + "展开 ▼"
Expanded: shows AI input + Tab bar + full list

Delegation Item actions: [已追问] [记录结论] [修改追问]
TODO Item actions: ☐ checkbox + [编辑]
Done Item: strikethrough + gray + opacity 0.55
```

### 6.4 VoiceInput (mobile only)

```
Props: onResult: (text: string) => void
State:
  - listening: boolean
  - supported: boolean

States:
  idle → (blue mic icon, 48×48px)
  mousedown → listening (red pulse icon, scale 1.15)
  mouseup → send text → idle
  mouseleave → cancel → idle
  60s timeout → auto-send

Fallback: if !supported → gray disabled icon + tooltip
```

### 6.5 FileUpload

```
Props: onFilesSelected: (files: File[]) => void
State:
  - uploading: boolean

UI:
  📎 button (28×28px, dashed border, border-gray-300)
  onClick → <input type="file" multiple accept=".pdf,.docx,.doc,.txt,.md,.png,.jpg">
  onFilesSelected → show preview in chat → call AI → show result

AI parsing logic (server-side):
  if filename contains "会议/纪要/评审" → MEETING card
  if filename contains "方案/需求/文档/设计" → DESIGN card
  else → offer options: 存档/转TODO/生成纪要
```

## 7. Responsive Breakpoints

| Breakpoint | Layout | Sidebar | AI Panel | Bottom Nav |
|------------|--------|---------|----------|------------|
| ≥1280px | 3 columns | 224px | 380px | hidden |
| 1024-1279px | 3 columns compact | 200px | 320px | hidden |
| 768-1023px | 2 columns | 64px (icons only) | floating FAB | hidden |
| <768px | 1 column | hidden | standalone Tab | 64px, 5 tabs |

## 8. Animation Specs (from PRD §11.4)

| Animation | Duration | Easing | Property |
|-----------|----------|--------|----------|
| Page transition | 200ms | ease | fade-in + translateY(4px) |
| Modal open | 200ms | ease-out | scale(0.95→1) + opacity |
| Modal close | 150ms | ease-in | scale(1→0.95) + opacity |
| Toast enter | 300ms | ease-out | translateX(right→0) |
| Toast exit | 200ms | ease-in | opacity |
| Expand/collapse | 250ms | ease | max-height |
| Checkbox done | 300ms | ease | text-decoration + opacity |
| Mic press | 150ms | ease | scale(1→1.15) + color |

## 9. File Upload Processing Flow

```
1. User clicks 📎 → selects file(s)
2. Client validates: size ≤10MB each, total ≤30MB
3. File read as base64 in client
4. POST /api/ai/chat { message: "", files: [{ name, type, data }] }
5. Server extracts text:
   - PDF: pdf-parse
   - DOCX: mammoth
   - TXT/MD: direct read
   - PNG/JPG: Claude Vision (OCR)
6. Server calls Claude: "分析以下文件内容，判断类型：会议纪要/需求文档/方案文档/其他"
7. Based on Claude response:
   - 会议纪要 → auto-create Card(type=MEETING)
   - 方案文档 → auto-create Card(type=DESIGN)
   - 需求文档 → auto-create Card(type=DESIGN)
   - 其他 → return options for user to choose
8. Response includes: file name, parsed summary, created card link, action buttons
```

## 10. AI Term Auto-Research Flow

```
1. User types "记一下 K8s 不太懂" → Claude intent: ADD_TERM
2. Server creates Card skeleton: { title: "K8s", type: TERM, status: UNKNOWN }
3. Server calls Claude: "请解释「K8s」是什么，生成简洁定义、2-4个标签"
4. Claude returns: { content: "Kubernetes（简称K8s）是...", tags: ["容器","编排","云原生"] }
5. Server updates Card with content + tags
6. Response to client: TermResearchCard with actions:
   - 📖 查看详情 → open knowledge modal
   - ✅ 标记已了解 → PATCH status UNKNOWN→KNOWN
   - ✏️ 编辑 → open edit form
```

## 11. Checkbox Strikethrough Behavior

```
On check (PENDING → DONE):
  1. Optimistic UI update:
     - Row opacity → 0.55
     - Row background → #F9FAFB
     - All text → line-through + color #9CA3AF
     - All badges → opacity 0.5
  2. PATCH /api/tasks/[id] { status: DONE, completedAt: now }
  3. Toast "✅ 任务已完成"
  4. On API error: rollback UI + Toast "❌ 操作失败，请重试"

On uncheck (DONE → PENDING):
  1. Restore original styles (opacity 1, no line-through, original colors)
  2. PATCH /api/tasks/[id] { status: PENDING, completedAt: null }
  3. On API error: rollback
```

## 12. Error Handling

| Error | Behavior |
|-------|----------|
| AI API timeout (>10s) | "思考中..." → "⚠️ AI 服务暂时不可用，请稍后重试" |
| Network error | Toast "❌ 网络连接失败，请检查网络" + retry button |
| File too large | Toast "⚠️ 文件大小超过限制（10MB）" |
| Unsupported file type | Toast "⚠️ 不支持的文件格式" |
| Empty search result | EmptyState "未找到匹配「XXX」的卡片" |
| API 500 | Toast "❌ 服务器错误，请稍后重试" |
