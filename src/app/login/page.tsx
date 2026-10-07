"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trees,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFreshSetup, setIsFreshSetup] = useState(false);

  useEffect(() => {
    async function checkSetup() {
      try {
        const res = await fetch("/api/auth/setup-status");
        if (res.ok) {
          const data = await res.json();
          if (!data.hasUsers) {
            setIsFreshSetup(true);
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

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      toast.success("Welcome back to TreeTag!");
      router.push("/dashboard");
    } else {
      setErrorMsg(res.error || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 selection:bg-emerald-600 selection:text-white transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        {/* Brand Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-xl shadow-emerald-900/20">
          <Trees className="w-7 h-7" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white">
          Sign In to TreeTag
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-xs mx-auto">
          Digital Tree Registry & Geospatial Biodiversity Intelligence Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Initial Clean Setup Alert */}
        {isFreshSetup && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Initial System Bootstrap</span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
              No registered accounts found in the database. The first account created will automatically become the <strong>System Administrator</strong>.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 font-bold text-xs text-emerald-700 dark:text-emerald-300 underline hover:text-emerald-900"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Initial Administrator Account &rarr;</span>
            </Link>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white dark:bg-stone-900 py-8 px-6 sm:px-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-900/5 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email Field */}
            <div>
              <label className="block font-semibold mb-1.5 text-stone-700 dark:text-stone-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                  placeholder="surveyor@institution.org"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-stone-600 dark:text-stone-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-emerald-600 accent-emerald-600"
                />
                <span>Remember this terminal</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-900/15 transition-all hover:scale-101 active:scale-98"
              >
                <span>{loading ? "Authenticating..." : "Sign In to Registry"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 text-center">
            <p className="text-xs text-stone-500">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Security & System Indicator */}
        <div className="mt-8 text-center flex items-center justify-center gap-2 text-[11px] text-stone-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>PostGIS Spatial Security • Enterprise Encrypted Session</span>
        </div>
      </div>
    </div>
  );
}
