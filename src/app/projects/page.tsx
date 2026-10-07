"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  FolderKanban,
  Plus,
  Trees,
  Users,
  Compass,
  MapPin,
  ExternalLink,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";

export default function ProjectsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    areaSqKm: "12.5",
    centerLat: "13.0827",
    centerLng: "80.2707",
  });

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          areaSqKm: parseFloat(form.areaSqKm),
          centerLat: parseFloat(form.centerLat),
          centerLng: parseFloat(form.centerLng),
        }),
      });

      if (res.ok) {
        toast.success(`Project ${form.name} created successfully!`);
        setShowCreateModal(false);
        setForm({
          name: "",
          code: "",
          description: "",
          areaSqKm: "12.5",
          centerLat: "13.0827",
          centerLng: "80.2707",
        });
        fetchProjects();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to create project");
      }
    } catch {
      toast.error("Network error creating project");
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
                Workspaces
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs text-stone-500 font-medium">
                {projects.length} Active Survey Areas
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
              Field Survey Projects
            </h1>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Survey Project</span>
          </button>
        </div>

        {/* Projects Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.length === 0 && !loading && (
            <div className="col-span-full p-12 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 text-stone-500 space-y-3">
              <FolderKanban className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-white">No survey projects active</h3>
                <p className="text-xs text-stone-500 mt-1">Create your first survey project zone to organize tree records.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Survey Project</span>
              </button>
            </div>
          )}
          {projects.map((p) => (
            <div
              key={p.id}
              className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {p.code}
                  </span>
                  <span className="text-[11px] text-stone-400 font-medium">
                    {p.organization}
                  </span>
                </div>

                <h3 className="font-extrabold text-lg text-stone-900 dark:text-white leading-snug">
                  {p.name}
                </h3>
                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                  {p.description || "Active canopy biodiversity mapping zone."}
                </p>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold flex items-center gap-1">
                      <Trees className="w-3 h-3 text-emerald-600" /> Trees Plotted
                    </span>
                    <span className="text-base font-extrabold text-stone-900 dark:text-white font-mono">
                      {p._count?.trees || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold flex items-center gap-1">
                      <Users className="w-3 h-3 text-emerald-600" /> Team Surveyors
                    </span>
                    <span className="text-base font-extrabold text-stone-900 dark:text-white font-mono">
                      {p._count?.members || 1}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-stone-100 dark:border-stone-800">
                <Link
                  href={`/trees?projectId=${p.id}`}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-emerald-700 hover:text-white text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors"
                >
                  <span>Explore Project Trees</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900 dark:text-white">
              Create New Field Survey Project
            </h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                  placeholder="e.g. South Campus Biodiversity Audit 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Project Code</label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 font-mono uppercase"
                    placeholder="e.g. SC-AUDIT"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Survey Area (Sq Km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.areaSqKm}
                    onChange={(e) => setForm({ ...form, areaSqKm: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                  placeholder="Goals, boundaries, and methodology..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
