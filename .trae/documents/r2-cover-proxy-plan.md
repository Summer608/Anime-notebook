# R2 封面图片代理缓存方案

## 问题
封面图片来自境外 CDN（img.bgm.tv、s4.anilist.co、cdn.myanimelist.net），国内不挂代理无法加载。

## 方案：Cloudflare Pages Functions + R2 绑定

### 核心思路
创建一个 Pages Function（`/api/cover?url=xxx`）作为图片代理：
1. 浏览器请求 `/api/cover?url=<封面URL>`
2. Function 用 URL 的哈希作为 key 查 R2
3. 如果 R2 已有缓存 → 直接返回图片（走 Cloudflare CDN，国内快）
4. 如果没有 → 从境外 CDN 下载，存入 R2，再返回给浏览器
5. 下次同一图片的请求直接从 R2 命中

### 优势
- **无需 API Token**：用 R2 绑定（Binding），密钥不暴露在前端
- **无需公开访问**：R2 bucket 保持私有，通过 Function 访问
- **自动缓存**：第一次访问慢，之后都走 R2 + Cloudflare CDN
- **零迁移工作**：不需要改数据库里的 URL，只改前端 `<img src>`

## 用户需要做的步骤

1. **创建 R2 bucket**
   - Cloudflare Dashboard → R2 → Create bucket
   - 名称：`anime-covers`
   - 不需要开启公开访问

2. **在 Pages 项目添加 R2 绑定**
   - Cloudflare Dashboard → Workers & Pages → `anime-notebook` → Settings → Functions
   - 找到 R2 bindings → Add binding
   - Variable name: `COVERS`
   - R2 bucket: `anime-covers`

## 代码改动

### 1. 创建 `functions/api/cover.ts`（Pages Function）
- 路径：`functions/api/cover.ts`
- 逻辑：
  - 读取 `url` query 参数
  - 用简单哈希生成 key：`covers/{hash}`
  - `env.COVERS.get(key)` 检查缓存
  - 命中：返回图片 + Cache-Control 头
  - 未命中：fetch 原始 URL → `env.COVERS.put(key, body)` → 返回图片
  - 设置 `Cache-Control: public, max-age=31536000, immutable`（一年缓存）

### 2. 修改 `src/components/AnimeCard.tsx`
- 把 `<img src={anime.coverUrl}>` 改为：
```tsx
const coverSrc = anime.coverUrl
  ? import.meta.env.DEV
    ? anime.coverUrl  // 本地开发直接用原 URL（挂代理）
    : `/api/cover?url=${encodeURIComponent(anime.coverUrl)}`  // 生产用代理
  : null;
```
- 本地开发用直接 URL（用户已挂代理）
- 生产环境用 `/api/cover` 代理

### 3. 修改 `functions/api/cover.ts` 的类型定义
- 创建 `functions/api/cover.ts` 时需要声明 `env` 类型

## 本地开发注意事项
- Pages Functions 在 `npm run dev`（Vite dev server）下不会运行
- 本地开发时 `import.meta.env.DEV` 为 true，直接用原 URL
- 如需本地测试 Function，用 `npx wrangler pages dev` 替代 `npm run dev`

## 验证步骤
1. 部署后访问 https://anime-notebook.pages.dev
2. 打开开发者工具 → Network
3. 查看封面图片请求是否走 `/api/cover?url=...`
4. 第一次加载稍慢（下载+缓存），第二次刷新后很快（R2 命中）
5. 不挂代理也能正常显示封面
