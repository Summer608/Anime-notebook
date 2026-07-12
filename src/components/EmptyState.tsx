import { Film } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 text-center animate-fade-in-up">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-mist">
        <Film className="h-10 w-10 text-stone" />
      </div>
      <div className="max-w-xs space-y-2">
        <h3 className="text-xl font-bold text-ink">还没有收录动漫</h3>
        <p className="text-sm leading-relaxed text-stone">
          点击右上角的「添加动漫」，把你喜欢的番剧收录进来吧～
        </p>
      </div>
    </div>
  );
}
