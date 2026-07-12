import { Trash2 } from "lucide-react";
import type { AnimeItem } from "@/types";
import { GenreTag } from "./GenreTag";

interface AnimeCardProps {
  anime: AnimeItem;
  onDelete?: (id: string) => void;
  style?: React.CSSProperties;
}

const gradients = [
  "from-coral/30 to-mint/30",
  "from-mint/30 to-sunshine/30",
  "from-sunshine/30 to-coral/30",
  "from-ink/20 to-coral/20",
  "from-purple-400/30 to-pink-400/30",
  "from-blue-400/30 to-cyan-400/30",
];

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

function getInitials(name: string): string {
  const match = name.match(/[\u4e00-\u9fa5]/);
  if (match) return match[0];
  return name.charAt(0).toUpperCase();
}

function getCoverSrc(coverUrl: string): string {
  if (import.meta.env.DEV) return coverUrl;
  return `/api/cover?url=${encodeURIComponent(coverUrl)}`;
}

export function AnimeCard({ anime, onDelete, style }: AnimeCardProps) {
  const gradient = getGradient(anime.displayName);
  const initials = getInitials(anime.displayName);

  return (
    <article
      style={style}
      className="card group relative flex flex-col gap-2 overflow-hidden p-3 hover:-translate-y-1 hover:shadow-lift sm:gap-4 sm:p-5"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
        {anime.coverUrl ? (
          <img
            src={getCoverSrc(anime.coverUrl)}
            alt={anime.displayName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}
          >
            <span className="font-display text-5xl font-bold text-ink/40">
              {initials}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 sm:gap-3">
        <h3
          className="group/link relative text-xs font-bold leading-tight text-ink sm:text-lg"
          title={anime.displayName}
        >
          <span className="line-clamp-2">{anime.displayName}</span>
          <span className="pointer-events-none absolute -top-9 left-0 z-20 max-w-xs whitespace-nowrap rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover/link:opacity-100">
            {anime.displayName}
          </span>
        </h3>

        <div className="flex flex-wrap gap-1.5">
          {anime.genres.map((genre) => (
            <GenreTag key={genre} genre={genre} />
          ))}
        </div>
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(anime.id)}
          className="absolute right-4 top-4 rounded-full bg-white/80 p-2 text-stone opacity-0 backdrop-blur-sm transition-all hover:bg-coral hover:text-white group-hover:opacity-100"
          aria-label="删除"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </article>
  );
}
