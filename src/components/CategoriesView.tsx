import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { AnimeItem } from "@/types";
import { AnimeCard } from "./AnimeCard";

interface CategoriesViewProps {
  items: AnimeItem[];
  onDelete?: (id: string) => void;
}

export function CategoriesView({ items, onDelete }: CategoriesViewProps) {
  const grouped = items.reduce<Record<string, AnimeItem[]>>((acc, item) => {
    item.genres.forEach((genre) => {
      if (!acc[genre]) acc[genre] = [];
      acc[genre].push(item);
    });
    return acc;
  }, {});

  const sortedGenres = Object.keys(grouped).sort((a, b) =>
    a.localeCompare(b, "zh-CN"),
  );

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sortedGenres.forEach((genre) => (initial[genre] = false));
    return initial;
  });

  const toggleGenre = (genre: string) => {
    setExpanded((prev) => ({ ...prev, [genre]: !prev[genre] }));
  };

  if (items.length === 0) {
    return (
      <div className="py-24 text-center text-stone">
        还没有动漫，先去添加几部吧～
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedGenres.map((genre) => (
        <section
          key={genre}
          className="rounded-3xl bg-white/70 p-5 shadow-soft backdrop-blur-sm sm:p-6"
        >
          <button
            type="button"
            onClick={() => toggleGenre(genre)}
            className="flex w-full items-center justify-between"
          >
            <h2 className="font-display text-xl font-bold text-ink">
              {genre}
              <span className="ml-3 text-sm font-normal text-stone">
                {grouped[genre].length} 部
              </span>
            </h2>
            <ChevronDown
              className={`h-5 w-5 text-stone transition-transform ${
                expanded[genre] ? "rotate-180" : ""
              }`}
            />
          </button>

          {expanded[genre] && (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {grouped[genre].map((anime) => (
                <AnimeCard key={anime.id} anime={anime} onDelete={onDelete} />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
