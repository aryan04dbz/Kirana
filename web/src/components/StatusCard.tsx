import React from "react";
import { GroceryItemPreview } from "../types";
import { Check, Plus, AlertTriangle, Clock } from "lucide-react";

interface StatusCardProps {
  item: GroceryItemPreview;
  onFinished: (id: string) => void;
  onOpenedNext: (id: string) => void;
  onRestocked: (id: string) => void;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  item,
  onFinished,
  onOpenedNext,
  onRestocked,
}) => {
  const getStatusBadge = () => {
    switch (item.status) {
      case "due":
        return {
          bg: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-900",
          ring: "text-rose-500",
          label: "Due <24h",
        };
      case "low":
        return {
          bg: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-900",
          ring: "text-amber-500",
          label: "Running Low",
        };
      default:
        return {
          bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
          ring: "text-emerald-500",
          label: "Plenty Left",
        };
    }
  };

  const statusStyle = getStatusBadge();

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {item.category}
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {item.name}
            </h3>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyle.bg}`}
          >
            {item.status === "due" && (
              <AlertTriangle className="mr-1 h-3 w-3" />
            )}
            {item.status === "low" && <Clock className="mr-1 h-3 w-3" />}
            {statusStyle.label}
          </span>
        </div>

        {/* Prediction summary */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Predicted Run-out
            </div>
            <div className="text-base font-semibold text-slate-800 dark:text-slate-100">
              {item.daysRemaining <= 0
                ? "Today / Depleted"
                : `in ~${item.daysRemaining} days`}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Stock
            </div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {item.unopenedCount} unopened
            </div>
          </div>
        </div>
      </div>

      {/* One-tap action buttons (per Spec A6) */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <button
          onClick={() => onFinished(item.id)}
          className="flex h-11 items-center justify-center rounded-xl bg-slate-100 text-xs font-medium text-slate-700 transition hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          title="Mark current pack as finished"
        >
          <Check className="mr-1 h-3.5 w-3.5 text-rose-500" />
          Finished
        </button>
        <button
          onClick={() => onOpenedNext(item.id)}
          className="flex h-11 items-center justify-center rounded-xl bg-slate-100 text-xs font-medium text-slate-700 transition hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          title="Open next unopened pack"
        >
          <Plus className="mr-1 h-3.5 w-3.5 text-blue-500" />
          Open Next
        </button>
        <button
          onClick={() => onRestocked(item.id)}
          className="dark:bg-kirana-950/50 dark:text-kirana-300 border-kirana-200 flex h-11 items-center justify-center rounded-xl border bg-kirana-50 text-xs font-medium text-kirana-700 transition hover:bg-kirana-100 active:scale-95 dark:border-kirana-900 dark:hover:bg-kirana-900/50"
          title="Add restocked pack"
        >
          <Plus className="dark:text-kirana-400 mr-1 h-3.5 w-3.5 text-kirana-600" />
          Restocked
        </button>
      </div>
    </div>
  );
};
