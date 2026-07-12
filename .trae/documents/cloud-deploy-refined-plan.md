# 永久部署 + 云端同步方案（精炼版）

## Context

用户希望将动漫收藏网站变成永久在线链接，数据跨设备/浏览器/手机同步。上一轮会话已完成：
- ✅ 安装 `@supabase/supabase-js`
- ✅ 创建 `src/lib/supabase.ts`（客户端实例）
- ✅ 创建 `src/store/authStore.ts`（GitHub/Google OAuth）
- ✅ 创建 `.env.local`（**占位符值，尚未填入真实凭证**）
- ✅ 更新 `src/vite-env.d.ts`（环境变量类型）

**关键问题**：`.env.local` 当前是占位符（`https://your-project-ref.supabase.co`），用户尚未创建 Supabase 项目。若按原计划"persist 不再存 items"，用户刷新页面会丢失全部 229+ 条数据。

**本方案核心改进**：保留 localStorage 作为缓存/回退，Supabase 作为云端同步层。代码写好后立即可用（本地模式），用户创建 Supabase 项目后自动切换为云端模式。

## 运行模式（三种状态自动切换）

| 状态 | 条件 | items 来源 | 写入目标 |
|------|------|-----------|---------|
| 本地模式 | Supabase 未配置（占位符） | localStorage | localStorage |
| 只读模式 | Supabase 已配置 + 未登录 | Supabase（公开读） | 无（只读） |
| 云端模式 | Supabase 已配置 + 已登录 | Supabase | 乐观更新本地 + fire-and-forget 写 Supabase |

检测函数（在 animeStore 顶部）：
```typescript
export const isSupabaseConfigured =
  !!import.meta.env.VITE_SUPABASE_URL &&
  !import.meta.env.VITE_SUPABASE_URL.includes("your-project-ref") &&
  !!import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_ANON_KEY !== "your-anon-key";
```

## 需要修改的文件（7 个）

### 1. `src/store/animeStore.ts` — 核心改动（保留 + 叠加云端同步）

**策略：不删除 localStorage 持久化，在其之上叠加 Supabase 同步。**

- 保留现有 persist 配置不变（items + viewMode + sortBy 存 localStorage，key `anime-collection`）
- 新增 `isCloudEnabled`（= `isSupabaseConfigured`）、`isLoadingCloud` 状态
- 新增 `AnimeItemRow` 接口 + `rowToItem` / `itemToRow` 转换函数（snake_case ↔ camelCase）
- 新增 `loadFromSupabase()`：从 Supabase 拉取全部 items，替换本地 state（同时更新 localStorage 缓存）
- 新增 `migrateLocalData()`：当 Supabase 表为空且本地有数据时，将本地 items 批量 upsert 到 Supabase，返回迁移条数
- 所有 CRUD 方法在 `set()` 后，若 `isCloudEnabled && useAuthStore.getState().user`，fire-and-forget 写 Supabase：
  - `addItem` → `insert(row)`
  - `addItems` → 批量 `insert(rows)`
  - `removeItem` → `delete().eq('id', id)`
  - `updateItem` → `update({...}).eq('id', id)`
  - `commitOrder` → 批量 `update({ sort_order }).eq('id', id)`
  - `syncFromKnowledge` → 批量 `update({ genres, display_name, douban_url })`
  - `importData` → 先 `delete` 全部再批量 `insert`（或 upsert）
- 写入失败时 `console.error` + 不回滚（用户可刷新恢复服务端数据）
- 方法签名全部不变，调用方零改动

Supabase 表结构（snake_case）：
```
id (uuid) | display_name (text) | original_input (text) | genres (text[])
cover_url (text null) | douban_url (text) | sort_order (int)
created_at (bigint) | updated_at (bigint)
```

### 2. `src/App.tsx` — 初始化流程

- `useEffect` 中调用 `useAuthStore.getState().initAuth()`
- auth 初始化完成后，若 `isSupabaseConfigured`：调用 `loadFromSupabase()`，若返回空且本地有 items 则调 `migrateLocalData()`
- `authStore.loading` 期间显示简单 Loading 界面（居中 spinner + "加载中..."）
- 将 `isAddModalOpen` / `isBulkModalOpen` 的打开逻辑加上 `!!user` 守卫（未登录时不响应）

### 3. `src/components/Header.tsx` — 登录/登出 + 条件渲染

- 引入 `useAuthStore`
- 未登录：右侧显示"登录"按钮，点击弹出小菜单（GitHub / Google 两个选项）
- 已登录：右侧显示用户邮箱首字母头像 + "登出"按钮
- `onAddClick` / `onBulkImportClick` 按钮仅在已登录时显示
- 移动端：登录/登出按钮始终显示（替换原添加按钮位置）

