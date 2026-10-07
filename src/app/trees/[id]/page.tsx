"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trees,
  MapPin,
  Calendar,
  Ruler,
  HeartPulse,
  Wrench,
  Camera,
  History,
  Copy,
  Check,
  Plus,
  AlertTriangle,
  Compass,
  User,
  Shield,
  Edit,
  Trash2,
  ExternalLink,
  Info,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { TreeHealthBadge } from "@/components/ui/TreeHealthBadge";
import { MapLibreMap } from "@/components/maps/MapLibreMap";
import { formatCoordinates } from "@/lib/geo";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "@/components/providers/ToastProvider";
import { useAuth } from "@/components/providers/AuthProvider";

export default function TreeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const treeId = params?.id as string;

  const [tree, setTree] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "photos" | "health" | "inspections" | "maintenance" | "timeline">("overview");

  // Modals
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Form states for modals
  const [inspectionForm, setInspectionForm] = useState({
    healthStatus: "HEALTHY",
    riskLevel: "LOW",
    observations: "",
    recommendations: "",
    nextInspectionDate: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split("T")[0],
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    maintenanceType: "WATERING",
    description: "",
    notes: "",
    cost: "",
  });

  const [photoForm, setPhotoForm] = useState({
    fileUrl: "",
    photoType: "FULL_TREE",
    caption: "",
  });

  const fetchTree = async () => {
    try {
      const res = await fetch(`/api/trees/${treeId}`);
      if (res.ok) {
        const data = await res.json();
        setTree(data.tree);
        setAuditLogs(data.auditLogs || []);
      } else {
        toast.error("Tree record not found");
      }
    } catch {
      toast.error("Network error loading tree details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (treeId) fetchTree();
  }, [treeId]);

  const copyCoordinates = () => {
    if (!tree) return;
    navigator.clipboard.writeText(`${tree.latitude}, ${tree.longitude}`);
    setCopiedCoords(true);
    toast.success("Coordinates copied to clipboard");
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleAddInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/trees/${tree.id}/inspections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inspectionForm),
      });
      if (res.ok) {
        toast.success("Inspection report saved successfully!");
        setShowInspectionModal(false);
        fetchTree();
      } else {
        toast.error("Failed to submit inspection report");
      }
    } catch {
      toast.error("Network error submitting inspection");
    }
  };

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/trees/${tree.id}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...maintenanceForm,
          cost: maintenanceForm.cost ? parseFloat(maintenanceForm.cost) : null,
        }),
      });
      if (res.ok) {
        toast.success("Maintenance log recorded!");
        setShowMaintenanceModal(false);
        fetchTree();
      } else {
        toast.error("Failed to log maintenance");
      }
    } catch {
      toast.error("Network error recording maintenance");
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoForm.fileUrl) return;
    try {
      const res = await fetch(`/api/trees/${tree.id}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(photoForm),
      });
      if (res.ok) {
        toast.success("Photo added to specimen dossier!");
        setShowPhotoModal(false);
        fetchTree();
      } else {
        toast.error("Failed to upload photo");
      }
    } catch {
      toast.error("Network error adding photo");
    }
  };

  const handleDeleteTree = async () => {
    if (!confirm(`Are you sure you want to delete tree ${tree.treeCode}? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/trees/${tree.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Tree ${tree.treeCode} deleted`);
        router.push("/trees");
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to delete tree");
      }
    } catch {
      toast.error("Network error deleting tree");
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="py-20 text-center text-stone-500">Loading tree dossier...</div>
      </AppLayout>
    );
  }

  if (!tree) {
    return (
      <AppLayout>
        <div className="py-20 text-center text-stone-500">
          <p>Tree record not found.</p>
          <Link href="/trees" className="text-emerald-600 underline text-sm mt-2 block">
            Return to Tree Registry
          </Link>
        </div>
      </AppLayout>
    );
  }

  const primaryPhoto = tree.photos?.find((p: any) => p.isPrimary) || tree.photos?.[0];

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Link href="/trees" className="hover:text-emerald-700">
            Tree Registry
          </Link>
          <span>/</span>
          <span className="font-mono text-stone-800 dark:text-stone-200 font-semibold">
            {tree.treeCode}
          </span>
        </div>

        {/* Specimen Header Hero Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Primary Photo Thumbnail */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shrink-0">
              {primaryPhoto ? (
                <img
                  src={primaryPhoto.fileUrl}
                  alt={tree.commonName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  🌳
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {tree.treeCode}
                </span>
                <span className="text-xs text-stone-400 font-medium">
                  {tree.project?.name || "General Registry"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
                {tree.commonName}
              </h1>
              <p className="text-sm italic text-stone-500">
                {tree.scientificName} ({tree.family || "Meliaceae"})
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-stone-600 dark:text-stone-400">
                <TreeHealthBadge status={tree.healthStatus} size="sm" />
                <button
                  onClick={copyCoordinates}
                  className="flex items-center gap-1 font-mono text-[11px] bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded hover:bg-stone-200 transition-colors"
                >
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>{formatCoordinates(tree.latitude, tree.longitude)}</span>
                  {copiedCoords ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-stone-400" />
                  )}
                </button>
                <span>
                  Last inspected:{" "}
                  {tree.lastInspectedAt
                    ? formatDistanceToNow(new Date(tree.lastInspectedAt), { addSuffix: true })
                    : "Not inspected yet"}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowInspectionModal(true)}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Add Inspection</span>
            </button>
            <button
              onClick={() => setShowMaintenanceModal(true)}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-50 text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors"
            >
              <Wrench className="w-4 h-4" />
              <span>Log Maintenance</span>
            </button>
            {(user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER") && (
              <button
                onClick={handleDeleteTree}
                className="p-2 rounded-xl border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                title="Delete Tree"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 overflow-x-auto gap-2">
          {[
            { id: "overview", label: "Overview", icon: Trees },
            { id: "photos", label: `Photos (${tree.photos?.length || 0})`, icon: Camera },
            { id: "health", label: "Health & Risk", icon: HeartPulse },
            { id: "inspections", label: `Inspections (${tree.inspections?.length || 0})`, icon: Calendar },
            { id: "maintenance", label: `Maintenance (${tree.maintenances?.length || 0})`, icon: Wrench },
            { id: "timeline", label: `Audit Trail (${auditLogs.length})`, icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition-colors shrink-0 ${
                  isActive
                    ? "border-emerald-700 text-emerald-800 dark:text-emerald-400"
                    : "border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Botanical & Dimensions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dendrometric Dimensions */}
              <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                    Dendrometric Dimensions
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
                    <span className="block text-[10px] text-stone-400 uppercase font-semibold">
                      Height
                    </span>
                    <span className="text-base font-extrabold text-stone-900 dark:text-white font-mono">
                      {tree.height || "—"} m
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
                    <span className="block text-[10px] text-stone-400 uppercase font-semibold">
                      DBH (Diameter)
                    </span>
                    <span className="text-base font-extrabold text-stone-900 dark:text-white font-mono">
                      {tree.dbh || "—"} cm
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
                    <span className="block text-[10px] text-stone-400 uppercase font-semibold">
                      Circumference
                    </span>
                    <span className="text-base font-extrabold text-stone-900 dark:text-white font-mono">
                      {tree.trunkCircumference || "—"} cm
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
                    <span className="block text-[10px] text-stone-400 uppercase font-semibold">
                      Canopy Spread
                    </span>
                    <span className="text-base font-extrabold text-stone-900 dark:text-white font-mono">
                      {tree.canopyWidth || "—"} m
                    </span>
                  </div>
                </div>
              </div>

              {/* Environmental Context */}
              <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                    Environmental & Habitat Context
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-[10px] text-stone-400 uppercase font-semibold">
                      Soil Substrate
                    </span>
                    <p className="font-medium text-stone-800 dark:text-stone-200 mt-0.5">
                      {tree.soilCondition || "Loamy organic soil"}
                    </p>
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 uppercase font-semibold">
                      Sunlight Exposure
                    </span>
                    <p className="font-medium text-stone-800 dark:text-stone-200 mt-0.5">
                      {tree.sunlight || "Full Sunlight"}
                    </p>
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 uppercase font-semibold">
                      Water Availability
                    </span>
                    <p className="font-medium text-stone-800 dark:text-stone-200 mt-0.5">
                      {tree.waterAvailability || "Natural rainwater catchment"}
                    </p>
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 uppercase font-semibold">
                      Surrounding Land Use
                    </span>
                    <p className="font-medium text-stone-800 dark:text-stone-200 mt-0.5">
                      {tree.surroundingEnvironment || "Campus academic zone"}
                    </p>
                  </div>
                </div>

                {tree.notes && (
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
                    <span className="block text-[10px] text-stone-400 uppercase font-semibold">
                      Field Survey Notes
                    </span>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                      {tree.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Map & Geospatial Pin */}
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                      GIS Location
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-stone-400">
                    Accuracy: ±{tree.gpsAccuracy || 4}m
                  </span>
                </div>

                <MapLibreMap
                  trees={[
                    {
                      id: tree.id,
                      treeCode: tree.treeCode,
                      commonName: tree.commonName,
                      scientificName: tree.scientificName,
                      healthStatus: tree.healthStatus,
                      latitude: tree.latitude,
                      longitude: tree.longitude,
                    },
                  ]}
                  center={[tree.longitude, tree.latitude]}
                  zoom={16}
                  height="260px"
                  showLayerToggle={false}
                />

                <div className="text-xs text-stone-500 space-y-1 pt-1">
                  <p>
                    <span className="font-semibold text-stone-700 dark:text-stone-300">
                      Coordinates:
                    </span>{" "}
                    {tree.latitude.toFixed(6)}, {tree.longitude.toFixed(6)}
                  </p>
                  <p>
                    <span className="font-semibold text-stone-700 dark:text-stone-300">
                      Captured By:
                    </span>{" "}
                    {tree.createdBy?.name || "Surveyor"} ({tree.locationSource})
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PHOTOS */}
        {activeTab === "photos" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                Specimen Photographic Evidence ({tree.photos?.length || 0})
              </h3>
              <button
                onClick={() => setShowPhotoModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Photograph</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {tree.photos?.map((photo: any) => (
                <div
                  key={photo.id}
                  className="rounded-2xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs"
                >
                  <div className="h-52 w-full bg-stone-100 dark:bg-stone-800 relative">
                    <img
                      src={photo.fileUrl}
                      alt={photo.caption || tree.commonName}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/75 text-white">
                      {photo.photoType}
                    </span>
                    {photo.isPrimary && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                        Primary Photo
                      </span>
                    )}
                  </div>
                  <div className="p-3 text-xs text-stone-600 dark:text-stone-400">
                    <p className="font-medium text-stone-900 dark:text-white truncate">
                      {photo.caption || "Botanical record"}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Uploaded by {photo.uploadedBy?.name || "Surveyor"} •{" "}
                      {format(new Date(photo.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: HEALTH */}
        {activeTab === "health" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-stone-900 dark:text-white">
                  Tree Vitality & Biotic Risk Evaluation
                </h3>
                <p className="text-xs text-stone-500">
                  Comprehensive assessment of pathological and structural issues.
                </p>
              </div>
              <TreeHealthBadge status={tree.healthStatus} size="lg" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
                <span className="block text-[10px] text-stone-400 uppercase font-semibold">
                  Trunk & Bark State
                </span>
                <p className="font-bold text-stone-900 dark:text-white mt-1">
                  {tree.trunkCondition || "Sound bark structure"}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
                <span className="block text-[10px] text-stone-400 uppercase font-semibold">
                  Canopy & Foliage
                </span>
                <p className="font-bold text-stone-900 dark:text-white mt-1">
                  {tree.leafCondition || "Vibrant dense foliage"}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
                <span className="block text-[10px] text-stone-400 uppercase font-semibold">
                  Pest & Pathogen Infiltration
                </span>
                <p className="font-bold text-stone-900 dark:text-white mt-1">
                  {tree.pestStatus || "None detected"}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
                <span className="block text-[10px] text-stone-400 uppercase font-semibold">
                  Public Structural Risk
                </span>
                <p className="font-bold text-stone-900 dark:text-white mt-1">
                  {tree.riskLevel} Risk
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INSPECTIONS */}
        {activeTab === "inspections" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                Recurring Inspection Reports ({tree.inspections?.length || 0})
              </h3>
              <button
                onClick={() => setShowInspectionModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Perform Inspection</span>
              </button>
            </div>

            <div className="space-y-3">
              {tree.inspections?.length === 0 && (
                <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 text-stone-500 text-xs">
                  No inspection reports logged yet. Click "Perform Inspection" to record one.
                </div>
              )}

              {tree.inspections?.map((insp: any) => (
                <div
                  key={insp.id}
                  className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TreeHealthBadge status={insp.healthStatus} size="sm" />
                      <span className="text-xs text-stone-400 font-mono">
                        {format(new Date(insp.inspectionDate), "MMM d, yyyy")}
                      </span>
                    </div>
                    <span className="text-xs text-stone-500">
                      Inspector: <strong>{insp.inspector?.name || "Surveyor"}</strong>
                    </span>
                  </div>

                  {insp.observations && (
                    <div>
                      <span className="block text-[10px] text-stone-400 uppercase font-semibold">
                        Observations
                      </span>
                      <p className="text-xs text-stone-700 dark:text-stone-300 mt-0.5">
                        {insp.observations}
                      </p>
                    </div>
                  )}

                  {insp.recommendations && (
                    <div>
                      <span className="block text-[10px] text-stone-400 uppercase font-semibold">
                        Arborist Recommendations
                      </span>
                      <p className="text-xs text-stone-700 dark:text-stone-300 mt-0.5">
                        {insp.recommendations}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: MAINTENANCE */}
        {activeTab === "maintenance" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                Maintenance & Care History ({tree.maintenances?.length || 0})
              </h3>
              <button
                onClick={() => setShowMaintenanceModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Maintenance</span>
              </button>
            </div>

            <div className="space-y-3">
              {tree.maintenances?.length === 0 && (
                <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 text-stone-500 text-xs">
                  No maintenance activities recorded yet.
                </div>
              )}

              {tree.maintenances?.map((m: any) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 font-mono text-[10px]">
                        {m.maintenanceType}
                      </span>
                      <span className="text-stone-500 text-[11px]">
                        {format(new Date(m.performedAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <p className="font-medium text-stone-800 dark:text-stone-200">{m.description}</p>
                    {m.notes && <p className="text-[11px] text-stone-500">{m.notes}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-stone-400 block">Performed By</span>
                    <span className="font-semibold text-stone-700 dark:text-stone-300">
                      {m.performedBy?.name || "Technician"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: TIMELINE & AUDIT TRAIL */}
        {activeTab === "timeline" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-white">
                Historical Audit Trail & Modification Log
              </h3>
              <p className="text-xs text-stone-500">
                Cryptographic immutable log of every creation, photo upload, and status transition.
              </p>
            </div>

            <div className="relative pl-6 space-y-6 border-l-2 border-emerald-500/30">
              {auditLogs.map((log) => {
                let meta: any = {};
                try {
                  meta = JSON.parse(log.metadata || "{}");
                } catch {}

                return (
                  <div key={log.id} className="relative">
                    {/* Timeline Node Dot */}
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-white dark:ring-stone-900" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900 dark:text-white">
                          {meta.summary || `${log.action} on ${log.entityType}`}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        By {log.user?.name || "System"} ({log.user?.role || "SURVEYOR"})
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Inspection Modal */}
      {showInspectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900 dark:text-white">
              Log Recurring Tree Inspection
            </h3>
            <form onSubmit={handleAddInspection} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Health Status</label>
                <select
                  value={inspectionForm.healthStatus}
                  onChange={(e) =>
                    setInspectionForm({ ...inspectionForm, healthStatus: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                >
                  <option value="HEALTHY">🟢 Healthy</option>
                  <option value="GOOD">🟢 Good</option>
                  <option value="MODERATE">🟡 Moderate</option>
                  <option value="POOR">🟠 Poor</option>
                  <option value="CRITICAL">🔴 Critical</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Observations</label>
                <textarea
                  rows={3}
                  required
                  value={inspectionForm.observations}
                  onChange={(e) =>
                    setInspectionForm({ ...inspectionForm, observations: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                  placeholder="Canopy vigor, foliage color, pest symptoms..."
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Recommendations</label>
                <input
                  type="text"
                  value={inspectionForm.recommendations}
                  onChange={(e) =>
                    setInspectionForm({ ...inspectionForm, recommendations: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                  placeholder="e.g. Schedule clearance pruning, apply organic fertilizer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInspectionModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Save Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900 dark:text-white">
              Record Maintenance Activity
            </h3>
            <form onSubmit={handleAddMaintenance} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Maintenance Type</label>
                <select
                  value={maintenanceForm.maintenanceType}
                  onChange={(e) =>
                    setMaintenanceForm({ ...maintenanceForm, maintenanceType: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                >
                  <option value="WATERING">💧 Irrigation / Watering</option>
                  <option value="PRUNING">✂️ Pruning / Clearance</option>
                  <option value="FERTILIZATION">🌱 Fertilization / Soil Treatment</option>
                  <option value="PEST_CONTROL">🛡️ Pest Control</option>
                  <option value="STRUCTURAL_SUPPORT">🏗️ Structural Support</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Action Description</label>
                <input
                  type="text"
                  required
                  value={maintenanceForm.description}
                  onChange={(e) =>
                    setMaintenanceForm({ ...maintenanceForm, description: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                  placeholder="e.g. Deep watering with 50L and organic mulch layer applied"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Estimated Cost (INR / $)</label>
                <input
                  type="number"
                  value={maintenanceForm.cost}
                  onChange={(e) =>
                    setMaintenanceForm({ ...maintenanceForm, cost: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                  placeholder="450"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900 dark:text-white">
              Add Photo to Specimen
            </h3>
            <form onSubmit={handleAddPhoto} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Photo URL</label>
                <input
                  type="url"
                  required
                  value={photoForm.fileUrl}
                  onChange={(e) => setPhotoForm({ ...photoForm, fileUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Photo Type</label>
                <select
                  value={photoForm.photoType}
                  onChange={(e) => setPhotoForm({ ...photoForm, photoType: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                >
                  <option value="FULL_TREE">Full Tree Habit</option>
                  <option value="TRUNK">Trunk & Bark</option>
                  <option value="LEAVES">Foliage / Leaves</option>
                  <option value="FLOWERS">Flowers / Blossom</option>
                  <option value="DAMAGE">Damage / Cavity</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Caption</label>
                <input
                  type="text"
                  value={photoForm.caption}
                  onChange={(e) => setPhotoForm({ ...photoForm, caption: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                  placeholder="e.g. Upper crown canopy after seasonal rain"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Attach Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
