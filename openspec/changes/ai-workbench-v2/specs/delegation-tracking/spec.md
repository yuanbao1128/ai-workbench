# Spec: Delegation Tracking (v2 Delta)

> 来源：PRD v2.0 §4，原型 `docs/prototype-v2.html` 待跟进面板
> 变更类型：**BREAKING** — 入口+聚合变更

## 变更说明

v1.0 独立 `/delegation` 页面 → v2.0 **取消独立页面**，委托数据合并到仪表盘「待跟进」折叠面板，与 TODO 统一管理

## 变更场景

### 1. 取消独立导航页（BREAKING）
**Given** v2.0 应用
**When** 查看侧边栏导航
**Then** 不再有"委托跟进"导航项
**And** 访问 `/delegation` → 重定向到 `/`（仪表盘）

### 2. 委托在待跟进面板中显示（新增）
**Given** 仪表盘页面
**When** 待跟进面板展开 + 选择"委托追问"Tab
**Then** 显示所有委托事项（status != RESOLVED）
**And** 每项显示：标题、被委托人、来源、追问时间、状态 Badge
**And** 每条含操作按钮：[已追问] [记录结论] [修改追问]

### 3. 委托操作保留（不变）
**Given** 待跟进面板中的委托事项
**When** 点击"已追问"
**Then** status WAITING→ASKED，timeline 追加，Toast
**When** 点击"记录结论"
**Then** 弹出结论模态框 → 输入结论+选择状态（已回复/已解决）→ 保存
**When** 点击"修改追问"
**Then** 弹出时间选择器 → 更新 followUpTimes

### 4. 委托创建保留（不变 + 新入口）
**Given** 用户创建委托
**When** 通过 AI 聊天"XX 找我说 YY 问题，转给 ZZ"
**Then** AI 识别 → 创建委托 → 返回结果卡片
**When** 通过待跟进面板 AI 快速输入框
**Then** 同样走 AI 意图识别 → 创建

### 5. 委托 API 保留（不变）
**Given** 后端 API
**Then** 保留所有 delegation CRUD 端点
**And** 新增 `GET /api/follow-ups` 聚合查询端点（union delegation + todo）

### 6. 委托完成状态（新增）
**Given** 委托 status=RESOLVED
**Then** 该事项出现在"已完成"Tab 中
**And** 显示为灰色 + conclusion 内容
