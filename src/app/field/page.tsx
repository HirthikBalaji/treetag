"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  MapPin,
  Sparkles,
  HeartPulse,
  CheckCircle2,
  WifiOff,
  RefreshCw,
  Plus,
  History,
  AlertTriangle,
  Locate,
  TreePine,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getPendingQueue, syncPendingQueue, savePendingTree } from "@/lib/offline-sync";
import { useToast } from "@/components/providers/ToastProvider";
import { formatCoordinates } from "@/lib/geo";
import { MapLibreMap } from "@/components/maps/MapLibreMap";

export default function FieldModePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isOnline, setIsOnline] = useState(true);
  const [pendingQueue, setPendingQueue] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Quick survey temporary state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedQuickSpecies, setSelectedQuickSpecies] = useState("Neem");
  const [selectedQuickHealth, setSelectedQuickHealth] = useState("HEALTHY");
  const [quickPhoto, setQuickPhoto] = useState<string | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    setPendingQueue(getPendingQueue());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleQueueChange = () => setPendingQueue(getPendingQueue());

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("treetag_queue_updated", handleQueueChange);

    // Auto-acquire current location on opening field mode
    handleQuickGps();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("treetag_queue_updated", handleQueueChange);
    };
  }, []);

  const handleQuickGps = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        setCurrentCoords({
          lat: parseFloat(pos.coords.latitude.toFixed(6)),
          lng: parseFloat(pos.coords.longitude.toFixed(6)),
        });
        toast.info(`GPS Locked: ±${Math.round(pos.coords.accuracy)}m`);
      },
      () => {
        setGpsLoading(false);
        // Fallback default
        setCurrentCoords({ lat: 13.0827, lng: 80.2707 });
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const handleQuickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setQuickPhoto(event.target?.result as string);
        toast.success("Specimen photo captured!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuickSubmit = async () => {
    if (!currentCoords) {
      toast.error("Please lock GPS coordinates before submitting");
      return;
    }

    const payload = {
      projectId: "default",
      commonName: selectedQuickSpecies,
      scientificName:
        selectedQuickSpecies === "Neem"
          ? "Azadirachta indica"
          : selectedQuickSpecies === "Banyan"
          ? "Ficus benghalensis"
          : selectedQuickSpecies === "Peepal"
          ? "Ficus religiosa"
          : "Tamarindus indica",
      latitude: currentCoords.lat,
      longitude: currentCoords.lng,
      healthStatus: selectedQuickHealth,
      height: 10.0,
      trunkCircumference: 75.0,
      locationSource: "DEVICE_GPS",
      photos: quickPhoto
        ? [{ fileUrl: quickPhoto, photoType: "FULL_TREE", isPrimary: true }]
        : [],
    };

    if (isOnline) {
      try {
        const res = await fetch("/api/trees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          toast.success(`Tree ${data.tree?.treeCode} saved to registry!`);
          setQuickPhoto(null);
          router.push(`/trees/${data.tree?.id}`);
          return;
        }
      } catch {}
    }

    // Save offline
    savePendingTree(payload);
    toast.info("Offline mode: Record queued safely in local storage!");
    setPendingQueue(getPendingQueue());
    setQuickPhoto(null);
  };

  const handleSyncAll = async () => {
    if (!isOnline) {
      toast.error("Connect to internet to synchronize records.");
      return;
    }
    setIsSyncing(true);
    const { synced, failed } = await syncPendingQueue();
    setIsSyncing(false);
    if (synced > 0) toast.success(`Synced ${synced} field records successfully!`);
    if (failed > 0) toast.error(`Failed to sync ${failed} records.`);
    setPendingQueue(getPendingQueue());
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto space-y-5 animate-in fade-in duration-200">
        {/* Field Header Banner */}
        <div className="p-4 rounded-3xl bg-emerald-900 text-white shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> High-Contrast Field Survey
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isOnline ? "bg-emerald-800 text-emerald-200" : "bg-amber-500 text-black"
              }`}
            >
              {isOnline ? "● Online" : "● Offline Field Mode"}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Field Geotagging Terminal
          </h1>
          <p className="text-xs text-emerald-100 leading-relaxed">
            Touch-first interface designed for direct sunlight, high speed, and zero latency.
          </p>
        </div>

        {/* Offline Queue Sync Bar */}
        {pendingQueue.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-900 dark:text-amber-200 flex items-center justify-between">
            <div>
              <p className="font-bold text-xs">
                {pendingQueue.length} Record(s) Waiting in Offline Queue
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                Data is stored safely in device storage.
              </p>
            </div>
            <button
              onClick={handleSyncAll}
              disabled={isSyncing || !isOnline}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Sync All"}</span>
            </button>
          </div>
        )}

        {/* Big Touch Action 1: Full Guided Wizard */}
        <Link
          href="/trees/new"
          className="w-full py-4 px-6 rounded-3xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-base flex items-center justify-between shadow-lg shadow-emerald-900/20 active:scale-98 transition-transform"
        >
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6 stroke-[3]" />
            <span>START 7-STEP DETAILED SURVEY</span>
          </div>
          <ArrowRight className="w-5 h-5" />
        </Link>

        {/* Quick Touch Survey Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-stone-900 dark:text-white">
              Instant 30-Second Rapid Log
            </h3>
            <span className="text-[10px] font-mono text-stone-400">RAPID SURVEY</span>
          </div>

          {/* 1. GPS LOCK */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-stone-700 dark:text-stone-300">
              1. GPS Coordinates
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleQuickGps}
                disabled={gpsLoading}
                className="flex-1 py-3 px-4 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 font-bold text-xs flex items-center justify-center gap-2 text-stone-800 dark:text-stone-200 active:scale-98 transition-all"
              >
                <Locate className={`w-4 h-4 ${gpsLoading ? "animate-spin text-emerald-600" : ""}`} />
                <span>
                  {currentCoords
                    ? `${currentCoords.lat.toFixed(5)}, ${currentCoords.lng.toFixed(5)}`
                    : "Tap to Lock GPS Location"}
                </span>
              </button>
            </div>

            {currentCoords && (
              <div className="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 mt-2">
                <MapLibreMap
                  height="160px"
                  center={[currentCoords.lng, currentCoords.lat]}
                  zoom={16.5}
                  selectable={true}
                  selectedCoordinates={[currentCoords.lng, currentCoords.lat]}
                  onCoordinatesChange={({ lat, lng }) => {
                    setCurrentCoords({
                      lat: parseFloat(lat.toFixed(6)),
                      lng: parseFloat(lng.toFixed(6)),
                    });
                  }}
                  showLayerToggle={true}
                />
              </div>
            )}
          </div>

          {/* 2. SNAP PHOTO */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-stone-700 dark:text-stone-300">
              2. Camera Snap
            </label>
            <label className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 flex items-center justify-center gap-2 font-bold text-xs text-stone-700 dark:text-stone-300 cursor-pointer hover:bg-stone-100 transition-colors">
              <Camera className="w-5 h-5 text-emerald-600" />
              <span>{quickPhoto ? "✓ Photo Attached (Tap to Replace)" : "Take Specimen Photo"}</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleQuickPhoto}
                className="hidden"
              />
            </label>
          </div>

          {/* 3. SPECIES TOUCH BUTTONS */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-stone-700 dark:text-stone-300">
              3. Identify Specimen
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["Neem", "Banyan", "Peepal", "Tamarind", "Gulmohar", "Other"].map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => setSelectedQuickSpecies(sp)}
                  className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all ${
                    selectedQuickSpecies === sp
                      ? "bg-emerald-700 text-white shadow-md scale-102"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
                  }`}
                >
                  🌳 {sp}
                </button>
              ))}
            </div>
          </div>

          {/* 4. HEALTH TOUCH BUTTONS */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-stone-700 dark:text-stone-300">
              4. Assess Vitality
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "HEALTHY", label: "🟢 Healthy" },
                { id: "MODERATE", label: "🟡 Monitor" },
                { id: "CRITICAL", label: "🔴 Critical" },
              ].map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setSelectedQuickHealth(h.id)}
                  className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all ${
                    selectedQuickHealth === h.id
                      ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-md scale-102"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleQuickSubmit}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 active:scale-98 transition-all"
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              <span>COMMIT & REGISTER SPECIMEN</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
