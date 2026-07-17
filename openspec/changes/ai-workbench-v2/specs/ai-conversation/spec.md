# Spec: AI Conversation (v2 Delta)

> 来源：PRD v2.0 §8，原型 `docs/prototype-v2.html` AI 聊天全功能
> 变更类型：位置+功能升级

## 变更说明

v1.0 仪表盘内嵌聊天区域 → v2.0 PC 端 380px 固定面板全局存在 + 手机端独立 Tab + 新增文件上传 + 术语自动检索

## 新增/修改场景

### 1. PC 端固定面板（修改）
**Given** PC 端（≥1024px）
**When** 页面加载
**Then** 右侧显示 380px 固定 AI 面板（`position: sticky; top: 0`）
**And** 面板高度撑满视口
**And** 所有页面共享同一面板实例（对话历史不丢失）
**Given** 768-1023px
**Then** 面板宽度缩至 320px
**Given** <768px
**Then** AI 面板不显示（改为底部导航独立 Tab）

### 2. 手机端独立 AI Tab（新增）
**Given** 手机端
**When** 用户点击底部导航"💬 AI"
**Then** 进入全屏 AI 对话页
**And** 顶部显示"🤖 AI 助手 ● 在线"
**And** 输入框 + 麦克风按钮在底部固定
**And** 对话历史保留（切换 Tab 不丢失）

### 3. 术语自动检索（新增）
**Given** 用户在 AI 对话中输入记录术语的消息（如"记一下 K8s 不太懂"）
**When** AI 识别为 ADD_TERM 意图
**Then** 系统自动：
- 创建 Card(type=TERM, status=UNKNOWN, title="K8s")
- 调用 AI 检索术语定义+标签
- 将 AI 生成的内容填入卡片
- 返回嵌入式术语检索结果卡片
**And** 卡片包含：标题、定义摘要、标签、日期、来源
**And** 3 个操作按钮：
- 📖 查看详情 → 打开知识库详情模态框
- ✅ 标记已了解 → status UNKNOWN→KNOWN
- ✏️ 编辑 → 打开编辑表单

### 4. 文件上传（新增）
**Given** PC 端 AI 面板输入区
**When** 页面加载
**Then** 输入框左侧显示 📎 按钮（28×28px，虚线边框 `border-dashed`）
**When** 用户点击 📎
**Then** 打开文件选择器（accept=".pdf,.docx,.doc,.txt,.md,.png,.jpg"）
**When** 用户选择文件
**Then** 对话中显示用户消息气泡（含文件名+大小列表）
**And** AI 面板显示"正在分析文件内容..."（thinking 状态）
**When** AI 分析完成
**Then** 返回结果：
- 会议纪要类型 → 创建 MEETING 卡片 + 显示摘要
- 方案文档类型 → 创建 DESIGN 卡片 + 显示摘要
- 未识别类型 → 提供选项：存入知识库 / 转待跟进 / 生成纪要

### 5. 文件上传限制（新增）
**Given** 用户选择文件
**When** 单个文件 > 10MB
**Then** Toast "⚠️ 文件大小超过限制（10MB）"
**When** 总计 > 30MB
**Then** Toast "⚠️ 文件总大小超过限制（30MB）"
**When** 文件格式不支持
**Then** Toast "⚠️ 不支持的文件格式"

### 6. 快捷建议动态切换（新增）
**Given** AI 面板
**When** 当前页面是仪表盘
**Then** 快捷建议显示：记名词 / 添加TODO / 转委托 / 查日程 / 生周报
**When** 当前页面是知识库
**Then** 快捷建议显示：记名词 / 查名词 / 搜方案
**When** 当前页面是日程表
**Then** 快捷建议显示：加任务 / 查今天 / 生周报

### 7. 意图识别（不变 + 增强）
**Given** AI 对话
**Then** 支持以下意图（保持 v1.0）：
- ADD_TERM → 创建知识卡片（新增自动检索）
- ADD_TODO → 创建 Task(type=TODO)
- ADD_DELEGATION → 创建委托
- QUERY → 查询知识库/日程/任务
- GENERATE_REPORT → 生成日报/周报
- UNKNOWN → 自由对话

### 8. 嵌入式结果卡片（修改）
**Given** AI 执行操作后
**Then** 在对话中嵌入结构化结果卡片：
- 术语卡片：显示类型 Badge + 状态 Dot + 标题 + 内容摘要 + 标签 + 操作按钮
- TODO 卡片：显示标题 + 截止日期 + "已同步到日程表 ✓"
- 委托卡片：显示标题 + 被委托人 + 追问时间

### 9. AI 错误处理（不变）
**Given** AI 服务不可用
**Then** 显示"抱歉，AI 服务暂时不可用"
**And** 输入框恢复可用