### 4. `src/components/Hero.tsx` — 条件渲染

- 引入 `useAuthStore`
- "添加动漫" / "批量导入"按钮仅在已登录时显示
- 未登录时 Hero 区显示"登录后可管理你的动漫收藏"提示文案

### 5. `src/components/FloatingAddButton.tsx` — 条件渲染

- 引入 `useAuthStore`，未登录时返回 `null`

### 6. `src/pages/Home.tsx` — 条件渲染编辑功能

- 引入 `useAuthStore`
- 已登录：显示同步知识库 / 获取封面 / 备份工具 / 删除 / 拖拽（现有行为）
- 未登录：隐藏上述编辑按钮，`AnimeGrid` 的 `onDelete` 传 `undefined`、`onReorder` 传 `undefined`（禁用拖拽和删除）
- 搜索 / 筛选 / 视图切换 始终可用

### 7. `src/components/AnimeCard.tsx` + `AnimeGrid.tsx` — onDelete 改为可选

- `AnimeCardProps.onDelete` 改为 `(id: string) => void` 可选；为 `undefined` 时不渲染删除按钮
- `AnimeGridProps.onDelete` 同理改为可选；list 视图删除按钮条件渲染

### 8. `src/components/Footer.tsx` — 更新文案

- 根据模式显示不同文案：
  - 本地模式：现有文案"数据仅保存在浏览器本地..."
  - 云端模式："数据已云端同步，可在任意设备访问"

### 9. 新建 `vercel.json`

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

### 10. 新建 `.env.example`

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
（`.env.local` 已在 `.gitignore` 的 `*.local` 规则中，不会被提交）

## 数据库 SQL（用户在 Supabase SQL Editor 执行）

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

## 用户手动步骤（代码完成后）

1. **创建 Supabase 项目**：supabase.com → GitHub 登录 → New Project
2. **执行 SQL**：SQL Editor 粘贴上面的建表语句运行
3. **获取凭证**：Settings → API → 复制 Project URL + anon key → 填入 `.env.local`
4. **配置 OAuth**：
   - GitHub：Settings → Developer settings → OAuth Apps → Callback URL 填 `https://<project-ref>.supabase.co/auth/v1/callback`
   - Google：Google Cloud Console → Credentials → Redirect URI 同上
   - Supabase Dashboard → Authentication → Providers → 填入 Client ID/Secret
5. **关闭公开注册**：Authentication → Settings → 关闭 "Allow new users to sign up"（只有你的账号能登录）
6. **推送 GitHub**：创建仓库 → `git push`
7. **Vercel 部署**：vercel.com → Import 项目 → 环境变量填 `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` → Deploy
8. **更新 Supabase 回调**：Authentication → URL Configuration → Site URL + Redirect URLs 填 Vercel 域名

## 实现顺序

1. 重构 `src/store/animeStore.ts`（叠加云端同步 + 迁移 + 加载）
2. 修改 `src/App.tsx`（初始化 + Loading）
3. 修改 `src/components/Header.tsx`（登录/登出）
4. 修改 `src/components/Hero.tsx` + `FloatingAddButton.tsx`（条件渲染）
5. 修改 `src/pages/Home.tsx`（条件渲染编辑功能）
6. 修改 `src/components/AnimeCard.tsx` + `AnimeGrid.tsx`（onDelete 可选）
7. 修改 `src/components/Footer.tsx`（文案）
8. 创建 `vercel.json` + `.env.example`
9. TypeScript 编译验证

## 验证步骤

1. `npm run dev` → 本地模式（占位符凭证）→ 现有功能全部正常，数据仍在 localStorage
2. 用户填入真实凭证后刷新 → 只读模式 → 能看到动漫列表但不能编辑
3. 点击登录 → GitHub/Google OAuth → 回调后出现编辑功能（云端模式）
4. 添加/删除/拖拽动漫 → 刷新后数据仍在（云端同步成功）
5. 换浏览器/手机访问同一域名 → 登录后数据一致
6. 推送 GitHub → Vercel 自动部署 → 线上访问正常

## Assumptions & Decisions

- **保留 localStorage 持久化**：作为离线缓存和未配置 Supabase 时的回退，不删除。比原计划更安全，不会丢失现有数据。
- **fire-and-forget 写入不回滚**：写入失败时仅 console.error，用户可刷新从服务端恢复。避免复杂的回滚逻辑。
- **迁移仅一次**：Supabase 表为空且本地有数据时自动迁移；之后以 Supabase 为准。
- **sort_order 首次迁移按 createdAt 升序赋值**：保持与当前 "oldest" 排序一致。
- **不引入额外的 loading/toast 库**：用现有 Tailwind 样式实现简单的 Loading 界面。
