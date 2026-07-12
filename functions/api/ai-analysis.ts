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
- **豆瓣评分**：X.X / 10（N 人评价）
- **Bangumi 评分**：X.X / 10（N 人评价）
> 如不确定具体数字，给出合理估值并标注"约"

## 📺 各集标题
第1集：标题
第2集：标题
...（列出全部或主要集数）

## 💬 经典台词与名场面
1. "台词原文" —— 场景描述
2. "台词原文" —— 场景描述
...（3-5 条）

## 🎯 入坑指南 & 相似作品
**看前须知**：...
**相似作品**：《作品1》《作品2》《作品3》

## ✨ 一句话灵魂总结
xxx

## 🔍 冷知识与幕后花絮
1. xxx
2. xxx
...（3-5 条）`;
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
    return new Response("DOUBAO_API_KEY not configured", { status: 500 });
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
            { role: "system", content: "你是一位资深动漫评论家，知识渊博，文笔生动。" },
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
    let buffer = "";
    let fullContent = "";

    const stream = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            if (fullContent.length > 0) {
              await env.COVERS.put(cacheKey, fullContent);
            }
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
              controller.close();
              if (fullContent.length > 0) {
                await env.COVERS.put(cacheKey, fullContent);
              }
              return;
            }

            try {
              const parsed: DoubaoChunk = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                controller.enqueue(new TextEncoder().encode(delta));
              }
            } catch {
              // 跳过无法解析的行
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
