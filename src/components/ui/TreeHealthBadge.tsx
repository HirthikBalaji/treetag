"use client";

import React from "react";

interface TreeHealthBadgeProps {
  status: "HEALTHY" | "GOOD" | "MODERATE" | "POOR" | "CRITICAL" | string;
  size?: "sm" | "md" | "lg";
  showDotOnly?: boolean;
}

export function TreeHealthBadge({
  status,
  size = "md",
  showDotOnly = false,
}: TreeHealthBadgeProps) {
  const norm = status?.toUpperCase() || "HEALTHY";

  const config: Record<
    string,
    { label: string; dotClass: string; badgeClass: string; icon: string }
  > = {
    HEALTHY: {
      label: "Healthy",
      dotClass: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
      badgeClass:
        "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
      icon: "🟢",
    },
    GOOD: {
      label: "Good Condition",
      dotClass: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]",
      badgeClass:
        "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/60 dark:text-green-300 dark:border-green-800",
      icon: "🟢",
    },
    MODERATE: {
      label: "Needs Monitoring",
      dotClass: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
      badgeClass:
        "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
      icon: "🟡",
    },
    POOR: {
      label: "Poor / Stressed",
      dotClass: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]",
      badgeClass:
        "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800",
      icon: "🟠",
    },
    CRITICAL: {
      label: "Critical Condition",
      dotClass: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse",
      badgeClass:
        "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800",
      icon: "🔴",
    },
  };

  const item = config[norm] || config.HEALTHY;

  if (showDotOnly) {
    return (
      <span
        title={item.label}
        className={`inline-block rounded-full ${
          size === "sm" ? "w-2 h-2" : size === "lg" ? "w-3.5 h-3.5" : "w-2.5 h-2.5"
        } ${item.dotClass}`}
      />
    );
  }

  const sizeClasses =
    size === "sm"
      ? "text-xs px-2 py-0.5 gap-1.5"
      : size === "lg"
      ? "text-sm px-3.5 py-1.5 gap-2"
      : "text-xs px-2.5 py-1 gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors ${sizeClasses} ${item.badgeClass}`}
    >
      <span
        className={`rounded-full shrink-0 ${
          size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"
        } ${item.dotClass}`}
      />
      <span>{item.label}</span>
    </span>
  );
}
