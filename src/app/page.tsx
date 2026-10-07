"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trees,
  MapPin,
  Camera,
  HeartPulse,
  Ruler,
  Compass,
  ArrowRight,
  Download,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  BarChart3,
  ExternalLink,
  Users,
} from "lucide-react";
import { MapLibreMap } from "@/components/maps/MapLibreMap";
import { TreeHealthBadge } from "@/components/ui/TreeHealthBadge";

export default function LandingPage() {
  const [demoTrees, setDemoTrees] = useState<any[]>([]);

  useEffect(() => {
    async function loadDemoTrees() {
      try {
        const res = await fetch("/api/trees?limit=30");
        if (res.ok) {
          const d = await res.json();
          setDemoTrees(d.trees || []);
        }
      } catch {}
    }
    loadDemoTrees();
  }, []);

  const mapPoints = demoTrees.map((t) => ({
    id: t.id,
    treeCode: t.treeCode,
    commonName: t.commonName,
    scientificName: t.scientificName,
    healthStatus: t.healthStatus,
    latitude: t.latitude,
    longitude: t.longitude,
    height: t.height,
    dbh: t.dbh,
  }));

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 selection:bg-emerald-500 selection:text-white transition-colors">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-900/20">
              <Trees className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-stone-900 dark:text-white">
                TreeTag
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Biodiversity GIS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold px-3.5 py-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition-all hover:scale-102"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Digital Tree Registry & Biodiversity Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-stone-900 dark:text-white leading-[1.1]">
            Map Every Tree. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600">
              Understand Every Forest.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed">
            A collaborative platform for documenting, monitoring, and protecting trees through
            precise geospatial coordinates, high-resolution photographs, botanical taxons, and
            complete audit trails.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-lg shadow-emerald-800/25 flex items-center gap-2 transition-all hover:scale-102"
          >
            <span>Open Live Registry Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/trees/new"
            className="px-6 py-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 text-stone-800 dark:text-stone-200 font-bold text-sm shadow-sm transition-all"
          >
            Start 7-Step Field Survey
          </Link>
          <Link
            href="/field"
            className="px-6 py-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-700/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-950/60 font-bold text-sm shadow-sm transition-all flex items-center gap-2"
          >
            <Smartphone className="w-4 h-4" />
            <span>Field Mode Terminal</span>
          </Link>
        </motion.div>

        {/* Live GIS Map Preview Frame */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="pt-6"
        >
          <div className="relative rounded-3xl overflow-hidden border-2 border-stone-200 dark:border-stone-800 shadow-2xl bg-white dark:bg-stone-900 p-2 sm:p-3">
            <div className="flex items-center justify-between px-3 py-2 border-b border-stone-100 dark:border-stone-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <span className="font-mono text-[11px] text-stone-500 ml-2">
                  MapLibre GL JS • Vector Tiles • EPSG:4326 PostGIS
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                50+ Sample Canopies Plotted
              </span>
            </div>

            <MapLibreMap
              trees={mapPoints}
              height="480px"
              center={[80.2707, 13.0827]}
              zoom={13.6}
              showLayerToggle={true}
            />
          </div>
        </motion.div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-stone-200 dark:border-stone-800 space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            End-to-End Survey Engineering
          </span>
          <h2 className="text-3xl font-extrabold text-stone-900 dark:text-white">
            Everything Required for Professional Canopy Audits
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-900 dark:text-white">
              Sub-Meter GPS Pinpointing
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Browser Geolocation API integration with signal accuracy meters (±Xm), interactive
              drag-to-adjust map markers, and altitude telemetry.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-900 dark:text-white">
              Multi-Angle Photographic Evidence
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Upload and tag specimen photos across categories: Full Habit, Leaves, Trunk Bark,
              Blossoms, Damage, and Root Flare, with primary photo designation.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-900 dark:text-white">
              Arboricultural Health & Biotic Risks
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Systematically assess crown defoliation, fungal conks, trunk cavities, and structural
              lean, coupled with recurring inspection scheduling.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-900 dark:text-white">
              Offline-First Field Mode
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Conduct surveys deep in forest arboretums or zero-cell campus zones. Records are
              persisted locally and synced with one tap upon reconnection.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-900 dark:text-white">
              GIS Standard GeoJSON & CSV
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Instant 1-click export of complete FeatureCollections for QGIS, ArcGIS Pro, Google
              Earth, CAD, and environmental impact assessments.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-900 dark:text-white">
              Role-Based Team Collaboration
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Manage multi-tier teams across Admins, Project Managers, Surveyors, and Public
              Viewers with immutable audit trail logging.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-8 px-4 text-center text-xs text-stone-500">
        <p className="font-semibold text-stone-700 dark:text-stone-300">
          TreeTag — Digital Tree Registry & Biodiversity Intelligence Platform
        </p>
        <p className="text-[11px] text-stone-400 mt-1">
          Designed for Universities, Municipalities, Environmental NGOs, and ESG Teams.
        </p>
      </footer>
    </div>
  );
}
