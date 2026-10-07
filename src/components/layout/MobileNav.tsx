"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MapPin, Plus, Trees, Smartphone } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const links = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "Map", href: "/map", icon: MapPin },
    { label: "Add", href: "/trees/new", icon: Plus, isAction: true },
    { label: "Trees", href: "/trees", icon: Trees },
    { label: "Field", href: "/field", icon: Smartphone },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg border-t border-stone-200 dark:border-stone-800 px-3 py-1.5 flex items-center justify-around shadow-lg">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        if (link.isAction) {
          return (
            <Link
              key={link.label}
              href={link.href}
              className="relative -top-4 w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-700/30 active:scale-95 transition-transform"
              title="Add Tree"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </Link>
          );
        }

        return (
          <Link
            key={link.label}
            href={link.href}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
              isActive
                ? "text-emerald-700 dark:text-emerald-400 font-bold"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-800"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
