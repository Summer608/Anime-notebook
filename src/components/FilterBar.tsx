import { useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { GenreTag } from "./GenreTag";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedGenre: string | null;
  onGenreChange: (genre: string | null) => void;
  genres: string[];
  resultCount: number;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedGenre,
  onGenreChange,
  genres,
  resultCount,
}: FilterBarProps) {
  const [genreExpanded, setGenreExpanded] = useState(false);

  return (
    <div className="space-y-5 rounded-3xl bg-white/70 p-5 shadow-soft backdrop-blur-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索动漫名称、题材..."
            className="input pl-11"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone hover:bg-ink/5"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setGenreExpanded(!genreExpanded)}
          className="flex w-full items-center justify-between rounded-xl bg-ink/5 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ink/10"
        >
          <span>
            题材筛选
            {selectedGenre && (
              <span className="ml-2 text-coral">· {selectedGenre}</span>
            )}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-stone transition-transform ${genreExpanded ? "rotate-180" : ""}`}
          />
        </button>
        {genreExpanded && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <GenreTag
              genre="全部"
              active={selectedGenre === null}
              onClick={() => onGenreChange(null)}
            />
            {genres.map((genre) => (
              <GenreTag
                key={genre}
                genre={genre}
                active={selectedGenre === genre}
                onClick={() => onGenreChange(genre)}
              />
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-stone">
        共收录 <span className="font-semibold text-ink">{resultCount}</span> 部动漫
      </p>
    </div>
  );
}
