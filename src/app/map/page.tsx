"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MapLibreMap } from "@/components/maps/MapLibreMap";
import { TreeHealthBadge } from "@/components/ui/TreeHealthBadge";
import Link from "next/link";
import {
  Filter,
  PlusCircle,
  ExternalLink,
  Layers,
  Sparkles,
  TreePine,
  X,
  Compass,
} from "lucide-react";

export default function FullscreenMapPage() {
  const [trees, setTrees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHealth, setSelectedHealth] = useState("ALL");
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    async function loadTrees() {
      try {
        const params = new URLSearchParams({ limit: "all" });
        if (selectedHealth !== "ALL") params.set("healthStatus", selectedHealth);
        const res = await fetch(`/api/trees?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setTrees(data.trees || []);
        }
      } catch (err) {
        console.error("Map trees load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTrees();
  }, [selectedHealth]);

  const mapPoints = trees.map((t) => ({
    id: t.id,
    treeCode: t.treeCode,
    commonName: t.commonName,
    scientificName: t.scientificName,
    healthStatus: t.healthStatus,
    latitude: t.latitude,
    longitude: t.longitude,
    height: t.height,
    dbh: t.dbh,
    photoUrl: t.photos?.[0]?.fileUrl,
    projectName: t.project?.name,
  }));

  const inspectedTree = trees.find((t) => t.id === selectedTreeId);

  return (
    <AppLayout hideSidebar={false}>
      <div className="relative h-[calc(100vh-8rem)] rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm animate-in fade-in duration-200">
        {/* Floating Top Controls */}
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
          <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-md flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-stone-900 dark:text-white">
              {trees.length} Canopies Plotted
            </span>
          </div>

          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-md p-2 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-md text-stone-700 dark:text-stone-300 hover:bg-white transition-colors"
            title="Filter Map Layers"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {trees.length === 0 && !loading && (
          <div className="absolute top-4 right-4 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-xl flex items-center gap-3 animate-in fade-in duration-200">
            <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">
              No specimens in registry yet.
            </span>
            <Link
              href="/trees/new"
              className="px-3 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all"
            >
              + Add Tree
            </Link>
          </div>
        )}

        {/* Filter Drawer */}
        {filterDrawerOpen && (
          <div className="absolute top-16 left-4 z-30 w-64 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Health Condition Layer
              </span>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              {[
                { id: "ALL", label: "Show All Conditions" },
                { id: "HEALTHY", label: "🟢 Healthy Only" },
                { id: "GOOD", label: "🟢 Good Condition" },
                { id: "MODERATE", label: "🟡 Needs Monitoring" },
                { id: "POOR", label: "🟠 Poor Condition" },
                { id: "CRITICAL", label: "🔴 Critical Specimens" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedHealth(opt.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedHealth === opt.id
                      ? "bg-emerald-700 text-white"
                      : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MapLibre Map Canvas */}
        <MapLibreMap
          trees={mapPoints}
          height="100%"
          center={[80.2707, 13.0827]}
          zoom={13.8}
          selectedTreeId={selectedTreeId}
          onTreeSelect={(id) => setSelectedTreeId(id)}
        />

        {/* Inspected Tree Bottom Drawer */}
        {inspectedTree && (
          <div className="absolute bottom-4 right-4 z-30 max-w-sm w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xl p-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
                  {inspectedTree.photos?.[0]?.fileUrl ? (
                    <img
                      src={inspectedTree.photos[0].fileUrl}
                      alt={inspectedTree.commonName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">
                      🌳
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                      {inspectedTree.treeCode}
                    </span>
                    <TreeHealthBadge status={inspectedTree.healthStatus} size="sm" />
                  </div>
                  <h4 className="font-bold text-sm text-stone-900 dark:text-white truncate">
                    {inspectedTree.commonName}
                  </h4>
                  <p className="text-xs italic text-stone-500 truncate">
                    {inspectedTree.scientificName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTreeId(null)}
                className="text-stone-400 hover:text-stone-600 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-400">
              <div>
                <span className="block text-[10px] text-stone-400">Height / DBH</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  {inspectedTree.height || "—"}m / {inspectedTree.dbh || "—"}cm
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-stone-400">Coordinates</span>
                <span className="font-mono text-[10px] truncate block text-stone-800 dark:text-stone-200">
                  {inspectedTree.latitude.toFixed(4)}, {inspectedTree.longitude.toFixed(4)}
                </span>
              </div>
            </div>

            <div className="mt-3">
              <Link
                href={`/trees/${inspectedTree.id}`}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors"
              >
                <span>Open Tree Dossier</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
