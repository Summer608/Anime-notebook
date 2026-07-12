import type { AnimeItem } from "@/types";
import { findAnimeMatches, findExactAnime, generateDoubanUrl } from "@/data/animeKnowledge";

export interface BulkImportCandidate {
  originalInput: string;
  displayName: string;
  genres: string[];
  coverUrl: string | undefined;
  doubanUrl: string;
  confidence: "high" | "medium" | "low";
  sourceName: string;
  selected: boolean;
}

const GENRE_MAP: Record<string, string> = {
  Romance: "恋爱",
  "Boys Love": "恋爱",
  "Girls Love": "恋爱",
  Action: "战斗",
  Adventure: "冒险",
  Comedy: "搞笑",
  Drama: "日常",
  Fantasy: "奇幻",
  "Sci-Fi": "科幻",
  Mystery: "悬疑",
  Thriller: "悬疑",
  Psychological: "悬疑",
  Supernatural: "奇幻",
  Horror: "恐怖",
  Sports: "运动",
  Music: "音乐",
  "Slice of Life": "日常",
  School: "校园",
  Mecha: "机战",
  Historical: "历史",
  Isekai: "异世界",
  Military: "战斗",
  "Martial Arts": "战斗",
  Parody: "搞笑",
  Police: "悬疑",
  Space: "科幻",
  Vampire: "奇幻",
};

const CHINESE_NUMBERS: Record<string, string> = {
  一: "1",
  二: "2",
  三: "3",
  四: "4",
  五: "5",
  六: "6",
  七: "7",
  八: "8",
  九: "9",
  壹: "1",
  贰: "2",
  叁: "3",
  肆: "4",
  伍: "5",
  陆: "6",
  柒: "7",
  捌: "8",
  玖: "9",
};

function normalizeChineseDigits(input: string): string {
  let result = input;
  for (const [cn, num] of Object.entries(CHINESE_NUMBERS)) {
    result = result.split(cn).join(num);
  }
  return result;
}

function containsChineseDigit(input: string): boolean {
  return /[一二三四五六七八九十壹贰叁肆伍陆柒捌玖拾]/.test(input);
}

function parseArabicNumbers(token: string): number[] {
  return token
    .split(/[、,，]/)
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n) && n > 0);
}

function parseChineseDigitList(token: string): number[] {
  return normalizeChineseDigits(token)
    .replace(/[、,，]/g, "")
    .split("")
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n) && n > 0);
}

interface SeasonVariant {
  kind: "season" | "movie" | "ova" | "final";
  label: string;
  suffix: string;
}

interface SeasonParseResult {
  baseQuery: string;
  variants: SeasonVariant[];
}

