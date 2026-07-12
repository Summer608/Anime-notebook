import { useState, useRef } from "react";
import { Download, Loader2, Play } from "lucide-react";
import knowledgeRaw from "../data/animeKnowledge.ts?raw";
import userAddedRaw from "../data/userAddedAnime.ts?raw";
import { animeKnowledgeBase } from "@/data/animeKnowledge";
import { userAddedAnime } from "@/data/userAddedAnime";
import type { AnimeKnowledge } from "@/types";

const BANGUMI_TAG_MAP: Record<string, string> = {
  爱情: "恋爱", 恋愛: "恋爱", 恋爱: "恋爱", 纯爱: "恋爱",
  百合: "恋爱", 耽美: "恋爱", 后宫: "恋爱", GL: "恋爱", BL: "恋爱",
  狗粮: "恋爱", 发糖: "恋爱", 虐心: "恋爱", 虐恋: "恋爱",
  青梅竹马: "恋爱", 三角关系: "恋爱",
  热血: "热血", 燃: "热血", 激情: "热血", 热血战斗: "热血",
  战斗: "战斗", 动作: "战斗", 格斗: "战斗", 打斗: "战斗",
  打架: "战斗", 武术: "战斗", 战斗番: "战斗",
  搞笑: "搞笑", 喜剧: "搞笑", 吐槽: "搞笑", 恶搞: "搞笑",
  欢乐: "搞笑", 趣味: "搞笑", 无厘头: "搞笑", 搞笑番: "搞笑",
  日常: "日常", 生活: "日常", 平淡: "日常", 日常番: "日常",
  治愈: "治愈", 温情: "治愈", 温馨: "治愈", 暖心: "治愈", 治愈系: "治愈",
  奇幻: "奇幻", 幻想: "奇幻", 魔法: "奇幻", 魔幻: "奇幻",
  神鬼: "奇幻", 妖精: "奇幻", 妖怪: "奇幻", 精灵: "奇幻",
  魔法少女: "奇幻", 神灵: "奇幻", 超能力: "奇幻", 异能: "奇幻",
  恶魔: "奇幻", 魔鬼: "奇幻", 神话: "奇幻",
  科幻: "科幻", SF: "科幻", "sci-fi": "科幻", "Sci-Fi": "科幻",
  赛博朋克: "科幻", 太空: "科幻", 宇宙: "科幻", 末日: "科幻",
  末世: "科幻", 人工智能: "科幻",
  悬疑: "悬疑", 疑案: "悬疑", 谜团: "悬疑", 悬疑番: "悬疑",
  推理: "推理", 侦探: "推理", 解谜: "推理", 本格推理: "推理", 推理番: "推理",
  恐怖: "恐怖", 惊悚: "恐怖", 猎奇: "恐怖", 血腥: "恐怖",
  gore: "恐怖", 灵异: "恐怖",
  运动: "运动", 体育: "运动", 运动番: "运动",
  竞技: "竞技", 比赛: "竞技", 对决: "竞技", 竞技番: "竞技",
  音乐: "音乐", 偶像: "音乐", 乐队: "音乐", 演奏: "音乐",
  歌唱: "音乐", 演唱会: "音乐", 乐器: "音乐", 音乐番: "音乐",
  校园: "校园", 学园: "校园", 学生: "校园", 青春: "校园",
  学校: "校园", 社团: "校园", 校园番: "校园",
  机战: "机战", 机器人: "机战", 萝卜: "机战", Mecha: "机战",
  机甲: "机战", mecha: "机战", 机战番: "机战",
  历史: "历史", 时代剧: "历史", 古代: "历史", 历史人物: "历史",
  战国: "历史", 幕末: "历史", 历史番: "历史",
  异世界: "异世界", 转生: "异世界", 穿越: "异世界", 转世: "异世界",
  异世界穿越: "异世界", 龙傲天: "异世界",
  美食: "美食", 料理: "美食", 烹饪: "美食", 做饭: "美食", 美食番: "美食",
  职场: "职场", 工作: "职场", 上班: "职场", 职场番: "职场",
  冒险: "冒险", 冒険: "冒险", 探险: "冒险", 探索: "冒险", 冒险番: "冒险",
};

