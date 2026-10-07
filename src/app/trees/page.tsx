"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  PlusCircle,
  Table,
  Columns2,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Trees,
  CheckSquare,
  Square,
  Sparkles,
  MapPin,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { TreeHealthBadge } from "@/components/ui/TreeHealthBadge";
import { MapLibreMap } from "@/components/maps/MapLibreMap";
import { formatCoordinates } from "@/lib/geo";
import { useToast } from "@/components/providers/ToastProvider";

export default function TreesRegistryPage() {
  const { toast } = useToast();
  const [trees, setTrees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [speciesList, setSpeciesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [search, setSearch] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedHealth, setSelectedHealth] = useState("ALL");
  const [selectedRisk, setSelectedRisk] = useState("ALL");
  const [selectedProject, setSelectedProject] = useState("ALL");
  const [nativeOnly, setNativeOnly] = useState(false);
  const [inspectionDueOnly, setInspectionDueOnly] = useState(false);

  // View mode: 'split' | 'table' | 'grid'
  const [viewMode, setViewMode] = useState<"split" | "table" | "grid">("split");
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);

  // Bulk selection
  const [selectedTreeIds, setSelectedTreeIds] = useState<string[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch trees with active filters
  const fetchTrees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedSpecies) params.set("species", selectedSpecies);
      if (selectedHealth !== "ALL") params.set("healthStatus", selectedHealth);
      if (selectedRisk !== "ALL") params.set("riskLevel", selectedRisk);
      if (selectedProject !== "ALL") params.set("projectId", selectedProject);
      if (nativeOnly) params.set("nativeStatus", "true");
      if (inspectionDueOnly) params.set("inspectionDue", "true");
      params.set("page", page.toString());
      params.set("limit", viewMode === "split" ? "40" : "20");

      const res = await fetch(`/api/trees?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTrees(data.trees || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
        if (data.trees?.length > 0 && !selectedTreeId) {
          setSelectedTreeId(data.trees[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load trees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadMeta() {
      try {
        const [pRes, sRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/species"),
        ]);
        if (pRes.ok) setProjects((await pRes.json()).projects || []);
        if (sRes.ok) setSpeciesList((await sRes.json()).species || []);
      } catch {}
    }
    loadMeta();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTrees();
    }, 200);
    return () => clearTimeout(timer);
  }, [
    search,
    selectedSpecies,
    selectedHealth,
    selectedRisk,
    selectedProject,
    nativeOnly,
    inspectionDueOnly,
    page,
    viewMode,
  ]);

  // Bulk selection toggles
  const toggleSelectAll = () => {
    if (selectedTreeIds.length === trees.length) {
      setSelectedTreeIds([]);
    } else {
      setSelectedTreeIds(trees.map((t) => t.id));
    }
  };

  const toggleSelectTree = (id: string) => {
    setSelectedTreeIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

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

  return (
    <AppLayout>
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Canopy Catalog
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs text-stone-500 font-medium">
                {totalCount} Geotagged Specimens
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white">
              Tree Registry & Geospatial Index
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <button
                onClick={() => setViewMode("split")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "split"
                    ? "bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                    : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                }`}
                title="Split View (List + Interactive Map)"
              >
                <Columns2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "table"
                    ? "bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                    : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                }`}
                title="Full Data Table"
              >
                <Table className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                    : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                }`}
                title="Grid Cards"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <Link
              href="/trees/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Tree</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search tree ID (TR-000001), species, family, notes..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white outline-none focus:border-emerald-500"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Health Filter */}
            <select
              value={selectedHealth}
              onChange={(e) => {
                setSelectedHealth(e.target.value);
                setPage(1);
              }}
              className="text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 font-medium text-stone-800 dark:text-stone-200 outline-none"
            >
              <option value="ALL">All Health Conditions</option>
              <option value="HEALTHY">🟢 Healthy</option>
              <option value="GOOD">🟢 Good</option>
              <option value="MODERATE">🟡 Moderate</option>
              <option value="POOR">🟠 Poor</option>
              <option value="CRITICAL">🔴 Critical</option>
            </select>

            {/* Project Filter */}
            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setPage(1);
              }}
              className="text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 font-medium text-stone-800 dark:text-stone-200 outline-none"
            >
              <option value="ALL">All Survey Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-100 dark:border-stone-800 text-xs">
            <span className="text-stone-400 text-[11px] font-semibold uppercase">
              Quick Filters:
            </span>
            <button
              onClick={() => setNativeOnly(!nativeOnly)}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium text-[11px] ${
                nativeOnly
                  ? "bg-emerald-700 text-white"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
              }`}
            >
              🌿 Native Species Only
            </button>
            <button
              onClick={() => setInspectionDueOnly(!inspectionDueOnly)}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium text-[11px] ${
                inspectionDueOnly
                  ? "bg-amber-600 text-white"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
              }`}
            >
              ⚠️ Inspections Due
            </button>

            {/* Bulk actions bar if items are selected */}
            {selectedTreeIds.length > 0 && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  {selectedTreeIds.length} Selected
                </span>
                <a
                  href="/api/export/geojson"
                  download
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Export GeoJSON
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Content Views */}
        {viewMode === "split" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Synchronized Tree List */}
            <div className="lg:col-span-6 space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              {trees.length === 0 && !loading && (
                <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
                    <Trees className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                      No tree specimens found
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                      Your tree registry is currently empty or no records match your filter criteria.
                    </p>
                  </div>
                  <div className="flex items-center justify-center pt-1">
                    <Link
                      href="/trees/new"
                      className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                    >
                      + Register Specimen
                    </Link>
                  </div>
                </div>
              )}

              {trees.map((t) => {
                const isSelected = selectedTreeId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTreeId(t.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-xs"
                        : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Thumbnail photo */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200 dark:border-stone-700">
                        {t.photos?.[0]?.fileUrl ? (
                          <img
                            src={t.photos[0].fileUrl}
                            alt={t.commonName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            🌳
                          </div>
                        )}
                      </div>

                      {/* Tree info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300">
                              {t.treeCode}
                            </span>
                          </div>
                          <TreeHealthBadge status={t.healthStatus} size="sm" />
                        </div>
                        <h4 className="font-bold text-sm text-stone-900 dark:text-white truncate">
                          {t.commonName}
                        </h4>
                        <p className="text-xs italic text-stone-500 truncate">
                          {t.scientificName}
                        </p>

                        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-stone-500">
                          <span>H: {t.height || "-"}m</span>
                          <span>DBH: {t.dbh || "-"}cm</span>
                          <span className="font-mono text-[10px] truncate">
                            {t.latitude.toFixed(4)}, {t.longitude.toFixed(4)}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/trees/${t.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-700 hover:bg-stone-100 dark:hover:bg-stone-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Synchronized GIS Map */}
            <div className="lg:col-span-6 sticky top-20">
              <MapLibreMap
                trees={mapPoints}
                height="680px"
                selectedTreeId={selectedTreeId}
                onTreeSelect={(id) => setSelectedTreeId(id)}
              />
            </div>
          </div>
        )}

        {/* Full Table View */}
        {viewMode === "table" && (
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 font-semibold text-stone-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 w-10">
                      <button onClick={toggleSelectAll} className="p-0.5">
                        {selectedTreeIds.length === trees.length && trees.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-400" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-4">Tree ID</th>
                    <th className="py-3 px-4">Specimen Details</th>
                    <th className="py-3 px-4">Health & Risk</th>
                    <th className="py-3 px-4">Dendrometrics</th>
                    <th className="py-3 px-4">Coordinates</th>
                    <th className="py-3 px-4">Survey Project</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                  {trees.length === 0 && !loading && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-stone-500">
                        <Trees className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                        <p className="font-semibold text-xs text-stone-700 dark:text-stone-300">
                          No tree specimens registered
                        </p>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Use "+ Add Tree" to register specimens and populate the registry.
                        </p>
                      </td>
                    </tr>
                  )}
                  {trees.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-stone-50/80 dark:hover:bg-stone-800/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleSelectTree(t.id)}
                          className="p-0.5 text-stone-400 hover:text-emerald-600"
                        >
                          {selectedTreeIds.includes(t.id) ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                          {t.treeCode}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                            {t.photos?.[0]?.fileUrl ? (
                              <img
                                src={t.photos[0].fileUrl}
                                alt={t.commonName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs">
                                🌳
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-stone-900 dark:text-white block">
                              {t.commonName}
                            </span>
                            <span className="italic text-stone-500 text-[11px]">
                              {t.scientificName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <TreeHealthBadge status={t.healthStatus} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-300">
                        <span>H: {t.height || "-"}m</span>
                        <span className="block text-[11px] text-stone-400">
                          DBH: {t.dbh || "-"}cm
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-stone-600 dark:text-stone-400">
                        {t.latitude.toFixed(4)}, {t.longitude.toFixed(4)}
                      </td>
                      <td className="py-3 px-4 text-stone-700 dark:text-stone-300">
                        {t.project?.name || "General"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/trees/${t.id}`}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-emerald-100 hover:text-emerald-800 text-stone-700 dark:text-stone-300 font-semibold text-[11px] transition-colors"
                        >
                          View Dossier
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
              <span>
                Showing page {page} of {totalPages} ({totalCount} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-100 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-100 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Card Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trees.length === 0 && !loading && (
              <div className="col-span-full p-12 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 text-stone-500 space-y-3">
                <Trees className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
                <div>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-white">Tree catalog is empty</h3>
                  <p className="text-xs text-stone-500 mt-1">Start by registering your first field tree specimen.</p>
                </div>
                <Link
                  href="/trees/new"
                  className="inline-block px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
                >
                  + Register Specimen
                </Link>
              </div>
            )}
            {trees.map((t) => (
              <div
                key={t.id}
                className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="h-44 w-full bg-stone-100 dark:bg-stone-800 relative">
                    {t.photos?.[0]?.fileUrl ? (
                      <img
                        src={t.photos[0].fileUrl}
                        alt={t.commonName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🌳
                      </div>
                    )}
                    <span className="absolute top-3 left-3 font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-black/70 text-white">
                      {t.treeCode}
                    </span>
                    <div className="absolute top-3 right-3">
                      <TreeHealthBadge status={t.healthStatus} size="sm" />
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div>
                      <h4 className="font-bold text-base text-stone-900 dark:text-white">
                        {t.commonName}
                      </h4>
                      <p className="text-xs italic text-stone-500">{t.scientificName}</p>
                    </div>

                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-400">
                      <div>
                        <span className="block text-[10px] text-stone-400">Height / DBH</span>
                        <span className="font-semibold">
                          {t.height}m / {t.dbh}cm
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-stone-400">Coordinates</span>
                        <span className="font-mono text-[10px]">
                          {t.latitude.toFixed(4)}, {t.longitude.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link
                    href={`/trees/${t.id}`}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-emerald-700 hover:text-white text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors"
                  >
                    <span>View Tree Dossier</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
