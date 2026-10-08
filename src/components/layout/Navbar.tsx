"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trees,
  Search,
  PlusCircle,
  Smartphone,
  Sun,
  Moon,
  User,
  Shield,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const isSurveyor = user?.role === "SURVEYOR";

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <Link
            href={isSurveyor ? "/trees/new" : "/dashboard"}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform">
              <Trees className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-stone-900 dark:text-white">
                  TreeTag
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {isSurveyor ? "Field Surveyor" : "GIS v2.4"}
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-stone-500 dark:text-stone-400 font-medium -mt-0.5">
                {isSurveyor
                  ? "Tree Registration Terminal"
                  : "Digital Tree Registry & Biodiversity Platform"}
              </p>
            </div>
          </Link>
        </div>

        {/* Global search trigger (Cmd+K) - Hidden for surveyors */}
        {!isSurveyor && (
          <div className="flex-1 max-w-md hidden md:block">
            <button
              onClick={() => {
                window.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "k", metaKey: true })
                );
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200/70 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 text-xs transition-colors border border-transparent hover:border-stone-300 dark:hover:border-stone-700"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-stone-400" />
                <span>Search specimens, coordinates, projects...</span>
              </div>
              <kbd className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500 shadow-2xs">
                ⌘K
              </kbd>
            </button>
          </div>
        )}

        {/* Action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Controls hidden for surveyor */}
          {!isSurveyor && (
            <>
              {/* Field mode toggle */}
              <Link
                href="/field"
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  pathname === "/field"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300"
                }`}
                title="Field survey touch interface"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Field Mode</span>
              </Link>

              {/* Add tree CTA */}
              <Link
                href="/trees/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm hover:shadow transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Tree</span>
              </Link>
            </>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Toggle color theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-600" />
            )}
          </button>

          {/* User profile & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen((p) => !p)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                {user ? user.name.charAt(0) : "S"}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-medium text-stone-900 dark:text-stone-100 leading-tight">
                  {user ? user.name : "Surveyor"}
                </p>
                <p className="text-[10px] text-stone-500 font-mono">
                  {user ? user.role : "SURVEYOR"}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
            </button>

            {userDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setUserDropdownOpen(false)}
              >
                <div className="px-3.5 py-2.5 border-b border-stone-100 dark:border-stone-800">
                  <p className="font-semibold text-stone-900 dark:text-stone-100">
                    {user?.name || "Field Surveyor"}
                  </p>
                  <p className="text-stone-500 text-[11px] truncate">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold uppercase">
                      {user?.role || "SURVEYOR"}
                    </span>
                    {user?.organization && (
                      <span className="text-[10px] text-stone-400 truncate">
                        {user.organization}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-1">
                  {!isSurveyor && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3.5 py-2 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                    >
                      <Shield className="w-3.5 h-3.5 text-stone-400" />
                      <span>Admin Settings</span>
                    </Link>
                  )}
                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