interface BangumiSubject {
  id: number;
  name: string;
  name_cn: string;
  tags?: { name: string; count: number }[];
}

interface LogEntry {
  index: number;
  total: number;
  name: string;
  oldGenres: string[];
  newGenres: string[];
  source: string;
  changed: boolean;
}

interface FileResult {
  filename: string;
  content: string;
  changed: number;
  unchanged: number;
  failed: number;
}

function toSearchQuery(name: string): string {
  let result = name.trim();
  if (result.includes("/")) {
    result = result.split("/")[0].trim();
  }
  if (result.includes("~")) {
    result = result.split("~")[0].trim();
  }
  if (result.includes("～")) {
    result = result.split("～")[0].trim();
  }
  result = result.replace(/（[^（）]*）/g, "").trim();
  result = result.replace(/\([^()]*\)/g, "").trim();
  result = result.replace(/\s*第\d+季.*$/g, "").trim();
  result = result.replace(/\s*part\s*\d+.*$/gi, "").trim();
  result = result.replace(/\s*Season\s*\d+.*$/gi, "").trim();
  result = result.replace(/\s*Final\s*Season.*$/gi, "").trim();
  result = result.replace(/\s+/g, " ").trim();
  return result || name.trim();
}

async function fetchSubjectTags(id: number): Promise<{ name: string; count: number }[] | undefined> {
  try {
    const res = await fetch(`https://api.bgm.tv/v0/subjects/${id}`, {
      headers: {
        "User-Agent": "AnimeNotebook/1.0 (https://localhost)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    return data.tags;
  } catch {
    return undefined;
  }
}

async function searchBangumi(query: string): Promise<BangumiSubject | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  try {
    const res = await fetch(
      `https://api.bgm.tv/search/subject/${encodeURIComponent(trimmed)}?type=2&responseGroup=small&max_results=5`,
      {
        headers: {
          "User-Agent": "AnimeNotebook/1.0 (https://localhost)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!res.ok) return null;

    const data = await res.json();
    const list: BangumiSubject[] = data.list || [];
    if (list.length === 0) return null;

    const lowerQuery = trimmed.toLowerCase();
    const getNames = (s: BangumiSubject) =>
      [s.name, s.name_cn].filter(Boolean).map((n) => n.toLowerCase());

    let matched: BangumiSubject | null = null;

    const exactMatch = list.find((s) =>
      getNames(s).some((n) => n === lowerQuery),
    );
    if (exactMatch) matched = exactMatch;

    if (!matched) {
      const startsWithMatch = list.find((s) =>
        getNames(s).some(
          (n) => n.startsWith(lowerQuery) && n.length - lowerQuery.length <= 6,
        ),
      );
      if (startsWithMatch) matched = startsWithMatch;
    }

    if (!matched) {
      const reverseMatch = list.find((s) =>
        getNames(s).some(
          (n) => lowerQuery.startsWith(n) && lowerQuery.length - n.length <= 6,
        ),
      );
      if (reverseMatch) matched = reverseMatch;
    }

    if (!matched) {
      const containsMatch = list.find((s) =>
        getNames(s).some((n) => n.includes(lowerQuery) || lowerQuery.includes(n)),
      );
      if (containsMatch) matched = containsMatch;
    }

    if (!matched) matched = list[0];

    if (matched && matched.id && !matched.tags) {
      const tags = await fetchSubjectTags(matched.id);
      if (tags) matched.tags = tags;
    }

    return matched;
  } catch {
    return null;
  }
}

function mapBangumiTags(tags: { name: string; count: number }[] | undefined): string[] | null {
  if (!tags || tags.length === 0) return null;
  const sorted = [...tags].sort((a, b) => (b.count || 0) - (a.count || 0));
  const result: string[] = [];
  const seen = new Set<string>();

  for (const t of sorted) {
    const mapped = BANGUMI_TAG_MAP[t.name];
    if (mapped && !seen.has(mapped)) {
      seen.add(mapped);
      result.push(mapped);
    }
    if (result.length >= 5) break;
  }

  return result.length > 0 ? result : null;
}

function parseEntryBlocks(text: string) {
  const blocks: {
    start: number;
    end: number;
    fullMatch: string;
    aliases: string[];
    fullName: string;
    currentGenres: string[];
  }[] = [];

  const regex =
    /\{\s*aliases:\s*\[([^\]]*)\]\s*,\s*fullName:\s*"([^"]+)"\s*,\s*genres:\s*\[([^\]]*)\]([\s\S]*?)\n(  \},|\},)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const [fullMatch, aliasesStr, fullName, genresStr] = match;
    const aliases =
      aliasesStr.match(/"([^"]+)"/g)?.map((s) => s.slice(1, -1)) || [];
    const currentGenres =
      genresStr.match(/"([^"]+)"/g)?.map((s) => s.slice(1, -1)) || [];
    blocks.push({
      start: match.index,
      end: match.index + fullMatch.length,
      fullMatch,
      aliases,
      fullName,
      currentGenres,
    });
  }
  return blocks;
}

