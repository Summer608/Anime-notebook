import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Home from "@/pages/Home";
import Categories from "@/pages/Categories";
import Recategorize from "@/pages/Recategorize";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AddAnimeModal } from "@/components/AddAnimeModal";
import { BulkImportModal } from "@/components/BulkImportModal";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { useAnimeStore, isSupabaseConfigured } from "@/store/animeStore";
import { useAuthStore } from "@/store/authStore";

export default function App() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const { addItem, addItems, loadFromSupabase, migrateLocalData } = useAnimeStore();
  const { user, loading, initAuth } = useAuthStore();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await initAuth();
      if (cancelled || !isSupabaseConfigured) return;
      const loaded = await loadFromSupabase();
      if (cancelled) return;
      if (loaded === 0 && useAnimeStore.getState().items.length > 0) {
        const migrated = await migrateLocalData();
        if (migrated > 0) {
          console.log(`已迁移 ${migrated} 条数据到云端`);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initAuth, loadFromSupabase, migrateLocalData]);

  const handleAddClick = () => {
    if (!user) return;
    setIsAddModalOpen(true);
  };

  const handleBulkImportClick = () => {
    if (!user) return;
    setIsBulkModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-coral" />
          <p className="text-sm text-stone">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex min-h-screen flex-col">
        <Header
          onAddClick={handleAddClick}
          onBulkImportClick={handleBulkImportClick}
        />

        <main className="flex-1">
          <div className="container py-8">
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    onAddClick={handleAddClick}
                    onBulkImportClick={handleBulkImportClick}
                  />
                }
              />
              <Route path="/categories" element={<Categories />} />
              <Route path="/recategorize" element={<Recategorize />} />
            </Routes>
          </div>
        </main>

        <Footer />
        <FloatingAddButton onClick={handleAddClick} />

        <AddAnimeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={addItem}
        />

        <BulkImportModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          onAddItems={addItems}
        />
      </div>
    </Router>
  );
}
