import fs from "fs";

const listPath = new URL("./user-list.txt", import.meta.url);
const outputPath = new URL("../src/data/userAddedAnime.ts", import.meta.url);
const existingPath = new URL("../src/data/animeKnowledge.ts", import.meta.url);

const raw = fs.readFileSync(listPath, "utf-8");
const lines = raw
  .split(/\n/)
  .map((s) => s.trim().replace(/^[,，\s]+|[,，\s]+$/g, ""))
  .filter((s) => s.length > 0);

const existingText = fs.readFileSync(existingPath, "utf-8");
const existingAliases = new Set();
for (const m of existingText.matchAll(/aliases:\s*\[([^\]]+)\]/g)) {
  const quoted = m[1].match(/"([^"]+)"/g);
  if (quoted) {
    quoted.forEach((s) => existingAliases.add(s.slice(1, -1).toLowerCase()));
  }
}

const CHINESE_NUMBERS = {
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

function normalizeChineseDigits(input) {
  let result = input;
  for (const [cn, num] of Object.entries(CHINESE_NUMBERS)) {
    result = result.split(cn).join(num);
  }
  return result;
}

function containsChineseDigit(input) {
  return /[一二三四五六七八九十壹贰叁肆伍陆柒捌玖拾]/.test(input);
}

function parseArabicNumbers(token) {
  return token
    .split(/[、,，]/)
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n) && n > 0);
}

function parseChineseDigitList(token) {
  return normalizeChineseDigits(token)
    .replace(/[、,，]/g, "")
    .split("")
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n) && n > 0);
}

function parseSeasonVariants(input) {
  let base = input;
  const seasonNumbers = new Set();
  const typeLabels = new Set();
  let hasFinal = false;

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

  const finalRegex = /(最终季|最终章|完结篇|Part\s*[一二三四五六七八九十\d]+|第[一二三四五六七八九十\d]+部分?)/gi;
  base = base.replace(finalRegex, () => {
    hasFinal = true;
    return " ";
  });

  const courRegex = /(前半|後半|后半|反击篇|反撃編|总集篇|総集編)(?:\s*[、,，]?\s*(前半|後半|后半|反击篇|反撃編|总集篇|総集編))*/gi;
  base = base.replace(courRegex, " ");

  const arcRegex = /([\u4e00-\u9fa5]{1,6}篇)(?:\s*[、,，]?\s*[\u4e00-\u9fa5]{1,6}篇)*$/gi;
  base = base.replace(arcRegex, " ");

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

  const variants = [];
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

const TAG_MAP = {
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
  爱情: "恋爱",
  青春: "校园",
  推理: "推理",
  萌系: "日常",
  催泪: "治愈",
  转生: "异世界",
  穿越: "异世界",
  魔法: "奇幻",
  神魔: "奇幻",
  斗智: "悬疑",
  群像: "日常",
  末世: "科幻",
};

function mapBangumiTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return ["未分类"];
  const mapped = tags
    .map((t) => TAG_MAP[t.name])
    .filter(Boolean);
  const unique = Array.from(new Set(mapped));
  return unique.length > 0 ? unique : ["未分类"];
}

async function searchBangumi(query) {
  try {
    const res = await fetch(
      `https://api.bgm.tv/search/subject/${encodeURIComponent(query)}?type=2&responseGroup=small&max_results=1`,
      {
        headers: {
          "User-Agent": "AnimeNotebook/1.0 (https://localhost)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.list?.[0] || null;
  } catch {
    return null;
  }
}

async function fetchBangumiSubject(query) {
  const search = await searchBangumi(query);
  if (!search) return null;
  try {
    const res = await fetch(`https://api.bgm.tv/subject/${search.id}?responseGroup=large`, {
      headers: {
        "User-Agent": "AnimeNotebook/1.0 (https://localhost)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return { name_cn: search.name_cn, name: search.name, tags: search.tags };
    }
    const detail = await res.json();
    return {
      name_cn: detail.name_cn || search.name_cn,
      name: detail.name || search.name,
      tags: detail.tags || search.tags,
    };
  } catch {
    return { name_cn: search.name_cn, name: search.name, tags: search.tags };
  }
}

const entries = [];
const seenBase = new Set();

for (const line of lines) {
  const { baseQuery, variants } = parseSeasonVariants(line);
  const base = baseQuery.trim();
  if (!base || seenBase.has(base.toLowerCase())) continue;
  seenBase.add(base.toLowerCase());

  if (existingAliases.has(base.toLowerCase())) {
    console.log(`[skip existing] ${base}`);
    continue;
  }

  const subject = await searchBangumi(base);
  const fullName = subject?.name_cn || subject?.name || base;
  const genres = subject?.tags ? mapBangumiTags(subject.tags) : ["未分类"];

  const seasons = Array.from(
    new Set(
      variants
        .filter((v) => v.kind === "season")
        .map((v) => parseInt(v.label.replace(/[^0-9]/g, ""), 10))
        .filter((n) => !isNaN(n)),
    ),
  ).sort((a, b) => a - b);

  const entry = { aliases: [base], fullName, genres };
  if (seasons.length > 0) entry.seasons = seasons;
  if (variants.some((v) => v.kind === "movie")) entry.movies = true;
  if (variants.some((v) => v.kind === "ova")) entry.ovas = true;
  if (variants.some((v) => v.kind === "final")) entry.finalSeason = true;

  entries.push(entry);
  console.log(`[added] ${base} -> ${fullName} [${genres.join("/")}]`);

  await new Promise((resolve) => setTimeout(resolve, 400));
}

function objectToTs(obj, indent = 2) {
  const pad = " ".repeat(indent);
  const inner = obj
    .map((entry) => {
      const lines = ["{"];
      for (const [key, value] of Object.entries(entry)) {
        if (Array.isArray(value)) {
          lines.push(`${pad}${key}: [${value.map((v) => `"${v}"`).join(", ")}],`);
        } else if (typeof value === "boolean") {
          lines.push(`${pad}${key}: ${value},`);
        } else if (typeof value === "string") {
          lines.push(`${pad}${key}: "${value}",`);
        }
      }
      lines.push("}");
      return lines.map((l) => `${pad}${l}`).join("\n");
    })
    .join(",\n");
  return `[\n${inner}\n]`;
}

const ts = `import type { AnimeKnowledge } from "@/types";

export const userAddedAnime: AnimeKnowledge[] = ${objectToTs(entries, 2)};
`;

fs.writeFileSync(outputPath, ts);
console.log(`\nWrote ${entries.length} entries to ${outputPath.pathname}`);
