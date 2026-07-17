# Tasks: AI 工作台 v2.0 重构

> 关联：[proposal.md](proposal.md) | [design.md](design.md)
> 参考：[PRD v2.0](../../../docs/prd-v2.md) | [原型 v2.0](../../../docs/prototype-v2.html)

## Phase 1: 布局重构（Layout）

- [x] **1.1** 重构 `layout.tsx`：PC 三栏布局（Sidebar 224px + Content flex-1 + AIPanel 380px sticky），响应式断点（1280/1024/768）
- [x] **1.2** 更新 `Sidebar.tsx`：导航项 5 项（仪表盘/知识库/日程表/日报/周报），移除"委托跟进"，新增"周报"
- [x] **1.3** 创建 `AIPanel.tsx`：380px 固定面板，sticky top-0，高度撑满视口，含 ChatHeader + ChatMessages + QuickSuggestions + ChatInput
- [x] **1.4** 更新 `BottomNav.tsx`：5 Tab（仪表/知识/日程/日报/AI），当前页高亮蓝色
- [x] **1.5** 创建 `useResponsive.ts`：监听窗口变化，返回当前断点（xl/lg/md/sm），驱动条件渲染
- [x] **1.6** 重构全局 CSS：动画（fade-in 200ms, modal 200ms ease-out, toast 300ms, expand 250ms），响应式断点变量

## Phase 2: 仪表盘 v2（Dashboard）

- [x] **2.1** 重构 `DashboardView.tsx`：双栏布局（左侧概览卡片 3/5 + 右侧 DashboardChat 2/5），移除旧单栏布局
- [x] **2.2** 创建 `ThresholdReminder.tsx`：红色提醒条，待了解名词≥5 时显示，点击跳转知识库，× 关闭（localStorage 记录当天）
- [x] **2.3** 创建 `PriorityCard.tsx`：必须解决/重点关注卡片，内嵌任务列表（最多 3 条）+ Checkbox + 超出"+N 条"，点击标题跳日程表
- [x] **2.4** 创建 `FollowUpCard.tsx`：折叠面板，初始显示前 2 条，展开后含 AI 快速输入框 + Tab 筛选栏（全部/委托追问/我的TODO/已完成）+ 事项列表
- [x] **2.5** 创建 `FollowUpItem.tsx`：统一待跟进事项组件，根据 type 渲染不同 UI（委托：追问时间+操作按钮 / TODO：Checkbox+截止日期 / 已完成：删除线灰色）
- [x] **2.6** 创建 `AIQuickInput.tsx`：待跟进面板内的 AI 快速输入框，textarea + 发送按钮，调用 AI 意图识别
- [x] **2.7** 创建 `UnknownTermsCloud.tsx`：待了解名词标签云，点击跳转知识库，空状态"🎉 没有待了解的名词"
- [x] **2.8** 实现 `GET /api/dashboard/overview`：聚合查询 mustCount, focusCount, delegationCount, unknownCount, todayTasks, followUps(first 2), unknownTerms
- [x] **2.9** 实现页面焦点刷新：`visibilitychange` 事件监听 → 自动 refetch dashboard 数据

## Phase 3: 待跟进统一（Follow-Up Unified）

- [x] **3.1** 创建 `GET /api/follow-ups`：聚合查询 Delegation(not RESOLVED) + Task(type=TODO, not DONE)，支持 tab 筛选 + 分页，返回 counts
- [x] **3.2** Task 模型新增 `type` 字段（SCHEDULE/TODO）：Prisma schema 更新 + migration（default SCHEDULE 兼容现有数据）
- [x] **3.3** 更新 `POST /api/tasks`：支持 type=TODO 创建，设置 source（AI对话/手动添加/委托转TODO）
- [x] **3.4** 实现委托操作 API：`PUT /api/delegation/[id]`（标记已追问 → ASKED，记录结论 → REPLIED/RESOLVED，修改追问时间）
- [x] **3.5** 实现 TODO Checkbox 完成行为：乐观更新 UI → PATCH status=DONE + completedAt → 失败回滚
- [x] **3.6** 实现默认追问时间计算：`src/lib/delegation-rules.ts`（9-17:00 → +3h+18:00；after 17 → 次日10:00+18:00；用户自定义优先）
- [x] **3.7** 实现日程同步：TODO(dueDate) + 委托(followUpTime) → 日程表"待跟进"分组自动显示
- [x] **3.8** 重定向 `/delegation` → `/`（取消独立页面，保留 API）

## Phase 4: 知识库 v2（Knowledge Base）

