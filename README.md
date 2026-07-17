# AI 工作台 (AI Workbench)

> 面向职场人的个人效率工具 —— 以"仪表盘为中枢、AI 聊天为贯穿线"，覆盖知识管理、任务跟进、日程规划、自动汇报的完整日常工作流。

---

## 目录

- [产品介绍](#产品介绍)
- [核心功能](#核心功能)
- [技术栈](#技术栈)
- [系统架构](#系统架构)
- [项目结构](#项目结构)
- [数据模型](#数据模型)
- [API 设计](#api-设计)
- [快速开始](#快速开始)
- [部署](#部署)
- [测试](#测试)

---

## 产品介绍

### 产品定位

AI 工作台面向所有职场人，覆盖从信息收集到复盘汇报的完整工作闭环，解决了职场人日常面临的四大痛点：

1. **信息碎片化** —— 会议纪要、方案文档、术语定义散落各处，缺乏统一的知识管理
2. **跟进失控** —— 委托给他人的事项和个人 TODO 割裂管理，遗漏风险高
3. **汇报耗时** —— 每日/每周手工撰写工作汇报，重复劳动且易遗漏
4. **AI 不可达** —— 切换到不同功能模块就丢失 AI 对话上下文，无法持续辅助

### 布局架构

```text
┌──────────────────────────────────────────────────────────┐
│  PC 端 (≥1024px)                                         │
│  ┌──────────┐  ┌──────────────────┐  ┌──────────────┐   │
│  │  Sidebar │  │                  │  │              │   │
│  │  224px   │  │   Main Content   │  │   AI Panel   │   │
│  │          │  │   (flex-1)       │  │   380px      │   │
│  │  📊 仪表盘 │  │                  │  │   Fixed      │   │
│  │  📝 知识库 │  │   各模块主操作区   │  │   对话历史    │   │
│  │  📅 日程表 │  │                  │  │   快捷建议    │   │
│  │  📋 日报   │  │                  │  │   输入框      │   │
│  │  📊 周报   │  │                  │  │              │   │
│  └──────────┘  └──────────────────┘  └──────────────┘   │
│                                                          │
│  手机端 (<768px)                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Main Content (full width)            │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  仪表 │ 知识 │ 日程 │ 日报 │ AI  ← BottomNav     │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

**核心交互模型**：AI 面板在 PC 端全局固定于右侧，用户在任何模块都能随时与 AI 对话，实现上下文连续的智能辅助。

---

## 核心功能

### 📊 仪表盘

- **必须解决 / 重点关注卡片** —— 内嵌任务列表（最多 3 条），Checkbox 完成操作，超出"+N 条"折叠，点击标题跳转日程表
- **待跟进面板** —— 委托追问 + TODO 统一管理，Tab 筛选（全部/委托追问/我的 TODO/已完成），支持 AI 快速输入创建
- **待了解名词云** —— 知识库中状态为"待了解"的术语标签云，点击跳转知识库
- **阈值提醒条** —— 待了解名词 ≥5 时红色提醒，× 关闭（localStorage 记忆当天）
- **页面焦点刷新** —— 切换回页面自动 refetch 数据（`visibilitychange` 事件）

### 📝 知识库

- **3×3 紧凑正方形网格** —— 卡片展示标题、类型标签、状态，点击展开详情模态框
- **类型/状态筛选** —— 筛选栏始终可见，搜索关键词 300ms 防抖
- **前后端分页** —— 每页 9 张，◀/▶/页码/总计 完整分页控件，URL 参数同步
- **完整 CRUD** —— 新增/编辑/删除卡片，AI 术语自动检索（输入"XXX 不太懂"→AI 自动生成定义+标签）
- **空状态 / 搜索无结果** —— 友好的引导提示

### 📅 日程表

- **周视图日历** —— 7 列网格，彩色任务标记（🔴必须解决 / 🟡重点关注 / ⚪普通 / 📌待跟进），周末灰色样式，今天蓝色圆圈
- **日详情面板** —— 优先级分组展示（🔴必须解决 → 🟡重点关注 → 普通 → 📌待跟进），每条含 Checkbox + 标题 + 时间 + 优先级徽章
- **已完成删除线** —— Checkbox 勾选后文字 line-through + opacity-55，不消失
- **键盘快捷键** —— ←/→ 切换周，输入框中自动屏蔽
- **遗留问题列表** —— "已逾期 N 天"天数徽章，已完成项折叠切换

### 📋 日报 & 周报

- **日报 3×3 网格** —— 类型徽章 + 2 行摘要 + 日期，点击展开详情模态框（Markdown 渲染）
- **详情操作** —— 复制 Markdown / 编辑内容 / 下载文件
- **周报独立页** —— 历史周选择器（横向周徽章），结构化周报视图，编辑模式
- **分页** —— 与知识库一致的分页控件

### 🤖 AI 聊天

- **全局固定面板（PC）** —— 380px sticky，对话历史 + 快捷建议 + 输入框，任何页面都能对话
- **全屏聊天（手机）** —— `/chat` 独立页面，全屏沉浸式
- **页面感知快捷建议** —— 仪表盘/知识库/日程表/日报/周报各自不同的建议文案
- **文件上传** —— 📎 按钮→选择文件→AI 解析→智能归档（会议纪要/方案文档等）
- **术语自动检索** —— AI 检测到"不太懂"等关键词→自动生成术语卡片（定义+标签+查看/标记/编辑）

### 🎤 语音输入

- **长按录音** —— PointerEvents 统一触屏/鼠标，按住说话松开发送
- **滑出取消** —— 手指滑动超过 40px → 取消录音
- **60 秒超时** —— 自动停止并发送
- **双形态** —— 手机端 48px 蓝色突出按钮，桌面端紧凑图标按钮
- **浏览器检测** —— 不支持 Web Speech API 自动隐藏

### ⚙️ 系统设置

- **AI 提供商** —— Anthropic / OpenAI 切换
- **API Key** —— 密码遮罩 + 显示/隐藏切换
- **模型** —— 自定义模型 ID
- **Base URL** —— 代理地址
- **测试连接** —— `POST /api/settings/test-connection` 验证配置
- **通知开关** —— 4 项通知偏好设置

---

## 技术栈

| 层面 | 技术 | 说明 |
|------|------|------|
| 框架 | **Next.js 15** (App Router) | React 19 服务端渲染框架 |
| 语言 | **TypeScript 5.7** | 严格模式，全量类型覆盖 |
| 样式 | **Tailwind CSS 4** | 原子化 CSS，响应式断点（xl/lg/md/sm） |
| 数据库 | **PostgreSQL** (Supabase) | 生产数据库，PgBouncer 连接池 |
| ORM | **Prisma 6** | 类型安全的数据访问层 |
| AI | **Claude API** / **OpenAI** | 通过 AI SDK 接入，AI Gateway 统一管理 |
| 语音 | **Web Speech API** | 浏览器原生语音识别 |
| 测试 | **Vitest + Testing Library** | 单元/组件测试，jsdom 环境 |
| E2E | **Playwright** | 端到端测试，支持 PC/移动端 |
| 部署 | **Vercel** | CDN 缓存 + Fluid Compute |

### 依赖项

```json
{
  "核心框架": ["next@^15.2", "react@^19", "react-dom@^19"],
  "数据层": ["@prisma/client@^6.4", "prisma@^6.4"],
  "AI SDK": ["@anthropic-ai/sdk@^0.55", "openai@^6.46"],
  "UI 图标": ["lucide-react@^0.475"],
  "测试": ["vitest@^3", "@testing-library/react@^16", "@playwright/test@^1.61"],
  "工具链": ["typescript@^5.7", "tailwindcss@^4", "eslint@^9"]
}
```

---

## 系统架构

```
┌──────────────────────────────────────────────────────────────┐
│                    Next.js 15 App Router                       │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ layout.tsx (Root Layout, force-dynamic)               │     │
│  │                                                       │     │
│  │  PC (≥1024px):                Mobile (<768px):        │     │
│  │  ┌──────┬──────────┬──────┐  ┌────────────────────┐  │     │
│  │  │Sideba│ Content  │ AI   │  │ Content (full)     │  │     │
│  │  │224px │ flex-1   │Panel │  │                    │  │     │
│  │  │      │          │380px │  ├────────────────────┤  │     │
│  │  │      │          │sticky│  │ BottomNav (64px)   │  │     │
│  │  └──────┴──────────┴──────┘  └────────────────────┘  │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ API Layer (/api/*)                 22 个端点          │     │
│  │                                                       │     │
│  │ dashboard • knowledge • tasks • delegation            │     │
│  │ follow-ups • reports • legacy-issues • ai/chat        │     │
│  │ settings • settings/test-connection                   │     │
│  │ cron/check-reminders • cron/daily-report               │     │
│  │ cron/weekly-report • cron/morning-brief               │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ Service Layer                                        │     │
│  │                                                       │     │
│  │ Claude API    Prisma ORM    Web Speech API            │     │
│  │ (对话/意图)    (PostgreSQL)   (语音输入)                │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ Infrastructure                                        │     │
│  │                                                       │     │
│  │ Vercel CDN    Supabase       Vercel Cron              │     │
│  │ (30s cache)   (PostgreSQL)   (4 jobs)                 │     │
│  └─────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

### 组件树

```
layout.tsx
├── Sidebar (PC only, 224px)
│   ├── NavItem × 5 (仪表盘/知识库/日程表/日报/周报)
│   └── SettingsLink → /settings
├── Main Content Area (flex-1)
│   ├── DashboardView (/)
│   │   ├── ThresholdReminder
│   │   ├── PriorityCard (必须解决)
│   │   ├── PriorityCard (重点关注)
│   │   ├── FollowUpCard (待跟进折叠面板)
│   │   │   ├── AIQuickInput
│   │   │   └── FollowUpItem[]
│   │   └── UnknownTermsCloud
│   ├── KnowledgePage (/knowledge)
│   │   ├── FilterBar v2
│   │   ├── CardGrid (3×3)
│   │   ├── CardDetailModal
│   │   └── Pagination
│   ├── TasksView (/tasks)
│   │   ├── WeekCalendar v2
│   │   ├── DayDetail v2
│   │   └── LegacyIssueList v2
│   ├── ReportsPage (/reports)
│   │   ├── ReportGrid (3×3)
│   │   ├── ReportDetail (Modal)
│   │   └── Pagination
│   ├── WeeklyPage (/weekly)
│   │   ├── WeekSelector
│   │   └── WeeklyReportView
│   ├── SettingsPage (/settings)
│   ├── MobileAIPage (/chat)
│   └── DelegationPage (/delegation → redirect)
├── AIPanel (PC only, 380px sticky)
│   ├── ChatPanel
│   │   ├── ChatHeader
│   │   ├── QuickSuggestions (page-aware)
│   │   ├── ChatMessages
│   │   ├── VoiceInput
│   │   ├── FileUpload
│   │   └── TermResearchCard
├── BottomNav (Mobile only, 64px)
│   └── Tab × 5 (仪表/知识/日程/日报/AI)
└── ToastProvider (全局)
```

---

## 项目结构

```
ai-workbench/
├── prisma/
│   ├── schema.prisma              # 数据模型（7 个 Model）
│   ├── migrations/                # 数据库迁移文件
│   └── dev.db                     # 本地 SQLite 开发数据库
├── src/
│   ├── app/                       # Next.js App Router 页面
│   │   ├── layout.tsx             # 根布局（三栏响应式）
│   │   ├── page.tsx               # 首页 = 仪表盘
│   │   ├── globals.css            # 全局样式 + 动画 + 组件类
│   │   ├── api/                   # API 路由（22 个端点）
│   │   │   ├── ai/chat/           # AI 对话（Claude/OpenAI）
│   │   │   ├── dashboard/overview/# 仪表盘聚合数据
│   │   │   ├── knowledge/         # 知识库 CRUD + 分页
│   │   │   ├── tasks/             # 日程任务 CRUD + 周查询
│   │   │   ├── delegation/        # 委托管理 CRUD
│   │   │   ├── follow-ups/        # 待跟进聚合（Delegation+TODO）
│   │   │   ├── reports/           # 日报周报 CRUD + 分页
│   │   │   ├── legacy-issues/     # 遗留问题管理
│   │   │   ├── settings/          # 设置读写 + test-connection
│   │   │   └── cron/              # 定时任务（提醒/日报/周报/晨报）
│   │   ├── knowledge/             # 知识库页面
│   │   ├── tasks/                 # 日程表页面
│   │   ├── reports/               # 日报页面
│   │   ├── weekly/                # 周报页面
│   │   ├── chat/                  # 手机端 AI 聊天页面
│   │   ├── delegation/            # 委托页面（重定向到首页）
│   │   └── settings/              # 系统设置页面
│   ├── components/
│   │   ├── layout/                # 布局组件
│   │   │   ├── Sidebar.tsx        # PC 侧边栏
│   │   │   ├── BottomNav.tsx      # 手机底部导航
│   │   │   └── AIPanel.tsx        # PC AI 面板
│   │   ├── dashboard/             # 仪表盘组件
│   │   │   ├── PriorityCard.tsx
│   │   │   ├── FollowUpCard.tsx
│   │   │   └── UnknownTermsCloud.tsx
│   │   ├── knowledge/             # 知识库组件
│   │   │   ├── FilterBar.tsx
│   │   │   └── ThresholdReminder.tsx
│   │   ├── tasks/                 # 日程组件
│   │   │   ├── WeekCalendar.tsx
│   │   │   ├── DayDetail.tsx
│   │   │   └── LegacyIssueList.tsx
│   │   ├── reports/               # 日报周报组件
│   │   │   ├── ReportCard.tsx
│   │   │   ├── ReportGrid.tsx
│   │   │   ├── ReportDetail.tsx
│   │   │   ├── WeekSelector.tsx
│   │   │   └── WeeklyReportView.tsx
│   │   ├── chat/                  # AI 聊天组件
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── QuickSuggestions.tsx
│   │   │   ├── VoiceInput.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   └── TermResearchCard.tsx
│   │   └── ui/                    # 通用 UI 组件
│   │       ├── Toast.tsx + ToastProvider.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── Skeleton.tsx
│   │       ├── EmptyState.tsx
│   │       ├── TagInput.tsx
│   │       └── Pagination.tsx
│   ├── hooks/
│   │   └── useResponsive.ts       # 响应式断点 Hook
│   └── lib/
│       ├── db.ts                  # Prisma 客户端单例
│       └── delegation-rules.ts    # 待跟进时间规则
├── tests/                         # 测试文件（19 个文件，148 个测试）
│   ├── setup.ts                   # Vitest 全局配置
│   ├── e2e/                       # Playwright E2E 测试
│   └── *.test.ts(x)               # Vitest 单元/组件测试
├── docs/
│   ├── prd-v2.md                  # 产品需求文档 (PRD)
│   └── prototype-v2.html          # 高保真交互原型
├── openspec/changes/ai-workbench-v2/
│   ├── proposal.md                # 变更提案
│   ├── design.md                  # 技术设计文档
│   └── tasks.md                   # 实施任务清单（85 项）
├── prisma.config.ts               # Prisma 配置
├── vitest.config.ts               # Vitest 配置
├── vercel.json                    # Vercel 部署配置（Cron + CDN）
├── tsconfig.json                  # TypeScript 配置
└── package.json
```

---

## 数据模型

7 个数据模型（Prisma + PostgreSQL）：

| Model | 核心字段 | 说明 |
|-------|---------|------|
| **Card** | title, type(TERM/PROJECT/NOTE), status(KNOWN/UNKNOWN/LEARNING), content, keyConcepts | 知识卡片 |
| **Task** | title, type(SCHEDULE/TODO), priority(MUST/FOCUS/NORMAL), status(PENDING/DONE), dueDate | 日程任务 |
| **LegacyIssue** | title, plannedDate, status(PENDING/RESOLVED), tags | 遗留问题 |
| **Delegation** | title, assignee, status(WAITING/REPLIED/RESOLVED), priority, followUpTimes, conclusion | 委托事项 |
| **Activity** | type, description, refId, refType, timestamp | 活动日志 |
| **Report** | type(DAILY/WEEKLY), dateRange, content, weekNumber | 日报/周报 |
| **Setting** | apiProvider, apiKey, model, baseUrl | 系统设置（单例） |

> **设计决策**：使用 String 字段替代 Prisma Enum（PostgreSQL 兼容性），Task.type 默认 "SCHEDULE" 兼容现有数据。

---

## API 设计

### 端点一览（22 个）

| 方法 | 端点 | 说明 |
|------|------|------|
| `GET` | `/api/dashboard/overview` | 仪表盘聚合数据 |
| `GET` | `/api/knowledge` | 知识库列表（分页） |
| `POST` | `/api/knowledge` | 新增知识卡片 |
| `GET/PUT/DELETE` | `/api/knowledge/[id]` | 卡片详情/更新/删除 |
| `GET` | `/api/tasks` | 任务列表（支持 week/date/include 参数） |
| `POST` | `/api/tasks` | 创建任务 |
| `GET/PUT/DELETE` | `/api/tasks/[id]` | 任务详情/更新/删除 |
| `GET` | `/api/follow-ups` | 待跟进聚合（Delegation + TODO） |
| `GET` | `/api/delegation` | 委托列表 |
| `POST` | `/api/delegation` | 创建委托 |
| `GET/PUT/DELETE` | `/api/delegation/[id]` | 委托详情/更新/删除 |
| `GET` | `/api/legacy-issues` | 遗留问题列表 |
| `POST` | `/api/legacy-issues` | 创建遗留问题 |
| `GET/PUT/DELETE` | `/api/legacy-issues/[id]` | 遗留问题详情/更新/删除 |
| `GET` | `/api/reports` | 日报列表（分页） |
| `POST` | `/api/reports` | 创建日报/周报 |
| `GET/PUT/DELETE` | `/api/reports/[id]` | 详情/更新/删除 |
| `POST` | `/api/ai/chat` | AI 对话（Claude/OpenAI） |
| `GET/PUT` | `/api/settings` | 获取/更新系统设置 |
| `POST` | `/api/settings/test-connection` | 测试 AI 连接 |
| `POST` | `/api/cron/*` | 定时任务（4 个 Cron Job） |
| `GET` | `/api/health` | 健康检查 |

### API 规范

- **分页规范**：`{ cards/reports, pagination: { page, pageSize, total, totalPages } }`
- **向后兼容**：`GET /api/tasks` 无 `include` 参数时返回扁平数组
- **CDN 缓存**：`public, max-age=30, stale-while-revalidate=60`（知识库/任务/日报/委托/遗留问题/待跟进/仪表盘）
- **Cron Jobs**：每日 10:00 提醒检查 / 工作日 18:00 日报 / 周五 18:00 周报 / 工作日 9:00 晨报

---

## 快速开始

### 前置要求

- Node.js ≥ 18
- PostgreSQL（或 Supabase 账号）

### 安装

```bash
# 克隆仓库
git clone <repo-url>
cd ai-workbench

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入数据库连接和 API Key
```

### 环境变量

```bash
# 数据库
DATABASE_URL="postgresql://user:password@host:port/database"

# AI 配置（也可在系统设置页面配置）
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."
```

### 本地开发

```bash
# 初始化数据库
npx prisma migrate dev

# 启动开发服务器
npm run dev
# → http://localhost:3000

# 运行测试
npm test                # Vitest 单元测试（148 个）
npm run test:e2e        # Playwright E2E 测试
npm run test:e2e:ui     # Playwright UI 模式

# 打开 Prisma Studio
npm run db:studio
```

### 构建

```bash
npm run build   # prisma generate + next build
npm start       # 生产模式启动
```

---

## 部署

### Vercel（推荐）

支持以下两种部署方式：

**方式一：GitHub 集成（自动部署）**

推送代码到 GitHub → Vercel 自动检测 Next.js 项目 → 构建并部署

```bash
git push origin main
```

**方式二：Vercel CLI（手动部署）**

```bash
npm i -g vercel
vercel deploy --prod
```

### 环境变量（Vercel）

在 Vercel Dashboard → Settings → Environment Variables 配置：

- `DATABASE_URL` — PostgreSQL 连接串
- `ANTHROPIC_API_KEY` — Claude API Key
- `OPENAI_API_KEY` — OpenAI API Key（可选）

### CDN 缓存策略

| 路由 | 缓存策略 |
|------|---------|
| `/api/(knowledge\|tasks\|reports\|follow-ups\|dashboard\|delegation\|legacy-issues)(.*)` | `max-age=30, stale-while-revalidate=60` |
| 静态资源 | Vercel 默认（长期缓存 + 内容哈希） |
| 页面路由 | 动态渲染（force-dynamic） |

### Cron Jobs（4 个）

| Job | 时间 | 说明 |
|-----|------|------|
| `check-reminders` | 每日 10:00 | 检查委托追问提醒 |
| `daily-report` | 工作日 18:00 | 自动生成日报 |
| `weekly-report` | 周五 18:00 | 自动生成周报 |
| `morning-brief` | 工作日 9:00 | 每日晨报 |

---

## 测试

### 测试策略

| 类型 | 工具 | 覆盖范围 | 文件数 |
|------|------|---------|--------|
| 单元测试 | Vitest | 工具函数、API 逻辑 | 4 |
| 组件测试 | Vitest + Testing Library | React 组件渲染与交互 | 12 |
| API 测试 | Vitest | 路由处理器 | 3 |
| E2E 测试 | Playwright | 完整用户流程 | 8 |

### 运行

```bash
npm test                    # 148 tests, 19 files
npm run test:watch          # Watch 模式
npm run test:e2e            # Playwright headless
npm run test:e2e:ui         # Playwright UI 模式
npm run test:e2e:prod       # 针对生产环境
npm run test:e2e:report     # 查看 E2E 报告
```

---

## 指标

| 指标 | 目标 | 状态 |
|------|------|------|
| LCP | < 2s | ✅ |
| API 响应 | < 300ms | ✅ CDN 缓存 |
| AI 响应 | < 3s | ✅ Streaming |
| 单元测试 | ≥ 0 失败 | ✅ 148/148 pass |
| TypeScript | 严格模式 | ✅ |
| 构建 | 0 错误 | ✅ |

---

## 相关文档

- [产品需求文档 (PRD) v2.0](docs/prd-v2.md)
- [高保真交互原型](docs/prototype-v2.html)
- [变更提案](openspec/changes/ai-workbench-v2/proposal.md)
- [技术设计文档](openspec/changes/ai-workbench-v2/design.md)
- [实施任务清单](openspec/changes/ai-workbench-v2/tasks.md)

---

## 作者

郭红军

## License

Private
