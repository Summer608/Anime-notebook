# 番剧手帐

一个用来整理、归类你看过的日本动漫的个人网站。支持输入简称自动补全完整名称、自动分配题材标签，并一键跳转到豆瓣评分页。

## 功能特点

- **添加动漫**：输入动漫名称（支持简称），自动补全完整名称并推荐题材标签
- **自动归类**：恋爱、热血、悬疑、科幻、奇幻、日常、运动、音乐、机战、治愈等题材
- **快速筛选**：按题材标签筛选，支持搜索和排序
- **豆瓣跳转**：点击动漫标题直接打开豆瓣搜索页
- **数据备份**：支持导出/导入 JSON 备份
- **封面预留**：卡片已预留封面图位置，后续可扩展图片上传

## 如何运行

### 方法一：双击运行（推荐）

1. 打开项目文件夹 `e:\新建文件\anime`
2. 双击 `start-visible.bat`
3. 会弹出一个标题为 **Anime Notebook** 的黑色窗口，启动成功后不要关闭它
4. 打开浏览器访问：`http://localhost:5173/`

> 如果 `start-visible.bat` 无法使用，可以尝试 `start.bat`。

### 如何关闭网站

- 如果用的是 `start-visible.bat`：关闭标题为 **Anime Notebook** 的黑色窗口
- 如果用的是 `start.bat`：在黑色窗口里按 `Ctrl + C`，然后关闭窗口
- 也可以直接双击 `stop.bat` 一键关闭

### 方法二：手动运行

如果你已经安装了 Node.js，可以在项目文件夹内打开终端，运行：

```bash
npm install
npm run dev
```

然后打开浏览器访问：`http://localhost:5173/`

## 项目结构

```
anime/
├── src/
│   ├── components/      # UI 组件
│   ├── data/            # 本地动漫知识库
│   ├── hooks/           # 自定义 React Hooks
│   ├── pages/           # 页面
│   ├── store/           # Zustand 状态管理
│   ├── types/           # TypeScript 类型
│   ├── App.tsx          # 主应用
│   ├── main.tsx         # 入口文件
│   └── index.css        # 全局样式
├── index.html           # HTML 模板
├── package.json         # 项目配置
├── start-visible.bat    # 一键启动脚本（推荐，打开不关闭的新窗口）
├── start.bat            # 一键启动脚本（备用）
├── stop.bat             # 一键关闭脚本
└── README.md            # 本文件
```

## 技术栈

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand（状态管理 + localStorage 持久化）
- Lucide React（图标）

## 关于自动归类是否需要 AI

当前版本**不需要调用 AI 大模型**。它通过内置的本地动漫知识库完成名称补全和题材分类，优点是：

- 免费、无 API Key
- 响应极快、可离线使用
- 观影记录不会上传到第三方

如果你以后想识别更冷门的动漫，或自动获取封面、评分，可以扩展接入 Bangumi、AniList 或 LLM API。
