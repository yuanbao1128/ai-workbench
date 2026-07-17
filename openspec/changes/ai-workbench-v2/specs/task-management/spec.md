# Spec: Task Management (v2 Delta)

> 来源：PRD v2.0 §6 + §4.5.2，原型 `docs/prototype-v2.html` Calendar + Tasks screen
> 变更类型：模型+交互变更

## 变更说明

v1.0 Task 无 type 区分，Checkbox 完成即移除 → v2.0 Task 新增 type 字段（SCHEDULE/TODO），Checkbox 完成保留删除线不消失，日程表增加待跟进分组

## 新增/修改场景

### 1. Task 类型区分（新增）
**Given** 创建任务
**When** type=SCHEDULE
**Then** 该任务出现在日程表中（对应日期）
**When** type=TODO
**Then** 该任务出现在待跟进面板中
**And** 如设了 dueDate，也同步到日程表

### 2. 日程表日详情增加待跟进分组（新增）
**Given** 用户点击日历中某个日期
**When** 日详情展开
**Then** 任务按以下分组显示：
- 🔴 必须解决（SCHEDULE tasks with MUST priority）
- 🟡 重点关注（SCHEDULE tasks with FOCUS priority）
- 普通（SCHEDULE tasks with NORMAL priority）
- 📌 待跟进（TODO tasks with dueDate + Delegation follow-ups）

### 3. Checkbox 完成保留（修改）
**Given** 任务列表中的一条任务
**When** 用户勾选 Checkbox
**Then** 任务文字加删除线（text-decoration: line-through）
**And** 透明度降至 0.55
**And** 背景变灰（#F9FAFB）
**And** 任务保留在列表中（不删除、不消失）
**And** Toast "✅ 任务已完成"
**When** 用户取消勾选
**Then** 恢复原始样式（无删除线，opacity 1，原背景色）

### 4. 日程表周视图（修改）
**Given** 日程表页面
**When** 页面加载
**Then** 显示 7 列日历（周一~周日）
**And** 每个日期格内用小 Badge 显示任务数
**And** 待跟进事项用紫色 📌 Badge 区分
**And** 支持 ◀ 上周 / 下周 ▶ 切换
**And** 支持键盘 ← → 快捷键

### 5. 日期选择与高亮（修改）
**Given** 日历视图
**When** 用户点击某个日期
**Then** 该日期蓝色边框高亮
**And** 下方显示当日详情
**When** 当前日期
**Then** 日期数字用蓝色圆形背景标记

### 6. 遗留问题 Tab（修改）
**Given** 日程表页面
**When** 切换到"⚠️ 遗留问题"Tab
**Then** 显示遗留问题列表
**And** 逾期项（超计划解决日期）红色高亮 + "已逾期 N 天"
**And** 已解决项移入折叠区域

### 7. 任务完成不消失（修改）
**Given** 日程表日详情中有任务
**When** 勾选完成任务
**Then** 任务保留在列表中（删除线 + 灰色）
**And** 可在"已完成"分组中查看
