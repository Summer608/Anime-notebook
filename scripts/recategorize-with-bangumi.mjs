import fs from "fs";
import { fileURLToPath } from "url";

const knowledgePath = fileURLToPath(new URL("../src/data/animeKnowledge.ts", import.meta.url));
const userAddedPath = fileURLToPath(new URL("../src/data/userAddedAnime.ts", import.meta.url));
const cachePath = fileURLToPath(new URL("./bangumi-tag-cache.json", import.meta.url));
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const VALID_GENRES = new Set([
  "恋爱", "热血", "悬疑", "科幻", "奇幻", "日常", "运动", "音乐", "机战",
  "治愈", "搞笑", "冒险", "恐怖", "推理", "校园", "异世界", "战斗", "美食",
  "历史", "科普", "职场", "竞技", "未分类",
]);

// Bangumi tags → 本地标签映射表（扩充版）
const BANGUMI_TAG_MAP = {
  // 恋爱
  "爱情": "恋爱", "恋愛": "恋爱", "恋爱": "恋爱", "纯爱": "恋爱",
  "百合": "恋爱", "耽美": "恋爱", "后宫": "恋爱", "GL": "恋爱", "BL": "恋爱",
  "狗粮": "恋爱", "发糖": "恋爱", "虐心": "恋爱", "虐恋": "恋爱",
  "青梅竹马": "恋爱", "三角关系": "恋爱",
  // 热血
  "热血": "热血", "燃": "热血", "激情": "热血", "热血战斗": "热血",
  // 战斗
  "战斗": "战斗", "动作": "战斗", "格斗": "战斗", "打斗": "战斗",
  "打架": "战斗", "武术": "战斗", "战斗番": "战斗",
  // 搞笑
  "搞笑": "搞笑", "喜剧": "搞笑", "吐槽": "搞笑", "恶搞": "搞笑",
  "欢乐": "搞笑", "趣味": "搞笑", "无厘头": "搞笑", "搞笑番": "搞笑",
  // 日常
  "日常": "日常", "生活": "日常", "平淡": "日常", "日常番": "日常",
  // 治愈
  "治愈": "治愈", "温情": "治愈", "温馨": "治愈", "暖心": "治愈",
  "治愈系": "治愈",
  // 奇幻
  "奇幻": "奇幻", "幻想": "奇幻", "魔法": "奇幻", "魔幻": "奇幻",
  "神鬼": "奇幻", "妖精": "奇幻", "妖怪": "奇幻", "精灵": "奇幻",
  "魔法少女": "奇幻", "神灵": "奇幻", "超能力": "奇幻", "异能": "奇幻",
  "恶魔": "奇幻", "魔鬼": "奇幻", "神话": "奇幻",
  // 科幻
  "科幻": "科幻", "SF": "科幻", "sci-fi": "科幻", "Sci-Fi": "科幻",
  "赛博朋克": "科幻", "太空": "科幻", "宇宙": "科幻", "末日": "科幻",
  "末世": "科幻", "人工智能": "科幻",
  // 悬疑
  "悬疑": "悬疑", "疑案": "悬疑", "谜团": "悬疑", "悬疑番": "悬疑",
  // 推理
  "推理": "推理", "侦探": "推理", "解谜": "推理", "本格推理": "推理",
  "推理番": "推理",
  // 恐怖
  "恐怖": "恐怖", "惊悚": "恐怖", "猎奇": "恐怖", "血腥": "恐怖",
  "gore": "恐怖", "灵异": "恐怖",
  // 运动
  "运动": "运动", "体育": "运动", "运动番": "运动",
  // 竞技
  "竞技": "竞技", "比赛": "竞技", "对决": "竞技", "竞技番": "竞技",
  // 音乐
  "音乐": "音乐", "偶像": "音乐", "乐队": "音乐", "演奏": "音乐",
  "歌唱": "音乐", "演唱会": "音乐", "乐器": "音乐", "音乐番": "音乐",
  // 校园
  "校园": "校园", "学园": "校园", "学生": "校园", "青春": "校园",
  "学校": "校园", "社团": "校园", "校园番": "校园",
  // 机战
  "机战": "机战", "机器人": "机战", "萝卜": "机战", "Mecha": "机战",
  "机甲": "机战", "mecha": "机战", "机战番": "机战",
  // 历史
  "历史": "历史", "时代剧": "历史", "古代": "历史", "历史人物": "历史",
  "战国": "历史", "幕末": "历史", "历史番": "历史",
  // 异世界
  "异世界": "异世界", "转生": "异世界", "穿越": "异世界", "转世": "异世界",
  "异世界穿越": "异世界", "龙傲天": "异世界",
  // 美食
  "美食": "美食", "料理": "美食", "烹饪": "美食", "做饭": "美食",
  "美食番": "美食",
  // 职场
  "职场": "职场", "工作": "职场", "上班": "职场", "职场番": "职场",
  // 冒险
  "冒险": "冒险", "冒険": "冒险", "探险": "冒险", "探索": "冒险",
  "冒险番": "冒险",
};

