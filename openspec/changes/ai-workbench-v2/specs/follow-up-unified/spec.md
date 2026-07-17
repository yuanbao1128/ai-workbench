# Spec: Follow-Up Unified

> 来源：PRD v2.0 §4，原型 `docs/prototype-v2.html` 待跟进面板

## 场景

### 1. 聚合查询待跟进列表
**Given** 系统中有委托事项（Delegation）和 TODO 事项（Task with type=TODO）
**When** 调用 `GET /api/follow-ups?tab=all`
**Then** 返回合并的统一列表，每条含 type（delegation|todo）、title、status、source、dueDate/followUpTime
**And** 返回 counts：{ all, delegation, todo, done }
**And** 支持分页（page, pageSize）

### 2. Tab 筛选
**Given** `GET /api/follow-ups?tab=delegation`
**Then** 仅返回来源为 Delegation 的事项（status != RESOLVED）
**Given** `GET /api/follow-ups?tab=todo`
**Then** 仅返回来源为 Task(type=TODO) 的事项（status != DONE）
**Given** `GET /api/follow-ups?tab=done`
**Then** 返回已完成/已解决的事项（Delegation RESOLVED + Task DONE）

### 3. AI 自然语言创建 TODO
**Given** 用户输入"张三找我解决发电量报表问题，6.17前需要回复"
**When** AI 识别为 ADD_TODO 意图
**Then** 创建 Task(type=TODO, title="发电量报表问题 → 回复张三", dueDate="2026-06-17", source="AI对话")
**And** 返回结果卡片：{ type: "TODO", title, dueDate }

### 4. AI 自然语言创建委托
**Given** 用户输入"李老板反馈登录页报错，转给王工排查"
**When** AI 识别为 ADD_DELEGATION 意图
**Then** 创建 Delegation(title="登录页报错", assignee="王工", source="李老板")
**And** 自动计算追问时间（默认规则：上午转出→3小时后+18:00；下午转出→次日10:00+18:00）
**And** 返回结果卡片：{ type: "DELEGATION", title, assignee, followUpTime }

### 5. TODO 完成行为（删除线保留）
**Given** 列表中有一条 TODO 事项
**When** 用户勾选 Checkbox
**Then** 事项文字加删除线（line-through）+ 透明度降至 0.55 + 背景变灰 #F9FAFB
**And** 事项保留在列表中（不移除）
**And** Toast "✅ 任务已完成"
**And** status 变更为 DONE
**Given** 事项已完成
**When** 用户取消勾选
**Then** 恢复原始样式 → status 变回 PENDING

### 6. 委托状态流转
**Given** 委托事项 status=WAITING
**When** 用户点击"已追问"
**Then** status → ASKED，timeline 追加 { action: "已追问", time: now }
**Given** status=ASKED
**When** 用户点击"记录结论"并输入结论
**Then** status → REPLIED/RESOLVED，conclusion 更新，timeline 追加记录

### 7. 日程同步
**Given** TODO 有 dueDate
**When** TODO 创建/更新
**Then** 该事项自动出现在日程表对应日期的"待跟进"分组
**Given** 委托有 followUpTime
**When** 委托创建/更新
**Then** 该事项出现在日程表对应日期的"待跟进"分组

### 8. 委托默认追问规则
**Given** 用户在 9:00-17:00 之间创建委托
**Then** 默认追问时间 = 当前时间 + 3 小时 + 当天 18:00（两个时间点）
**Given** 用户在 17:00 之后创建委托
**Then** 默认追问时间 = 次日 10:00 + 次日 18:00
**Given** 用户自定义了追问时间
**Then** 优先使用用户自定义时间，跳过默认规则

### 9. 删除待跟进事项
**Given** 待跟进面板中有一条事项
**When** 用户点击删除按钮
**Then** 弹出确认对话框"确定删除「XXX」？"
**When** 确认
**Then** 软删除（Delegation: 标记删除 / Task: status=CANCELLED）
**And** Toast "✅ 已删除"
