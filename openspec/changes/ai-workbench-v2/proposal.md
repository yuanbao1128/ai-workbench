# Proposal: AI 工作台 v2.0 重构

> **参考文档：**
> - [PRD v2.0](../../../docs/prd-v2.md) — 14 章完整产品需求文档（产品概述~版本规划）
> - [原型 v2.0](../../../docs/prototype-v2.html) — 高保真交互原型（~2800 行，含完整 HTML/CSS/JS 交互）

## Why

v1.0 已实现核心 MVP（62/62 tasks 完成），但存在 4 个结构性问题需要重构：
1. **AI 面板不可全局访问** — 仪表盘内嵌的 AI 聊天只能在仪表盘使用，切换到知识库/日程表就丢失对话上下文
2. **委托跟进与 TODO 割裂** — 两个独立模块/页面，但本质都是"待跟进事项"，用户需要在两个页面间跳转
3. **知识库/日报采用老旧列表布局** — 卡片大小不一、无分页，内容多时性能差
4. **手机端无语音输入** — 移动场景下打字不便，语音是最自然的交互方式

本次 v2.0 重构以 **"AI 面板全局化、待跟进统一化、布局网格化、移动端语音化"** 为主线。

## What Changes

### 架构级变更

- **PRD §2 布局架构** — PC 端从两栏变为三栏固定布局：Sidebar(224px) + Content(flex) + AI Panel(380px sticky)；手机端单栏 + 底部 5 Tab 导航（仪表/知识/日程/日报/AI）
- **PRD §3 仪表盘** — 双栏布局（左侧概览卡片 + 右侧 AI 聊天），必须解决/重点关注卡片内嵌任务列表，待跟进折叠面板，待了解名词标签云，阈值提醒条
- **PRD §4 待跟进模块** — **BREAKING**: 取消独立 `/delegation` 页面，委托追问 + AI 记录的 TODO 合并为统一"待跟进"面板（仪表盘展开），支持 Tab 筛选（全部/委托追问/我的TODO/已完成）、AI 快速输入创建
- **PRD §5 知识库** — 3×3 紧凑正方形网格 + 前后端分页（每页 9 张），类型+状态筛选栏，搜索防抖 300ms，卡片详情模态框，新增/编辑/删除完整 CRUD
- **PRD §6 日程表** — 周视图日历 + 日详情分组（必须解决/重点关注/普通/待跟进），待跟进事项自动同步到日历，遗留问题 Tab
- **PRD §7 日报&周报** — 日报 3×3 网格+分页；**BREAKING**: 周报从报告中分离为独立导航页 `/weekly`，支持历史切换、复制/编辑/下载 Markdown
- **PRD §8 AI 聊天** — PC 端 380px 固定面板全局存在；手机端独立全屏 Tab；文件上传（📎 按钮，AI 解析→智能归档）；术语自动检索（AI 自动生成定义+标签）；语音输入（长按录音，Web Speech API）
- **PRD §9 系统设置** — 设置模态框：AI 提供商/Key/模型/Base URL + 测试连接 + 通知开关
- **PRD §10 数据模型** — Task 模型新增 `type` 字段（SCHEDULE/TODO），Delegation 保持不变，FollowUp 为聚合视图
- **PRD §11 交互规范** — Toast/确认对话框/骨架屏/空状态/错误态/乐观更新/防抖/键盘快捷键/移动端手势
- **PRD §12 API 设计** — 20 个端点 + 分页规范 + AI 对话接口（含文件上传）
- **PRD §13 非功能需求** — LCP < 2s，API < 300ms，LLM < 3s，CDN 缓存 30s

### 关键交互细节（原型已实现，需代码化）

| 功能 | 原型位置 | 说明 |
|------|----------|------|
| AI 术语自动检索 | `getAIResponse()` + `generateTermResearch()` | 输入"记一下 XXX 不太懂"→AI 自动生成定义+标签→嵌入式卡片含查看/标记已了解/编辑 |
| 文件上传 | `handleFileUpload()` | 📎 虚线边框按钮→选择文件→AI 解析→智能归档（会议纪要→纪要卡片，方案文档→方案卡片） |
| 任务完成删除线 | `toggleTaskComplete()` | Checkbox→文字 line-through + opacity 0.55 + 背景灰，不消失 |
| Toast 通知 | `showToast()` | 右上角滑入，3 秒消失，4 种类型(success/error/warning/info) |
| 确认对话框 | `showConfirm()` | 删除等危险操作二次确认 |
| 知识库筛选+分页 | `filterKnowledge()` + `goKnowledgePage()` | 类型/状态筛选+关键词搜索+分页控件 |
| 日历导航 | `changeWeek()` + `selectDay()` | 周切换+日期选择+任务标记 |
| 待跟进面板 | `toggleFollowUp()` + `filterFollowUp()` | 折叠/展开+Tab 切换+操作按钮 |

