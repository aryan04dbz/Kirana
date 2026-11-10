import React, { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { GroceryItemPreview, HealthInfo, UserSetting } from "./types";

const INITIAL_ITEMS: GroceryItemPreview[] = [
  {
    id: "item-1",
    name: "Amul Taaza Toned Milk",
    category: "Dairy",
    unit: "L",
    daysRemaining: 1,
    status: "due",
    stage: "learning",
    unopenedCount: 0,
  },
  {
    id: "item-2",
    name: "Farm Fresh Brown Eggs (6 pack)",
    category: "Dairy & Eggs",
    unit: "pack",
    daysRemaining: 2,
    status: "low",
    stage: "assisted",
    unopenedCount: 1,
  },
  {
    id: "item-3",
    name: "Modern Brown Bread (400g)",
    category: "Bakery",
    unit: "pack",
    daysRemaining: 1,
    status: "due",
    stage: "learning",
    unopenedCount: 0,
  },
  {
    id: "item-4",
    name: "Aashirvaad Shudh Chakki Atta (5kg)",
    category: "Staples",
    unit: "kg",
    daysRemaining: 6,
    status: "plenty",
    stage: "auto",
    unopenedCount: 1,
  },
  {
    id: "item-5",
    name: "Tata Tea Gold (500g)",
    category: "Beverages",
    unit: "pack",
    daysRemaining: 12,
    status: "plenty",
    stage: "auto",
    unopenedCount: 2,
  },
  {
    id: "item-6",
    name: "Red Onions (1kg)",
    category: "Produce",
    unit: "kg",
    daysRemaining: 2,
    status: "low",
    stage: "assisted",
    unopenedCount: 0,
  },
];

export const App: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      localStorage.getItem("kirana-theme") === "dark" ||
      (!localStorage.getItem("kirana-theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  const [health, setHealth] = useState<HealthInfo | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<UserSetting[]>([
    { user_id: "default_user", key: "lookahead_hours", value: "48" },
    { user_id: "default_user", key: "min_order_value", value: "199" },
    { user_id: "default_user", key: "review_buffer_days", value: "2" },
    { user_id: "default_user", key: "max_extend_days", value: "7" },
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync dark class on root html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("kirana-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("kirana-theme", "light");
    }
  }, [isDark]);

  // Fetch backend health and settings
  useEffect(() => {
    const fetchBackendData = async () => {
      setHealthLoading(true);
      try {
        const healthRes = await fetch("http://127.0.0.1:9000/health");
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setHealth(healthData);
        }

        const settingsRes = await fetch(
          "http://127.0.0.1:9000/api/v1/settings?user_id=default_user"
        );
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (Array.isArray(settingsData) && settingsData.length > 0) {
            setSettings(settingsData);
          }
        }
      } catch {
        // Fallback gracefully if backend is not currently running
        setHealth(null);
      } finally {
        setHealthLoading(false);
      }
    };

    fetchBackendData();
  }, []);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Header
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        health={health}
        loading={healthLoading}
      />

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Dashboard
          items={INITIAL_ITEMS}
          settings={settings}
          onActionToast={showToast}
        />
      </main>

      {/* Floating Action Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl ring-1 ring-white/10 transition-all dark:bg-slate-100 dark:text-slate-900">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
