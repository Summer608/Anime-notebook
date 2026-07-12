# 部署到 Vercel + Supabase 云端存储方案

## Context

当前动漫收藏网站是一个纯前端项目，数据存储在浏览器 localStorage 中。用户希望：
1. 部署为永久在线链接，不需要每次本地运行
2. 数据云端存储，跨设备/跨浏览器/手机都能访问
3. 公开可看（任何人通过链接可看动漫列表）
4. 登录可编辑（只有登录用户能增删改）

方案：**Vercel 部署 + Supabase 数据库 + Supabase Auth（GitHub/Google OAuth）**

## 需要你手动完成的步骤

### 1. 创建 Supabase 项目
- 访问 https://supabase.com 用 GitHub 账号登录
- New Project → 填写名称 → 创建
- 记下 **Project URL** 和 **anon key**（Settings → API）
- 在 SQL Editor 中执行建表 SQL（我会提供）

### 2. 配置 OAuth
- **GitHub**：Settings → Developer settings → OAuth Apps → New OAuth App
  - Callback URL: `https://你的项目ref.supabase.co/auth/v1/callback`
- **Google**：Google Cloud Console → Credentials → Create OAuth client ID
  - Redirect URI: 同上
- 在 Supabase Dashboard → Authentication → Providers 中填入 Client ID/Secret

### 3. 推送代码到 GitHub
- 我会帮你初始化 git 并创建 .gitignore
- 你需要在 GitHub 创建仓库并推送

### 4. Vercel 部署
- https://vercel.com 用 GitHub 登录
- Import 项目 → 配置环境变量 → Deploy
- 拿到域名后回 Supabase 更新 Site URL 和 Redirect URLs

## 我来实现的代码改动

### 新增文件（4个）

| 文件 | 用途 |
|------|------|
| `src/lib/supabase.ts` | Supabase 客户端实例 |
| `src/store/authStore.ts` | 认证状态管理（登录/登出/OAuth） |
| `.env.local` | 本地环境变量（VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY） |
| `vercel.json` | Vercel 部署配置（SPA 路由重写） |

### 修改文件（12个）

**核心改动：**

1. **`src/store/animeStore.ts`** — 从 localStorage 改为 Supabase
   - persist 只保留 viewMode/sortBy（不再存 items）
   - 所有 CRUD 方法：乐观更新本地 + fire-and-forget 写 Supabase
   - 新增 `loadFromSupabase()` 和 `migrateLocalData()`
   - 方法签名全部不变，调用方零改动

2. **`src/App.tsx`** — 初始化流程
   - 调用 `initAuth()` + `loadFromSupabase()`
   - 加载完成前显示 Loading
   - 首次登录时自动迁移 localStorage 旧数据

3. **`src/components/Header.tsx`** — 登录/登出按钮
   - 未登录：显示"登录"按钮（GitHub/Google 选项）
   - 已登录：显示添加/导入按钮 + 登出

4. **`src/components/AnimeCard.tsx`** — `onDelete` 改为可选

5. **UI 组件条件渲染**（`Home.tsx` / `Hero.tsx` / `FloatingAddButton.tsx` / `Categories.tsx` 等）
   - 未登录时隐藏所有编辑功能（添加/删除/拖拽/同步/导入导出）
   - 只保留浏览功能（搜索/筛选/视图切换）

**辅助改动：**
- `src/vite-env.d.ts` — 添加环境变量类型
- `src/components/Footer.tsx` — 更新文案
- `package.json` — 添加 `@supabase/supabase-js` 依赖

### 数据库 SQL（在 Supabase 执行）

```sql
CREATE TABLE anime_items (
  id UUID PRIMARY KEY,
  display_name TEXT NOT NULL,
  original_input TEXT NOT NULL,
  genres TEXT[] NOT NULL DEFAULT '{}',
  cover_url TEXT,
  douban_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

ALTER TABLE anime_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON anime_items
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "auth_insert" ON anime_items
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON anime_items
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete" ON anime_items
  FOR DELETE TO authenticated USING (true);

CREATE INDEX idx_anime_items_sort_order ON anime_items(sort_order);
```

### 关键设计决策

- **乐观更新**：先更新本地状态（UI 立即响应），再后台写 Supabase。写入失败时提示刷新
- **关闭公开注册**：只有你自己的 GitHub/Google 账号能登录，其他人只能看
- **数据迁移**：首次登录时自动将 localStorage 旧数据导入 Supabase
- **排序持久化**：新增 `sort_order` 列，拖拽后批量更新

## 实现顺序

1. 安装 `@supabase/supabase-js` 依赖
2. 创建 `src/lib/supabase.ts` + `.env.local` + `vite-env.d.ts` 类型
3. 创建 `src/store/authStore.ts`
4. 重构 `src/store/animeStore.ts`（核心改动）
5. 修改 `App.tsx` 添加初始化流程
6. 修改 `Header.tsx` 添加登录/登出
7. 修改各 UI 组件条件渲染编辑功能
8. 创建 `vercel.json`
9. 初始化 git + .gitignore

## 验证方式

1. 本地 `npm run dev` → 访问 http://localhost:5176
2. 未登录状态：能看到动漫列表，但不能添加/删除/编辑
3. 点击登录 → GitHub/Google OAuth → 回调后出现编辑功能
4. 添加/删除动漫 → 刷新页面后数据仍在（云端同步成功）
5. 换浏览器/手机访问 → 数据一致
6. 推送到 GitHub → Vercel 自动部署 → 线上访问正常
