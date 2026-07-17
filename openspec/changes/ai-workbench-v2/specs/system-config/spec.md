# Spec: System Config (v2 Delta)

> 来源：PRD v2.0 §9，原型 `docs/prototype-v2.html` Settings modal
> 变更类型：UI 重构

## 变更说明

v1.0 简单设置页 → v2.0 模态框形式 + 新增通知开关 + API 连接测试按钮

## 变更场景

### 1. 设置入口（修改）
**Given** 任意页面
**When** 用户点击页头 ⚙️ 图标
**Then** 弹出设置模态框（居中，半透明遮罩）
**When** 点击 ✕ 或遮罩区域或按 Esc
**Then** 模态框关闭

### 2. AI 模型配置（修改）
**Given** 设置模态框
**Then** 显示 AI 模型配置区域：
- API 提供商下拉：[Anthropic / 自定义]
- API Key 输入框（掩码显示 `••••••••`，旁边 👁️ 切换明/密文）
- 模型选择下拉：[Claude Sonnet 5 / Claude Opus 4.8 / ...]
- API Base URL 输入框（可选，默认 `https://api.anthropic.com`）
- [测试连接] 按钮

### 3. 测试连接（新增）
**Given** 设置模态框
**When** 用户点击"测试连接"
**Then** 按钮变为 Loading + "测试中..."
**When** 连接成功
**Then** 显示 "✅ 连接成功"
**When** 连接失败
**Then** 显示错误信息（红色文字）

### 4. 通知设置（新增）
**Given** 设置模态框
**Then** 显示通知设置区域，含 4 个开关：
- ☑ 早晨提醒（工作日 9:00）
- ☑ 委托追问提醒
- ☑ 日报生成通知（18:00）
- ☑ 周报生成通知（周五 18:00）
**When** 切换开关
**Then** 状态即时更新

### 5. 保存设置（修改）
**Given** 设置模态框
**When** 用户点击"保存设置"
**Then** API Key 使用 AES-256-GCM 加密后存储
**And** 其他设置保存到 Setting 表
**And** Toast "✅ 设置已保存"
**And** 模态框关闭

### 6. API Key 安全性（不变）
**Given** 存储 API Key
**Then** 加密存储（AES-256-GCM）
**And** 显示时掩码（仅显示后 4 位）
**And** 从数据库读取时解密使用
