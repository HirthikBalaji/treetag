"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  PlusCircle,
  BarChart3,
  Download,
  FolderKanban,
  Activity,
  Trees,
  Smartphone,
  X,
  Sparkles,
} from "lucide-react";

interface SearchResult {
  id: string;
  treeCode: string;
  commonName: string;
  scientificName: string;
  healthStatus: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  // Listen for Cmd+K and key sequences
  useEffect(() => {
    let keyBuffer: string[] = [];
    let keyTimeout: any = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }

      // If typing in input, ignore single-letter navigation shortcuts
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key.toLowerCase() === "a") {
        e.preventDefault();
        router.push("/trees/new");
        return;
      }

      keyBuffer.push(e.key.toLowerCase());
      clearTimeout(keyTimeout);
      keyTimeout = setTimeout(() => {
        keyBuffer = [];
      }, 800);

      const seq = keyBuffer.join("");
      if (seq === "gm") {
        router.push("/map");
        keyBuffer = [];
      } else if (seq === "gt") {
        router.push("/trees");
        keyBuffer = [];
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/trees?search=${encodeURIComponent(query)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.trees || []);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(url);
  };

  const actions = [
    {
      title: "Add New Tree",
      desc: "Start 7-step guided field survey",
      icon: PlusCircle,
      badge: "A",
      url: "/trees/new",
    },
    {
      title: "GIS Interactive Map",
      desc: "Full-screen canopy map and clustering",
      icon: MapPin,
      badge: "G then M",
      url: "/map",
    },
    {
      title: "Tree Registry Table",
      desc: "Filter, search, and split-screen list",
      icon: Trees,
      badge: "G then T",
      url: "/trees",
    },
    {
      title: "Field Survey Mode",
      desc: "Touch-optimized mobile surveyor screen",
      icon: Smartphone,
      url: "/field",
    },
    {
      title: "Biodiversity Intelligence",
      desc: "Species richness and health metrics",
      icon: BarChart3,
      url: "/analytics",
    },
    {
      title: "Survey Projects",
      desc: "Campus and municipal survey areas",
      icon: FolderKanban,
      url: "/projects",
    },
    {
      title: "System Activity & Audit Trail",
      desc: "Real-time inspection and creation logs",
      icon: Activity,
      url: "/activity",
    },
    {
      title: "Export Spatial GeoJSON",
      desc: "Download full FeatureCollection for QGIS",
      icon: Download,
      url: "/api/export/geojson",
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search header */}
        <div className="flex items-center px-4 py-3.5 border-b border-stone-200 dark:border-stone-800 gap-3">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trees by code, species, or common name... (or choose action)"
            className="flex-1 bg-transparent text-sm sm:text-base outline-none text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500">
            ESC
          </span>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto p-2 divide-y divide-stone-100 dark:divide-stone-800/50">
          {query && (
            <div className="py-2">
              <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                Matching Trees {isSearching && "..."}
              </span>
              <div className="mt-1 space-y-1">
                {searchResults.length === 0 && !isSearching && (
                  <p className="px-3 py-2 text-xs text-stone-500">
                    No trees found matching "{query}"
                  </p>
                )}
                {searchResults.map((tree) => (
                  <button
                    key={tree.id}
                    onClick={() => handleSelect(`/trees/${tree.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-900 dark:text-stone-100 group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-2">
                          <span>{tree.commonName}</span>
                          <span className="text-xs font-mono text-stone-400">
                            {tree.treeCode}
                          </span>
                        </div>
                        <p className="text-xs italic text-stone-500 dark:text-stone-400">
                          {tree.scientificName}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {tree.healthStatus}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="py-2">
            <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              Quick Actions & Navigation
            </span>
            <div className="mt-1 space-y-1">
              {actions.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.title}
                    onClick={() => handleSelect(act.url)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-stone-100 dark:hover:bg-stone-800/80 text-stone-900 dark:text-stone-100 group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{act.title}</div>
                        <div className="text-xs text-stone-500 dark:text-stone-400">
                          {act.desc}
                        </div>
                      </div>
                    </div>
                    {act.badge && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                        {act.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="font-mono bg-stone-200 dark:bg-stone-800 px-1 py-0.5 rounded">
                A
              </kbd>{" "}
              Add Tree
            </span>
            <span>
              <kbd className="font-mono bg-stone-200 dark:bg-stone-800 px-1 py-0.5 rounded">
                G
              </kbd>{" "}
              <kbd className="font-mono bg-stone-200 dark:bg-stone-800 px-1 py-0.5 rounded">
                M
              </kbd>{" "}
              Map
            </span>
            <span>
              <kbd className="font-mono bg-stone-200 dark:bg-stone-800 px-1 py-0.5 rounded">
                G
              </kbd>{" "}
              <kbd className="font-mono bg-stone-200 dark:bg-stone-800 px-1 py-0.5 rounded">
                T
              </kbd>{" "}
              Trees
            </span>
          </div>
          <span className="text-[11px] text-stone-400">TreeTag Registry</span>
        </div>
      </div>
    </div>
  );
}