function parseSeasonVariants(input: string): SeasonParseResult {
  let base = input;
  const seasonNumbers = new Set<number>();
  const typeLabels = new Set<string>();
  let hasFinal = false;

  // 1. 显式季数：第2季、第二季、第二部、第一期（避免把 re0 里的 0 当成季数）
  const digitGroup = "(?:[一二三四五六七八九十壹贰叁肆伍陆柒捌玖拾]+|\\d+)";
  const explicitRegex = new RegExp(
    `第?((${digitGroup}(?:[、,，]${digitGroup})*))(季|部|期)`,
    "g",
  );
  base = base.replace(explicitRegex, (match, digits) => {
    if (containsChineseDigit(digits)) {
      parseChineseDigitList(digits).forEach((n) => seasonNumbers.add(n));
    } else {
      parseArabicNumbers(digits).forEach((n) => seasonNumbers.add(n));
    }
    return " ";
  });

  // 2. 剧场版 / OVA / SP 等类型标记，前面可能带季数，如“一二剧场版”
  const typeDigitGroup = "(?:[一二三四五六七八九十壹贰叁肆伍陆柒捌玖拾]+|\\d+)";
  const typeRegex = new RegExp(
    `(${typeDigitGroup})?\\s*(剧场版|电影版|映画|OVA|OAD|SP|特别篇|特別篇|番外)`,
    "g",
  );
  base = base.replace(typeRegex, (match, digits, marker) => {
    if (digits) {
      const normalized = normalizeChineseDigits(digits).replace(/[、,，]/g, "");
      if (containsChineseDigit(digits)) {
        parseChineseDigitList(digits).forEach((n) => seasonNumbers.add(n));
      } else if (/^[1-9]{2,4}$/.test(normalized)) {
        // 阿拉伯数字连写（如“12剧场版”）按单季列表理解
        normalized
          .split("")
          .map((s) => parseInt(s, 10))
          .filter((n) => n > 0)
          .forEach((n) => seasonNumbers.add(n));
      } else {
        parseArabicNumbers(normalized).forEach((n) => seasonNumbers.add(n));
      }
    }
    const label = /剧场版|电影版|映画/.test(marker) ? "剧场版" : "OVA/SP";
    typeLabels.add(label);
    return " ";
  });

  // 3. 最终季 / Part N / 第N部分
  const finalRegex = /(最终季|最终章|完结篇|Part\s*[一二三四五六七八九十\d]+|第[一二三四五六七八九十\d]+部分?)/gi;
  base = base.replace(finalRegex, () => {
    hasFinal = true;
    return " ";
  });

  // 3.5 拆分播出标记：前半 / 后半 / 反击篇 / 总集篇
  const courRegex = /(前半|後半|后半|反击篇|反撃編|总集篇|総集編)(?:\s*[、,，]?\s*(前半|後半|后半|反击篇|反撃編|总集篇|総集編))*/gi;
  base = base.replace(courRegex, " ");

  // 3.6 拆分篇章名：游郭篇 / 锻刀村篇 / 无限列车篇 等（限制长度避免误伤标题）
  const arcRegex = /([\u4e00-\u9fa5]{1,6}篇)(?:\s*[、,，]?\s*[\u4e00-\u9fa5]{1,6}篇)*$/gi;
  base = base.replace(arcRegex, " ");

  // 4. 末尾残留的数字，如“路人女主12”
  const trailingRegex = /([一二三四五六七八九十\d]+)$/;
  base = base.replace(trailingRegex, (match, digits) => {
    const normalized = normalizeChineseDigits(digits).replace(/[、,，]/g, "");
    if (containsChineseDigit(digits)) {
      parseChineseDigitList(digits).forEach((n) => seasonNumbers.add(n));
      return " ";
    }
    if (/^[1-9]{2,4}$/.test(normalized)) {
      normalized
        .split("")
        .map((s) => parseInt(s, 10))
        .filter((n) => n > 0)
        .forEach((n) => seasonNumbers.add(n));
      return " ";
    }
    return match;
  });

  const cleanBase = base.replace(/[、,，；;]/g, " ").replace(/\s+/g, " ").trim();

  const variants: SeasonVariant[] = [];
  Array.from(seasonNumbers)
    .sort((a, b) => a - b)
    .forEach((n) => variants.push({ kind: "season", label: `第${n}季`, suffix: `（第${n}季）` }));
  Array.from(typeLabels).forEach((label) =>
    variants.push({ kind: label === "剧场版" ? "movie" : "ova", label, suffix: `（${label}）` }),
  );
  if (hasFinal) {
    variants.push({ kind: "final", label: "最终季", suffix: "（最终季）" });
  }

  return { baseQuery: cleanBase || input, variants };
}

function mapGenres(jikanGenres: { name: string }[]): string[] {
  const mapped = jikanGenres
    .map((g) => GENRE_MAP[g.name])
    .filter((g): g is string => Boolean(g));
  const unique = Array.from(new Set(mapped));
  return unique.length > 0 ? unique : ["未分类"];
}

