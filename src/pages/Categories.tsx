import { CategoriesView } from "@/components/CategoriesView";
import { useAnimeStore } from "@/store/animeStore";
import { useAuthStore } from "@/store/authStore";

export default function Categories() {
  const { items, removeItem } = useAnimeStore();
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 pb-8">
      <div className="rounded-3xl bg-ink px-6 py-10 text-center text-white shadow-lift sm:py-14">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">按题材分类</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/70 sm:text-base">
          所有动漫按题材自动聚合，方便你按心情挑选下一部想看的作品。
        </p>
      </div>

      <CategoriesView items={items} onDelete={user ? removeItem : undefined} />
    </div>
  );
}
