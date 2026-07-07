# Spec: System Config (系统配置)

## ADDED Requirements

### Requirement: AI 模型配置入口
系统 SHALL 在页面顶部提供齿轮图标按钮，作为系统设置入口。

#### Scenario: 打开设置
- **WHEN** 用户点击顶部 ⚙️ 图标
- **THEN** 弹出 AI 模型配置弹窗

### Requirement: AI 模型配置弹窗
配置弹窗 SHALL 包含以下字段：API 提供商（下拉选择）、API Key（密码输入）、模型（下拉选择）、API Base URL（可选文本输入）。

#### Scenario: 配置 Claude API
- **WHEN** 用户选择提供商=Anthropic、输入 API Key、选择模型=claude-sonnet-5
- **THEN** 系统保存配置，后续 AI 调用使用该配置

#### Scenario: 配置自定义 API
- **WHEN** 用户选择提供商=自定义、输入 API Key、输入 Base URL
- **THEN** 系统使用自定义端点进行 AI 调用

### Requirement: 测试连接
配置弹窗 SHALL 提供「测试连接」按钮，验证 API 配置是否可用。

#### Scenario: 测试连接成功
- **WHEN** 用户点击「测试连接」且 API 配置正确
- **THEN** 显示 "✅ 连接成功"

#### Scenario: 测试连接失败
- **WHEN** 用户点击「测试连接」且 API Key 无效
- **THEN** 显示错误提示信息

### Requirement: API Key 安全存储
API Key SHALL 加密存储在后端，前端不暴露明文。

#### Scenario: 保存 API Key
- **WHEN** 用户保存 API Key
- **THEN** Key 加密后存入数据库，前端仅显示脱敏信息（如 sk-ant-api••••••••）

### Requirement: PWA 安装支持
系统 SHALL 配置 PWA manifest.json 和 Service Worker，支持用户在手机上将工作台安装到桌面。

#### Scenario: 手机端安装
- **WHEN** 用户在手机 Safari 打开工作台并点击「添加到主屏幕」
- **THEN** 工作台以独立 App 形式安装，全屏运行，无浏览器外壳

#### Scenario: 离线查看
- **WHEN** 用户在离线状态下打开已安装的 PWA
- **THEN** 显示已缓存的页面内容，标记「离线模式」

### Requirement: 响应式布局
系统 SHALL 支持 PC 端（≥1024px）和手机端（<768px）两套布局，PC 端侧边栏导航，手机端底部导航栏。

#### Scenario: PC 端布局
- **WHEN** 用户在 PC 浏览器打开工作台
- **THEN** 显示左侧 224px 固定侧边栏 + 右侧主内容区

#### Scenario: 手机端布局
- **WHEN** 用户在手机浏览器打开工作台
- **THEN** 显示单列布局 + 底部 64px 导航栏（仪表/知识/日程/委托/日报）