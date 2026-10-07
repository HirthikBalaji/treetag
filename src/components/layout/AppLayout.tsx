"use client";

import React from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { CommandPalette } from "@/components/ui/CommandPalette";

interface AppLayoutProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
}

export function AppLayout({ children, hideSidebar = false }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      <OfflineBanner />
      <Navbar />
      <CommandPalette />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {!hideSidebar && <Sidebar />}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