function toSearchQuery(name) {
  let result = name.trim();
  if (result.includes("/")) {
    result = result.split("/")[0].trim();
  }
  if (result.includes("~")) {
    result = result.split("~")[0].trim();
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

async function searchBangumi(query) {
  const trimmed = query.trim();
  if (!trimmed) return null;

  try {
    const res = await fetch(
      `https://api.bgm.tv/search/subject/${encodeURIComponent(trimmed)}?type=2&responseGroup=large&max_results=5`,
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
    const list = data.list || [];
    if (list.length === 0) return null;

    const lowerQuery = trimmed.toLowerCase();
    const getNames = (s) =>
      [s.name, s.name_cn].filter(Boolean).map((n) => n.toLowerCase());

    // 1. 精确匹配
    const exactMatch = list.find((s) =>
      getNames(s).some((n) => n === lowerQuery),
    );
    if (exactMatch) return exactMatch;

    // 2. 名称以搜索词开头
    const startsWithMatch = list.find((s) =>
      getNames(s).some(
        (n) => n.startsWith(lowerQuery) && n.length - lowerQuery.length <= 6,
      ),
    );
    if (startsWithMatch) return startsWithMatch;

    // 3. 搜索词以名称开头
    const reverseMatch = list.find((s) =>
      getNames(s).some(
        (n) => lowerQuery.startsWith(n) && lowerQuery.length - n.length <= 6,
      ),
    );
    if (reverseMatch) return reverseMatch;

    // 4. 包含匹配
    const containsMatch = list.find((s) =>
      getNames(s).some(
        (n) => n.includes(lowerQuery) || lowerQuery.includes(n),
      ),
    );
    if (containsMatch) return containsMatch;

    // 5. 返回第一个结果
    return list[0];
  } catch {
    return null;
  }
}

function mapBangumiTags(tags) {
  if (!tags || tags.length === 0) return null;
  // 按 count 降序排序（高 count = 更多用户认可 = 更核心的标签）
  const sorted = [...tags].sort((a, b) => (b.count || 0) - (a.count || 0));
  const result = [];
  const seen = new Set();

  for (const t of sorted) {
    const name = typeof t === "string" ? t : t?.name;
    if (!name) continue;
    const mapped = BANGUMI_TAG_MAP[name];
    if (mapped && !seen.has(mapped)) {
      seen.add(mapped);
      result.push(mapped);
    }
    if (result.length >= 5) break;
  }

  return result.length > 0 ? result : null;
}

function parseEntryBlocks(text) {
  const blocks = [];
  const regex = /\{\s*aliases:\s*\[([^\]]*)\]\s*,\s*fullName:\s*"([^"]+)"\s*,\s*genres:\s*\[([^\]]*)\]([\s\S]*?)\n(  \},|\},)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const [fullMatch, aliasesStr, fullName, genresStr] = match;
    const aliases = aliasesStr.match(/"([^"]+)"/g)?.map((s) => s.slice(1, -1)) || [];
    const currentGenres = genresStr.match(/"([^"]+)"/g)?.map((s) => s.slice(1, -1)) || [];
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

function pickQueries(block) {
  const queries = [];
  const searchName = toSearchQuery(block.fullName);
  if (searchName) queries.push(searchName);
  for (const alias of block.aliases) {
    const aliasSearch = toSearchQuery(alias);
    if (aliasSearch && !queries.includes(aliasSearch)) {
      queries.push(aliasSearch);
    }
  }
  return queries;
}

async function fetchWithRetry(query, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    const subject = await searchBangumi(query);
    if (subject) return subject;
    await delay(1500);
  }
  return null;
}

function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(cachePath, "utf-8"));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

async function recategorizeFile(filePath, cache) {
  const text = fs.readFileSync(filePath, "utf-8");
  const blocks = parseEntryBlocks(text);
  const fileName = filePath.split(/[\\/]/).pop();
  console.log(`\n=== ${fileName}: ${blocks.length} entries ===`);

  let updated = text;
  let offset = 0;
  let changed = 0;
  let failed = 0;
  let unchanged = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const queries = pickQueries(block);
    const cacheKey = queries[0]?.toLowerCase() || block.aliases[0]?.toLowerCase();

    let genres;
    let source = "cache";

    if (cacheKey && cache[cacheKey]) {
      genres = cache[cacheKey];
      source = "cache";
    } else {
      let subject = null;
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
          if (cacheKey) cache[cacheKey] = genres;
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
    }

    const oldStr = block.currentGenres.join("/");
    const newStr = genres.join("/");
    const status = oldStr === newStr ? "=" : "→";
    console.log(
      `[${i + 1}/${blocks.length}] ${block.aliases[0]}: [${oldStr}] ${status} [${newStr}] (${source})`,
    );

    const newGenresStr = `genres: [${genres.map((g) => `"${g}"`).join(", ")}]`;
    const newBlock = block.fullMatch.replace(/genres:\s*\[[^\]]*\]/, newGenresStr);

    if (newBlock !== block.fullMatch) {
      const start = block.start + offset;
      const end = block.end + offset;
      updated = updated.slice(0, start) + newBlock + updated.slice(end);
      offset += newBlock.length - block.fullMatch.length;
      changed++;
    } else {
      unchanged++;
    }

    await delay(600);
    if (i % 5 === 0) saveCache(cache);
  }

  fs.writeFileSync(filePath, updated);
  saveCache(cache);
  console.log(
    `\n${fileName}: changed ${changed}/${blocks.length}, unchanged ${unchanged}, ${failed} failures.`,
  );
}

async function main() {
  const cache = loadCache();
  await recategorizeFile(knowledgePath, cache);
  await recategorizeFile(userAddedPath, cache);
  saveCache(cache);
  console.log("\n=== Done ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
