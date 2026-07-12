import { cn } from "@/lib/utils";

interface GenreTagProps {
  genre: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

const genreColorMap: Record<string, string> = {
  恋爱: "bg-coral/15 text-coral border-coral/20",
  热血: "bg-red-500/15 text-red-600 border-red-500/20",
  悬疑: "bg-indigo-500/15 text-indigo-600 border-indigo-500/20",
  科幻: "bg-blue-500/15 text-blue-600 border-blue-500/20",
  奇幻: "bg-purple-500/15 text-purple-600 border-purple-500/20",
  日常: "bg-mint/15 text-teal-600 border-mint/20",
  运动: "bg-orange-500/15 text-orange-600 border-orange-500/20",
  音乐: "bg-pink-500/15 text-pink-600 border-pink-500/20",
  机战: "bg-slate-500/15 text-slate-600 border-slate-500/20",
  治愈: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  搞笑: "bg-yellow-400/20 text-yellow-700 border-yellow-500/20",
  冒险: "bg-amber-600/15 text-amber-700 border-amber-600/20",
  恐怖: "bg-gray-700/15 text-gray-700 border-gray-700/20",
  推理: "bg-sky-600/15 text-sky-700 border-sky-600/20",
  校园: "bg-violet-500/15 text-violet-600 border-violet-500/20",
  异世界: "bg-fuchsia-500/15 text-fuchsia-600 border-fuchsia-500/20",
  战斗: "bg-rose-600/15 text-rose-700 border-rose-600/20",
  美食: "bg-lime-500/15 text-lime-700 border-lime-500/20",
  历史: "bg-stone-500/15 text-stone-600 border-stone-500/20",
};

export function GenreTag({ genre, active, onClick, className }: GenreTagProps) {
  const colorClass = genreColorMap[genre] || "bg-ink/10 text-ink border-ink/15";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200",
        active
          ? "bg-ink text-white border-ink shadow-md"
          : `${colorClass} hover:brightness-95`,
        onClick && "cursor-pointer",
        className,
      )}
    >
      {genre}
    </button>
  );
}
