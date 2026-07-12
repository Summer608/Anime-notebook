import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Tags, BookOpen, Upload, LogIn, LogOut, ChevronDown, Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

interface HeaderProps {
  onAddClick: () => void;
  onBulkImportClick: () => void;
}

const navItems = [
  { to: "/", label: "动漫墙", icon: LayoutGrid },
  { to: "/categories", label: "分类", icon: Tags },
];

export function Header({ onAddClick, onBulkImportClick }: HeaderProps) {
  const location = useLocation();
  const { user, signInWithGitHub, signInWithGoogle, signOut } = useAuthStore();
  const [loginOpen, setLoginOpen] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
        setLoginOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userEmail = user?.email ?? "";
  const userInitial = userEmail.charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-paper/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-ink">
          <BookOpen className="h-6 w-6 text-coral" />
          <span className="font-display text-lg font-bold">番剧手帐</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-ink text-white"
                    : "text-ink hover:bg-ink/5",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden items-center gap-2 sm:flex">
                <button
                  type="button"
                  onClick={onBulkImportClick}
                  className="btn-ghost py-2.5"
                  title="批量导入"
                >
                  <Upload className="h-4 w-4" />
                  批量导入
                </button>
                <button type="button" onClick={onAddClick} className="btn-primary">
                  添加动漫
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-coral text-sm font-bold text-white"
                  title={userEmail}
                >
                  {userInitial}
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  className="btn-ghost p-2"
                  title="登出"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div ref={loginRef} className="relative">
              <button
                type="button"
                onClick={() => setLoginOpen((v) => !v)}
                className="btn-primary flex items-center gap-1.5"
              >
                <LogIn className="h-4 w-4" />
                登录
                <ChevronDown className="h-3 w-3" />
              </button>
              {loginOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-lift">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginOpen(false);
                      signInWithGitHub();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-ink transition-colors hover:bg-ink/5"
                  >
                    <Github className="h-4 w-4" />
                    GitHub 登录
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginOpen(false);
                      signInWithGoogle();
                    }}
                    className="flex w-full items-center gap-2 border-t border-ink/5 px-4 py-3 text-left text-sm text-ink transition-colors hover:bg-ink/5"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google 登录
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
