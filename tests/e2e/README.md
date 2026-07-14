# Playwright E2E Tests

## 测试覆盖

| 文件 | 覆盖场景 |
|------|----------|
| `dashboard.spec.ts` | 仪表盘概览、快捷入口、页面导航 |
| `knowledge.spec.ts` | 术语卡片创建、筛选、搜索、详情、标记已了解 |
| `tasks.spec.ts` | 周视图日历、任务创建完成、遗留问题 |
| `delegation.spec.ts` | 委托创建、状态筛选 |
| `reports.spec.ts` | 日报/周报生成 |
| `ai-chat.spec.ts` | AI 聊天界面、快捷建议、意图识别 |
| `settings.spec.ts` | API 配置保存 |
| `responsive.spec.ts` | PC 侧边栏、移动端底部导航 |

## 运行方式

### 本地运行（需要本地 dev 服务器）

```bash
npx playwright test
```

### 线上运行（针对已部署的 URL）

```bash
PLAYWRIGHT_BASE_URL=https://ai-workbench-now.vercel.app npx playwright test
```

### 单个文件

```bash
npx playwright test tests/e2e/knowledge.spec.ts
```

### 查看报告

```bash
npx playwright show-report
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `PLAYWRIGHT_BASE_URL` | 测试目标 URL，默认 `http://localhost:3000` |