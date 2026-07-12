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
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Referer": "https://anilist.co/",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!fetchResponse.ok) {
      if (fetchResponse.status === 403 || fetchResponse.status === 401) {
        return Response.redirect(targetUrl, 302);
      }
      return new Response(`Failed to fetch: ${fetchResponse.status}`, { status: 502 });
    }

    const contentType = fetchResponse.headers.get("Content-Type") ?? getContentType(targetUrl);
    const body = await fetchResponse.arrayBuffer();

    if (body.byteLength === 0) {
      return new Response("Empty image body", { status: 502 });
    }

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