function mapBangumiTags(tags: { name: string }[] | undefined): string[] {
  if (!tags) return ["未分类"];
  const tagMap: Record<string, string> = {
    爱情: "恋爱",
    恋愛: "恋爱",
    战斗: "战斗",
    冒険: "冒险",
    搞笑: "搞笑",
    喜剧: "搞笑",
    日常: "日常",
    奇幻: "奇幻",
    科幻: "科幻",
    悬疑: "悬疑",
    恐怖: "恐怖",
    运动: "运动",
    音乐: "音乐",
    校园: "校园",
    机战: "机战",
    历史: "历史",
    异世界: "异世界",
    美食: "美食",
    治愈: "治愈",
    推理: "推理",
    冒险: "冒险",
  };
  const mapped = tags
    .map((t) => tagMap[t.name])
    .filter((g): g is string => Boolean(g));
  const unique = Array.from(new Set(mapped));
  return unique.length > 0 ? unique : ["未分类"];
}

// Bangumi types
interface BangumiSubject {
  id: number;
  url: string;
  name: string;
  name_cn: string;
  images?: {
    large?: string;
    common?: string;
    medium?: string;
    small?: string;
    grid?: string;
  };
  tags?: { name: string; count: number }[];
  rating?: { score: number };
}

interface BangumiSearchResponse {
  list?: BangumiSubject[];
  results?: number;
}

