import { useState } from "react";
import { ImageIcon, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import type { AnimeItem } from "@/types";
import { fetchCoverImage } from "@/services/animeApi";

interface FetchCoversButtonProps {
  items: AnimeItem[];
  onUpdate: (id: string, updates: Partial<AnimeItem>) => void;
}

interface ProgressState {
  done: number;
  total: number;
  updated: number;
  unchanged: number;
  failed: number;
}

export function FetchCoversButton({ items, onUpdate }: FetchCoversButtonProps) {
  const [fetching, setFetching] = useState(false);
  const [progress, setProgress] = useState<ProgressState>({
    done: 0,
    total: 0,
    updated: 0,
    unchanged: 0,
    failed: 0,
  });
  const [currentName, setCurrentName] = useState("");
  const [lastResult, setLastResult] = useState<string | null>(null);

  const missingCount = items.filter((item) => !item.coverUrl).length;

  const fetchCovers = async (fetchAll: boolean) => {
    const targets = fetchAll ? items : items.filter((item) => !item.coverUrl);
    if (targets.length === 0 || fetching) return;

    setFetching(true);
    setProgress({ done: 0, total: targets.length, updated: 0, unchanged: 0, failed: 0 });
    setLastResult(null);

    let updated = 0;
    let unchanged = 0;
    let failed = 0;

    for (let i = 0; i < targets.length; i++) {
      const item = targets[i];
      setCurrentName(item.displayName);
      try {
        const coverUrl = await fetchCoverImage(item.displayName);
        if (coverUrl) {
          if (coverUrl === item.coverUrl) {
            unchanged++;
            console.log(
              `[封面] 未变化: ${item.displayName}\n  旧URL: ${item.coverUrl}\n  新URL: ${coverUrl}`,
            );
          } else {
            onUpdate(item.id, { coverUrl });
            updated++;
            console.log(
              `[封面] 已更新: ${item.displayName}\n  旧URL: ${item.coverUrl}\n  新URL: ${coverUrl}`,
            );
          }
        } else {
          failed++;
          console.log(`[封面] 未找到: ${item.displayName}`);
        }
      } catch (err) {
        failed++;
        console.log(`[封面] 出错: ${item.displayName}`, err);
      }
      setProgress({ done: i + 1, total: targets.length, updated, unchanged, failed });

      // 延迟 800ms，避免触发 API 速率限制
      if (i < targets.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }

    setFetching(false);
    setCurrentName("");
    const summary = `完成：更新 ${updated} · 未变 ${unchanged} · 未找到 ${failed}`;
    setLastResult(summary);
    console.log(`[封面] 批量获取完成 - ${summary}`);
  };

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {fetching ? (
        <span className="inline-flex items-center gap-2 text-xs text-ink">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>
            获取封面 {progress.done}/{progress.total}
            <span className="text-coral"> 更新 {progress.updated}</span>
            <span className="text-stone"> 未变 {progress.unchanged}</span>
            <span className="text-stone"> 未找到 {progress.failed}</span>
          </span>
          {currentName && (
            <span className="max-w-[12rem] truncate text-stone" title={currentName}>
              · {currentName}
            </span>
          )}
        </span>
      ) : missingCount > 0 ? (
        <button
          type="button"
          onClick={() => fetchCovers(false)}
          className="btn-ghost text-xs"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          获取缺失封面 ({missingCount})
        </button>
      ) : lastResult ? (
        <span className="text-xs text-stone">{lastResult}</span>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs text-stone">
          <CheckCircle2 className="h-3.5 w-3.5" />
          封面已齐全
        </span>
      )}

      <button
        type="button"
        onClick={() => fetchCovers(true)}
        disabled={fetching}
        className="btn-ghost text-xs disabled:cursor-not-allowed disabled:opacity-50"
        title="重新获取所有动漫的封面（包括已有的）"
      >
        {fetching ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RefreshCw className="h-3.5 w-3.5" />
        )}
        重新获取全部
      </button>
    </div>
  );
}