- [x] **4.1** 创建 `KnowledgeGrid.tsx`：3 列（PC）/ 2 列（Mobile）aspect-square 正方形卡片网格，gap-3
- [x] **4.2** 重构 `KnowledgeCard.tsx`：卡片内部布局（顶行 Badge+状态、中间标题+副标题截断、底行日期分割线），hover 阴影加深
- [x] **4.3** 重构 `FilterBar.tsx`：类型 Tab（全部/术语/方案/灵感/纪要/问题）+ 状态 Tab（全部状态/🔴待了解/🟢已了解）+ 搜索框 300ms 防抖
- [x] **4.4** 创建 `Pagination.tsx`（通用）：[◀] [1] [2] [3] [▶] + "共 N 项"，首/末页 disabled，URL 同步
- [x] **4.5** 更新 `GET /api/knowledge`：支持 page, pageSize(9), type, status, q(search) 参数，返回 data + pagination meta
- [x] **4.6** 创建 `KnowledgeDetail.tsx` 模态框：完整字段展示（标题/类型/状态/内容/标签/来源/历史时间线）+ 操作按钮
- [x] **4.7** 创建 `KnowledgeEdit.tsx` 模态框：表单（类型下拉/标题/内容 textarea/标签 TagInput/来源）+ 新增/编辑模式切换
- [x] **4.8** 实现"标记为已了解/回退为待了解"：`PUT /api/knowledge/[id]` status 切换 + 乐观更新
- [x] **4.9** 实现 URL 参数同步：筛选条件 + 搜索 + 分页 → URL searchParams（可直接通过 URL 访问初始化状态）
- [x] **4.10** 空状态 + 搜索无结果状态："未找到匹配「XXX」的卡片" + 清除筛选按钮

## Phase 5: 日程表 v2（Task Management）

- [x] **5.1** 重构 `WeekCalendar.tsx`：7 列日历网格，每格显示日期+任务数 Badge（SCHEDULE + 待跟进），待跟进用紫色 📌 区分，周末灰色
- [x] **5.2** 实现周切换：◀ 上周 / 下周 ▶ 按钮 + 键盘 ← → 快捷键
- [x] **5.3** 重构 `DayDetail.tsx`：任务按优先级分组（必须解决/重点关注/普通/待跟进），每个任务含 Checkbox + 标题 + 时间
- [x] **5.4** 实现日期选择：点击日期 → 蓝色边框高亮 → 下方显示当日详情；今日蓝色圆形背景
- [x] **5.5** 重构 `LegacyIssueList.tsx`：遗留问题列表 + 逾期红色高亮 + "已逾期 N 天"，已完成移入折叠区域
- [x] **5.6** 实现日程表"待跟进"分组：聚合显示当日 dueDate 的 TODO + followUpTime 的委托
- [x] **5.7** 更新 `GET /api/tasks`：支持 week/date 参数 + include=follow-ups 参数
- [x] **5.8** Checkbox 完成后删除线保留（同 Phase 3.5 逻辑）

## Phase 6: 日报 & 周报 v2（Reports）

- [x] **6.1** 创建 `ReportGrid.tsx`：3×3 网格卡片（PC 3 列 / Mobile 2 列），每页 9 张
- [x] **6.2** 创建 `ReportCard.tsx`：类型 Badge + 日期 + 摘要（两行截断）+ 日期标签
- [x] **6.3** 创建 `ReportDetail.tsx` 模态框：完整 Markdown 渲染 + 操作按钮（复制/编辑/下载）
- [x] **6.4** 更新 `GET /api/reports`：支持 type 筛选 + 分页（page, pageSize=9）
- [x] **6.5** 实现生成报告按钮：Loading 状态 + Toast 完成/失败
- [x] **6.6** 空状态："暂无报告，点击「生成日报」开始"
- [x] **6.7** 创建 `WeeklyPage` (`/weekly`)：周报独立页
- [x] **6.8** 创建 `WeekSelector.tsx`：历史周报 Badge 列表，横向滚动，点击切换
- [x] **6.9** 创建 `WeeklyReportView.tsx`：结构化展示（核心摘要/项目进展/学习成长/下周计划/操作按钮）
- [x] **6.10** 实现周报操作：📋 复制全文（clipboard API）→ Toast / ✏️ 编辑（Markdown textarea 切换）/ 📥 下载（`.md` 文件）
- [x] **6.11** Report 模型新增 `weekNumber` 字段（Int, optional, for WEEKLY reports）

## Phase 7: AI 聊天 v2（AI Conversation）

