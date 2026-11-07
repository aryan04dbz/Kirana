import React from "react";
import { GroceryItemPreview, UserSetting } from "../types";
import { StatusCard } from "./StatusCard";
import {
  ShoppingCart,
  Sparkles,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";

interface DashboardProps {
  items: GroceryItemPreview[];
  settings: UserSetting[];
  onActionToast: (msg: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  items,
  settings,
  onActionToast,
}) => {
  const dueItems = items.filter((i) => i.status === "due");
  const lowItems = items.filter((i) => i.status === "low");

  const minOrderVal =
    settings.find((s) => s.key === "min_order_value")?.value || "199";
  const lookaheadHrs =
    settings.find((s) => s.key === "lookahead_hours")?.value || "48";

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Due Batch Alert */}
      <section className="shadow-kirana-950/10 relative overflow-hidden rounded-3xl bg-gradient-to-br from-kirana-600 to-emerald-800 p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Smart Threshold Restock Active</span>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {dueItems.length > 0
                ? `${dueItems.length} essential items due for restock`
                : "All tracked grocery items well-stocked"}
            </h2>
            <p className="mt-1 text-sm text-emerald-100">
              Lookahead window is {lookaheadHrs}h with a minimum cart threshold
              of ₹{minOrderVal}.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() =>
                onActionToast("Draft order review ready in Phase 4!")
              }
              className="flex items-center rounded-2xl bg-white px-5 py-3 text-sm font-bold text-kirana-800 shadow-md transition hover:bg-emerald-50 active:scale-95"
            >
              <ShoppingCart className="mr-2 h-4 w-4 text-kirana-700" />
              Review Draft Cart
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Tracked
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {items.length}
          </div>
          <div className="text-xs text-slate-400">Household essentials</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Due &lt;24h
          </div>
          <div className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {dueItems.length}
          </div>
          <div className="text-xs text-rose-500">Critical restock</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Running Low
          </div>
          <div className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {lowItems.length}
          </div>
          <div className="text-xs text-amber-500">Next 1–2 days</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Threshold Min
          </div>
          <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ₹{minOrderVal}
          </div>
          <div className="text-xs text-slate-400">Free delivery goal</div>
        </div>
      </section>

      {/* Grocery Items Shelf */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Pantry &amp; Fridge Items
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              One-tap logs to train adaptive ML predictions
            </p>
          </div>
          <div className="text-xs font-medium text-slate-400">
            Showing {items.length} items
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <StatusCard
              key={item.id}
              item={item}
              onFinished={() =>
                onActionToast(`Marked ${item.name} as Finished`)
              }
              onOpenedNext={() =>
                onActionToast(`Opened next pack for ${item.name}`)
              }
              onRestocked={() =>
                onActionToast(`Restocked new pack for ${item.name}`)
              }
            />
          ))}
        </div>
      </section>

      {/* Scoped Configuration Inspector */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
          <SlidersHorizontal className="h-4 w-4 text-kirana-600" />
          <span>Active Scoped Settings (User: default_user)</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {settings.map((s) => (
            <div
              key={s.key}
              className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/50"
            >
              <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {s.key}
              </div>
              <div className="mt-0.5 font-semibold text-slate-800 dark:text-slate-100">
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
