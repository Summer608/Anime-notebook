import { useEffect, useMemo, useRef, useState } from "react";
import { X, Upload, Loader2, Check, AlertCircle, Film } from "lucide-react";
import type { BulkImportCandidate } from "@/services/animeApi";
import {
  candidateToAnimeItem,
  parseBulkInput,
  resolveAnimeNamesStream,
} from "@/services/animeApi";
import type { AnimeItem } from "@/types";
import { GENRES } from "@/data/animeKnowledge";
import { GenreTag } from "./GenreTag";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItems: (items: Omit<AnimeItem, "id" | "createdAt" | "updatedAt">[]) => void;
}

type Status = "idle" | "resolving" | "review" | "importing" | "done";

export function BulkImportModal({ isOpen, onClose, onAddItems }: BulkImportModalProps) {
  const [rawInput, setRawInput] = useState("");
  const [candidates, setCandidates] = useState<BulkImportCandidate[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const totalCount = candidates.length;
  const selectedCount = candidates.filter((c) => c.selected).length;
  const hasHighConfidence = candidates.some((c) => c.confidence === "high");

  useEffect(() => {
    if (isOpen) {
      setRawInput("");
      setCandidates([]);
      setStatus("idle");
      setProgress(0);
      setProgressTotal(0);
      setError(null);
      abortRef.current = false;
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const parsedNames = useMemo(() => parseBulkInput(rawInput), [rawInput]);

  const handleResolve = async () => {
    if (parsedNames.length === 0) return;

    setStatus("resolving");
    setProgress(0);
    setProgressTotal(0);
    setError(null);
    abortRef.current = false;
    const resolved: BulkImportCandidate[] = [];

    try {
      for await (const result of resolveAnimeNamesStream(parsedNames)) {
        if (abortRef.current) break;
        resolved.push(result.candidate);
        setCandidates([...resolved]);
        setProgress(result.index);
        setProgressTotal(result.total);
      }
      setStatus("review");
    } catch (err) {
      setError("识别过程出错，请检查网络连接后重试。");
      setStatus("review");
    }
  };

  const handleImport = () => {
    const selected = candidates.filter((c) => c.selected);
    if (selected.length === 0) return;

    setStatus("importing");
    const items = selected.map(candidateToAnimeItem);

    setTimeout(() => {
      onAddItems(items);
      setStatus("done");
    }, 300);
  };

  const toggleSelected = (index: number) => {
    setCandidates((prev) =>
      prev.map((c, i) => (i === index ? { ...c, selected: !c.selected } : c)),
    );
  };

  const updateCandidateName = (index: number, value: string) => {
    setCandidates((prev) =>
      prev.map((c, i) =>
        i === index ? { ...c, displayName: value, doubanUrl: "" } : c,
      ),
    );
  };

  const toggleGenre = (candidateIndex: number, genre: string) => {
    setCandidates((prev) =>
      prev.map((c, i) => {
        if (i !== candidateIndex) return c;
        const has = c.genres.includes(genre);
        const nextGenres = has ? c.genres.filter((g) => g !== genre) : [...c.genres, genre];
        const filtered = nextGenres.filter((g) => g !== "未分类");
        return { ...c, genres: filtered.length > 0 ? filtered : ["未分类"] };
      }),
    );
  };

  const selectAll = () => {
    setCandidates((prev) => prev.map((c) => ({ ...c, selected: true })));
  };

  const deselectAll = () => {
    setCandidates((prev) => prev.map((c) => ({ ...c, selected: false })));
  };

  const handleClose = () => {
    abortRef.current = true;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in-up"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />

      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col animate-slide-in overflow-hidden rounded-3xl bg-paper shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">批量导入</h2>
            <p className="text-xs text-stone">先用本地数据库匹配简称，未命中再联网补全名称、题材和封面</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-stone transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {status === "idle" && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-ink">
                粘贴动漫名称列表
                <span className="ml-2 text-xs font-normal text-stone">
                  每行一个，支持用换行、逗号、分号分隔
                </span>
              </label>
              <textarea
                ref={textareaRef}
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder={`例如：
你的名字
鬼灭之刃
间谍过家家
进击的巨人`}
                className="input min-h-[240px] resize-y font-mono text-sm"
              />
              {parsedNames.length > 0 && (
                <p className="text-sm text-stone">检测到 {parsedNames.length} 个名称</p>
              )}
            </div>
          )}

          {(status === "resolving" || status === "importing") && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-coral" />
              <p className="mt-4 text-ink">
                {status === "resolving"
                  ? `正在识别... ${progress} / ${progressTotal || parsedNames.length}`
                  : "正在保存到本地..."}
              </p>
              <p className="mt-1 text-xs text-stone">
                {status === "resolving" && "本地数据库优先匹配简称；未命中时再请求 Bangumi / MyAnimeList"}
              </p>
            </div>
          )}

          {status === "review" && (
            <div className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-ink">
                  共识别 <span className="font-bold">{totalCount}</span> 条，已选{" "}
                  <span className="font-bold text-coral">{selectedCount}</span> 条
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={selectAll} className="btn-ghost py-1.5 text-xs">
                    全选
                  </button>
                  <button type="button" onClick={deselectAll} className="btn-ghost py-1.5 text-xs">
                    全不选
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {candidates.map((candidate, index) => (
                  <div
                    key={`${candidate.originalInput}-${index}`}
                    className={`flex gap-4 rounded-2xl border p-4 transition-colors ${
                      candidate.selected
                        ? "border-coral/30 bg-white"
                        : "border-ink/10 bg-white/50 opacity-60"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSelected(index)}
                      className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        candidate.selected
                          ? "border-coral bg-coral text-white"
                          : "border-ink/30 bg-white"
                      }`}
                    >
                      {candidate.selected && <Check className="h-3.5 w-3.5" />}
                    </button>

                    <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-ink/5">
                      {candidate.coverUrl ? (
                        <img
                          src={import.meta.env.DEV ? candidate.coverUrl : `/api/cover?url=${encodeURIComponent(candidate.coverUrl)}`}
                          alt={candidate.displayName}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-stone/50">
                          <Film className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <input
                            type="text"
                            value={candidate.displayName}
                            onChange={(e) => updateCandidateName(index, e.target.value)}
                            className="w-full rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-sm font-semibold text-ink outline-none focus:border-coral"
                          />
                          {candidate.originalInput !== candidate.displayName && (
                            <p className="mt-0.5 text-xs text-stone">
                              原输入：{candidate.originalInput}
                            </p>
                          )}
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                            candidate.confidence === "high"
                              ? "bg-mint/20 text-mint"
                              : candidate.confidence === "medium"
                                ? "bg-sunshine/30 text-ink/70"
                                : "bg-ink/10 text-stone"
                          }`}
                        >
                          {candidate.confidence === "high"
                            ? "高匹配"
                            : candidate.confidence === "medium"
                              ? "可能匹配"
                              : "未识别"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {GENRES.map((genre) => {
                          const active = candidate.genres.includes(genre);
                          return (
                            <button
                              key={genre}
                              type="button"
                              onClick={() => toggleGenre(index, genre)}
                              className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                                active
                                  ? "bg-coral/10 text-coral ring-1 ring-coral/30"
                                  : "bg-ink/5 text-stone hover:bg-ink/10"
                              }`}
                            >
                              {genre}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {status === "done" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mint/20">
                <Check className="h-7 w-7 text-mint" />
              </div>
              <p className="mt-4 text-lg font-bold text-ink">导入完成</p>
              <p className="text-sm text-stone">
                成功导入 {selectedCount} 部动漫
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-ink/10 px-6 py-4">
          {status === "idle" && (
            <>
              <button type="button" onClick={handleClose} className="btn-ghost">
                取消
              </button>
              <button
                type="button"
                onClick={handleResolve}
                disabled={parsedNames.length === 0}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                开始识别 ({parsedNames.length})
              </button>
            </>
          )}

          {status === "review" && (
            <>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="btn-ghost"
              >
                重新输入
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={selectedCount === 0}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                导入所选 ({selectedCount})
              </button>
            </>
          )}

          {status === "done" && (
            <button type="button" onClick={handleClose} className="btn-primary">
              完成
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