- [x] **7.1** 重构 `ChatPanel.tsx`：自适应面板模式（PC 嵌入 AIPanel / Mobile 全屏 Tab）、共享消息状态
- [x] **7.2** 实现 AI 术语自动检索：Claude 意图 ADD_TERM → 创建 Card 骨架 → Claude 检索定义+标签 → 填入内容 → 返回 TermResearchCard
- [x] **7.3** 创建 `TermResearchCard.tsx`：嵌入式术语检索结果卡片（Badge + 状态 + 标题 + 内容摘要 + 标签 + 3 个操作按钮）
- [x] **7.4** 创建 `FileUpload.tsx`：📎 按钮（28×28px dashed border）→ 文件选择器 → 验证大小+格式 → base64 编码
- [x] **7.5** 实现文件上传 API：`POST /api/ai/chat` 支持 files 参数 → 服务端解析（PDF/DOCX/TXT 提取文本 + 图片 OCR）→ Claude 分析归类 → 自动创建卡片
- [x] **7.6** 创建 `QuickSuggestions.tsx`：根据当前页面动态切换建议列表（dashboard→记名词/加TODO/转委托、knowledge→记名词/查名词、tasks→加任务/查今天）
- [x] **7.7** 创建 `MobileAIPage.tsx`：手机端全屏 AI 对话页（含底部 VoiceInput）
- [x] **7.8** 移动端实现 Tab 间对话历史保持（不丢失状态）

## Phase 8: 语音输入（Voice Input）

- [x] **8.1** 创建 `VoiceInput.tsx`：48×48px 蓝色麦克风按钮，仅在移动端显示
- [x] **8.2** 实现长按录音：mousedown/touchstart → 变红+放大+震动，录音中提示条"🔴 正在录音... 松开发送"
- [x] **8.3** 实现松开发送：mouseup/touchend → 停止录音 → 识别结果发送
- [x] **8.4** 实现取消录音：手指滑出按钮区域 → abort → 不发送
- [x] **8.5** 实现 60s 超时自动发送
- [x] **8.6** 浏览器不支持时降级：灰色 disabled 按钮 + tooltip "您的浏览器不支持语音输入"

## Phase 9: 系统设置 v2（Settings）

- [x] **9.1** 重构 `SettingsModal.tsx`：模态框形式（居中遮罩），含 AI 配置 + 通知设置两个区域
- [x] **9.2** 实现 API Key 掩码显示：默认 `••••••••`，👁️ 切换明/密文（需先解密读取）
- [x] **9.3** 实现测试连接：`POST /api/settings/test-connection` → Claude API ping → 返回 success/error
- [x] **9.4** 实现通知开关：4 个 toggle（早晨提醒/追问提醒/日报通知/周报通知）
- [x] **9.5** 实现保存：`PUT /api/settings` → Key 加密存储（AES-256-GCM）+ 其他设置明文
- [x] **9.6** Esc 关闭、遮罩点击关闭、✕ 按钮关闭

## Phase 10: 通用交互组件（UI Components）

- [x] **10.1** 创建 `Toast.tsx` + `useToast.ts`：4 类型（success/error/warning/info），右上角滑入，3 秒消失
- [x] **10.2** 创建 `ConfirmDialog.tsx`：居中模态 + 标题 + 描述 + 取消/确认按钮
- [x] **10.3** 创建 `Skeleton.tsx`：骨架屏（Grid 3×3 / Card / List 三种变体）
- [x] **10.4** 创建 `EmptyState.tsx`：图标 + 引导文案 + 可选操作按钮
- [x] **10.5** 创建 `TagInput.tsx`：标签输入组件（回车添加，× 删除）
- [x] **10.6** 实现键盘快捷键：`Esc` 关闭模态框，`Ctrl+K` 聚焦搜索，`← →` 日历翻周

## Phase 11: 部署与验证

- [ ] **11.1** Prisma migration：生成并执行 migration（Task.type 字段 + Report.weekNumber 字段）
- [ ] **11.2** 更新 `vercel.json`：确保新路由 `/weekly` 和 `/api/follow-ups` 在 CDN 缓存配置中
- [ ] **11.3** PC 视觉对齐：对照 [原型 v2.0](../../../docs/prototype-v2.html) 逐屏对比（仪表盘/知识库/日程表/日报/周报/AI面板）
- [ ] **11.4** 移动端视觉对齐：对照原型逐屏对比（底部导航/AI Tab/语音输入）
- [ ] **11.5** 交互验证：AI 术语检索 / 文件上传 / 拖拽完成 / 分页 / 筛选 / 模态框 / Toast / 确认对话框
- [ ] **11.6** 性能验证：LCP < 2s，API < 300ms，构建成功 `npm run build`
- [ ] **11.7** 生产部署：`vercel deploy --prod`