async function searchBangumi(query: string): Promise<BangumiSubject | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  try {
    const res = await fetch(
      `https://api.bgm.tv/search/subject/${encodeURIComponent(trimmed)}?type=2&responseGroup=small&max_results=10`,
      {
        headers: {
          "User-Agent": "AnimeNotebook/1.0 (https://localhost)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) return null;

    const data = (await res.json()) as BangumiSearchResponse;
    const list = data.list || [];
    if (list.length === 0) return null;

    const lowerQuery = trimmed.toLowerCase();
    const getNames = (s: BangumiSubject) =>
      [s.name, s.name_cn].filter(Boolean).map((n) => n.toLowerCase());

    // 1. 精确匹配
    const exactMatch = list.find((s) =>
      getNames(s).some((n) => n === lowerQuery),
    );
    if (exactMatch) return exactMatch;

    // 2. 名称以搜索词开头，且长度差不超过 6
    const startsWithMatch = list.find((s) =>
      getNames(s).some((n) => n.startsWith(lowerQuery) && n.length - lowerQuery.length <= 6),
    );
    if (startsWithMatch) return startsWithMatch;

    // 3. 搜索词以名称开头（反向匹配）
    const reverseMatch = list.find((s) =>
      getNames(s).some((n) => lowerQuery.startsWith(n) && lowerQuery.length - n.length <= 6),
    );
    if (reverseMatch) return reverseMatch;

    // 4. 包含匹配：名称包含搜索词，或搜索词包含名称
    const containsMatch = list.find((s) =>
      getNames(s).some((n) => n.includes(lowerQuery) || lowerQuery.includes(n)),
    );
    if (containsMatch) return containsMatch;

    // 5. 返回第一个结果（Bangumi 搜索排序本身有一定准确性）
    return list[0];
  } catch {
    return null;
  }
}

// Jikan fallback types
interface JikanAnime {
  mal_id: number;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
  genres: { name: string }[];
  score: number | null;
  url: string;
}

interface JikanSearchResponse {
  data: JikanAnime[];
}

async function searchJikan(query: string): Promise<JikanAnime | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  try {
    const res = await fetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(trimmed)}&limit=5`,
      { signal: AbortSignal.timeout(4000) },
    );
    if (!res.ok) return null;

    const data = (await res.json()) as JikanSearchResponse;
    if (!data.data || data.data.length === 0) return null;

    const lowerQuery = trimmed.toLowerCase();

    const exactMatch = data.data.find((a) => {
      const titles = [a.title, a.title_english, a.title_japanese].filter(Boolean);
      return titles.some((t) => t?.toLowerCase() === lowerQuery);
    });
    if (exactMatch) return exactMatch;

    // 验证第一个结果是否与搜索词相关（防止返回完全无关的结果）
    const first = data.data[0];
    const allTitles = [first.title, first.title_english, first.title_japanese]
      .filter(Boolean)
      .join(" ");
    if (!isResultRelevant(trimmed, allTitles)) {
      return null;
    }

    return first;
  } catch {
    return null;
  }
}

function pickBestBangumiTitle(subject: BangumiSubject): string {
  return subject.name_cn || subject.name;
}

// AniList types
interface AniListMedia {
  id: number;
  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
  };
  coverImage: {
    large: string | null;
    extraLarge: string | null;
    medium: string | null;
  };
  synonyms?: string[];
}

interface AniListResponse {
  data?: {
    Media?: AniListMedia | null;
    Page?: {
      media?: AniListMedia[];
    };
  };
}

async function searchAniList(query: string): Promise<string | undefined> {
  const trimmed = query.trim();
  if (!trimmed) return undefined;

  try {
    const graphql = `
      query ($search: String) {
        Page(page: 1, perPage: 5) {
          media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
            id
            title { romaji english native }
            coverImage { large extraLarge medium }
          }
        }
      }
    `;

    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: graphql,
        variables: { search: trimmed },
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return undefined;

    const data = (await res.json()) as AniListResponse;
    const mediaList = data.data?.Page?.media || [];
    if (mediaList.length === 0) return undefined;

    const lowerQuery = trimmed.toLowerCase();
    const getTitles = (m: AniListMedia) =>
      [m.title?.native, m.title?.romaji, m.title?.english]
        .filter(Boolean)
        .map((t) => t!.toLowerCase());

    const pickCover = (m: AniListMedia) =>
      m.coverImage?.extraLarge || m.coverImage?.large || m.coverImage?.medium || undefined;

    // 1. 精确匹配
    const exact = mediaList.find((m) =>
      getTitles(m).some((t) => t === lowerQuery),
    );
    if (exact) {
      const cover = pickCover(exact);
      if (cover) return cover;
    }

    // 2. 季数关键词匹配：搜索词含 Season N / Final Season / Part N 时，
    //    优先选标题中也含同样关键词的结果
    const seasonMatch = /season\s*\d|final\s*season|part\s*\d/i.test(trimmed);
    if (seasonMatch) {
      const matched = mediaList.find((m) => {
        const titles = getTitles(m);
        return titles.some((t) => {
          const seasonNum = lowerQuery.match(/season\s*(\d+)/i)?.[1];
          const partNum = lowerQuery.match(/part\s*(\d+)/i)?.[1];
          const isFinal = /final\s*season/i.test(lowerQuery);
          if (seasonNum && new RegExp(`season\\s*${seasonNum}`, "i").test(t)) return true;
          if (partNum && new RegExp(`part\\s*${partNum}`, "i").test(t)) return true;
          if (isFinal && /final\s*season/i.test(t)) return true;
          return false;
        });
      });
      if (matched) {
        const cover = pickCover(matched);
        if (cover) return cover;
      }
    }

    // 3. 返回第一个结果（AniList SEARCH_MATCH 排序最匹配的）
    const cover = pickCover(mediaList[0]);
    return cover;
  } catch {
    return undefined;
  }
}

function stripSeasonSuffix(name: string): string {
  let result = name.trim();

  // 去除括号内的季数/剧场版标记：（第N季）（剧场版）（OVA/SP）（最终季）等
  result = result.replace(/（[^（）]*季[^（）]*）$/g, "");
  result = result.replace(/（剧场版）$/g, "");
  result = result.replace(/（OVA\/SP）$/g, "");
  result = result.replace(/（最终季）$/g, "");
  result = result.replace(/（完结篇）$/g, "");
  result = result.replace(/（[^（）]*篇）$/g, "");

  // 去除不带括号的后缀：第N季、Season N、Final Season
  result = result.replace(/\s*第[一二三四五六七八九十\d]+季\s*$/g, "");
  result = result.replace(/\s*Season\s*\d+\s*$/gi, "");
  result = result.replace(/\s*Final\s*Season\s*$/gi, "");

  return result.trim() || name.trim();
}

const CN_DIGIT_MAP: Record<string, string> = {
  一: "1", 二: "2", 三: "3", 四: "4", 五: "5",
  六: "6", 七: "7", 八: "8", 九: "9", 十: "10",
};

function toAniListQuery(name: string): string {
  let result = name.trim();

  // （第N季partM）→ Season N Part M
  result = result.replace(
    /（第(\d+)季\s*part\s*(\d+)）$/gi,
    " Season $1 Part $2",
  );
  result = result.replace(
    /（第([一二三四五六七八九十]+)季\s*part\s*(\d+)）$/gi,
    (match, cn, part) => ` Season ${CN_DIGIT_MAP[cn] || cn} Part ${part}`,
  );

  // （第N季）→ Season N
  result = result.replace(/（第(\d+)季）$/g, " Season $1");
  result = result.replace(
    /（第([一二三四五六七八九十]+)季）$/g,
    (match, cn) => ` Season ${CN_DIGIT_MAP[cn] || cn}`,
  );

  // （最终季partM）→ Final Season Part M
  result = result.replace(/（最终季\s*part\s*(\d+)）$/gi, " Final Season Part $1");

  // （最终季 完结篇 前篇/后篇）→ Final Season Part 1/2
  result = result.replace(/（最终季\s*完结篇\s*前篇）$/g, " Final Season Part 1");
  result = result.replace(/（最终季\s*完结篇\s*后篇）$/g, " Final Season Part 2");

  // （最终季）→ Final Season
  result = result.replace(/（最终季）$/g, " Final Season");

  // （剧场版）→ 去除（AniList 用类型区分）
  result = result.replace(/（剧场版）$/g, "");

  // （XX篇）→ 保留篇章名，去括号
  result = result.replace(/（([^（）]+)篇）$/g, " $1");

  // （OVA/SP）→ 去除
  result = result.replace(/（OVA\/SP）$/g, "");

  // 去除剩余的中文括号内容
  result = result.replace(/（[^（）]*）$/g, "");

  // 合并多余空格
  result = result.replace(/\s+/g, " ").trim();

  return result || name.trim();
}

function toBangumiQuery(name: string): string {
  // Bangumi 不认识中文括号，替换为空格保留内容
  // "鬼灭之刃（游郭篇）" → "鬼灭之刃 游郭篇"
  // "进击的巨人（第3季）" → "进击的巨人 第3季"
  let result = name.replace(/（/g, " ").replace(/）/g, " ");
  result = result.replace(/\s+/g, " ").trim();
  return result || name.trim();
}

function toSearchQuery(name: string): string {
  let result = name.trim();
  // 取 "/" 前面的部分（如"龙与虎 / とらドラ！" → "龙与虎"）
  if (result.includes("/")) {
    result = result.split("/")[0].trim();
  }
  // 取第一个 "~" 前面的部分（如"无职转生~到了异世界就拿出真本事~第2季part2" → "无职转生"）
  if (result.includes("~")) {
    result = result.split("~")[0].trim();
  }
  // 去掉中文括号内容（如"鬼灭之刃（游郭篇）" → "鬼灭之刃"）
  result = result.replace(/（[^（）]*）/g, "").trim();
  // 去掉英文括号内容
  result = result.replace(/\([^()]*\)/g, "").trim();
  // 去掉末尾的季数标记（第N季、partN、Season N 等）
  result = result.replace(/\s*第\d+季.*$/g, "").trim();
  result = result.replace(/\s*part\s*\d+.*$/gi, "").trim();
  result = result.replace(/\s*Season\s*\d+.*$/gi, "").trim();
  result = result.replace(/\s*Final\s*Season.*$/gi, "").trim();
  // 去掉多余空格
  result = result.replace(/\s+/g, " ").trim();
  return result || name.trim();
}

function isResultRelevant(query: string, title: string): boolean {
  const queryChars = query.match(/[\u4e00-\u9fa5]/g);
  if (queryChars && queryChars.length > 0) {
    return queryChars.some((ch) => title.includes(ch));
  }
  const queryLower = query.toLowerCase();
  const titleLower = title.toLowerCase();
  let common = 0;
  for (const ch of queryLower) {
    if (ch.trim() && titleLower.includes(ch)) common++;
  }
  return common >= 3;
}

function pickBestJikanTitle(anime: JikanAnime): string {
  const candidates = [
    anime.title_english,
    anime.title,
    anime.title_japanese,
  ].filter(Boolean) as string[];

  const chinese = candidates.find((t) => /[\u4e00-\u9fa5]/.test(t));
  if (chinese) return chinese;

  const english = candidates.find((t) => /^[\x00-\x7F\s]+$/.test(t));
  if (english) return english;

  return candidates[0] || anime.title;
}

function buildCandidate(
  input: string,
  displayName: string,
  genres: string[],
  coverUrl: string | undefined,
  confidence: "high" | "medium" | "low",
  sourceName: string,
): BulkImportCandidate {
  return {
    originalInput: input.trim(),
    displayName,
    genres,
    coverUrl,
    doubanUrl: generateDoubanUrl(displayName),
    confidence,
    sourceName,
    selected: true,
  };
}

interface BaseResolution {
  displayNameBase: string;
  genres: string[];
  coverUrl?: string;
  confidence: "high" | "medium" | "low";
  sourceName: string;
}

async function resolveBase(input: string, baseQuery: string): Promise<BaseResolution | null> {
  const trimmed = baseQuery.trim();
  if (!trimmed) return null;

  // 1. 本地精确匹配
  const exact = findExactAnime(trimmed);
  if (exact) {
    return {
      displayNameBase: exact.fullName,
      genres: exact.genres,
      confidence: "high",
      sourceName: exact.fullName,
    };
  }

  // 2. 本地简称/前缀匹配
  const matches = findAnimeMatches(trimmed, 1);
  if (matches.length > 0) {
    const best = matches[0];
    return {
      displayNameBase: best.fullName,
      genres: best.genres,
      confidence: "medium",
      sourceName: best.fullName,
    };
  }

  // 3. Bangumi 联网补全
  const bangumi = await searchBangumi(trimmed);
  if (bangumi) {
    const title = pickBestBangumiTitle(bangumi);
    return {
      displayNameBase: title,
      genres: mapBangumiTags(bangumi.tags),
      coverUrl: bangumi.images?.large || bangumi.images?.common || bangumi.images?.medium,
      confidence: "medium",
      sourceName: title,
    };
  }

  // 4. Jikan 兜底
  const jikan = await searchJikan(trimmed);
  if (jikan) {
    const title = pickBestJikanTitle(jikan);
    return {
      displayNameBase: title,
      genres: mapGenres(jikan.genres),
      coverUrl: jikan.images.jpg.large_image_url || jikan.images.jpg.image_url,
      confidence: "medium",
      sourceName: title,
    };
  }

  return null;
}

export async function fetchCoverImage(query: string): Promise<string | undefined> {
  const trimmed = query.trim();
  if (!trimmed) return undefined;

  const searchName = toSearchQuery(trimmed);

  console.log(`[封面搜索] "${trimmed}" → "${searchName}"`);

  const pickBangumiCover = (s: BangumiSubject | null): string | undefined => {
    if (!s?.images) return undefined;
    return s.images.large || s.images.common || s.images.medium || s.images.small;
  };

  // 1. Bangumi 优先（中文动漫数据库，中文搜索最准确，图片不被 403）
  const bangumi = await searchBangumi(searchName);
  const cover = pickBangumiCover(bangumi);
  if (cover) {
    console.log(
      `[封面结果] "${trimmed}" → Bangumi: ${bangumi?.name_cn || bangumi?.name}`,
    );
    return cover;
  }

  // 2. Jikan / MAL（服务器抓取不易被 403）
  const jikan = await searchJikan(searchName);
  if (jikan) {
    const url = jikan.images.jpg.large_image_url || jikan.images.jpg.image_url;
    console.log(`[封面结果] "${trimmed}" → Jikan: ${jikan.title}`);
    return url;
  }

  // 3. AniList（最后备用，服务器抓取容易被 403）
  const anilistCover = await searchAniList(searchName);
  if (anilistCover) {
    console.log(`[封面结果] "${trimmed}" → AniList`);
    return anilistCover;
  }

  console.log(`[封面结果] "${trimmed}" → 未找到`);
  return undefined;
}

export async function resolveAnimeName(input: string): Promise<BulkImportCandidate[]> {
  const trimmed = input.trim();
  if (!trimmed) {
    return [buildCandidate("", "", ["未分类"], undefined, "low", "")];
  }

  const { baseQuery, variants } = parseSeasonVariants(trimmed);
  const baseRes = await resolveBase(trimmed, baseQuery);

  if (!baseRes) {
    return [buildCandidate(trimmed, trimmed, ["未分类"], undefined, "low", trimmed)];
  }

  if (variants.length === 0) {
    return [buildCandidate(trimmed, baseRes.displayNameBase, baseRes.genres, baseRes.coverUrl, baseRes.confidence, baseRes.sourceName)];
  }

  return variants.map((variant) =>
    buildCandidate(
      trimmed,
      `${baseRes.displayNameBase}${variant.suffix}`,
      baseRes.genres,
      baseRes.coverUrl,
      baseRes.confidence,
      baseRes.sourceName,
    ),
  );
}

export function candidateToAnimeItem(
  candidate: BulkImportCandidate,
): Omit<AnimeItem, "id" | "createdAt" | "updatedAt"> {
  const name = candidate.displayName || candidate.originalInput;
  return {
    displayName: name,
    originalInput: candidate.originalInput,
    genres: candidate.genres,
    coverUrl: candidate.coverUrl,
    doubanUrl: candidate.doubanUrl || generateDoubanUrl(name),
  };
}

export function parseBulkInput(raw: string): string[] {
  return raw
    .split(/\n|，|,|\/|;/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export async function* resolveAnimeNamesStream(
  names: string[],
  delayMs = 80,
): AsyncGenerator<{ index: number; total: number; candidate: BulkImportCandidate }, void, unknown> {
  const parsed = names.map((name) => ({ input: name, ...parseSeasonVariants(name) }));
  const total = parsed.reduce(
    (sum, item) => sum + (item.variants.length > 0 ? item.variants.length : 1),
    0,
  );
  let index = 0;

  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    const baseRes = await resolveBase(item.input, item.baseQuery);
    const variantList = item.variants.length > 0 ? item.variants : [{ label: "", suffix: "" }];

    for (const variant of variantList) {
      let candidate: BulkImportCandidate;
      if (!baseRes) {
        candidate = buildCandidate(item.input, item.input, ["未分类"], undefined, "low", item.input);
      } else if (variant.suffix) {
        candidate = buildCandidate(
          item.input,
          `${baseRes.displayNameBase}${variant.suffix}`,
          baseRes.genres,
          baseRes.coverUrl,
          baseRes.confidence,
          baseRes.sourceName,
        );
      } else {
        candidate = buildCandidate(
          item.input,
          baseRes.displayNameBase,
          baseRes.genres,
          baseRes.coverUrl,
          baseRes.confidence,
          baseRes.sourceName,
        );
      }
      index++;
      yield { index, total, candidate };
    }

    if (i < parsed.length - 1 && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
