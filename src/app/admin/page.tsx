"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Shield,
  Users,
  Database,
  Download,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Server,
  Key,
} from "lucide-react";
import { useAuth, DEMO_USERS } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";

export default function AdminPage() {
  const { user, switchDemoUser } = useAuth();
  const { toast } = useToast();

  return (
    <AppLayout>
      <div className="space-y-7 max-w-5xl mx-auto animate-in fade-in duration-200">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              System Administration
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500 font-medium">RBAC & Geospatial Infrastructure</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
            Admin Governance & Platform Configuration
          </h1>
        </div>

        {/* Current Identity & Role Switcher */}
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                Active User Identity & RBAC Simulation
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">
              {user?.role || "SURVEYOR"}
            </span>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed">
            Switch between authenticated demo roles with 1 click to test permissions across Admin, Project Manager, Surveyor, and Read-Only Viewer.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {(
              [
                { role: "ADMIN", name: "Hirthik Sharma", desc: "Full permissions & system deletion" },
                { role: "PROJECT_MANAGER", name: "Dr. Sunita Rao", desc: "Project & inspection oversight" },
                { role: "SURVEYOR", name: "Arjun Patel", desc: "Add trees, upload photos, surveys" },
                { role: "VIEWER", name: "Ananya Iyer", desc: "Read-only access to GIS records" },
              ] as const
            ).map((item) => (
              <div
                key={item.role}
                onClick={() => switchDemoUser(item.role)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  user?.role === item.role
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 shadow-xs"
                    : "bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 hover:border-emerald-500/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                    {item.role}
                  </span>
                  {user?.role === item.role && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <h4 className="font-bold text-xs text-stone-900 dark:text-white mt-2">
                  {item.name}
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Database & Spatial Engine Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                Geospatial Database Engine
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-stone-100 dark:border-stone-800">
                <span className="text-stone-500">Database Engine</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">PostgreSQL 15</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100 dark:border-stone-800">
                <span className="text-stone-500">Spatial Indexing</span>
                <span className="font-mono text-emerald-600 font-bold">WGS84 / EPSG:4326</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100 dark:border-stone-800">
                <span className="text-stone-500">Active Database</span>
                <span className="font-mono text-stone-800 dark:text-stone-200">treetag_db</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-stone-500">ORM Schema Layer</span>
                <span className="font-mono text-stone-800 dark:text-stone-200">Prisma v5.22</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                Data Export & Interoperability
              </h3>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Export standard spatial formats for integration with GIS desktop software (QGIS, ArcGIS Pro, Google Earth).
            </p>

            <div className="space-y-2 pt-2">
              <a
                href="/api/export/geojson"
                download
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors"
              >
                <span>Download Spatial GeoJSON (FeatureCollection)</span>
                <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded">
                  .geojson
                </span>
              </a>

              <a
                href="/api/export/csv"
                download
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors"
              >
                <span>Download Complete Registry CSV Table</span>
                <span className="font-mono text-[10px] bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded">
                  .csv
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