## Capabilities

### New Capabilities

- `dashboard-v2`: 仪表盘 v2.0 —— 双栏布局（概览卡片+AI 聊天），内嵌任务列表，待跟进折叠面板，待了解名词标签云，阈值提醒条。覆盖 PRD §3。
- `follow-up-unified`: 统一待跟进 —— 聚合委托追问（Delegation）+ AI TODO（Task type=TODO）的统一 TODO 池，Tab 筛选（全部/委托追问/我的TODO/已完成），AI 快速输入创建，日程同步。覆盖 PRD §4。
- `weekly-report`: 周报独立页 —— `/weekly` 页面，历史周报切换，核心摘要/项目进展/学习成长/下周计划结构化展示，复制/编辑/下载 Markdown，AI 手动生成。覆盖 PRD §7 周报部分。
- `voice-input`: 语音输入 —— 手机端长按麦克风按钮录音，Web Speech API，录音状态动画（红色脉冲），松开发送，60s 超时，浏览器不支持时降级。覆盖 PRD §8.3。

### Modified Capabilities

- `knowledge-base`: **布局+分页重构** —— 从非固定网格改为 3×3 紧凑正方形网格+前后端分页；筛选栏从简单标签改为类型+状态组合筛选+搜索防抖；新增卡片详情模态框（含历史记录）；新增/编辑表单改为模态框模式。覆盖 PRD §5。
- `task-management`: **模型+交互变更** —— Task 模型新增 `type` 字段（SCHEDULE/TODO）；日程表日详情增加"待跟进"分组（显示关联的 TODO/委托）；Checkbox 完成行为从删除改为删除线+灰色；任务完成后保留在列表中。覆盖 PRD §6 + §4.5.2。
- `delegation-tracking`: **入口+聚合变更** —— **BREAKING**: 取消独立 `/delegation` 导航页；委托数据合并到仪表盘「待跟进」面板；API 新增 `/api/follow-ups` 聚合查询端点；委托操作（已追问/记录结论/修改追问）保留但在待跟进面板中执行。覆盖 PRD §4。
- `auto-reports`: **布局+分离变更** —— 日报列表改为 3×3 网格+分页；周报从报告中分离为独立 `/weekly` 页面；报告详情展开从列表展开改为模态框。覆盖 PRD §7。
- `ai-conversation`: **位置+功能升级** —— PC 端从仪表盘内嵌区域改为 380px 固定 sticky 面板（全局存在）；新增文件上传（📎 按钮，支持 PDF/Word/TXT/MD/PNG/JPG）；新增术语自动检索（AI 自动生成定义+标签+嵌入式结果卡片）；手机端从无变为独立全屏 Tab；快捷建议根据当前页面动态切换。覆盖 PRD §8。
- `system-config`: **UI 重构** —— 从简单设置页改为模态框形式；新增通知开关（早晨提醒/追问提醒/日报通知/周报通知）；新增 API 连接测试按钮；API Key 加密存储+掩码显示。覆盖 PRD §9。

## Impact

- **布局系统**：需重写 `layout.tsx` 和 `Sidebar.tsx`/`BottomNav.tsx`，新增 `AIPanel.tsx`
- **路由变更**：新增 `/weekly` 页面；删除 `/delegation` 独立页面
- **数据模型**：Task 表新增 `type` 字段（需 migration）；新增 FollowUp 聚合查询视图
- **API 变更**：新增 `/api/dashboard/overview`、`/api/follow-ups`、`/api/settings/test-connection`；删除独立 delegation 路由（改用 follow-ups 聚合）
- **组件新增**：AIPanel、VoiceInput、FileUpload、KnowledgeDetail、KnowledgeEdit、ReportGrid、WeeklyReportView、FollowUpPanel、ThresholdReminder
- **组件修改**：KnowledgeGrid（加分页）、TaskList（加 strikethrough）、ChatPanel（加文件上传+术语检索结果卡片）、Calendar（加待跟进分组）
- **AI 依赖**：Claude API 调用增加术语检索场景、文件内容解析场景
- **移动端**：Web Speech API 集成（需 HTTPS 或 localhost）
- **参考文档**：PRD v2.0（1458 行，14 章）+ 原型 v2.0（2790 行，完整交互）
