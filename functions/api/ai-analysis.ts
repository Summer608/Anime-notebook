interface Env {
  COVERS: R2Bucket;
  DOUBAO_API_KEY: string;
}

function hashUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function buildPrompt(animeName: string): string {
  return `你是一位资深动漫评论家。请分析动漫《${animeName}》，严格按以下 Markdown 格式输出，不要输出其他内容：

## 📊 评分一览
- **豆瓣评分**：X.X / 10
- **Bangumi 评分**：X.X / 10
> ⚠️ 评分准确性最重要！请务必检索真实的豆瓣(douban.com)和Bangumi(bgm.tv)评分数据，切勿编造。如确实无法检索到，标注"暂无"。

##  经典台词与名场面
1. "台词原文" —— 场景描述
2. "台词原文" —— 场景描述
...（3-5 条，确保台词准确出自该作品）

## 🎯 入坑指南 & 相似作品
**看前须知**：...
**相似作品**：
- 《作品1》
- 《作品2》
- 《作品3》
- 《作品4》
- 《作品5》
- 《作品6》
...（列举6-8部高度相似的作品，确保题材、风格或受众相似，切勿凑数）

## ✨ 一句话灵魂总结
xxx

## 🔍 冷知识与幕后花絮
1. xxx
2. xxx
...（3-5 条，确保信息准确真实）`;
}

interface DoubaoChunk {
  choices: Array<{
    delta?: { content?: string };
    finish_reason?: string | null;
  }>;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!env.DOUBAO_API_KEY) {
    return new Response(JSON.stringify({ error: "DOUBAO_API_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const animeName = url.searchParams.get("name");
  const force = url.searchParams.get("force") === "1";

  if (!animeName) {
    return new Response("Missing name parameter", { status: 400 });
  }

  const cacheKey = `ai-analysis/${hashUrl(animeName)}`;

  if (!force) {
    const cached = await env.COVERS.get(cacheKey);
    if (cached) {
      const text = await cached.text();
      return new Response(text, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Cache": "hit",
        },
      });
    }
  }

  try {
    const apiResponse = await fetch(
      "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.DOUBAO_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "doubao-seed-2-0-mini-260428",
          messages: [
            { role: "system", content: "你是一位资深动漫评论家，知识渊博，文笔生动。你提供的所有信息必须准确无误，尤其是评分数据必须来自真实检索结果，绝不能编造。" },
            { role: "user", content: buildPrompt(animeName) },
          ],
          stream: true,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(120000),
      },
    );

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      return new Response(`Doubao API error: ${apiResponse.status} ${errText}`, {
        status: 502,
      });
    }

    const reader = apiResponse.body!.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";
    let fullContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              if (fullContent.length > 0) {
                try {
                  await env.COVERS.put(cacheKey, fullContent);
                } catch {
                  // 缓存写入失败不影响返回
                }
              }
              controller.close();
              return;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data:")) continue;

              const data = trimmed.slice(5).trim();
              if (data === "[DONE]") {
                if (fullContent.length > 0) {
                  try {
                    await env.COVERS.put(cacheKey, fullContent);
                  } catch {
                    // 缓存写入失败不影响返回
                  }
                }
                controller.close();
                return;
              }

              try {
                const parsed: DoubaoChunk = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  fullContent += delta;
                  controller.enqueue(encoder.encode(delta));
                }
              } catch {
                // 跳过无法解析的行
              }
            }
          }
        } catch (err) {
          controller.error(err);
        }
      },
      cancel() {
        reader.cancel();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Cache": "miss",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    return new Response(`Fetch error: ${(err as Error).message}`, {
      status: 502,
    });
  }
};
