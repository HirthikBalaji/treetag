"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Activity,
  Filter,
  Clock,
  User,
  Trees,
  Camera,
  HeartPulse,
  Wrench,
  Shield,
  Search,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export default function ActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [selectedEntity, setSelectedEntity] = useState("ALL");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (selectedAction !== "ALL") params.set("action", selectedAction);
      if (selectedEntity !== "ALL") params.set("entityType", selectedEntity);

      const res = await fetch(`/api/activity?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch {
      console.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedAction, selectedEntity]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
      case "UPDATE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
      case "PHOTO_UPLOAD":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300";
      case "INSPECTION":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
      case "MAINTENANCE":
        return "bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-300";
      default:
        return "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-400";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Governance & Audit Trail
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs text-stone-500 font-medium">Immutable Modification Logs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
              System Activity & Audit Log
            </h1>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 font-medium text-stone-800 dark:text-stone-200 outline-none"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="INSPECTION">INSPECTION</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="PHOTO_UPLOAD">PHOTO_UPLOAD</option>
              <option value="DELETE">DELETE</option>
            </select>

            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 font-medium text-stone-800 dark:text-stone-200 outline-none"
            >
              <option value="ALL">All Entities</option>
              <option value="TREE">Tree</option>
              <option value="PHOTO">Photo</option>
              <option value="INSPECTION">Inspection</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="PROJECT">Project</option>
            </select>
          </div>
        </div>

        {/* Audit Timeline Table */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 space-y-4">
            {logs.length === 0 && !loading && (
              <div className="py-12 text-center text-stone-500 text-xs">
                No system activity logs found matching current filters.
              </div>
            )}

            {logs.map((log) => {
              let meta: any = {};
              try {
                meta = JSON.parse(log.metadata || "{}");
              } catch {}

              return (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {log.user?.name ? log.user.name.charAt(0) : "S"}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${getActionBadge(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                        <span className="font-semibold text-stone-900 dark:text-white">
                          {log.entityType}
                        </span>
                      </div>
                      <p className="font-medium text-stone-800 dark:text-stone-200 mt-1">
                        {meta.summary || `Modified ${log.entityType} ${log.entityId}`}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        By {log.user?.name || "System Surveyor"} •{" "}
                        {log.user?.role || "SURVEYOR"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:self-center shrink-0">
                    <span className="font-mono text-[11px] text-stone-500 block">
                      {format(new Date(log.createdAt), "HH:mm:ss")}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
