import React from "react";
import { Sun, Moon, ShoppingBag, Radio } from "lucide-react";
import { HealthInfo } from "../types";

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  health: HealthInfo | null;
  loading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  health,
  loading,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kirana-600 text-white shadow-md shadow-kirana-600/20">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Kirana
                <span className="text-kirana-600 dark:text-kirana-500">AI</span>
              </span>
              <span className="dark:bg-kirana-950 dark:text-kirana-400 rounded-full bg-kirana-100 px-2 py-0.5 text-xs font-semibold text-kirana-800">
                v0.1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Run-out prediction &amp; cart auto-fill
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Health indicator badge */}
          <div
            className={`hidden items-center space-x-1.5 rounded-full border px-2.5 py-1 text-xs font-medium sm:flex ${
              loading
                ? "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400"
                : health?.status === "ok"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-400"
                  : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-400"
            }`}
          >
            <Radio className={`h-3 w-3 ${loading ? "animate-pulse" : ""}`} />
            <span>
              {loading
                ? "Checking API..."
                : health?.status === "ok"
                  ? "Backend Connected"
                  : "API Offline"}
            </span>
          </div>

          {/* Theme toggle button */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 active:scale-95 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
