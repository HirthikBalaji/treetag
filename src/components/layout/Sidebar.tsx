"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Trees,
  PlusCircle,
  Smartphone,
  BarChart3,
  FolderKanban,
  Activity,
  Shield,
  Download,
  Leaf,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "GIS Canopy Map", href: "/map", icon: MapPin },
    { label: "Tree Registry", href: "/trees", icon: Trees },
    { label: "Register Specimen", href: "/trees/new", icon: PlusCircle, highlight: true },
    { label: "Field Survey Mode", href: "/field", icon: Smartphone },
    { label: "Biodiversity Insights", href: "/analytics", icon: BarChart3 },
    { label: "Survey Projects", href: "/projects", icon: FolderKanban },
    { label: "Audit Timeline", href: "/activity", icon: Activity },
    { label: "Admin & Settings", href: "/admin", icon: Shield },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between border-r border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Workspaces & Survey
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-emerald-800 text-white shadow-sm shadow-emerald-950/20"
                      : item.highlight
                      ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/60"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? "text-white"
                        : item.highlight
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-stone-400 group-hover:text-stone-600"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Spatial Quick Export widget */}
        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-semibold text-xs mb-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>GIS Quick Export</span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-2.5 leading-relaxed">
            Download tree registry points for QGIS, ArcGIS, or CAD.
          </p>
          <div className="flex items-center gap-2">
            <a
              href="/api/export/geojson"
              download
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold transition-colors shadow-2xs"
            >
              <Download className="w-3 h-3" />
              <span>GeoJSON</span>
            </a>
            <a
              href="/api/export/csv"
              download
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 text-stone-700 dark:text-stone-200 text-[11px] font-semibold transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>CSV</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer system status */}
      <div className="pt-4 border-t border-stone-100 dark:border-stone-800/80">
        <div className="flex items-center justify-between text-[11px] text-stone-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PostGIS Active</span>
          </span>
          <span className="font-mono text-[10px]">WGS84</span>
        </div>
      </div>
    </aside>
  );
}
