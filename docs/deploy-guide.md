# AI 工作台 — 部署与验收行动清单

按照以下顺序逐项执行，每完成一项打勾即可。

---

## 第一步：获取 AI API Key（5分钟）

这是让 AI 对话功能工作的前提。系统支持 **Anthropic**、**OpenAI**、**自定义 API** 三种提供商。

### 如果使用 OpenAI（推荐）

1. 打开 [OpenAI API Keys](https://platform.openai.com/api-keys)
2. 登录 OpenAI 账号
3. 点击 **Create new secret key**
4. 给 Key 取个名字（如 `ai-workbench`），点击创建
5. **立即复制** 生成的 Key（格式：`sk-proj-...`），它只显示一次

### 如果使用 Anthropic

1. 打开 [Anthropic Console](https://console.anthropic.com/)
2. 注册/登录 Anthropic 账号
3. 点击左侧菜单 **API Keys** → 点击 **Create Key**
4. 给 Key 取个名字（如 `ai-workbench`），点击创建
5. **立即复制** 生成的 Key（格式：`sk-ant-api03-...`），它只显示一次

> ⚠️ API 调用会按量计费。个人使用量很小，一个月大概几块钱。

---

## 第二步：创建 Supabase 数据库（10分钟）

Supabase 提供免费的 PostgreSQL 数据库，适合个人项目。

### 2.1 注册并创建项目

1. 打开 https://supabase.com/ ，点击 **Start your project**
2. 用 GitHub 账号登录（推荐，方便后续 Vercel 集成）
3. 登录后点击 **New project**
4. 填写信息：
   - **Name**: `ai-workbench`
   - **Database Password**: 设置一个强密码（**记下来！** 后面要用）
   - **Region**: 选择离你最近的，如 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`
   - **Pricing Plan**: 选 **Free**（免费版有 500MB 数据库空间，完全够用）
5. 点击 **Create project**，等待 1-2 分钟创建完成

### 2.2 获取数据库连接字符串

1. 项目创建完成后，进入 Supabase 项目面板
2. 点击左侧 **Settings**（齿轮图标）→ **Database**
3. 找到 **Connection string** 区域
4. 点击 **URI** 标签页
5. 复制那段连接字符串，格式类似：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
6. 把 `[YOUR-PASSWORD]` 替换成你在 2.1 步骤中设置的密码

### 2.3 配置到项目中

在项目根目录找到 `.env` 文件，修改 `DATABASE_URL`：

```bash
# 把原来的 SQLite 配置：
DATABASE_URL="file:./dev.db"

# 改成 Supabase PostgreSQL（粘贴你刚才复制的连接字符串）：
DATABASE_URL="postgresql://postgres:你的密码@db.xxxxx.supabase.co:5432/postgres"
```

### 2.4 推送数据库表结构

打开终端，在项目目录下运行：

```bash
# 修改 prisma/schema.prisma 中的数据库类型
# 把 provider = "sqlite" 改为 provider = "postgresql"
```

> 我来帮你改 —— 你只需要告诉我改好了，我执行命令。

---

## 第三步：把项目推送到 GitHub（5分钟）

Vercel 需要从 GitHub 拉取代码。

1. 打开 https://github.com/new ，创建一个新仓库
   - **Repository name**: `ai-workbench`
   - **Private** 或 Public 都可以
   - 不要勾选 "Add a README file"
2. 点击 **Create repository**

然后在终端执行以下命令（在项目目录下）：

```bash
git init
git add .
git commit -m "Initial commit: AI 工作台"
git branch -M main
git remote add origin https://github.com/你的用户名/ai-workbench.git
git push -u origin main
```

---

## 第四步：部署到 Vercel（10分钟）

### 4.1 导入项目

1. 打开 https://vercel.com/ ，点击 **Sign Up**
2. 选择 **Continue with GitHub**（用 GitHub 登录）
3. 登录后，点击 **Import** → **Import Git Repository**
4. 找到你的 `ai-workbench` 仓库，点击 **Import**
5. 如果看不到，点击 **Configure GitHub App** 授权访问

### 4.2 配置环境变量

在导入页面，展开 **Environment Variables**，添加以下变量：

| Name | Value | 说明 |
|------|-------|------|
| `DATABASE_URL` | `postgresql://postgres:密码@db.xxxxx.supabase.co:5432/postgres` | 第二步获取的连接字符串 |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | 第一步获取的 API Key |
| `CRON_SECRET` | 随意写一串随机字符，如 `my-secret-2026` | 保护定时任务接口 |

> ⚠️ 注意：Value 不要带引号，直接粘贴即可。

### 4.3 部署

1. 点击 **Deploy** 按钮
2. 等待 2-3 分钟，Vercel 会自动构建和部署
3. 部署完成后会显示一个URL，类似 `https://ai-workbench-xxx.vercel.app`
4. 点击这个 URL，确认应用能正常打开

### 4.4 修改数据库 Provider

部署前需要在本地执行一次迁移，把 SQLite 改成 PostgreSQL：

我会帮你执行这个命令，你确认即可。

---

## 第五步：生成 PWA 图标（5分钟）

让手机端可以安装到桌面需要两个图标。

1. 打开 https://realfavicongenerator.net/
2. 上传一张你想用作 App 图标的图片（建议 512x512 以上的方形图）
3. 网站会自动生成所有尺寸的图标
4. 下载生成的图标包，把 `icon-192.png` 和 `icon-512.png` 放到项目的 `public/` 目录
5. 提交并推送到 GitHub：
   ```bash
   git add public/icon-*.png
   git commit -m "Add PWA icons"
   git push
   ```
6. Vercel 会自动重新部署

---

## 第六步：验证功能（15分钟）

部署完成后，逐一验证以下功能：

### 6.1 基础页面

| 页面 | 验证项 | ✓ |
|------|--------|---|
| 首页 | 显示"今日概览"，4个统计卡片，AI助手输入框 | |
| 知识库 | 正方形卡片网格（PC 3列），筛选栏，搜索框 | |
| 日程表 | 周视图日历，可翻周，可点击日期 | |
| 委托跟进 | 委托卡片，状态筛选 | |
| 日报 | 日报/周报列表，可手动生成 | |

### 6.2 AI 对话

在首页或聊天页面输入以下测试用例：

| 输入 | 预期结果 | ✓ |
|------|---------|---|
| `K8s 不太懂，记一下` | 创建一张术语卡片 | |
| `今天要完成需求文档评审` | 创建一个任务 | |
| `李老板反馈登录页报错了，转给王工排查` | 创建一个委托 | |
| `今天有什么重点？` | 返回今日概览 | |
| `帮我写周报` | 生成周报 | |

### 6.3 手机端

1. 用手机浏览器打开 Vercel 部署的 URL
2. 检查底部导航栏是否正常显示
3. 点击各个 tab 切换
4. **iOS Safari**: 点击底部分享按钮 → "添加到主屏幕"
5. **Android Chrome**: 会自动弹出安装提示，或点击菜单 → "添加到主屏幕"
6. 从桌面图标打开 App，确认全屏运行（无浏览器地址栏）

### 6.4 定时任务（Vercel Cron）

Vercel Hobby 计划只支持 2 个 Cron Job。目前 `vercel.json` 配置了 4 个，需要：

1. 升级到 Vercel Pro（$20/月），或者
2. 合并 Cron Jobs（比如把 morning-brief 和 daily-report 合并）

**建议**：先用手动触发代替定时任务（在日报页面点击"生成日报"/"生成周报"按钮），等需要时再升级。

---

## 第七步：日常使用

部署完成后，日常使用场景：

1. **遇到不懂的名词** → 打开工作台，在 AI 对话框输入"xxx 不懂，记一下"
2. **记录 TODO** → 在 AI 对话框输入"今天要完成 xxx"
3. **业务反馈转开发** → 在 AI 对话框输入"xxx 反馈 xxx，转给 xx 排查"
4. **每天下班前** → 打开日报页面，点击"生成日报"
5. **每周五** → 打开日报页面，点击"生成周报"，复制后粘贴到公司周报系统
6. **查看日程** → 打开日程表页面，查看本周任务分布

---

## 遇到问题？

- **Vercel 部署失败**：检查环境变量是否正确配置（DATABASE_URL 和 ANTHROPIC_API_KEY）
- **数据库连接失败**：检查 Supabase 的 Database Settings 中是否开启了连接
- **AI 对话不工作**：检查 ANTHROPIC_API_KEY 是否正确，Anthropic 账户是否有余额
- **手机端 PWA 不显示**：确认 manifest.json 和图标文件已部署