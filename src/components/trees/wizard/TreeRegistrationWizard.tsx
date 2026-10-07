"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  MapPin,
  Sparkles,
  Ruler,
  HeartPulse,
  Compass,
  Wrench,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  AlertTriangle,
  Locate,
  Trees,
  Info,
  ShieldAlert,
  Loader2,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { MapLibreMap } from "@/components/maps/MapLibreMap";
import { TreeHealthBadge } from "@/components/ui/TreeHealthBadge";
import { formatCoordinates } from "@/lib/geo";
import { useToast } from "@/components/providers/ToastProvider";
import { savePendingTree } from "@/lib/offline-sync";
import { predictSpeciesFromPhoto, AISpeciesMatch } from "@/lib/ai-assistant";

interface SpeciesOption {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  genus: string;
  species: string;
  nativeStatus: boolean;
}

interface ProjectOption {
  id: string;
  name: string;
  code: string;
}

export function TreeRegistrationWizard() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [speciesList, setSpeciesList] = useState<SpeciesOption[]>([]);

  // GPS state
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    projectId: "",
    // Step 1: Photos & Coordinates
    photos: [] as { fileUrl: string; photoType: string; isPrimary: boolean }[],
    latitude: 13.0827,
    longitude: 80.2707,
    gpsAccuracy: 4.2 as number | null,
    altitude: 16.0 as number | null,
    locationSource: "DEVICE_GPS" as "DEVICE_GPS" | "MANUAL_PIN" | "MAP_ADJUSTED",

    // Step 2: Identify
    commonName: "Neem",
    scientificName: "Azadirachta indica",
    family: "Meliaceae",
    genus: "Azadirachta",
    species: "indica",
    variety: "",
    nativeStatus: true,
    identificationConfidence: 95,

    // Step 3: Measurements
    height: 12.5,
    trunkCircumference: 85,
    dbh: 27.1,
    canopyWidth: 8.0,
    estimatedAge: 25,

    // Step 4: Health
    healthStatus: "HEALTHY",
    riskLevel: "LOW",
    trunkCondition: "Sound and intact bark with good callusing",
    leafCondition: "Full vigorous dark green foliage",
    structuralCondition: "Well-balanced crown structure",
    pestStatus: "None detected",
    diseaseStatus: "Healthy vascular tissues",
    damageStatus: "No mechanical damage",

    // Step 5: Environment
    soilCondition: "Loamy fertile soil with organic layer",
    sunlight: "Full Sunlight",
    waterAvailability: "Natural rainfall + surface moisture",
    surroundingEnvironment: "Campus park arboretum lawn",
    competition: "Good lateral spacing",

    // Step 6: Maintenance
    irrigationRequired: false,
    pruningRequired: false,
    fertilizationRequired: false,
    pestControlRequired: false,
    supportRequired: false,
    nextInspectionDays: 90,
    notes: "",
  });

  // AI suggestions
  const [aiSuggestions, setAiSuggestions] = useState<AISpeciesMatch[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Load projects & species on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [projRes, specRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/species"),
        ]);
        if (projRes.ok) {
          const p = await projRes.json();
          setProjects(p.projects || []);
          if (p.projects?.[0]?.id) {
            setFormData((prev) => ({ ...prev, projectId: p.projects[0].id }));
          }
        }
        if (specRes.ok) {
          const s = await specRes.json();
          setSpeciesList(s.species || []);
        }
      } catch (err) {
        console.error("Failed to load setup data:", err);
      }
    }
    loadData();

    // Trigger initial geolocation detection
    captureDeviceLocation();
  }, []);

  // Browser Geolocation
  const captureDeviceLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingLocation(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingLocation(false);
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6)),
          gpsAccuracy: parseFloat(pos.coords.accuracy.toFixed(1)),
          altitude: pos.coords.altitude ? parseFloat(pos.coords.altitude.toFixed(1)) : 14.0,
          locationSource: "DEVICE_GPS",
        }));
        toast.info(
          `GPS Acquired: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (±${Math.round(
            pos.coords.accuracy
          )}m)`
        );
      },
      (err) => {
        setIsDetectingLocation(false);
        setGpsError(
          "Location signal weak or permission denied. You can manually adjust the pin on the map."
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Photo upload handling (supporting camera or file drop)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setFormData((prev) => ({
            ...prev,
            photos: [
              ...prev.photos,
              {
                fileUrl: dataUrl,
                photoType: prev.photos.length === 0 ? "FULL_TREE" : "LEAVES",
                isPrimary: prev.photos.length === 0,
              },
            ],
          }));

          // Trigger AI observation suggestion
          if (formData.photos.length === 0) {
            triggerAISuggestion(dataUrl);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAISuggestion = (imageUrl: string) => {
    setAiLoading(true);
    setTimeout(() => {
      const suggestions = predictSpeciesFromPhoto(imageUrl);
      setAiSuggestions(suggestions);
      setAiLoading(false);
    }, 800);
  };

  const applyAISuggestion = (s: AISpeciesMatch) => {
    setFormData((prev) => ({
      ...prev,
      commonName: s.commonName,
      scientificName: s.scientificName,
      family: s.family,
      nativeStatus: s.nativeStatus,
      identificationConfidence: s.confidence,
    }));
    toast.success(`Applied AI recommendation: ${s.commonName} (${s.confidence}% match)`);
  };

  // DBH auto-calculation when circumference changes
  const handleCircumferenceChange = (val: number) => {
    const dbhVal = parseFloat((val / Math.PI).toFixed(1));
    setFormData((prev) => ({
      ...prev,
      trunkCircumference: val,
      dbh: dbhVal,
    }));
  };

  // Step Navigation
  const nextStep = () => {
    if (currentStep === 1 && !formData.latitude) {
      toast.error("Please provide tree coordinates");
      return;
    }
    if (currentStep === 2 && (!formData.commonName || !formData.scientificName)) {
      toast.error("Please specify common and scientific names");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 7));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submission
  const handleSubmit = async () => {
    setSubmitting(true);
    const payload = {
      ...formData,
      projectId: formData.projectId || projects[0]?.id || "default",
      nextInspectionAt: new Date(Date.now() + formData.nextInspectionDays * 24 * 3600 * 1000).toISOString(),
    };

    try {
      const res = await fetch("/api/trees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#16a34a", "#22c55e", "#84cc16"],
        });
        toast.success(`Tree ${data.tree?.treeCode || "record"} successfully registered!`);
        router.push(`/trees/${data.tree?.id || ""}`);
      } else {
        // If offline or network error, save to offline sync queue
        savePendingTree(payload);
        toast.info("Network unavailable. Saved tree to offline queue for later sync!");
        router.push("/field");
      }
    } catch (err) {
      // Offline fallback
      savePendingTree(payload);
      toast.info("Offline: Specimen stored locally in field survey queue.");
      router.push("/field");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: "Capture", icon: Camera },
    { num: 2, title: "Identify", icon: Sparkles },
    { num: 3, title: "Measurements", icon: Ruler },
    { num: 4, title: "Health", icon: HeartPulse },
    { num: 5, title: "Environment", icon: Compass },
    { num: 6, title: "Maintenance", icon: Wrench },
    { num: 7, title: "Review", icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Guided Field Survey Workflow
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mt-0.5">
            Register Specimen #{steps[currentStep - 1].title}
          </h1>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-medium">Project:</span>
          <select
            value={formData.projectId}
            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            className="text-xs px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 font-medium text-stone-800 dark:text-stone-200 outline-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 7-Step Progress Stepper */}
      <div className="bg-white dark:bg-stone-900 p-3 sm:p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[580px] gap-2">
          {steps.map((st) => {
            const Icon = st.icon;
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;

            return (
              <div
                key={st.num}
                onClick={() => isCompleted && setCurrentStep(st.num)}
                className={`flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all ${
                  isCurrent
                    ? "bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-bold"
                    : isCompleted
                    ? "cursor-pointer text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                    : "text-stone-400 opacity-60"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                    isCurrent
                      ? "bg-emerald-700 text-white"
                      : isCompleted
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-400"
                  }`}
                >
                  {isCompleted ? "✓" : st.num}
                </div>
                <span className="text-xs truncate">{st.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Step Body with Animation */}
      <div className="bg-white dark:bg-stone-900 p-5 sm:p-7 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs min-h-[420px]">
        <AnimatePresence mode="wait">
          {/* STEP 1: CAPTURE */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Step 1 — Photographic Evidence & Geolocation
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Upload tree images and establish exact coordinates using device GPS or interactive map pinpointing.
                </p>
              </div>

              {/* Photo Upload Zone */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
                  Specimen Photographs
                </label>
                <div className="border-2 border-dashed border-stone-200 dark:border-stone-800 hover:border-emerald-500/50 rounded-2xl p-6 text-center bg-stone-50/60 dark:bg-stone-950/40 transition-colors">
                  <input
                    type="file"
                    id="photoUpload"
                    multiple
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <label htmlFor="photoUpload" className="cursor-pointer flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                      Take Photo or Select from Device
                    </span>
                    <span className="text-xs text-stone-400 mt-1">
                      Support for Full tree, Bark, Leaves, Fruit, and Root flare images
                    </span>
                  </label>
                </div>

                {/* Uploaded Photos Thumbnails */}
                {formData.photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {formData.photos.map((p, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 group h-28 bg-stone-100 dark:bg-stone-800"
                      >
                        <img
                          src={p.fileUrl}
                          alt="Uploaded tree"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white">
                          {p.photoType}
                        </span>
                        {p.isPrimary && (
                          <span className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                            Primary
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              photos: prev.photos.filter((_, i) => i !== idx),
                            }));
                          }}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Geolocation Section */}
              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>Geographic Coordinates</span>
                    </label>
                    <p className="text-xs font-mono text-stone-600 dark:text-stone-400">
                      {formatCoordinates(formData.latitude, formData.longitude)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={captureDeviceLocation}
                    disabled={isDetectingLocation}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold text-xs border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    <Locate className={`w-3.5 h-3.5 ${isDetectingLocation ? "animate-spin" : ""}`} />
                    <span>{isDetectingLocation ? "Acquiring..." : "Acquire GPS"}</span>
                  </button>
                </div>

                {/* GPS Accuracy Meter */}
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        formData.gpsAccuracy && formData.gpsAccuracy < 8
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`}
                    />
                    <span className="text-stone-600 dark:text-stone-400">
                      Signal Precision: ±{formData.gpsAccuracy || 4.0}m (
                      {formData.gpsAccuracy && formData.gpsAccuracy < 8
                        ? "High Accuracy"
                        : "Moderate Accuracy"}
                      )
                    </span>
                  </div>
                  <span className="font-mono text-stone-400 text-[11px]">
                    Alt: {formData.altitude || 14}m
                  </span>
                </div>

                {/* Interactive Map Preview with Draggable Pin */}
                <div className="space-y-1">
                  <span className="text-[11px] text-stone-500">
                    💡 Click on map or drag pin to fine-tune exact stem base position:
                  </span>
                  <MapLibreMap
                    height="240px"
                    selectable={true}
                    selectedCoordinates={[formData.longitude, formData.latitude]}
                    onCoordinatesChange={({ lat, lng }) => {
                      setFormData((prev) => ({
                        ...prev,
                        latitude: parseFloat(lat.toFixed(6)),
                        longitude: parseFloat(lng.toFixed(6)),
                        locationSource: "MAP_ADJUSTED",
                      }));
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: IDENTIFY */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Step 2 — Botanical Taxonomical Identification
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Select specimen from the verified botanical database or enter custom scientific nomenclature.
                </p>
              </div>

              {/* AI Species Identification Assistant Box */}
              {aiSuggestions.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>AI-Assisted Botanical Suggestion</span>
                    <span className="text-[10px] font-normal text-stone-500">
                      (Confirm before applying)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {aiSuggestions.map((s, idx) => (
                      <div
                        key={idx}
                        onClick={() => applyAISuggestion(s)}
                        className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 cursor-pointer text-xs flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-stone-900 dark:text-white">{s.commonName}</p>
                          <p className="italic text-stone-500 text-[11px]">{s.scientificName}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {s.confidence}% match
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Name & Quick Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Common Name *
                  </label>
                  <input
                    type="text"
                    value={formData.commonName}
                    onChange={(e) => setFormData({ ...formData, commonName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white outline-none focus:border-emerald-500"
                    placeholder="e.g. Neem, Banyan, Tamarind"
                  />
                  {/* Database quick picks */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {speciesList.slice(0, 6).map((sp) => (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            commonName: sp.commonName,
                            scientificName: sp.scientificName,
                            family: sp.family,
                            genus: sp.genus,
                            species: sp.species,
                            nativeStatus: sp.nativeStatus,
                          })
                        }
                        className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-emerald-100 hover:text-emerald-800 transition-colors"
                      >
                        {sp.commonName}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Scientific Name (Genus + Species) *
                  </label>
                  <input
                    type="text"
                    value={formData.scientificName}
                    onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white italic outline-none focus:border-emerald-500"
                    placeholder="e.g. Azadirachta indica"
                  />
                </div>
              </div>

              {/* Family & Genus */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Botanical Family
                  </label>
                  <input
                    type="text"
                    value={formData.family}
                    onChange={(e) => setFormData({ ...formData, family: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white outline-none"
                    placeholder="e.g. Meliaceae, Fabaceae"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Genus
                  </label>
                  <input
                    type="text"
                    value={formData.genus}
                    onChange={(e) => setFormData({ ...formData, genus: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Native Provenance
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, nativeStatus: true })}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                        formData.nativeStatus
                          ? "bg-emerald-700 text-white border-emerald-700"
                          : "border-stone-200 dark:border-stone-800 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      🌿 Native
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, nativeStatus: false })}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                        !formData.nativeStatus
                          ? "bg-stone-800 text-white border-stone-800"
                          : "border-stone-200 dark:border-stone-800 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      Exotic / Naturalized
                    </button>
                  </div>
                </div>
              </div>

              {/* Confidence Slider */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  <span>Botanical Identification Confidence</span>
                  <span className="font-mono text-emerald-600">{formData.identificationConfidence}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={formData.identificationConfidence}
                  onChange={(e) =>
                    setFormData({ ...formData, identificationConfidence: parseInt(e.target.value) })
                  }
                  className="w-full accent-emerald-600"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 3: MEASUREMENTS */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Step 3 — Dendrometric Dimensions & Age Estimation
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Measure height, trunk girth, and canopy width. DBH is automatically calculated from circumference.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Trunk Circumference & DBH */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Trunk Circumference (cm at 1.37m height)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.trunkCircumference}
                      onChange={(e) => handleCircumferenceChange(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 font-mono text-stone-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200">
                        Computed DBH (Diameter at Breast Height)
                      </span>
                      <p className="text-[10px] text-stone-500">Formula: Circumference / π</p>
                    </div>
                    <span className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-400">
                      {formData.dbh} cm
                    </span>
                  </div>
                </div>

                {/* Height & Canopy Spread */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Tree Height (meters)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.height}
                      onChange={(e) =>
                        setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 font-mono text-stone-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Average Canopy Spread / Width (meters)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.canopyWidth}
                      onChange={(e) =>
                        setFormData({ ...formData, canopyWidth: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 font-mono text-stone-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Estimated Age */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Estimated Age (Years)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="200"
                    value={formData.estimatedAge}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedAge: parseInt(e.target.value) })
                    }
                    className="flex-1 accent-emerald-600"
                  />
                  <span className="font-mono text-sm font-bold text-stone-800 dark:text-stone-200 w-16 text-right">
                    {formData.estimatedAge} yrs
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: HEALTH */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Step 4 — Tree Health & Structural Risk Assessment
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Evaluate crown vitality, trunk integrity, disease presence, and structural storm risk.
                </p>
              </div>

              {/* Overall Health Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
                  Overall Health Rating *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(
                    [
                      { id: "HEALTHY", label: "Healthy", color: "border-emerald-500 bg-emerald-50" },
                      { id: "GOOD", label: "Good", color: "border-green-500 bg-green-50" },
                      { id: "MODERATE", label: "Moderate", color: "border-amber-500 bg-amber-50" },
                      { id: "POOR", label: "Poor", color: "border-orange-500 bg-orange-50" },
                      { id: "CRITICAL", label: "Critical", color: "border-red-500 bg-red-50" },
                    ] as const
                  ).map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, healthStatus: h.id })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        formData.healthStatus === h.id
                          ? `${h.color} text-stone-900 shadow-xs dark:bg-stone-800 dark:text-white`
                          : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50"
                      }`}
                    >
                      <TreeHealthBadge status={h.id} size="sm" showDotOnly={false} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Level */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Public Structural Risk Level
                </label>
                <div className="flex gap-2">
                  {["LOW", "MODERATE", "HIGH", "EXTREME"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({ ...formData, riskLevel: r as any })}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors ${
                        formData.riskLevel === r
                          ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-transparent shadow-xs"
                          : "border-stone-200 dark:border-stone-800 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trunk & Leaf condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Trunk / Bark Condition
                  </label>
                  <input
                    type="text"
                    value={formData.trunkCondition}
                    onChange={(e) => setFormData({ ...formData, trunkCondition: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white outline-none"
                    placeholder="e.g. Sound bark, fungal conks, cavity..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Foliage / Crown Condition
                  </label>
                  <input
                    type="text"
                    value={formData.leafCondition}
                    onChange={(e) => setFormData({ ...formData, leafCondition: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white outline-none"
                    placeholder="e.g. Vigorous dense canopy, chlorosis..."
                  />
                </div>
              </div>

              {/* Pest & Disease */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Pest Infestation Status
                  </label>
                  <input
                    type="text"
                    value={formData.pestStatus}
                    onChange={(e) => setFormData({ ...formData, pestStatus: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Disease Status
                  </label>
                  <input
                    type="text"
                    value={formData.diseaseStatus}
                    onChange={(e) => setFormData({ ...formData, diseaseStatus: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: ENVIRONMENT */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Step 5 — Environmental & Microclimate Context
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Document surrounding edaphic conditions, sunlight, and surrounding urban infrastructure.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Soil Condition
                  </label>
                  <input
                    type="text"
                    value={formData.soilCondition}
                    onChange={(e) => setFormData({ ...formData, soilCondition: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white outline-none"
                    placeholder="e.g. Loamy, Red soil, Compacted urban fill"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Sunlight Exposure
                  </label>
                  <select
                    value={formData.sunlight}
                    onChange={(e) => setFormData({ ...formData, sunlight: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white outline-none"
                  >
                    <option value="Full Sunlight">Full Sunlight</option>
                    <option value="Partial Shade">Partial Shade</option>
                    <option value="Deep Shade">Deep Shade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Water Availability
                  </label>
                  <input
                    type="text"
                    value={formData.waterAvailability}
                    onChange={(e) => setFormData({ ...formData, waterAvailability: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white outline-none"
                    placeholder="e.g. Natural rainfall, Drip irrigation, Drain runoff"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Surrounding Infrastructure / Land Use
                  </label>
                  <input
                    type="text"
                    value={formData.surroundingEnvironment}
                    onChange={(e) =>
                      setFormData({ ...formData, surroundingEnvironment: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white outline-none"
                    placeholder="e.g. Walkway, Overhead wires, Building facade"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 6: MAINTENANCE */}
          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Step 6 — Care Schedule & Maintenance Requirements
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Tag urgent arboricultural interventions and schedule next recurring inspection.
                </p>
              </div>

              {/* Action Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: "irrigationRequired", label: "💧 Irrigation / Deep Watering Required" },
                  { key: "pruningRequired", label: "✂️ Clearance / Deadwood Pruning Required" },
                  { key: "fertilizationRequired", label: "🌱 Organic Fertilization / Mulch Required" },
                  { key: "pestControlRequired", label: "🛡️ Bio-Pest Control Treatment Required" },
                  { key: "supportRequired", label: "🏗️ Guy-wire / Structural Support Required" },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/40 cursor-pointer hover:bg-stone-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={(formData as any)[item.key]}
                      onChange={(e) =>
                        setFormData({ ...formData, [item.key]: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                    />
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Next Inspection */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Schedule Next Field Inspection
                </label>
                <select
                  value={formData.nextInspectionDays}
                  onChange={(e) =>
                    setFormData({ ...formData, nextInspectionDays: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white outline-none"
                >
                  <option value={14}>In 14 days (Urgent follow-up)</option>
                  <option value={30}>In 1 month (Standard monthly)</option>
                  <option value={90}>In 3 months (Quarterly survey)</option>
                  <option value={180}>In 6 months (Semi-annual survey)</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Surveyor Observations & Field Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white outline-none"
                  placeholder="Notes regarding wildlife nesting, seasonal flowering, local cultural significance..."
                />
              </div>
            </motion.div>
          )}

          {/* STEP 7: REVIEW & SUBMIT */}
          {currentStep === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Step 7 — Review Specimen Registry Record
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Verify the integrity of collected coordinates, botanical identification, and measurements before commiting.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xl">
                      🌳
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-stone-900 dark:text-white">
                        {formData.commonName}
                      </h4>
                      <p className="text-xs italic text-stone-500">
                        {formData.scientificName} ({formData.family})
                      </p>
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                        {formData.nativeStatus ? "Native Indian Specimen" : "Non-native"}
                      </span>
                    </div>
                  </div>

                  <TreeHealthBadge status={formData.healthStatus} size="lg" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-200 dark:border-stone-800 text-xs">
                  <div>
                    <span className="block text-[10px] text-stone-400 uppercase font-semibold">
                      Coordinates
                    </span>
                    <span className="font-mono text-stone-800 dark:text-stone-200 font-semibold">
                      {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 uppercase font-semibold">
                      Height & DBH
                    </span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {formData.height}m / {formData.dbh}cm
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 uppercase font-semibold">
                      Canopy Spread
                    </span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {formData.canopyWidth}m
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 uppercase font-semibold">
                      Est. Age
                    </span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      ~{formData.estimatedAge} years
                    </span>
                  </div>
                </div>

                {formData.photos.length > 0 && (
                  <div className="pt-2">
                    <span className="block text-[10px] text-stone-400 uppercase font-semibold mb-1.5">
                      Attached Photos ({formData.photos.length})
                    </span>
                    <div className="flex gap-2 overflow-x-auto">
                      {formData.photos.map((p, idx) => (
                        <img
                          key={idx}
                          src={p.fileUrl}
                          alt="preview"
                          className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Footer Navigation Controls */}
        <div className="mt-8 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1 || submitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentStep < 7 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all hover:translate-x-0.5"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 disabled:opacity-50 transition-all hover:scale-102"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Committing Tree Record...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Tree Record</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
