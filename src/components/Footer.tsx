import { Heart } from "lucide-react";
import { isSupabaseConfigured } from "@/store/animeStore";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-ink/5 py-8 text-center text-sm text-stone">
      <p className="flex items-center justify-center gap-1.5">
        用 <Heart className="h-3.5 w-3.5 text-coral" /> 记录每一部番剧
      </p>
      <p className="mt-1 text-xs text-stone/70">
        {isSupabaseConfigured
          ? "数据已云端同步，可在任意设备访问。登录后可管理你的收藏。"
          : "数据仅保存在你的浏览器本地，更换设备或清除浏览器数据会丢失，请及时备份。"}
      </p>
    </footer>
  );
}
