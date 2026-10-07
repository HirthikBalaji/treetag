"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trees,
  Lock,
  Mail,
  User,
  Building,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { refreshSession } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    organization: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFirstUser, setIsFirstUser] = useState(false);

  useEffect(() => {
    async function checkSetup() {
      try {
        const res = await fetch("/api/auth/setup-status");
        if (res.ok) {
          const data = await res.json();
          if (!data.hasUsers) {
            setIsFirstUser(true);
          }
        }
      } catch {}
    }
    checkSetup();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          organization: form.organization || "Environmental Forestry Registry",
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        toast.success(
          isFirstUser
            ? "Administrator account created successfully!"
            : "Account registered successfully!"
        );
        await refreshSession();
        router.push("/dashboard");
      } else {
        setErrorMsg(data.error || "Failed to create account");
      }
    } catch {
      setLoading(false);
      setErrorMsg("Network error during registration");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 selection:bg-emerald-600 selection:text-white transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-xl shadow-emerald-900/20">
          <Trees className="w-7 h-7" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white">
          Create TreeTag Account
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-xs mx-auto">
          {isFirstUser
            ? "Bootstrap your registry with the Initial Administrator account"
            : "Join your team to document, monitor, and manage tree canopies"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {isFirstUser && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="leading-relaxed">
              <strong>Initial Instance Bootstrap:</strong> You are registering the first account on this platform. You will automatically be granted <strong>System Administrator</strong> privileges.
            </span>
          </div>
        )}

        <div className="bg-white dark:bg-stone-900 py-8 px-6 sm:px-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-900/5 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1.5 text-stone-700 dark:text-stone-300">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1.5 text-stone-700 dark:text-stone-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                  placeholder="surveyor@institution.org"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1.5 text-stone-700 dark:text-stone-300">
                Organization / Campus / NGO
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type="text"
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                  placeholder="e.g. University Sustainability Cell / Forest Wing"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1.5 text-stone-700 dark:text-stone-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                  placeholder="At least 6 characters"
                  minLength={6}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-900/15 transition-all hover:scale-101 active:scale-98"
              >
                <span>{loading ? "Registering..." : isFirstUser ? "Create Administrator Account" : "Register Account"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 text-center">
            <p className="text-xs text-stone-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-2 text-[11px] text-stone-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Role-Based Access Control • PostGIS WGS84 Registry</span>
        </div>
      </div>
    </div>
  );
}
