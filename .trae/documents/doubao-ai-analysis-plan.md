# 豆包大模型 AI 分析功能实现计划

## Context

用户希望在动漫卡片点击后弹出详情界面，提供"AI 分析"选项调用豆包大模型（Doubao-Seed-2.0-mini，model id: `doubao-seed-2-0-mini-260428`）生成该动漫的深度分析。要求流式打字机效果输出，结果缓存到 Cloudflare R2，排版美观。

## 架构设计

```
用户点击动漫卡片
  → 弹出详情 Modal（封面大图 + 名称 + 标签 + AI分析按钮）
  → 点击"AI分析"
  → 前端 fetch /api/ai-analysis?name=xxx
  → Cloudflare Pages Function
    → 查 R2 缓存（ai-analysis/{hash}）
    → 命中：直接返回纯文本
    → 未命中：调用豆包 API（stream:true）
      → 解析 SSE，提取 content delta
      → 转发纯文本流给前端（打字机效果）
      → 流结束后存入 R2 缓存
  → 前端逐字显示
```

## 文件清单

### 新增文件

1. **`functions/api/ai-analysis.ts`** — Cloudflare Pages Function
   - 检查 R2 缓存（key: `ai-analysis/{hashUrl(name)}`）
   - 命中缓存：返回 `text/plain; charset=utf-8`，header `X-Cache: hit`
   - 未命中：调用豆包 API
     - URL: `https://ark.cn-beijing.volces.com/api/v3/chat/completions`
     - Headers: `Authorization: Bearer {DOUBAO_API_KEY}`
     - Body: `{ model: "doubao-seed-2-0-mini-260428", messages: [...], stream: true }`
     - 超时: 60 秒（AI 生成较慢）
   - 用 ReadableStream 解析 SSE，提取 `choices[0].delta.content`
   - 转发纯文本流给前端
   - 同时收集完整文本，流结束后 `env.COVERS.put()` 存入 R2
   - Env 接口扩展：`{ COVERS: R2Bucket; DOUBAO_API_KEY: string }`
   - 复用 `cover.ts` 里的 `hashUrl` 函数（提取为共享工具或复制）

2. **`src/components/AnimeDetailModal.tsx`** — 详情弹窗组件
   - Props: `{ anime: AnimeItem; isOpen: boolean; onClose: () => void }`
   - 布局：桌面端左右分栏，手机端上下堆叠
     - 左侧/上方：封面大图（走 `/api/cover` 代理）+ 名称 + 标签 + 豆瓣链接
     - 右侧/下方：AI 分析内容区域（可滚动）
   - 交互：
     - 初始显示"AI 分析"按钮
     - 点击后 fetch 流式 API，逐字渲染
     - 加载中显示打字机光标动画
     - 完成后显示"重新分析"按钮（带 `?force=1` 参数跳过缓存）
   - Markdown 渲染：简单解析 `##` 标题、`-` 列表、`**粗体**`，不引入第三方库
   - 响应式：`max-w-4xl`，手机端 `flex-col`，桌面端 `md:flex-row`

3. **`src/components/StreamingText.tsx`** — 流式文本渲染组件
   - Props: `{ stream: ReadableStream<Uint8Array> | null; onDone: () => void }`
   - 用 `TextDecoder` + `getReader()` 读取流
   - 逐字追加到 state，配合 `requestAnimationFrame` 平滑渲染
   - 闪烁光标 CSS 动画

### 修改文件

4. **`src/components/AnimeCard.tsx`**
   - 添加 `onClick?: (anime: AnimeItem) => void` prop
   - 在 `<article>` 上添加 `onClick` 处理（排除删除按钮点击）
   - 添加 `cursor-pointer` 样式提示可点击
   - 手机端列表视图也要支持点击

5. **`src/components/AnimeGrid.tsx`**
   - 添加 `onAnimeClick?: (anime: AnimeItem) => void` prop
   - 传递给 `AnimeCard`
   - 列表视图的 `<li>` 也添加 `onClick`

6. **`src/pages/Home.tsx`**
   - 添加 `selectedAnime` state
   - 添加 `AnimeDetailModal` 渲染
   - 传递 `onAnimeClick` 给 `AnimeGrid`

7. **`src/pages/Categories.tsx`**
   - 同 Home.tsx，添加详情弹窗支持

8. **`.env.local`** — 添加豆包 API Key（仅本地开发用）
   ```
   DOUBAO_API_KEY=你的key
   ```
   注意：这个变量不加 `VITE_` 前缀，只在 Pages Function 里用，不暴露给前端

