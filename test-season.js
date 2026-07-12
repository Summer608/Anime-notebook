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

const cases = [
  "路人女主一二剧场版",
  "路人女主第一季第二季剧场版",
  "辉夜大小姐第2季",
  "进击的巨人最终季Part2",
  "柯南",
  "你的名字",
  "鬼灭之刃第二季",
  "EVA剧场版",
  "re0一二季",
  "路人女主12剧场版",
  "白色相簿2",
  "命运石之门0",
  "小林家的龙女仆S",
  "工作细胞12",
];

for (const c of cases) {
  const result = parseSeasonVariants(c);
  console.log(c, "=> base:", result.baseQuery, "variants:", result.variants.map((v) => v.label).join(", ") || "无");
}
