"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Layers,
  Locate,
  Flame,
  Plus,
  Minus,
  Maximize2,
  TreePine,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { formatCoordinates } from "@/lib/geo";

export interface MapTreePoint {
  id: string;
  treeCode: string;
  commonName: string;
  scientificName: string;
  healthStatus: string;
  latitude: number;
  longitude: number;
  height?: number | null;
  dbh?: number | null;
  photoUrl?: string | null;
  projectName?: string | null;
}

interface MapLibreMapProps {
  trees?: MapTreePoint[];
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  height?: string;
  selectable?: boolean;
  selectedCoordinates?: [number, number] | null; // [lng, lat]
  onCoordinatesChange?: (coords: { lat: number; lng: number }) => void;
  selectedTreeId?: string | null;
  onTreeSelect?: (treeId: string) => void;
  showHeatmapToggle?: boolean;
  showLayerToggle?: boolean;
  className?: string;
}

export function MapLibreMap({
  trees = [],
  center = [80.2707, 13.0827], // [lng, lat] Chennai default
  zoom = 13.5,
  height = "500px",
  selectable = false,
  selectedCoordinates = null,
  onCoordinatesChange,
  selectedTreeId,
  onTreeSelect,
  showHeatmapToggle = true,
  showLayerToggle = true,
  className = "",
}: MapLibreMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const selectionMarkerRef = useRef<maplibregl.Marker | null>(null);

  const [activeLayer, setActiveLayer] = useState<"streets" | "satellite" | "dark">("streets");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [activePopupTree, setActivePopupTree] = useState<MapTreePoint | null>(null);

  // Map Tile styles
  const TILE_STYLES = {
    streets: {
      version: 8 as const,
      sources: {
        osm: {
          type: "raster" as const,
          tiles: [
            "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          ],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors © CARTO",
        },
      },
      layers: [
        {
          id: "osm-layer",
          type: "raster" as const,
          source: "osm",
          minzoom: 0,
          maxzoom: 20,
        },
      ],
    },
    satellite: {
      version: 8 as const,
      sources: {
        satellite: {
          type: "raster" as const,
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "© Esri, Maxar, Earthstar Geographics",
        },
      },
      layers: [
        {
          id: "satellite-layer",
          type: "raster" as const,
          source: "satellite",
          minzoom: 0,
          maxzoom: 20,
        },
      ],
    },
    dark: {
      version: 8 as const,
      sources: {
        cartoDark: {
          type: "raster" as const,
          tiles: [
            "https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png",
          ],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors © CARTO",
        },
      },
      layers: [
        {
          id: "carto-dark-layer",
          type: "raster" as const,
          source: "cartoDark",
          minzoom: 0,
          maxzoom: 20,
        },
      ],
    },
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: TILE_STYLES[activeLayer],
      center: center,
      zoom: zoom,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      mapRef.current = map;
      renderMarkers();
    });

    // If selectable mode is on, allow click to place pin
    if (selectable) {
      map.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        if (onCoordinatesChange) {
          onCoordinatesChange({ lat, lng });
        }
      });
    }

    return () => {
      markersRef.current.forEach((m) => m.remove());
      if (selectionMarkerRef.current) selectionMarkerRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle Layer style switch
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(TILE_STYLES[activeLayer]);
    mapRef.current.once("style.load", () => {
      renderMarkers();
    });
  }, [activeLayer]);

  // Handle marker rendering
  const renderMarkers = () => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Render Tree Markers
    trees.forEach((tree) => {
      const el = document.createElement("div");
      el.className = "tree-marker-container cursor-pointer transition-transform hover:scale-125";

      // Choose color & icon based on health status
      let bgColor = "#16a34a"; // Healthy
      let ringColor = "rgba(34, 197, 94, 0.4)";
      let pulseAnim = "";

      if (tree.healthStatus === "GOOD") {
        bgColor = "#22c55e";
        ringColor = "rgba(34, 197, 94, 0.3)";
      } else if (tree.healthStatus === "MODERATE") {
        bgColor = "#eab308";
        ringColor = "rgba(234, 179, 8, 0.4)";
      } else if (tree.healthStatus === "POOR") {
        bgColor = "#f97316";
        ringColor = "rgba(249, 115, 22, 0.4)";
      } else if (tree.healthStatus === "CRITICAL") {
        bgColor = "#ef4444";
        ringColor = "rgba(239, 68, 68, 0.6)";
        pulseAnim = "pulse-gps";
      }

      const isSelected = selectedTreeId === tree.id;

      el.innerHTML = `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <div class="${pulseAnim}" style="position: absolute; inset: -4px; border-radius: 9999px; background-color: ${ringColor}; pointer-events: none;"></div>
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background-color: ${bgColor};
            border: 2.5px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            ${isSelected ? "outline: 3px solid #22c55e; transform: scale(1.2);" : ""}
          ">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L6 8h3l-4 6h5l-4 6h12l-4-6h5l-4-6h3L12 2z"/>
              <path d="M12 20v2"/>
            </svg>
          </div>
        </div>
      `;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setActivePopupTree(tree);
        if (onTreeSelect) onTreeSelect(tree.id);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([tree.longitude, tree.latitude])
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });

    // If there is an active placement selection marker (for tree creation)
    if (selectable && selectedCoordinates) {
      if (selectionMarkerRef.current) {
        selectionMarkerRef.current.setLngLat(selectedCoordinates);
      } else {
        const pinEl = document.createElement("div");
        pinEl.innerHTML = `
          <div style="position: relative; cursor: grab; transform: translate(0, -50%);">
            <div class="pulse-gps" style="position: absolute; inset: -6px; border-radius: 50%; background-color: rgba(16, 185, 129, 0.4);"></div>
            <div style="
              background: #166534;
              color: white;
              padding: 6px 10px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: bold;
              display: flex;
              align-items: center;
              gap: 4px;
              border: 2px solid white;
              box-shadow: 0 4px 14px rgba(0,0,0,0.35);
            ">
              <span>📍 New Tree</span>
            </div>
          </div>
        `;

        selectionMarkerRef.current = new maplibregl.Marker({
          element: pinEl,
          draggable: true,
        })
          .setLngLat(selectedCoordinates)
          .addTo(mapRef.current!);

        selectionMarkerRef.current.on("dragend", () => {
          if (!selectionMarkerRef.current) return;
          const lngLat = selectionMarkerRef.current.getLngLat();
          if (onCoordinatesChange) {
            onCoordinatesChange({ lat: lngLat.lat, lng: lngLat.lng });
          }
        });
      }
    }
  };

  // Re-render markers when trees or selectedCoordinates change
  useEffect(() => {
    renderMarkers();
  }, [trees, selectedCoordinates, selectedTreeId]);

  // GPS Device Geolocation handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 16,
            essential: true,
          });
        }
        if (selectable && onCoordinatesChange) {
          onCoordinatesChange({ lat: latitude, lng: longitude });
        }
      },
      (err) => {
        setIsLocating(false);
        alert(`Location detection failed: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm ${className}`}
      style={{ height }}
    >
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Control Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Layer toggle */}
        {showLayerToggle && (
          <div className="flex bg-white/90 dark:bg-stone-900/90 backdrop-blur-md p-1 rounded-xl border border-stone-200 dark:border-stone-700 shadow-md">
            <button
              onClick={() => setActiveLayer("streets")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                activeLayer === "streets"
                  ? "bg-emerald-700 text-white"
                  : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              Streets
            </button>
            <button
              onClick={() => setActiveLayer("satellite")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                activeLayer === "satellite"
                  ? "bg-emerald-700 text-white"
                  : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setActiveLayer("dark")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                activeLayer === "dark"
                  ? "bg-emerald-700 text-white"
                  : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              Dark
            </button>
          </div>
        )}

        {/* Locate Me button */}
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="p-2.5 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-xl border border-stone-200 dark:border-stone-700 shadow-md hover:bg-white text-stone-700 dark:text-stone-200 transition-colors self-end"
          title="Detect Current GPS Location"
        >
          <Locate className={`w-4 h-4 ${isLocating ? "animate-spin text-emerald-600" : ""}`} />
        </button>

        {/* Zoom In/Out */}
        <div className="flex flex-col bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-xl border border-stone-200 dark:border-stone-700 shadow-md overflow-hidden self-end">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 transition-colors border-b border-stone-200 dark:border-stone-800"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Health legend overlay */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-3 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 shadow-md text-[11px] text-stone-700 dark:text-stone-300">
        <span className="font-semibold text-stone-500 uppercase text-[9px] tracking-wider">
          Canopy Health
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Healthy
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-500" /> Poor
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Critical
        </span>
      </div>

      {/* Selected Tree Quick Popup Overlay */}
      {activePopupTree && (
        <div className="absolute top-4 left-4 z-30 max-w-xs w-full bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                {activePopupTree.treeCode}
              </span>
              <h4 className="font-bold text-sm text-stone-900 dark:text-white mt-1">
                {activePopupTree.commonName}
              </h4>
              <p className="text-xs italic text-stone-500">
                {activePopupTree.scientificName}
              </p>
            </div>
            <button
              onClick={() => setActivePopupTree(null)}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm p-1"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-400">
            <div>
              <span className="block text-[10px] text-stone-400">Health</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                {activePopupTree.healthStatus}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-stone-400">Coordinates</span>
              <span className="font-mono text-[10px] truncate block">
                {activePopupTree.latitude.toFixed(4)}, {activePopupTree.longitude.toFixed(4)}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2">
            <Link
              href={`/trees/${activePopupTree.id}`}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors"
            >
              <span>View Full Dossier</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
