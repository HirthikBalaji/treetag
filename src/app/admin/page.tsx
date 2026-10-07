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
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { format } from "date-fns";

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const d = await res.json();
        setUsers(d.users || []);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`User role updated to ${newRole}`);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        toast.error(data.error || "Failed to update role");
      }
    } catch {
      toast.error("Network error while updating role");
    } finally {
      setUpdatingUserId(null);
    }
  };

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

        {/* Current Active Account Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-lg shadow-xs">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-stone-900 dark:text-white">
                  {user?.name || "System Administrator"}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {user?.role || "ADMIN"}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                {user?.email} • {user?.organization || "MAHI Club"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Authenticated Session Active</span>
          </div>
        </div>

        {/* Live User Directory & RBAC Management */}
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                  User Directory & Role-Based Access Control (RBAC)
                </h3>
                <p className="text-xs text-stone-500">
                  Manage registered contributors, field surveyors, and administrative authority.
                </p>
              </div>
            </div>
            <button
              onClick={loadUsers}
              disabled={loadingUsers}
              className="p-1.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
              title="Refresh User Directory"
            >
              <RefreshCw className={`w-4 h-4 ${loadingUsers ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 font-semibold text-stone-500 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Contributor</th>
                  <th className="py-2.5 px-3">Organization</th>
                  <th className="py-2.5 px-3">Registered On</th>
                  <th className="py-2.5 px-3">Field Records</th>
                  <th className="py-2.5 px-3 text-right">System Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                    <td className="py-3 px-3">
                      <div className="font-bold text-stone-900 dark:text-white">
                        {u.name}
                      </div>
                      <div className="text-[11px] text-stone-500">{u.email}</div>
                    </td>
                    <td className="py-3 px-3 text-stone-600 dark:text-stone-300">
                      {u.organization || "—"}
                    </td>
                    <td className="py-3 px-3 text-stone-500 text-[11px]">
                      {format(new Date(u.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400 font-mono">
                          {u._count?.createdTrees || 0}
                        </span>
                        <span className="text-[10px] text-stone-400">trees</span>
                        <span className="text-stone-300">•</span>
                        <span className="font-semibold text-blue-600 font-mono">
                          {u._count?.inspections || 0}
                        </span>
                        <span className="text-[10px] text-stone-400">surveys</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <select
                        value={u.role}
                        disabled={updatingUserId === u.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="text-xs px-2.5 py-1 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 font-semibold text-stone-800 dark:text-stone-200 outline-none focus:border-emerald-500"
                      >
                        <option value="ADMIN">ADMIN (Full Access)</option>
                        <option value="PROJECT_MANAGER">PROJECT MANAGER</option>
                        <option value="SURVEYOR">SURVEYOR (Field Contributor)</option>
                        <option value="VIEWER">VIEWER (Read-Only)</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loadingUsers && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-stone-500">
                      No registered users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
                <span className="text-stone-500">Spatial Coordinate System</span>
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