function pickQueries(fullName: string, aliases: string[]): string[] {
  const queries: string[] = [];
  const searchName = toSearchQuery(fullName);
  if (searchName) queries.push(searchName);
  for (const alias of aliases) {
    const aliasSearch = toSearchQuery(alias);
    if (aliasSearch && !queries.includes(aliasSearch)) {
      queries.push(aliasSearch);
    }
  }
  return queries;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(query: string, maxRetries = 2): Promise<BangumiSubject | null> {
  for (let i = 0; i < maxRetries; i++) {
    const subject = await searchBangumi(query);
    if (subject) return subject;
    await delay(1500);
  }
  return null;
}

async function recategorizeFile(
  rawText: string,
  data: AnimeKnowledge[],
  filename: string,
  onProgress: (entry: LogEntry) => void,
): Promise<FileResult> {
  const blocks = parseEntryBlocks(rawText);
  let updated = rawText;
  let offset = 0;
  let changed = 0;
  let failed = 0;
  let unchanged = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const queries = pickQueries(block.fullName, block.aliases);

    let genres: string[];
    let source: string;

    let subject: BangumiSubject | null = null;
    let usedQuery = "";
    for (const q of queries) {
      subject = await fetchWithRetry(q);
      if (subject) {
        usedQuery = q;
        break;
      }
      await delay(800);
    }

    if (subject) {
      const mapped = mapBangumiTags(subject.tags);
      if (mapped && mapped.length > 0) {
        genres = mapped;
        source = `bangumi("${usedQuery}")`;
      } else {
        genres = block.currentGenres;
        source = `bangumi-no-tags("${usedQuery}")`;
        failed++;
      }
    } else {
      genres = block.currentGenres;
      source = "failed";
      failed++;
    }

    const isChanged =
      genres.join("/") !== block.currentGenres.join("/");
    if (isChanged) {
      changed++;
    } else {
      unchanged++;
    }

    onProgress({
      index: i + 1,
      total: blocks.length,
      name: block.aliases[0] || block.fullName,
      oldGenres: block.currentGenres,
      newGenres: genres,
      source,
      changed: isChanged,
    });

    const newGenresStr = `genres: [${genres.map((g) => `"${g}"`).join(", ")}]`;
    const newBlock = block.fullMatch.replace(
      /genres:\s*\[[^\]]*\]/,
      newGenresStr,
    );

    if (newBlock !== block.fullMatch) {
      const start = block.start + offset;
      const end = block.end + offset;
      updated = updated.slice(0, start) + newBlock + updated.slice(end);
      offset += newBlock.length - block.fullMatch.length;
    }

    await delay(600);
  }

  const resultFilename = filename;
  return { filename: resultFilename, content: updated, changed, unchanged, failed };
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Recategorize() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [currentName, setCurrentName] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [results, setResults] = useState<FileResult[]>([]);
  const [stats, setStats] = useState({ changed: 0, unchanged: 0, failed: 0 });
  const logEndRef = useRef<HTMLDivElement>(null);

  const handleRun = async () => {
    setRunning(true);
    setDone(false);
    setLogs([]);
    setResults([]);
    setStats({ changed: 0, unchanged: 0, failed: 0 });

    const allResults: FileResult[] = [];

    const onProgress = (entry: LogEntry) => {
      setProgress({ done: entry.index, total: entry.total });
      setCurrentName(entry.name);
      setLogs((prev) => [...prev, entry]);
      setTimeout(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    };

    const r1 = await recategorizeFile(knowledgeRaw, animeKnowledgeBase, "animeKnowledge.ts", onProgress);
    allResults.push(r1);

    const r2 = await recategorizeFile(userAddedRaw, userAddedAnime, "userAddedAnime.ts", onProgress);
    allResults.push(r2);

    setResults(allResults);
    setStats({
      changed: r1.changed + r2.changed,
      unchanged: r1.unchanged + r2.unchanged,
      failed: r1.failed + r2.failed,
    });
    setRunning(false);
    setDone(true);
  };

  const handleDownloadAll = () => {
    for (const r of results) {
      downloadFile(r.filename, r.content);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Bangumi 标签重归类</h1>
        <p className="mt-2 text-sm text-stone">
          使用 Bangumi API 重新匹配所有动漫的分类标签。名称处理与封面搜索一致（不看季数、去掉无关字符），每部动漫最多5个标签。
        </p>
      </div>

      <div className="rounded-2xl bg-white/70 p-5 shadow-soft backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm text-ink">
            <span className="font-medium">animeKnowledge.ts</span>
            <span className="ml-2 text-stone">{parseEntryBlocks(knowledgeRaw).length} 条</span>
            <span className="mx-3 text-ink/20">|</span>
            <span className="font-medium">userAddedAnime.ts</span>
            <span className="ml-2 text-stone">{parseEntryBlocks(userAddedRaw).length} 条</span>
            <span className="mx-3 text-ink/20">|</span>
            <span className="text-stone">共 {parseEntryBlocks(knowledgeRaw).length + parseEntryBlocks(userAddedRaw).length} 条</span>
          </div>

          {!running && !done && (
            <button
              type="button"
              onClick={handleRun}
              className="btn-primary"
            >
              <Play className="h-4 w-4" />
              开始重归类
            </button>
          )}

          {running && (
            <button type="button" disabled className="btn-primary opacity-60">
              <Loader2 className="h-4 w-4 animate-spin" />
              运行中...
            </button>
          )}

          {done && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-stone">
                更新 {stats.changed} · 未变 {stats.unchanged} · 失败 {stats.failed}
              </span>
              <button
                type="button"
                onClick={handleDownloadAll}
                className="btn-primary"
              >
                <Download className="h-4 w-4" />
                下载更新后的文件
              </button>
            </div>
          )}
        </div>

        {running && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs text-stone">
              <span>
                [{progress.done}/{progress.total}] {currentName}
              </span>
              <span>{progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink/10">
              <div
                className="h-full rounded-full bg-coral transition-all duration-300"
                style={{
                  width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {logs.length > 0 && (
        <div className="rounded-2xl bg-ink/5 p-5">
          <h3 className="mb-3 text-sm font-medium text-ink">详细日志</h3>
          <div className="max-h-96 space-y-1 overflow-y-auto font-mono text-xs">
            {logs.map((log, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 rounded px-2 py-1 ${
                  log.changed ? "bg-coral/5" : ""
                }`}
              >
                <span className="text-stone">
                  [{log.index}/{log.total}]
                </span>
                <span className="min-w-[8rem] font-medium text-ink">
                  {log.name}
                </span>
                <span className="text-stone">
                  [{log.oldGenres.join("/")}]
                </span>
                <span className="text-coral">{log.changed ? "→" : "="}</span>
                <span className="text-ink">
                  [{log.newGenres.join("/")}]
                </span>
                <span className="ml-auto text-stone/60">{log.source}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      )}

      {done && (
        <div className="rounded-2xl bg-white/70 p-5 text-sm text-ink shadow-soft">
          <p className="mb-2 font-medium">下一步操作：</p>
          <ol className="list-inside list-decimal space-y-1 text-stone">
            <li>点击上方"下载更新后的文件"按钮，下载两个 .ts 文件</li>
            <li>用下载的文件替换 <code className="rounded bg-ink/10 px-1">src/data/animeKnowledge.ts</code> 和 <code className="rounded bg-ink/10 px-1">src/data/userAddedAnime.ts</code></li>
            <li>刷新页面后点击"同步知识库"按钮，让已有数据应用新标签</li>
          </ol>
        </div>
      )}
    </div>
  );
}
