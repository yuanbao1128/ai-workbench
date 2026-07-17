# Spec: Knowledge Base (v2 Delta)

> 来源：PRD v2.0 §5，原型 `docs/prototype-v2.html` Knowledge screen
> 变更类型：布局+分页重构

## 变更说明

v1.0 使用不规则卡片列表无分页 → v2.0 改为 3×3 紧凑正方形网格 + 前后端分页 + 筛选栏重构 + 卡片详情模态框

## 新增/修改场景

### 1. 3×3 网格布局（修改）
**Given** PC 端知识库页面
**When** 页面加载
**Then** 卡片以 3 列网格排列（`grid-cols-3`）
**And** 每张卡片为正方形（`aspect-square`）
**And** 每页显示 9 张卡片（3×3）
**Given** 手机端
**Then** 卡片以 2 列网格排列
**And** 每页显示 6 张卡片（2×3）

### 2. 卡片内部布局（修改）
**Given** 一张知识卡片
**Then** 从上到下显示：
- 顶行：类型 Badge（术语/方案/灵感/纪要/问题）+ 状态 Dot/Badge（🔴待了解/🟢已了解）
- 中间：标题（大号加粗）+ 副标题（一行截断 truncate）
- 底行：日期/更新信息（带顶部分割线）

### 3. 筛选栏重构（修改）
**Given** 知识库页面
**Then** 搜索框 + 类型 Tab（全部/术语/方案/灵感/纪要/问题）+ 状态 Tab（全部状态/🔴待了解/🟢已了解）
**When** 类型和状态同时选择
**Then** 筛选条件为 AND 组合
**When** 切换筛选条件
**Then** 分页重置到第 1 页
**When** 搜索框输入
**Then** 300ms 防抖后触发搜索（搜索 title + content）

### 4. 分页（新增）
**Given** 知识库页面
**When** 卡片总数 > 每页数量
**Then** 显示分页控件：[◀] [1] [2] [3] ... [▶] + "共 N 张卡片"
**When** 点击页码
**Then** 发起 API 请求（带 `page` 参数）→ 滚动到页面顶部
**And** URL 同步：`/knowledge?page=2`
**Given** 当前在第一页
**Then** ◀ 按钮 disabled
**Given** 当前在最后一页
**Then** ▶ 按钮 disabled

### 5. 卡片详情模态框（新增）
**Given** 用户点击一张知识卡片
**When** 卡片被点击
**Then** 弹出详情模态框，显示：
- 标题 + 关闭按钮 ✕
- 类型 Badge + 状态 Badge
- 内容区（Markdown 渲染）
- 标签列表
- 来源信息
- 历史记录时间线（创建时间、更新时间）
- 操作按钮：[标记为已了解/回退为待了解] [✏️ 编辑] [🗑️ 删除]
**When** 点击"标记为已了解"
**Then** status UNKNOWN→KNOWN → Toast "✅ 已标记为已了解"
**When** 点击"回退为待了解"
**Then** status KNOWN→UNKNOWN → Toast "✅ 已回退为待了解"

### 6. 编辑卡片（修改）
**Given** 卡片详情模态框
**When** 点击"✏️ 编辑"
**Then** 模态框切换为编辑模式：类型下拉、标题输入、内容 textarea、标签 TagInput、来源输入
**When** 保存
**Then** 卡片更新 + history 追加 { time, summary } → Toast "✅ 卡片已更新"

### 7. 新增卡片（修改）
**Given** 知识库页面
**When** 点击"+ 新增卡片"按钮
**Then** 弹出编辑模态框（空白表单）
**When** 选择类型=术语
**Then** 自动设置 status=UNKNOWN
**When** 保存成功
**Then** Toast "✅ 卡片已创建" + 刷新列表

### 8. 删除卡片（修改）
**Given** 卡片详情模态框
**When** 点击"🗑️ 删除"
**Then** 弹出确认对话框"确定删除「XXX」？此操作不可撤销"
**When** 确认
**Then** 卡片删除 → 模态框关闭 → Toast "✅ 卡片已删除"

### 9. URL 参数同步（新增）
**Given** 知识库页面
**When** 筛选/搜索/分页操作
**Then** URL 参数同步：`?type=TERM&status=UNKNOWN&q=K8s&page=2`
**When** 通过 URL 直接访问
**Then** 页面根据参数初始化筛选和分页状态
