import { useState } from "react";
import { LayoutGrid, List, Database } from "lucide-react";
import { Hero } from "@/components/Hero";
import { FilterBar } from "@/components/FilterBar";
import { AnimeGrid } from "@/components/AnimeGrid";
import { BackupTools } from "@/components/BackupTools";
import { FetchCoversButton } from "@/components/FetchCoversButton";
import { AnimeDetailModal } from "@/components/AnimeDetailModal";
import { useAnimeStore, filterAndSortItems, getAllGenres } from "@/store/animeStore";
import { useAuthStore } from "@/store/authStore";
import type { AnimeItem } from "@/types";

interface HomeProps {
  onAddClick: () => void;
  onBulkImportClick: () => void;
}

export default function Home({ onAddClick, onBulkImportClick }: HomeProps) {
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [selectedAnime, setSelectedAnime] = useState<AnimeItem | null>(null);

  const {
    items,
    searchQuery,
    selectedGenre,
    sortBy,
    viewMode,
    setSearchQuery,
    setSelectedGenre,
    setViewMode,
    removeItem,
    reorderItems,
    commitOrder,
    updateItem,
    syncFromKnowledge,
    exportData,
    importData,
  } = useAnimeStore();

  const { user } = useAuthStore();

  const filteredItems = filterAndSortItems(items, searchQuery, selectedGenre, sortBy);
  const allGenres = getAllGenres(items);

  const handleReorder = (sourceId: string, targetId: string) => {
    if (sortBy !== "manual") {
      commitOrder(filteredItems.map((item) => item.id));
    }
    reorderItems(sourceId, targetId);
  };

  const handleSync = () => {
    const result = syncFromKnowledge();
    setSyncResult(
      `同步完成：更新 ${result.updated} · 未变 ${result.unchanged} · 未匹配 ${result.notFound}`,
    );
    setTimeout(() => setSyncResult(null), 6000);
  };

  return (
    <div className="space-y-8 pb-8">
      <Hero
        totalCount={items.length}
        onAddClick={onAddClick}
        onBulkImportClick={onBulkImportClick}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedGenre={selectedGenre}
        onGenreChange={setSelectedGenre}
        genres={allGenres}
        resultCount={filteredItems.length}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold text-ink">我的动漫墙</h2>
        <div className="flex flex-wrap items-center gap-3">
          {user && (
            <>
              {syncResult && (
                <span className="text-xs text-stone">{syncResult}</span>
              )}
              <button
                type="button"
                onClick={handleSync}
                className="btn-ghost text-xs"
                title="从知识库同步标签和名称（保留封面和排序）"
              >
                <Database className="h-3.5 w-3.5" />
                同步知识库
              </button>
              <FetchCoversButton items={items} onUpdate={updateItem} />
              <BackupTools onExport={exportData} onImport={importData} />
            </>
          )}
          <div className="flex rounded-xl bg-ink/5 p-1">
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={`rounded-lg p-2 transition-colors ${
                viewMode === "card"
                  ? "bg-white text-coral shadow-sm"
                  : "text-stone hover:text-ink"
              }`}
              aria-label="卡片视图"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded-lg p-2 transition-colors ${
                viewMode === "list"
                  ? "bg-white text-coral shadow-sm"
                  : "text-stone hover:text-ink"
              }`}
              aria-label="列表视图"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <AnimeGrid
        items={filteredItems}
        onDelete={user ? removeItem : undefined}
        onReorder={user ? handleReorder : undefined}
        onAnimeClick={setSelectedAnime}
        viewMode={viewMode}
      />

      <AnimeDetailModal
        anime={selectedAnime}
        isOpen={selectedAnime !== null}
        onClose={() => setSelectedAnime(null)}
      />
    </div>
  );
}
