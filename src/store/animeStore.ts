import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AnimeItem, SortOption, ViewMode } from "@/types";
import { findExactAnime, generateDoubanUrl } from "@/data/animeKnowledge";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

export const isSupabaseConfigured =
  !!import.meta.env.VITE_SUPABASE_URL &&
  !import.meta.env.VITE_SUPABASE_URL.includes("your-project-ref") &&
  !!import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_ANON_KEY !== "your-anon-key";

interface AnimeItemRow {
  id: string;
  display_name: string;
  original_input: string;
  genres: string[];
  cover_url: string | null;
  douban_url: string;
  sort_order: number;
  created_at: number;
  updated_at: number;
}

function rowToItem(row: AnimeItemRow): AnimeItem {
  return {
    id: row.id,
    displayName: row.display_name,
    originalInput: row.original_input,
    genres: row.genres || [],
    coverUrl: row.cover_url ?? undefined,
    doubanUrl: row.douban_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function itemToRow(item: AnimeItem, sortOrder?: number): AnimeItemRow {
  return {
    id: item.id,
    display_name: item.displayName,
    original_input: item.originalInput,
    genres: item.genres,
    cover_url: item.coverUrl ?? null,
    douban_url: item.doubanUrl,
    sort_order: sortOrder ?? item.createdAt,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

function updatesToRow(updates: Partial<AnimeItem>): Partial<AnimeItemRow> {
  const row: Partial<AnimeItemRow> = {};
  if (updates.displayName !== undefined) row.display_name = updates.displayName;
  if (updates.originalInput !== undefined) row.original_input = updates.originalInput;
  if (updates.genres !== undefined) row.genres = updates.genres;
  if (updates.coverUrl !== undefined) row.cover_url = updates.coverUrl ?? null;
  if (updates.doubanUrl !== undefined) row.douban_url = updates.doubanUrl;
  if (updates.updatedAt !== undefined) row.updated_at = updates.updatedAt;
  return row;
}

function canWriteCloud(): boolean {
  return isSupabaseConfigured && !!useAuthStore.getState().user;
}

function syncOrderToCloud(items: AnimeItem[]) {
  if (!canWriteCloud()) return;
  const now = Date.now();
  const rows: AnimeItemRow[] = items.map((item, index) => ({
    id: item.id,
    display_name: item.displayName,
    original_input: item.originalInput,
    genres: item.genres,
    cover_url: item.coverUrl ?? null,
    douban_url: item.doubanUrl,
    sort_order: index,
    created_at: item.createdAt,
    updated_at: now,
  }));
  supabase
    .from("anime_items")
    .upsert(rows)
    .then(({ error }) => {
      if (error) console.error("Supabase order sync error:", error);
    });
}

interface AnimeState {
  items: AnimeItem[];
  searchQuery: string;
  selectedGenre: string | null;
  sortBy: SortOption;
  viewMode: ViewMode;
  isLoadingCloud: boolean;
  addItem: (item: Omit<AnimeItem, "id" | "createdAt" | "updatedAt">) => void;
  addItems: (items: Omit<AnimeItem, "id" | "createdAt" | "updatedAt">[]) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<AnimeItem>) => void;
  reorderItems: (sourceId: string, targetId: string) => void;
  commitOrder: (orderedIds: string[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedGenre: (genre: string | null) => void;
  setSortBy: (sort: SortOption) => void;
  setViewMode: (mode: ViewMode) => void;
  syncFromKnowledge: () => { updated: number; unchanged: number; notFound: number };
  exportData: () => string;
  importData: (json: string) => void;
  loadFromSupabase: () => Promise<number>;
  migrateLocalData: () => Promise<number>;
}

const STORAGE_KEY = "anime-collection";

export const useAnimeStore = create<AnimeState>()(
  persist(
    (set, get) => ({
      items: [],
      searchQuery: "",
      selectedGenre: null,
      sortBy: "oldest",
      viewMode: "card",
      isLoadingCloud: false,

      addItem: (item) => {
        const now = Date.now();
        const newItem: AnimeItem = {
          ...item,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ items: [newItem, ...state.items] }));
        if (canWriteCloud()) {
          syncOrderToCloud(get().items);
        }
      },

      addItems: (items) => {
        const now = Date.now();
        const newItems: AnimeItem[] = items.map((item, index) => ({
          ...item,
          id: crypto.randomUUID(),
          createdAt: now + index,
          updatedAt: now + index,
        }));
        set((state) => ({ items: [...newItems, ...state.items] }));
        if (canWriteCloud()) {
          syncOrderToCloud(get().items);
        }
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
        if (canWriteCloud()) {
          supabase
            .from("anime_items")
            .delete()
            .eq("id", id)
            .then(({ error }) => {
              if (error) console.error("Supabase delete error:", error);
            });
        }
      },

      updateItem: (id, updates) => {
        const updatedAt = Date.now();
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates, updatedAt } : item,
          ),
        }));
        if (canWriteCloud()) {
          const rowUpdates = updatesToRow({ ...updates, updatedAt });
          supabase
            .from("anime_items")
            .update(rowUpdates)
            .eq("id", id)
            .then(({ error }) => {
              if (error) console.error("Supabase update error:", error);
            });
        }
      },

      reorderItems: (sourceId, targetId) => {
        set((state) => {
          const items = [...state.items];
          const sourceIndex = items.findIndex((item) => item.id === sourceId);
          const targetIndex = items.findIndex((item) => item.id === targetId);
          if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
            return {};
          }
          const [moved] = items.splice(sourceIndex, 1);
          items.splice(targetIndex, 0, moved);
          return { items, sortBy: "manual" };
        });
        syncOrderToCloud(get().items);
      },

      commitOrder: (orderedIds) => {
        set((state) => {
          const idSet = new Set(orderedIds);
          const ordered = orderedIds
            .map((id) => state.items.find((item) => item.id === id))
            .filter((item): item is AnimeItem => item !== undefined);
          const remaining = state.items.filter((item) => !idSet.has(item.id));
          return { items: [...ordered, ...remaining], sortBy: "manual" };
        });
        syncOrderToCloud(get().items);
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedGenre: (genre) => set({ selectedGenre: genre }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setViewMode: (mode) => set({ viewMode: mode }),

      syncFromKnowledge: () => {
        let updated = 0;
        let unchanged = 0;
        let notFound = 0;

        set((state) => ({
          items: state.items.map((item) => {
            const match =
              findExactAnime(item.originalInput) ||
              findExactAnime(item.displayName);
            if (!match) {
              notFound++;
              return item;
            }

            const newGenres = [...match.genres];
            const newDisplayName = match.fullName;
            const newDoubanUrl = generateDoubanUrl(newDisplayName);

            const isSame =
              JSON.stringify(item.genres) === JSON.stringify(newGenres) &&
              item.displayName === newDisplayName &&
              item.doubanUrl === newDoubanUrl;

            if (isSame) {
              unchanged++;
              return item;
            }

            updated++;
            return {
              ...item,
              displayName: newDisplayName,
              genres: newGenres,
              doubanUrl: newDoubanUrl,
              updatedAt: Date.now(),
            };
          }),
        }));

        if (canWriteCloud()) {
          const items = get().items;
          const rows = items.map((item, index) => itemToRow(item, index));
          supabase
            .from("anime_items")
            .upsert(rows)
            .then(({ error }) => {
              if (error) console.error("Supabase sync error:", error);
            });
        }

        return { updated, unchanged, notFound };
      },

      exportData: () => JSON.stringify(get().items, null, 2),

      importData: (json) => {
        try {
          const parsed = JSON.parse(json) as AnimeItem[];
          if (Array.isArray(parsed)) {
            set({ items: parsed });
            if (canWriteCloud()) {
              (async () => {
                const importedIds = new Set(parsed.map((i) => i.id));
                const { data: existing } = await supabase
                  .from("anime_items")
                  .select("id");
                const toDelete = (existing || [])
                  .filter((r) => !importedIds.has(r.id))
                  .map((r) => r.id);
                if (toDelete.length > 0) {
                  const { error: delError } = await supabase
                    .from("anime_items")
                    .delete()
                    .in("id", toDelete);
                  if (delError) console.error("Supabase delete error:", delError);
                }
                const rows = parsed.map((item, index) => itemToRow(item, index));
                const { error } = await supabase.from("anime_items").upsert(rows);
                if (error) console.error("Supabase import error:", error);
              })();
            }
          }
        } catch {
          console.error("导入数据失败：JSON 格式不正确");
        }
      },

      loadFromSupabase: async () => {
        if (!isSupabaseConfigured) return 0;
        set({ isLoadingCloud: true });
        try {
          const result = await Promise.race([
            supabase.from("anime_items").select("*").order("sort_order", { ascending: true }),
            new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), 8000)),
          ]);
          if (result === "timeout") {
            console.warn("Supabase load timeout, using local data");
            return -1;
          }
          if (!result || !("data" in result)) return -1;
          const { data, error } = result;
          if (error) {
            console.error("Supabase load error:", error);
            return -1;
          }
          if (!data || data.length === 0) return 0;
          const items = data.map(rowToItem);
          set({ items, sortBy: "manual" });
          return items.length;
        } catch {
          return -1;
        } finally {
          set({ isLoadingCloud: false });
        }
      },

      migrateLocalData: async () => {
        if (!canWriteCloud()) return 0;
        const items = get().items;
        if (items.length === 0) return 0;
        const rows = items.map((item, index) => itemToRow(item, index));
        const { error } = await supabase.from("anime_items").upsert(rows);
        if (error) {
          console.error("Supabase migrate error:", error);
          return 0;
        }
        return items.length;
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        items: state.items,
        viewMode: state.viewMode,
        sortBy: state.sortBy,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<AnimeState>;
        return {
          ...current,
          ...p,
          sortBy: p.sortBy === "manual" ? "manual" : "oldest",
        };
      },
    },
  ),
);

export function filterAndSortItems(
  items: AnimeItem[],
  searchQuery: string,
  selectedGenre: string | null,
  sortBy: SortOption,
): AnimeItem[] {
  const query = searchQuery.trim().toLowerCase();

  let result = items.filter((item) => {
    const matchesSearch =
      !query ||
      item.displayName.toLowerCase().includes(query) ||
      item.originalInput.toLowerCase().includes(query) ||
      item.genres.some((genre) => genre.toLowerCase().includes(query));

    const matchesGenre = !selectedGenre || item.genres.includes(selectedGenre);

    return matchesSearch && matchesGenre;
  });

  result = [...result];
  switch (sortBy) {
    case "oldest":
      result.sort((a, b) => a.createdAt - b.createdAt);
      break;
    case "manual":
      break;
  }

  return result;
}

export function getAllGenres(items: AnimeItem[]): string[] {
  const genreSet = new Set<string>();
  items.forEach((item) => item.genres.forEach((genre) => genreSet.add(genre)));
  return Array.from(genreSet).sort((a, b) => a.localeCompare(b, "zh-CN"));
}
