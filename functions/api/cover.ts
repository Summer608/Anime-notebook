interface Env {
  COVERS: R2Bucket;
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

function getContentType(url: string): string {
  const ext = url.split(".").pop()?.toLowerCase().split("?")[0] ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    bmp: "image/bmp",
  };
  return map[ext] ?? "image/jpeg";
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!env.COVERS) {
    return new Response("R2 binding not configured", { status: 500 });
  }

  const url = new URL(request.url);
  const targetUrl = url.searchParams.get("url");

  if (!targetUrl) {
    return new Response("Missing url parameter", { status: 400 });
  }

  const key = `covers/${hashUrl(targetUrl)}`;

  const cached = await env.COVERS.get(key);
  if (cached) {
    const contentType = cached.httpMetadata?.contentType ?? "image/jpeg";
    return new Response(cached.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Cover-Source": "r2-cache",
      },
    });
  }

  try {
    const fetchResponse = await fetch(targetUrl, {
      headers: { "User-Agent": "AnimeNotebook/1.0" },
      signal: AbortSignal.timeout(15000),
    });

    if (!fetchResponse.ok) {
      return new Response(`Failed to fetch: ${fetchResponse.status}`, { status: 502 });
    }

    const contentType = fetchResponse.headers.get("Content-Type") ?? getContentType(targetUrl);
    const body = await fetchResponse.arrayBuffer();

    await env.COVERS.put(key, body, {
      httpMetadata: { contentType },
    });

    return new Response(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Cover-Source": "r2-fresh",
      },
    });
  } catch (err) {
    return new Response(`Fetch error: ${(err as Error).message}`, { status: 502 });
  }
};
