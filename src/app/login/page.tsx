"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trees, Lock, Mail, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth, DEMO_USERS } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoUser } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      toast.success("Welcome back to TreeTag!");
      router.push("/dashboard");
    } else {
      toast.error(res.error || "Login failed");
    }
  };

  const handleQuickDemo = async (role: "ADMIN" | "PROJECT_MANAGER" | "SURVEYOR" | "VIEWER") => {
    setLoading(true);
    await switchDemoUser(role);
    setLoading(false);
    toast.success(`Logged in as demo ${role}`);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-lg shadow-emerald-900/20 mb-2">
            <Trees className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">TreeTag</h1>
          <p className="text-xs text-stone-500">
            Digital Tree Registry & Biodiversity Intelligence Platform
          </p>
        </div>

        {/* 1-Click Demo Accounts Box */}
        <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Instant 1-Click Demo Sign In</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo("ADMIN")}
              className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 text-left transition-colors"
            >
              <span className="font-bold block text-stone-900 dark:text-white">Admin</span>
              <span className="text-[10px] text-stone-400">Hirthik Sharma</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("PROJECT_MANAGER")}
              className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 text-left transition-colors"
            >
              <span className="font-bold block text-stone-900 dark:text-white">Project Manager</span>
              <span className="text-[10px] text-stone-400">Dr. Sunita Rao</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("SURVEYOR")}
              className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 text-left transition-colors"
            >
              <span className="font-bold block text-stone-900 dark:text-white">Field Surveyor</span>
              <span className="text-[10px] text-stone-400">Arjun Patel</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("VIEWER")}
              className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 text-left transition-colors"
            >
              <span className="font-bold block text-stone-900 dark:text-white">Public Viewer</span>
              <span className="text-[10px] text-stone-400">Ananya Iyer</span>
            </button>
          </div>
        </div>

        {/* Traditional Credentials Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white outline-none focus:border-emerald-500"
                  placeholder="admin@treetag.org"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white outline-none focus:border-emerald-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Sign In with Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/register"
              className="text-xs text-stone-500 hover:text-emerald-700 dark:hover:text-emerald-400"
            >
              Need a new account? Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
