"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Leaf,
  Trees,
  AlertTriangle,
  Award,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Download,
  Compass,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/StatCard";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const summary = data?.summary || {
    totalTrees: 0,
    speciesCount: 0,
    nativePercentage: 0,
    needAttention: 0,
    simpsonDiversityIndex: 0,
  };

  return (
    <AppLayout>
      <div className="space-y-7 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Biodiversity Intelligence
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs text-stone-500 font-medium">Urban Canopy Assessment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
              Ecological Metrics & Population Analytics
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/export/geojson"
              download
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export GIS GeoJSON</span>
            </a>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Simpson Diversity Index"
            value={summary.simpsonDiversityIndex}
            subtitle={summary.totalTrees > 1 ? "Canopy ecological resilience" : "Pending survey data"}
            icon={Sparkles}
            badge={summary.totalTrees > 1 ? `D = ${summary.simpsonDiversityIndex}` : "D = 0.00"}
            badgeColor="emerald"
          />
          <StatCard
            title="Native Flora Representation"
            value={`${summary.nativePercentage}%`}
            subtitle="Indigenous microclimate suitability"
            icon={Leaf}
            badge="Protected"
            badgeColor="emerald"
          />
          <StatCard
            title="Species Richness"
            value={`${summary.speciesCount} Taxa`}
            subtitle="Documented across surveyed plots"
            icon={Trees}
            badge="Broad Spectrum"
            badgeColor="blue"
          />
          <StatCard
            title="Urgent Interventions"
            value={summary.needAttention}
            subtitle="Require pruning, aeration, or support"
            icon={AlertTriangle}
            badge="Action Required"
            badgeColor="amber"
          />
        </div>

        {/* Biodiversity Intelligence Deep Dive Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950 to-stone-900 text-white border border-emerald-800/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Automated Biodiversity Intelligence Synthesis</span>
            </div>
            <span className="text-xs font-mono text-emerald-300">COMPUTED LIVE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-emerald-800/40 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-emerald-300 text-[11px] font-semibold">
                Dominant Ecological Specimen
              </span>
              <p className="text-sm font-bold mt-1">
                {data?.biodiversityInsights?.mostPrevalentSpecies || "None registered yet"}
              </p>
              <p className="text-[11px] text-stone-300 mt-0.5">
                {summary.totalTrees > 0
                  ? "Top cataloged species by total specimen density."
                  : "Awaiting tree specimens in registry."}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-amber-300 text-[11px] font-semibold">
                Highest Vulnerability Specimen
              </span>
              <p className="text-sm font-bold mt-1">
                {data?.biodiversityInsights?.highestRiskSpecies || "None"}
              </p>
              <p className="text-[11px] text-stone-300 mt-0.5">
                {summary.totalTrees > 0
                  ? "Identified based on arboricultural damage or structural decay."
                  : "No risk alerts currently active."}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-emerald-300 text-[11px] font-semibold">
                Estimated Canopy Shadow Area
              </span>
              <p className="text-sm font-bold mt-1">
                {data?.biodiversityInsights?.canopyCoverSqMeters || 0} m²
              </p>
              <p className="text-[11px] text-stone-300 mt-0.5">
                {summary.totalTrees > 0
                  ? "Calculated shadow footprint mitigating urban heat island effect."
                  : "Calculated dynamically from tree crown diameters."}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Species Richness Bar Chart */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
            <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-1">
              Botanical Species Abundance Distribution
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Number of surveyed specimens cataloged per species
            </p>

            {(data?.topSpecies || []).length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 text-stone-400">
                <Trees className="w-8 h-8 text-stone-300 dark:text-stone-600 mb-2" />
                <p className="text-xs font-medium text-stone-600 dark:text-stone-300">
                  No species distribution data yet
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Register specimens to plot botanical taxonomic abundance.
                </p>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data?.topSpecies || []}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                  >
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="scientificName"
                      tick={{ fontSize: 10, fontStyle: "italic" }}
                      width={110}
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
                    <Bar dataKey="count" fill="#166534" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart 2: Monthly Tree Additions Trajectory */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
            <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-1">
              Survey Registry Growth Trajectory
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Cumulative trees tagged across field surveys
            </p>

            {summary.totalTrees === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 text-stone-400">
                <TrendingUp className="w-8 h-8 text-stone-300 dark:text-stone-600 mb-2" />
                <p className="text-xs font-medium text-stone-600 dark:text-stone-300">
                  No survey additions to plot yet
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Monthly tagging trajectory will visualize survey velocity here.
                </p>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.monthlyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        backgroundColor: "#18181b",
                        border: "1px solid #27272a",
                        color: "#ffffff",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#166534" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Top Survey Contributors Leaderboard */}
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-stone-900 dark:text-white">
              Field Surveyor Contribution Leaderboard
            </h3>
          </div>

          {(data?.contributors || []).length === 0 ? (
            <div className="p-6 text-center bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 text-stone-400 text-xs">
              No surveyor contributions recorded yet. Field registrations will rank top contributors.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(data?.contributors || []).map((c: any, index: number) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 flex items-center gap-3.5"
                >
                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                      {c.name ? c.name.charAt(0) : "S"}
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-stone-900 dark:text-white truncate">
                      {c.name}
                    </h4>
                    <p className="text-[10px] text-stone-400 font-medium">{c.role}</p>
                    <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                      {c.treesCreated} trees documented
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
