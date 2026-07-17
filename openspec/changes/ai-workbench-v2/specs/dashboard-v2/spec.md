# Spec: Dashboard v2.0

> 来源：PRD v2.0 §3，原型 `docs/prototype-v2.html` Dashboard screen

## 场景

### 1. 查看今日概览
**Given** 用户打开应用首页 `/`
**When** 页面加载完成
**Then** 显示今日日期（格式：YYYY年M月D日 · 周X）
**And** 显示 2×2 概览卡片：必须解决、重点关注、待追问、待了解名词
**And** 每个卡片显示对应数量
**And** 数据来自 `GET /api/dashboard/overview`

### 2. 阈值提醒条
**Given** 待了解名词数量 ≥ 5
**When** 仪表盘页面加载
**Then** 在概览卡片上方显示红色提醒条"💡 待了解名词已达N个，有空时集中查阅吧"
**And** 点击提醒条跳转到 `/knowledge?type=TERM&status=UNKNOWN`
**And** 右侧 × 按钮关闭提醒，当天不再显示（localStorage）
**Given** 待了解名词数量 < 5
**When** 仪表盘页面加载
**Then** 不显示提醒条

### 3. 必须解决 / 重点关注卡片内嵌任务列表
**Given** 仪表盘页面加载
**When** 有对应优先级的任务
**Then** 卡片内显示任务列表（最多 3 条），每条含 Checkbox + 标题 + 时间/截止日期
**And** 超出 3 条显示"+N 条"折叠
**And** 点击任务标题跳转到日程表对应日期
**Given** 无对应优先级任务
**Then** 显示"暂无任务"占位文字

### 4. 待跟进折叠面板
**Given** 仪表盘页面
**When** 有待跟进事项（委托+TODO）
**Then** 显示"📌 待跟进 (N项)"面板，初始折叠，显示前 2 条
**And** 点击"展开 ▼"展开完整面板
**When** 面板展开
**Then** 显示 AI 快速输入框 + Tab 筛选栏（全部/委托追问/我的TODO/已完成，各带计数）+ 事项列表
**And** 点击"收起 ▲"折叠面板

### 5. 待跟进面板内 AI 快速输入
**Given** 待跟进面板已展开
**When** 在 AI 快速输入框输入自然语言并发送
**Then** 调用 AI 意图识别 → 自动创建 TODO 或委托 → 嵌入结果显示
**And** 新创建的事项立即出现在列表中

### 6. 待跟进 Tab 切换
**Given** 待跟进面板已展开
**When** 点击"委托追问"Tab
**Then** 只显示来源为委托的事项
**When** 点击"我的TODO"Tab
**Then** 只显示来源为 TODO 的事项
**When** 点击"已完成"Tab
**Then** 显示已完成事项（灰色+删除线）
**When** 点击"全部"Tab
**Then** 显示所有非已完成事项

### 7. 待跟进操作（委托）
**Given** 待跟进面板中有一条委托事项
**When** 点击"已追问"
**Then** 状态变更为 ASKED，记录追问时间，Toast "✅ 已记录追问"
**When** 点击"记录结论"
**Then** 弹出结论输入模态框 → 输入结论+状态 → 保存
**When** 点击"修改追问"
**Then** 弹出时间选择器 → 修改追问时间 → Toast "✅ 追问时间已更新"

### 8. 待跟进操作（TODO）
**Given** 待跟进面板中有一条 TODO 事项
**When** 点击 Checkbox 勾选
**Then** 文字加删除线 + 透明度 0.55 + 背景灰色 → Toast "✅ 任务已完成"
**And** 事项移至"已完成"Tab
**When** 取消勾选
**Then** 恢复原始样式 → 事项移回原 Tab

### 9. 待了解名词标签云
**Given** 仪表盘页面
**When** 有待了解名词（status=UNKNOWN, type=TERM）
**Then** 在页面底部显示标签云，每个名词一个可点击标签
**And** 点击标签跳转到该名词的知识库详情
**And** "查看全部→"链接跳转到 `/knowledge?type=TERM&status=UNKNOWN`
**Given** 无待了解名词
**Then** 显示"🎉 没有待了解的名词，继续保持！"

### 10. 页面焦点刷新
**Given** 用户在仪表盘页面
**When** 页面重新获得焦点（visibilitychange 事件）
**Then** 自动刷新仪表盘数据（重新调用 `GET /api/dashboard/overview`）
