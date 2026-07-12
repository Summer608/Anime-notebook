import { Plus } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface FloatingAddButtonProps {
  onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  const { user } = useAuthStore();
  if (!user) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-coral text-white shadow-lift transition-transform hover:scale-105 active:scale-95 sm:hidden"
      aria-label="添加动漫"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}
