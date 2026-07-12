import { useEffect, useMemo, useRef, useState } from "react";
import { X, Search, Check, Wand2, Loader2 } from "lucide-react";
import type { AnimeItem } from "@/types";
import { GENRES, findAnimeMatches, findExactAnime, generateDoubanUrl } from "@/data/animeKnowledge";
import { fetchCoverImage } from "@/services/animeApi";
import { GenreTag } from "./GenreTag";

interface AddAnimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<AnimeItem, "id" | "createdAt" | "updatedAt">) => void;
}

export function AddAnimeModal({ isOpen, onClose, onAdd }: AddAnimeModalProps) {
  const [query, setQuery] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => findAnimeMatches(query), [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedName("");
      setSelectedGenres([]);
      setHighlightedIndex(0);
      setIsSubmitting(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  const displayName = selectedName || query.trim();

  const handleSelectSuggestion = (index: number) => {
    const suggestion = suggestions[index];
    if (!suggestion) return;
    setSelectedName(suggestion.fullName);
    setSelectedGenres([...suggestion.genres]);
    setQuery(suggestion.fullName);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (selectedName && value.trim() !== selectedName) {
      setSelectedName("");
      setSelectedGenres([]);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelectSuggestion(highlightedIndex);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      const exact = findExactAnime(query);
      if (exact && !selectedName) {
        setSelectedName(exact.fullName);
        setSelectedGenres([...exact.genres]);
      }
    }, 150);
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = displayName;
    if (!name || isSubmitting) return;

    setIsSubmitting(true);
    const finalGenres = selectedGenres.length > 0 ? selectedGenres : ["未分类"];

    let coverUrl: string | undefined;
    try {
      coverUrl = await fetchCoverImage(name);
    } catch {
      // 获取封面失败，仍然保存
    }

    onAdd({
      displayName: name,
      originalInput: query.trim(),
      genres: finalGenres,
      coverUrl,
      doubanUrl: generateDoubanUrl(name),
    });
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in-up"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg animate-slide-in overflow-hidden rounded-3xl bg-paper shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <h2 className="font-display text-xl font-bold text-ink">添加动漫</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-stone transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="relative">
            <label htmlFor="anime-name" className="mb-2 block text-sm font-medium text-ink">
              动漫名称
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
              <input
                id="anime-name"
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleInputKeyDown}
                onBlur={handleInputBlur}
                placeholder="输入名称，支持简称，如「你的名字」"
                className="input pl-11"
                autoComplete="off"
              />
            </div>

            {query.trim() && suggestions.length > 0 && !selectedName && (
              <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-lift">
                {suggestions.map((suggestion, index) => (
                  <li key={suggestion.fullName}>
                    <button
                      type="button"
                      onClick={() => handleSelectSuggestion(index)}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                        index === highlightedIndex
                          ? "bg-ink/5 text-ink"
                          : "text-ink hover:bg-ink/5"
                      }`}
                    >
                      <span>{suggestion.fullName}</span>
                      <span className="text-xs text-stone">
                        {suggestion.genres.slice(0, 2).join(" / ")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {displayName && (
            <div className="rounded-2xl bg-white/60 p-4 text-sm text-ink">
              <span className="text-stone">将保存为：</span>
              <span className="ml-1 font-semibold">{displayName}</span>
            </div>
          )}

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-coral" />
              <span className="text-sm font-medium text-ink">题材标签</span>
              {selectedGenres.length > 0 && (
                <span className="text-xs text-stone">
                  已选 {selectedGenres.length} 个
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    selectedGenres.includes(genre)
                      ? "border-coral bg-coral/10 text-coral"
                      : "border-ink/10 bg-white text-ink hover:border-coral/30"
                  }`}
                >
                  {selectedGenres.includes(genre) && (
                    <Check className="h-3 w-3" />
                  )}
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost" disabled={isSubmitting}>
              取消
            </button>
            <button
              type="submit"
              disabled={!displayName || isSubmitting}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  获取封面中...
                </>
              ) : (
                "保存"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
