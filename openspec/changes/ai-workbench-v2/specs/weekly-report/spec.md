# Spec: Weekly Report

> 来源：PRD v2.0 §7（周报部分），原型 `docs/prototype-v2.html` Weekly screen

## 场景

### 1. 周报独立页面
**Given** 用户点击侧边栏"📊 周报"
**When** 页面加载
**Then** 显示 `/weekly` 页面
**And** 显示当前周（如"第27周(6.29-7.3)"）的周报内容
**And** 无周报时显示空状态"暂无周报，点击「生成本周周报」开始"

### 2. 历史周报切换
**Given** 系统中有多份周报
**When** 页面加载
**Then** 顶部显示历史周报 Badge 列表（`第27周(6.29-7.3) 第26周(6.22-6.26) ...`）
**When** 用户点击某个历史周报 Badge
**Then** 下方展示对应周的周报内容

### 3. 周报结构
**Given** 查看某份周报
**Then** 显示以下结构化内容：
- 🔑 核心摘要（Claude 生成的角色+关键成果总结）
- 🚀 项目/需求交付进展（该周完成的 Tasks + Delegation 结论）
- 📚 学习&成长（该周 UNKNOWN→KNOWN 的术语）
- 📌 下周重点计划（PENDING 的 MUST/FOCUS 任务）

### 4. AI 生成周报
**Given** 用户点击"🔄 生成本周周报"
**When** AI 开始生成
**Then** 按钮显示 Loading spinner + "生成中..."
**When** 生成完成
**Then** 显示生成的周报内容
**And** Toast "✅ 周报已生成"
** Given** 生成失败
**Then** Toast "❌ 生成失败，请稍后重试"

### 5. 复制周报
**Given** 查看某份周报
**When** 用户点击"📋 复制全文"
**Then** 将 Markdown 内容复制到剪贴板
**And** Toast "✅ 已复制到剪贴板"

### 6. 编辑周报
**Given** 查看某份周报
**When** 用户点击"✏️ 编辑"
**Then** 切换为 Markdown 编辑模式（textarea）
**When** 用户保存
**Then** 内容更新 → PUT /api/reports/[id]
**And** Toast "✅ 周报已更新"

### 7. 下载周报
**Given** 查看某份周报
**When** 用户点击"📥 下载 Markdown"
**Then** 触发浏览器下载 `.md` 文件（文件名：`周报-第N周-YYYYMMDD.md`）
