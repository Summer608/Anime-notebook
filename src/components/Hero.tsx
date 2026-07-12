import { Sparkles, Upload } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface HeroProps {
  totalCount: number;
  onAddClick: () => void;
  onBulkImportClick: () => void;
}

export function Hero({ totalCount, onAddClick, onBulkImportClick }: HeroProps) {
  const { user } = useAuthStore();

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] bg-ink px-6 py-16 text-white shadow-lift sm:px-12 sm:py-20">
      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-coral/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-mint/15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-sunshine" />
          <span>记录每一部打动你的动画</span>
        </div>

        <h1 className="mb-5 font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          番剧手帐
        </h1>

        <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
          收集你看过的日本动漫，自动补全名称、归类题材。
          让每一份观影记忆都有迹可循。
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          {user ? (
            <>
              <button type="button" onClick={onAddClick} className="btn-primary bg-coral hover:bg-coral/90">
                添加动漫
              </button>
              <button
                type="button"
                onClick={onBulkImportClick}
                className="btn-ghost border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              >
                <Upload className="h-4 w-4" />
                批量导入
              </button>
            </>
          ) : (
            <p className="text-sm text-white/60">
              登录后可管理你的动漫收藏
            </p>
          )}
          <div className="flex items-center gap-3 rounded-full bg-white/10 px-6 py-3 text-sm backdrop-blur-sm">
            <span className="text-white/60">已收录</span>
            <span className="font-display text-2xl font-bold text-sunshine">
              {totalCount}
            </span>
            <span className="text-white/60">部</span>
          </div>
        </div>
      </div>
    </section>
  );
}
