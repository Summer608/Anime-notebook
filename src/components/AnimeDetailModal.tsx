import { useEffect, useRef, useState } from "react";
import { X, Sparkles, RefreshCw, Loader2, ExternalLink } from "lucide-react";
import type { AnimeItem } from "@/types";
import { GenreTag } from "./GenreTag";
import { StreamingText } from "./StreamingText";

interface AnimeDetailModalProps {
  anime: AnimeItem | null;
  isOpen: boolean;
  onClose: () => void;
}

function getCoverSrc(coverUrl: string): string {
  if (import.meta.env.DEV) return coverUrl;
  return `/api/cover?url=${encodeURIComponent(coverUrl)}`;
}

export function AnimeDetailModal({ anime, isOpen, onClose }: AnimeDetailModalProps) {
  const [stream, setStream] = useState<ReadableStream<Uint8Array> | null>(null);
  const [loading, setLoading] = useState(false);
  const [streamDone, setStreamDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setStream(null);
      setLoading(false);
      setStreamDone(false);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !anime) return null;

  const handleAnalyze = async (force = false) => {
    setLoading(true);
    setStreamDone(false);
    setError(null);
    setStream(null);

    try {
      const params = new URLSearchParams({ name: anime.displayName });
      if (force) params.set("force", "1");

      const response = await fetch(`/api/ai-analysis?${params}`);

      if (!response.ok) {
        const errText = await response.text();
        setError(`分析失败：${errText}`);
        setLoading(false);
        return;
      }

      if (response.body) {
        setStream(response.body);
        setLoading(false);
      }
    } catch (err) {
      setError(`网络错误：${(err as Error).message}`);
      setLoading(false);
    }
  };

  const handleStreamDone = () => {
    setStreamDone(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 animate-fade-in-up sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />

      <div
        className="relative flex max-h-[95vh] w-full max-w-5xl animate-slide-in flex-col overflow-hidden rounded-3xl bg-paper shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-2 text-stone backdrop-blur-sm transition-colors hover:bg-ink/10 hover:text-ink"
          aria-label="关闭"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col overflow-hidden md:flex-row">
          <div className="flex flex-col gap-3 border-b border-ink/10 p-5 md:w-1/3 md:border-b-0 md:border-r">
            {anime.coverUrl && (
              <div className="mx-auto aspect-[3/4] w-full max-w-[200px] overflow-hidden rounded-2xl shadow-soft md:max-w-[240px]">
                <img
                  src={getCoverSrc(anime.coverUrl)}
                  alt={anime.displayName}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold leading-tight text-ink md:text-xl">
                {anime.displayName}
              </h2>

              <div className="flex flex-wrap gap-1.5">
                {anime.genres.map((genre) => (
                  <GenreTag key={genre} genre={genre} />
                ))}
              </div>

              {anime.doubanUrl && (
                <a
                  href={anime.doubanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-coral hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  豆瓣页面
                </a>
              )}
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5">
            {!stream && !loading && !error && (
              <div className="flex h-full flex-col items-center justify-center gap-4 py-12">
                <div className="rounded-full bg-coral/10 p-4">
                  <Sparkles className="h-8 w-8 text-coral" />
                </div>
                <p className="text-center text-sm text-stone">
                  点击下方按钮，让 AI 为你深度解析这部动漫
                </p>
                <button
                  type="button"
                  onClick={() => handleAnalyze(false)}
                  className="btn-primary"
                >
                  <Sparkles className="h-4 w-4" />
                  AI 分析
                </button>
              </div>
            )}

            {loading && (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-12">
                <Loader2 className="h-8 w-8 animate-spin text-coral" />
                <p className="text-sm text-stone">正在召唤 AI...</p>
              </div>
            )}

            {error && (
              <div className="flex h-full flex-col items-center justify-center gap-4 py-12">
                <p className="text-center text-sm text-coral">{error}</p>
                <button
                  type="button"
                  onClick={() => handleAnalyze(true)}
                  className="btn-ghost"
                >
                  重试
                </button>
              </div>
            )}

            {stream && (
              <div className="space-y-4">
                <StreamingText stream={stream} onDone={handleStreamDone} />
                {streamDone && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => handleAnalyze(true)}
                      className="btn-ghost text-xs"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      重新分析
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
