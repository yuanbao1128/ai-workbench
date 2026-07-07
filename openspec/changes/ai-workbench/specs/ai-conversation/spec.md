# Spec: AI Conversation (AI 自然语言对话)

## ADDED Requirements

### Requirement: 自然语言意图识别
系统 SHALL 通过 Claude API 识别用户输入的自然语言意图，支持以下意图类型：新增名词、新增方案/灵感/纪要/问题、新增任务、新增委托、查询、生成报告、通用对话。

#### Scenario: 识别新增名词意图
- **WHEN** 用户输入 "K8s 不太懂，记一下"
- **THEN** 系统识别意图为 ADD_TERM，提取标题=K8s，创建名词卡片

#### Scenario: 识别新增任务意图
- **WHEN** 用户输入 "记录一下，今天要完成电费收入分析报表的需求文档"
- **THEN** 系统识别意图为 ADD_TODO，提取标题=电费收入分析报表的需求文档，截止日期=今天

#### Scenario: 识别带截止日期的任务
- **WHEN** 用户输入 "这周三前，完成智能安全帽操作手册终稿"
- **THEN** 系统识别意图为 ADD_TODO，提取标题=完成智能安全帽操作手册终稿，截止日期=本周三

#### Scenario: 识别查询意图
- **WHEN** 用户输入 "矢量数据库什么意思？"
- **THEN** 系统识别意图为 QUERY，从知识库搜索「矢量数据库」并返回卡片内容

#### Scenario: 识别新增委托意图
- **WHEN** 用户输入 "李老板反馈登录页报错了，转给王工排查"
- **THEN** 系统识别意图为 ADD_DELEGATION，提取转交给=王工，来源=李老板

#### Scenario: 识别查询今日概览
- **WHEN** 用户输入 "今天有什么重点？"
- **THEN** 系统识别意图为 QUERY，返回今日概览（必须解决+重点关注+待追问）

#### Scenario: 识别生成周报
- **WHEN** 用户输入 "帮我写周报"
- **THEN** 系统识别意图为 GENERATE_REPORT，触发周报生成

### Requirement: 多意图自动拆解
当用户一句话包含多个意图时，系统 SHALL 自动拆解并逐一执行，最后汇总告知用户。

#### Scenario: 多意图拆解执行
- **WHEN** 用户输入 "记一下K8s不懂，顺便提醒我明天问王工那个bug"
- **THEN** 系统识别为 [ADD_TERM(K8s), ADD_DELEGATION(那个bug→王工, 明天)]，逐一执行，汇总告知结果

### Requirement: 语音输入
系统 SHALL 支持移动端语音输入，通过浏览器 Web Speech API 将语音转为文本后进入意图识别。

#### Scenario: 语音输入名词
- **WHEN** 用户在移动端点击语音按钮说 "GraphQL 不太懂，记一下"
- **THEN** 语音转文本后，识别为 ADD_TERM，创建名词卡片

### Requirement: 对话结果内嵌卡片
AI 对话中的操作结果 SHALL 以内嵌卡片形式展示，包含可点击的操作项。

#### Scenario: 委托创建卡片
- **WHEN** AI 创建委托成功
- **THEN** 对话中显示委托卡片，包含标题、转交对象、追问时间、操作按钮

#### Scenario: 知识查询卡片
- **WHEN** AI 查询知识库成功
- **THEN** 对话中显示知识卡片，包含标题、状态、理解内容、关键概念标签

### Requirement: 聊天界面快捷建议
AI 对话输入框下方 SHALL 显示快捷操作建议：记名词、添加TODO、转委托、查日程、生周报。

#### Scenario: 点击快捷建议
- **WHEN** 用户点击「记名词」快捷建议
- **THEN** 输入框自动填入提示文本，引导用户输入

### Requirement: 意图识别失败降级
当意图识别置信度低时，系统 SHALL 降级为通用对话模式，由 AI 自由回答。

#### Scenario: 模糊输入
- **WHEN** 用户输入 "最近怎么样？"
- **THEN** 系统识别为 UNKNOWN，AI 自由回答