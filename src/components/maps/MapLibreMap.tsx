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
  Compass,
  MapPin,
  Mountain,
  Globe,
  Sun,
  Moon,
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
  onCoordinatesChange?: (coords: { lat: number; lng: number; address?: string }) => void;
  selectedTreeId?: string | null;
  onTreeSelect?: (treeId: string) => void;
  showHeatmapToggle?: boolean;
  showLayerToggle?: boolean;
  className?: string;
}

export type BaseMapLayer = "osm" | "satellite" | "opentopo" | "humanitarian" | "dark";

export function MapLibreMap({
  trees = [],
  center = [80.2707, 13.0827], // [lng, lat] default
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

  // Default to authentic OpenStreetMap Standard
  const [activeLayer, setActiveLayer] = useState<BaseMapLayer>("osm");
  const [isLocating, setIsLocating] = useState(false);
  const [activePopupTree, setActivePopupTree] = useState<MapTreePoint | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [reverseAddress, setReverseAddress] = useState<string | null>(null);

  // Real Open-Source Map Tile Providers
  const TILE_STYLES: Record<BaseMapLayer, maplibregl.StyleSpecification> = {
    // 1. OpenStreetMap Standard (Official OSM community map)
    osm: {
      version: 8,
      sources: {
        osmRaster: {
          type: "raster",
          tiles: [
            "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
            "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
            "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          maxzoom: 19,
          attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
        },
      },
      layers: [
        {
          id: "osm-raster-layer",
          type: "raster",
          source: "osmRaster",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },

    // 2. High-Resolution Satellite Orthophoto (Aerial canopy survey)
    satellite: {
      version: 8,
      sources: {
        satelliteRaster: {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          maxzoom: 19,
          attribution: "© Esri, Maxar, Earthstar Geographics",
        },
      },
      layers: [
        {
          id: "satellite-raster-layer",
          type: "raster",
          source: "satelliteRaster",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },

    // 3. OpenTopoMap (Open-source topographic elevation and contours)
    opentopo: {
      version: 8,
      sources: {
        topoRaster: {
          type: "raster",
          tiles: [
            "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
            "https://b.tile.opentopomap.org/{z}/{x}/{y}.png",
            "https://c.tile.opentopomap.org/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          maxzoom: 17,
          attribution: 'Map data: © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Style: © <a href="https://opentopomap.org">OpenTopoMap</a>',
        },
      },
      layers: [
        {
          id: "opentopo-raster-layer",
          type: "raster",
          source: "topoRaster",
          minzoom: 0,
          maxzoom: 17,
        },
      ],
    },

    // 4. Humanitarian OpenStreetMap (High-contrast outdoor field survey)
    humanitarian: {
      version: 8,
      sources: {
        hotRaster: {
          type: "raster",
          tiles: [
            "https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
            "https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          maxzoom: 19,
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Humanitarian OSM Team',
        },
      },
      layers: [
        {
          id: "hot-raster-layer",
          type: "raster",
          source: "hotRaster",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },

    // 5. Dark Mode Eco-GIS (CartoDB Dark Matter)
    dark: {
      version: 8,
      sources: {
        cartoDarkRaster: {
          type: "raster",
          tiles: [
            "https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png",
            "https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png",
          ],
          tileSize: 256,
          maxzoom: 19,
          attribution: "© OpenStreetMap contributors © CARTO",
        },
      },
      layers: [
        {
          id: "carto-dark-raster-layer",
          type: "raster",
          source: "cartoDarkRaster",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
  };

  // Reverse geocode via OpenStreetMap Nominatim
  const queryReverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/geo/reverse?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data.displayName) {
          setReverseAddress(data.displayName);
          return data.displayName;
        }
      }
    } catch {}
    return undefined;
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

    // Add metric scale bar (real GIS scale)
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-left");

    // Add compact attribution control
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      mapRef.current = map;
      renderMarkers();
    });

    // Track mouse coordinates
    map.on("mousemove", (e) => {
      setHoverCoords({
        lat: parseFloat(e.lngLat.lat.toFixed(5)),
        lng: parseFloat(e.lngLat.lng.toFixed(5)),
      });
    });

    // Click to place / fine-tune pin
    if (selectable) {
      map.on("click", async (e) => {
        const { lng, lat } = e.lngLat;
        const address = await queryReverseGeocode(lat, lng);
        if (onCoordinatesChange) {
          onCoordinatesChange({ lat, lng, address });
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

  // Handle layer style switch
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

    // Render tree markers
    trees.forEach((tree) => {
      const el = document.createElement("div");
      el.className = "tree-marker-container cursor-pointer transition-transform hover:scale-125";

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

    // Selection pin for tree creation / manual coordinate placement
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
              <span>📍 Stem Position</span>
            </div>
          </div>
        `;

        selectionMarkerRef.current = new maplibregl.Marker({
          element: pinEl,
          draggable: true,
        })
          .setLngLat(selectedCoordinates)
          .addTo(mapRef.current!);

        selectionMarkerRef.current.on("dragend", async () => {
          if (!selectionMarkerRef.current) return;
          const lngLat = selectionMarkerRef.current.getLngLat();
          const address = await queryReverseGeocode(lngLat.lat, lngLat.lng);
          if (onCoordinatesChange) {
            onCoordinatesChange({ lat: lngLat.lat, lng: lngLat.lng, address });
          }
        });
      }
    }
  };

  // Re-render markers when tree list or selected tree changes
  useEffect(() => {
    renderMarkers();
  }, [trees, selectedTreeId, selectedCoordinates]);

  // Center on selected tree if requested
  useEffect(() => {
    if (!selectedTreeId || !mapRef.current) return;
    const tree = trees.find((t) => t.id === selectedTreeId);
    if (tree) {
      mapRef.current.flyTo({
        center: [tree.longitude, tree.latitude],
        zoom: Math.max(mapRef.current.getZoom(), 15),
        essential: true,
      });
    }
  }, [selectedTreeId]);

  // Geolocation trigger
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 16.5,
            essential: true,
          });
        }
        const address = await queryReverseGeocode(latitude, longitude);
        if (selectable && onCoordinatesChange) {
          onCoordinatesChange({ lat: latitude, lng: longitude, address });
        }
      },
      (err) => {
        setIsLocating(false);
        alert(`Location detection failed: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const layerOptions: { id: BaseMapLayer; name: string; subtitle: string; icon: any }[] = [
    { id: "osm", name: "OpenStreetMap", subtitle: "Standard Community Map", icon: Globe },
    { id: "satellite", name: "Satellite Imagery", subtitle: "High-Res Aerial Orthophoto", icon: Sun },
    { id: "opentopo", name: "OpenTopoMap", subtitle: "Topography & Contours", icon: Mountain },
    { id: "humanitarian", name: "Humanitarian (HOT)", subtitle: "Field Survey Contrast", icon: Compass },
    { id: "dark", name: "Dark Eco-GIS", subtitle: "Night Mode Map", icon: Moon },
  ];

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm ${className}`}
      style={{ height }}
    >
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Top Control Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        {/* Layer Switcher Trigger & Modal */}
        {showLayerToggle && (
          <div className="relative">
            <button
              onClick={() => setLayerMenuOpen(!layerMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200 dark:border-stone-700 shadow-md text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-white transition-all"
              title="Change Open-Source Map Layer"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {activeLayer === "osm"
                  ? "OpenStreetMap"
                  : activeLayer === "satellite"
                  ? "Satellite"
                  : activeLayer === "opentopo"
                  ? "OpenTopoMap"
                  : activeLayer === "humanitarian"
                  ? "Humanitarian"
                  : "Dark Mode"}
              </span>
            </button>

            {layerMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200 dark:border-stone-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1"
                onClick={() => setLayerMenuOpen(false)}
              >
                <div className="px-2 py-1 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Open-Source Base Maps
                  </span>
                  <span className="text-[9px] font-mono text-emerald-600 font-bold">WGS84</span>
                </div>
                {layerOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setActiveLayer(opt.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all ${
                        activeLayer === opt.id
                          ? "bg-emerald-700 text-white font-semibold shadow-xs"
                          : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate leading-tight">{opt.name}</p>
                        <p
                          className={`text-[10px] truncate ${
                            activeLayer === opt.id ? "text-emerald-100" : "text-stone-400"
                          }`}
                        >
                          {opt.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Locate Me button */}
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="p-2.5 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-xl border border-stone-200 dark:border-stone-700 shadow-md hover:bg-white text-stone-700 dark:text-stone-200 transition-colors"
          title="Detect Device GPS Location (Browser Geolocation API)"
        >
          <Locate className={`w-4 h-4 ${isLocating ? "animate-spin text-emerald-600" : ""}`} />
        </button>

        {/* Zoom In/Out Controls */}
        <div className="flex flex-col bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-xl border border-stone-200 dark:border-stone-700 shadow-md overflow-hidden">
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

      {/* Floating Bottom Left: OpenStreetMap Engine Badge & Live Coordinates */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
        {/* Live Cursor / Center Coordinates */}
        {hoverCoords && (
          <div className="bg-stone-900/85 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono shadow-md border border-white/10 w-fit">
            <span>Lat: {hoverCoords.lat.toFixed(5)}° • Lng: {hoverCoords.lng.toFixed(5)}°</span>
          </div>
        )}

        {/* OpenStreetMap Real Map Badge */}
        <div className="hidden sm:flex items-center gap-2 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 shadow-md text-[11px] pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-stone-800 dark:text-stone-200">
            OpenStreetMap (OSM)
          </span>
          <span className="text-stone-400">•</span>
          <span className="text-[10px] font-mono text-stone-500">EPSG:4326</span>
        </div>
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
