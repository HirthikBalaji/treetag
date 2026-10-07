"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trees,
  Leaf,
  AlertTriangle,
  Calendar,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Clock,
  Sparkles,
  Globe,
  PlusCircle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/StatCard";
import { MapLibreMap } from "@/components/maps/MapLibreMap";
import { TreeHealthBadge } from "@/components/ui/TreeHealthBadge";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/providers/ToastProvider";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

export default function DashboardPage() {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<any>(null);
  const [trees, setTrees] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [anRes, trRes, acRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/trees?limit=50"),
        fetch("/api/activity?limit=6"),
      ]);

      if (anRes.ok) setAnalytics(await anRes.json());
      if (trRes.ok) {
        const t = await trRes.json();
        setTrees(t.trees || []);
      }
      if (acRes.ok) {
        const a = await acRes.json();
        setActivity(a.logs || []);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSyncGbif = async () => {
    setSyncing(true);
    toast.info("Connecting to GBIF Open Access Biodiversity API...");
    try {
      const res = await fetch("/api/sync/gbif", { method: "POST" });
      const d = await res.json();
      if (res.ok) {
        toast.success(d.message || "Synced real open-source tree records!");
        await fetchDashboardData();
      } else {
        toast.error(d.error || "Sync failed");
      }
    } catch {
      toast.error("Network error syncing open data");
    } finally {
      setSyncing(false);
    }
  };

  const summary = analytics?.summary || {
    totalTrees: 0,
    treesThisMonth: 0,
    speciesCount: 0,
    nativePercentage: 0,
    needAttention: 0,
    criticalTrees: 0,
    inspectionsDue: 0,
    activeContributors: 0,
    simpsonDiversityIndex: 0,
  };

  const mapTrees = trees.map((t) => ({
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

  const healthColors = ["#16a34a", "#22c55e", "#eab308", "#f97316", "#ef4444"];

  return (
    <AppLayout>
      <div className="space-y-7 animate-in fade-in duration-300">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Digital Tree Registry
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Live Production Environment
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white mt-1">
              Biodiversity Intelligence Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/field"
              className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-50 text-stone-700 dark:text-stone-300 text-xs font-semibold shadow-xs transition-colors"
            >
              Field Mode
            </Link>
            <Link
              href="/trees/new"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Register Specimen</span>
            </Link>
          </div>
        </div>

        {/* Empty Database Fresh Onboarding Banner */}
        {summary.totalTrees === 0 && !loading && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-stone-900 to-stone-950 text-white border border-emerald-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Production Registry Initialized</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold">
                Your Digital Tree Registry is Clean and Ready
              </h2>
              <p className="text-xs text-stone-300 leading-relaxed">
                Zero mock records are seeded. You can start surveying field trees using the multi-step capture workflow with GPS detection, or ingest verified open-source botanical occurrences from the Global Biodiversity Information Facility (GBIF).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/trees/new"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
              >
                + Register First Tree
              </Link>
              <button
                type="button"
                disabled={syncing}
                onClick={handleSyncGbif}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>{syncing ? "Ingesting Open Data..." : "Ingest Open Data (GBIF)"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Top-Level KPI Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total Registered Trees"
            value={summary.totalTrees}
            subtitle={`+${summary.treesThisMonth} this month`}
            icon={Trees}
            badge="Registry Active"
            badgeColor="emerald"
          />
          <StatCard
            title="Species Diversity"
            value={`${summary.speciesCount} Species`}
            subtitle={`${summary.nativePercentage}% Native species`}
            icon={Leaf}
            badge="Taxa Count"
            badgeColor="emerald"
          />
          <StatCard
            title="Need Attention"
            value={summary.needAttention}
            subtitle={`${summary.criticalTrees} critical condition`}
            icon={AlertTriangle}
            badge="Action Required"
            badgeColor={summary.criticalTrees > 0 ? "red" : "amber"}
          />
          <StatCard
            title="Inspections Due"
            value={summary.inspectionsDue}
            subtitle={`${summary.activeContributors} active surveyors`}
            icon={Calendar}
            badge="Survey Schedule"
            badgeColor="blue"
          />
        </div>

        {/* Large Interactive GIS Canopy Map */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                Live Geospatial Canopy Map
              </h2>
              <span className="text-xs text-stone-500 hidden sm:inline">
                ({mapTrees.length} specimens plotted)
              </span>
            </div>
            <Link
              href="/map"
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Fullscreen Map</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="relative">
            <MapLibreMap
              trees={mapTrees}
              height="460px"
              center={[80.2707, 13.0827]}
              zoom={13.8}
              showLayerToggle={true}
            />
            {mapTrees.length === 0 && !loading && (
              <div className="absolute top-4 left-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-md flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-stone-700 dark:text-stone-300 font-medium">
                  Catalog empty. Plotted specimens will appear here automatically.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Middle Two-Column Section: Charts & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Distribution & Top Species */}
          <div className="lg:col-span-2 space-y-6">
            {/* Health Breakdown Chart */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                    Canopy Health Condition Breakdown
                  </h3>
                  <p className="text-xs text-stone-500">
                    Live classification of surveyed trees by arboricultural vigor
                  </p>
                </div>
                <Link
                  href="/analytics"
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Analytics &rarr;
                </Link>
              </div>

              {summary.totalTrees === 0 ? (
                <div className="h-56 flex flex-col items-center justify-center text-center p-6 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 text-stone-400">
                  <Trees className="w-8 h-8 text-stone-300 dark:text-stone-600 mb-2" />
                  <p className="text-xs font-medium text-stone-600 dark:text-stone-300">
                    No arboricultural health data recorded yet
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Health vigor and risk ratings will appear here as trees are inspected.
                  </p>
                </div>
              ) : (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics?.healthDistribution || []}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="status"
                        tick={{ fontSize: 11, fill: "#888888" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#888888" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          backgroundColor: "#18181b",
                          border: "1px solid #27272a",
                          color: "#ffffff",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {(analytics?.healthDistribution || []).map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || healthColors[index % healthColors.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Top Species Breakdown */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-3">
                Prevalent Botanical Species
              </h3>
              {(analytics?.topSpecies || []).length === 0 ? (
                <div className="p-6 text-center bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 text-stone-400 text-xs">
                  No botanical species recorded yet. Add trees to visualize species richness.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(analytics?.topSpecies || []).slice(0, 4).map((sp: any, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800"
                    >
                      <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 block font-mono">
                        {sp.count}
                      </span>
                      <span className="text-xs italic font-medium text-stone-800 dark:text-stone-200 line-clamp-1">
                        {sp.scientificName}
                      </span>
                      <span className="text-[10px] text-stone-500 uppercase tracking-wider block mt-0.5">
                        Specimens
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Timeline Feed */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                    Field Activity Feed
                  </h3>
                </div>
                <Link
                  href="/activity"
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  View All &rarr;
                </Link>
              </div>

              {activity.length === 0 ? (
                <div className="p-6 text-center bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 text-stone-400 text-xs space-y-1">
                  <p className="font-medium text-stone-600 dark:text-stone-300">
                    No field operations recorded
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Surveys, photo additions, and arborist updates will stream here in real time.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activity.map((log) => {
                    let meta: any = {};
                    try {
                      meta = JSON.parse(log.metadata || "{}");
                    } catch {}

                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 pb-3 border-b border-stone-100 dark:border-stone-800/80 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {log.user?.name ? log.user.name.charAt(0) : "S"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-stone-800 dark:text-stone-200 leading-snug">
                            {meta.summary || `${log.action} on ${log.entityType}`}
                          </p>
                          <span className="text-[10px] text-stone-400">
                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Biodiversity Intelligence Alert */}
            <div className="mt-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Biodiversity Intelligence</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {summary.totalTrees === 0 ? (
                  "Platform active. Simpson Index and microclimate cooling estimates will compute live as specimens are registered."
                ) : (
                  <>
                    Simpson Diversity Index is rated at{" "}
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                      {summary.simpsonDiversityIndex}
                    </span>
                    . {analytics?.biodiversityInsights?.priorityAction}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