9. **`src/vite-env.d.ts`** — 不需要改（DOUBAO_API_KEY 不走 Vite 环境变量）

## Prompt 设计

```
你是一位资深动漫评论家。请分析动漫《{name}》，严格按以下 Markdown 格式输出，不要输出其他内容：

## 📊 评分一览
- **豆瓣评分**：X.X / 10（N 人评价）
- **Bangumi 评分**：X.X / 10（N 人评价）
> 如不确定具体数字，给出合理估值并标注"约"

## 📺 各集标题
第1集：标题
第2集：标题
...（列出全部或主要集数）

## 💬 经典台词与名场面
1. "台词原文" —— 场景描述
2. "台词原文" —— 场景描述
...（3-5 条）

## 🎯 入坑指南 & 相似作品
**看前须知**：...
**相似作品**：《作品1》《作品2》《作品3》

## ✨ 一句话灵魂总结
xxx

## 🔍 冷知识与幕后花絮
1. xxx
2. xxx
...（3-5 条）
```

## UI 设计细节

### Modal 布局（桌面端）
```
┌─────────────────────────────────────────────┐
│  [关闭X]                                     │
├──────────────┬──────────────────────────────┤
│              │                              │
│   封面大图    │   动漫名称                    │
│   (3:4)      │   [标签] [标签]              │
│              │   [豆瓣链接]                  │
│              │                              │
│              │   ─────────────────────────  │
│              │   [🤖 AI 分析]  或  分析内容  │
│              │   (可滚动区域)                │
│              │                              │
└──────────────┴──────────────────────────────┘
```

### Modal 布局（手机端）
```
┌─────────────────┐
│  [关闭X]         │
├─────────────────┤
│   封面大图       │
│   动漫名称       │
│   [标签]         │
├─────────────────┤
│  [🤖 AI 分析]    │
│  或分析内容      │
│  (可滚动)        │
└─────────────────┘
```

### 配色方案
- Modal 背景：`bg-paper`（#FDF8F3）
- 标题：`text-ink`（#2E2658）
- 分析内容背景：`bg-white/60`
- 分割线：`border-ink/10`
- AI 按钮：`btn-primary` + Sparkles 图标
- 流式光标：`animate-pulse` 的 `▊` 字符

### 流式渲染
- 每收到一段文本，追加到内容区域
- 自动滚动到底部
- 简单 Markdown 解析：
  - `## ` → `<h2>` 标题
  - `### ` → `<h3>` 小标题
  - `- ` 或 `1. ` → 列表
  - `**text**` → `<strong>`
  - `> ` → 引用块
  - 空行 → 段落分隔

## 用户需要手动配置

### Cloudflare Pages 环境变量
在 Cloudflare Dashboard → Pages 项目 → Settings → Environment variables 添加：
- `DOUBAO_API_KEY` = 用户的豆包 API Key

### 本地开发
在 `.env.local` 添加：
```
DOUBAO_API_KEY=用户的key
```

## 实现顺序

1. 创建 `functions/api/ai-analysis.ts`（后端流式 API）
2. 创建 `src/components/StreamingText.tsx`（流式渲染组件）
3. 创建 `src/components/AnimeDetailModal.tsx`（详情弹窗）
4. 修改 `AnimeCard.tsx` + `AnimeGrid.tsx`（添加点击）
5. 修改 `Home.tsx` + `Categories.tsx`（接入弹窗）
6. 配置环境变量
7. 推送 GitHub，Cloudflare 自动部署
8. 在 Cloudflare Pages 添加 `DOUBAO_API_KEY` 环境变量
9. 重新部署

## 验证步骤

1. 本地 `npm run dev` 启动
2. 点击任意动漫卡片 → 弹出详情 Modal
3. 点击"AI 分析" → 流式文字逐字出现
4. 等待完成 → 检查 6 个部分是否完整
5. 关闭 Modal，重新打开同一动漫 → 点击"AI 分析" → 秒开（R2 缓存命中）
6. 点击"重新分析" → 重新流式输出
7. 手机端访问 → 布局正确
8. 检查 R2 bucket → 应有 `ai-analysis/xxx` 文件

## 注意事项

- 豆包 API 超时设为 60 秒（AI 生成 6 部分内容较慢）
- 流式输出时前端自动滚动到底部
- 缓存 key 用动漫 `displayName` 的 hash，不含时间戳
- `force=1` 参数跳过缓存检查，但新结果仍会覆盖缓存
- 列表视图点击也弹出详情（不只是卡片视图）
