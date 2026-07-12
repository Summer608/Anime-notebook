import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { AnimeItem, ViewMode } from "@/types";
import { AnimeCard } from "./AnimeCard";
import { EmptyState } from "./EmptyState";

interface AnimeGridProps {
  items: AnimeItem[];
  onDelete?: (id: string) => void;
  onReorder?: (sourceId: string, targetId: string) => void;
  onAnimeClick?: (anime: AnimeItem) => void;
  viewMode?: ViewMode;
}

export function AnimeGrid({
  items,
  onDelete,
  onReorder,
  onAnimeClick,
  viewMode = "card",
}: AnimeGridProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  if (items.length === 0) {
    return <EmptyState />;
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!onReorder) return;
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    if (!onReorder || !draggedId || draggedId === id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(id);
  };

  const handleDragLeave = (id: string) => {
    if (dragOverId === id) setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    if (!onReorder || !draggedId || draggedId === targetId) return;
    e.preventDefault();
    onReorder(draggedId, targetId);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const itemProps = (anime: AnimeItem) => ({
    key: anime.id,
    draggable: !!onReorder,
    onDragStart: (e: React.DragEvent) => handleDragStart(e, anime.id),
    onDragOver: (e: React.DragEvent) => handleDragOver(e, anime.id),
    onDragLeave: () => handleDragLeave(anime.id),
    onDrop: (e: React.DragEvent) => handleDrop(e, anime.id),
    onDragEnd: handleDragEnd,
  });

  if (viewMode === "list") {
    return (
      <div className={onReorder ? "cursor-move" : ""}>
        <ul className="divide-y divide-ink/5 overflow-hidden rounded-2xl bg-white/70 shadow-soft backdrop-blur-sm">
          {items.map((anime, index) => {
            const isDragging = draggedId === anime.id;
            const isDragOver = dragOverId === anime.id && draggedId !== anime.id;
            return (
              <li
                {...itemProps(anime)}
                onClick={() => onAnimeClick?.(anime)}
                className={`group flex items-center gap-3 border-l-2 px-4 py-3 transition-all ${
                  isDragging
                    ? "opacity-40"
                    : isDragOver
                      ? "border-coral bg-coral/10"
                      : "border-transparent hover:bg-coral/5"
                } ${onAnimeClick ? "cursor-pointer" : ""}`}
              >
                <span className="w-8 shrink-0 text-center text-sm font-medium text-stone">
                  {index + 1}
                </span>
                <span
                  className="group/link relative flex flex-1 items-center gap-1.5 truncate font-medium text-ink"
                  title={anime.displayName}
                >
                  <span className="truncate">{anime.displayName}</span>
                  <span className="pointer-events-none absolute -top-9 left-0 z-20 max-w-xs whitespace-nowrap rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover/link:opacity-100">
                    {anime.displayName}
                  </span>
                </span>
                <div className="flex shrink-0 gap-1">
                  {anime.genres.slice(0, 2).map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full bg-mint/15 px-2 py-0.5 text-xs text-ink/60"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(anime.id);
                    }}
                    className="rounded-full p-1.5 text-stone opacity-0 transition-all hover:bg-coral hover:text-white group-hover:opacity-100"
                    aria-label="删除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <section
      aria-label="动漫列表"
      className="grid grid-cols-3 gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-6"
    >
      {items.map((anime, index) => {
        const isDragging = draggedId === anime.id;
        const isDragOver = dragOverId === anime.id && draggedId !== anime.id;
        return (
          <div
            {...itemProps(anime)}
            className={`animate-fade-in-up transition-opacity ${onReorder ? "cursor-move" : ""}`}
            style={{ animationDelay: `${Math.min(index * 60, 600)}ms` }}
          >
            <div
              className={`h-full rounded-2xl transition-all ${
                isDragging
                  ? "opacity-40"
                  : isDragOver
                    ? "ring-2 ring-coral ring-offset-2 scale-[1.02]"
                    : ""
              }`}
            >
              <AnimeCard anime={anime} onDelete={onDelete} onClick={onAnimeClick} />
            </div>
          </div>
        );
      })}
    </section>
  );
}
