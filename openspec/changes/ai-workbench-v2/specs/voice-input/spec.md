# Spec: Voice Input

> 来源：PRD v2.0 §8.3，原型 `docs/prototype-v2.html` mobile AI tab

## 场景

### 1. 麦克风按钮显示
**Given** 用户在手机端 AI 对话页
**When** 浏览器支持 Web Speech API（`webkitSpeechRecognition` 或 `SpeechRecognition`）
**Then** 输入框右侧显示蓝色麦克风按钮（48×48px，圆形，蓝色渐变背景）
**Given** 浏览器不支持 Web Speech API
**Then** 麦克风按钮灰色 disabled，hover 提示"您的浏览器不支持语音输入"

### 2. 长按录音
**Given** 用户在手机端 AI 对话页
**When** 用户按下（mousedown/touchstart）麦克风按钮
**Then** 按钮变红色（#DC2626）+ 放大至 1.15 倍
**And** 底部显示红色提示条"🔴 正在录音... 松开发送"
**And** 触发触觉反馈 `navigator.vibrate(10)`
**And** 开始录音（`recognition.start()`）

### 3. 松开发送
**Given** 用户正在录音中
**When** 用户松开（mouseup/touchend）麦克风按钮
**Then** 停止录音（`recognition.stop()`）
**And** 按钮恢复蓝色
**And** 识别结果填入输入框 → 自动发送
**And** 底部提示条消失

### 4. 取消录音
**Given** 用户正在录音中
**When** 用户手指滑出按钮区域（mouseleave/touchmove outside）
**Then** 取消录音（`recognition.abort()`）
**And** 按钮恢复蓝色
**And** 底部提示条消失
**And** 不发送任何内容

### 5. 超时自动发送
**Given** 用户正在录音中
**When** 录音持续时间达到 60 秒
**Then** 自动停止录音并发送已识别内容

### 6. 语音识别结果处理
**Given** 语音识别返回文本
**When** 文本非空
**Then** 文本填入输入框 → 自动调用 sendChatMessage()
**When** 文本为空（未识别到语音）
**Then** Toast "⚠️ 未识别到语音，请重试"

### 7. 只在手机端显示
**Given** 用户在 PC 端 AI 面板
**Then** 麦克风按钮不显示（PC 端无需语音输入）
