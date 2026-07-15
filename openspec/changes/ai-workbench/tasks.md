# Tasks: AI 工作台

## 1. 项目初始化

- [x] 1.1 创建 Next.js 项目（TypeScript + App Router + Tailwind CSS）
- [x] 1.2 配置 Prisma ORM，创建 PostgreSQL 数据库（Supabase）
- [x] 1.3 定义 Prisma Schema（Card, Task, LegacyIssue, Delegation, Activity, Report, Setting）
- [x] 1.4 执行数据库迁移，生成 Prisma Client
- [x] 1.5 配置 Anthropic SDK（@anthropic-ai/sdk）
- [x] 1.6 配置项目环境变量（DATABASE_URL, ANTHROPIC_API_KEY）

## 2. UI 基础框架

- [x] 2.1 实现根布局（layout.tsx）：响应式框架 + 字体加载
- [x] 2.2 实现 PC 端侧边栏组件（Sidebar）：导航菜单 + 激活状态 + 徽章数量
- [x] 2.3 实现手机端底部导航栏组件（BottomNav）：5个图标按钮
- [x] 2.4 实现基础 UI 组件库：Badge, Button, Input, Modal, Tag, Tab, Card, Dot
- [x] 2.5 实现响应式断点逻辑：PC（≥1024px）vs 手机（<768px）

## 3. 知识库模块

- [x] 3.1 实现知识卡片 API：CRUD（/api/knowledge）
- [x] 3.2 实现卡片网格列表页（knowledge/page.tsx）：3列（PC）/ 2列（手机）
- [x] 3.3 实现卡片筛选栏：类型筛选 + 状态筛选 + 关键词搜索
- [x] 3.4 实现卡片详情页（knowledge/[id]/page.tsx）：完整字段 + 历史记录时间线
- [x] 3.5 实现卡片编辑功能：修改内容、类型、状态、关联卡片
- [x] 3.6 实现待了解名词阈值提醒逻辑（≥5个）

## 4. 日程表 & 遗留问题

- [x] 4.1 实现任务 API：CRUD（/api/tasks）
- [x] 4.2 实现遗留问题 API：CRUD（/api/legacy-issues）
- [x] 4.3 实现周视图日历组件（WeekCalendar）：7列网格 + 前后翻周 + 日期选中
- [x] 4.4 实现当日详情组件（DayDetail）：按优先级分组 + 勾选完成
- [x] 4.5 实现遗留问题列表：待解决/已逾期标记 + 标签分类
- [x] 4.6 实现日程表页面标签页切换：日程表 / 遗留问题

## 5. 委托跟进模块

- [x] 5.1 实现委托 API：CRUD（/api/delegation）
- [x] 5.2 实现默认追问时间计算逻辑（3小时+下班前规则）
- [x] 5.3 实现委托卡片组件：状态徽章 + 追问时间线 + 展开/折叠详情
- [x] 5.4 实现状态流转交互：已追问 / 记录结论（弹窗）/ 修改追问 / 删除
- [x] 5.5 实现委托列表筛选：全部 / 等待中 / 已解决

## 6. 日报 & 周报

- [x] 6.1 实现活动自动记录：在任务完成/卡片创建/委托创建时写入 Activity 表
- [x] 6.2 实现日报生成逻辑（/lib/reports/daily.ts）：扫描当天活动 → 按类型分组 → 生成 Markdown
- [x] 6.3 实现周报生成逻辑（/lib/reports/weekly.ts）：汇总5天日报 → 合并同类项 → 提取量化数据 → Claude API 润色
- [x] 6.4 实现报告 API：生成/查询（/api/reports）
- [x] 6.5 实现日报/周报列表页：日期倒序 + 摘要 + 点击展开
- [x] 6.6 实现周报操作：复制全文、编辑、下载 Markdown
- [x] 6.7 实现手动触发：AI 对话 "生成日报/周报" → 调用报告 API

## 7. AI 对话模块

- [x] 7.1 实现 Claude API 调用封装（/lib/ai/client.ts）：system prompt + 流式响应
- [x] 7.2 实现意图识别逻辑（/lib/ai/intent.ts）：意图 Schema 定义 + 实体提取 + 多意图拆解
- [x] 7.3 实现意图路由：根据意图调用对应模块 API
- [x] 7.4 实现聊天 API（/api/ai/chat）：接收用户消息 → 意图识别 → 路由执行 → 返回结果
- [x] 7.5 实现聊天界面组件（ChatPanel）：消息列表 + 聊天气泡 + 内嵌结果卡片
- [x] 7.6 实现语音输入（Web Speech API）：移动端语音转文字
- [x] 7.7 实现快捷建议栏：记名词 / 添加TODO / 转委托 / 查日程 / 生周报

## 8. 仪表盘首页

- [x] 8.1 实现仪表盘首页（page.tsx）：2列网格布局
- [x] 8.2 实现今日概览：必须解决列表 + 重点关注列表 + 待追问 + 待了解名词
- [x] 8.3 实现 AI 对话快捷入口：内嵌聊天输入框

## 9. 系统配置 & PWA

- [x] 9.1 实现设置 API：保存/读取 AI 配置（/api/settings）
- [x] 9.2 实现配置弹窗组件：API 提供商/Key/模型/Base URL + 测试连接
- [x] 9.3 实现 API Key 加密存储
- [x] 9.4 配置 PWA manifest.json + 图标生成
- [x] 9.5 配置 Service Worker（next-pwa）：离线缓存策略
- [x] 9.6 配置 Web Push：订阅/推送/通知权限请求

## 10. 定时任务 & 通知

- [x] 10.1 实现追问检查定时任务（/api/cron/check-reminders）：每分钟扫描 → 推送通知
- [x] 10.2 实现日报自动生成定时任务（/api/cron/daily-report）：工作日 18:00
- [x] 10.3 实现周报自动生成定时任务（/api/cron/weekly-report）：周五 18:00
- [x] 10.4 实现每日提醒定时任务（/api/cron/morning-brief）：工作日 9:00
- [x] 10.5 配置 vercel.json crons

## 11. 部署 & 验收

- [x] 11.1 部署到 Vercel：配置环境变量 + 域名
- [x] 11.2 验证 PC 端所有页面与原型一致
- [x] 11.3 验证手机端响应式布局 + PWA 安装
- [x] 11.4 验证 AI 意图识别准确率（各场景测试）
- [x] 11.5 验证定时任务执行（日报/周报/提醒）
- [x] 11.6 验证推送通知（桌面 + 手机）