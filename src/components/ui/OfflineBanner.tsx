"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { getPendingQueue, syncPendingQueue, PendingTreeSync } from "@/lib/offline-sync";
import { useToast } from "@/components/providers/ToastProvider";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const updateStatus = () => {
    setIsOnline(navigator.onLine);
    setPendingCount(getPendingQueue().length);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);
    setPendingCount(getPendingQueue().length);

    const handleOnline = () => {
      setIsOnline(true);
      toast.info("Back online. Ready to synchronize field records.");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.info("Network disconnected. Operating in offline field survey mode.");
    };

    const handleQueueChange = () => {
      setPendingCount(getPendingQueue().length);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("treetag_queue_updated", handleQueueChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("treetag_queue_updated", handleQueueChange);
    };
  }, [toast]);

  const handleSync = async () => {
    if (!isOnline) {
      toast.error("Cannot synchronize while offline. Please connect to internet.");
      return;
    }
    setIsSyncing(true);
    try {
      const { synced, failed } = await syncPendingQueue();
      if (synced > 0) {
        toast.success(`Successfully synchronized ${synced} field survey record(s)!`);
      }
      if (failed > 0) {
        toast.error(`${failed} record(s) could not be synced. Will retry later.`);
      }
      setPendingCount(getPendingQueue().length);
    } catch {
      toast.error("Error during synchronization process.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={`w-full px-4 py-2 text-sm flex items-center justify-between transition-colors ${
        !isOnline
          ? "bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200"
          : "bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
      }`}
    >
      <div className="flex items-center gap-2 max-w-xl">
        {!isOnline ? (
          <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        )}
        <span className="font-medium text-xs sm:text-sm">
          {!isOnline
            ? "Offline Mode — Changes will be stored safely on device and uploaded once network returns."
            : `${pendingCount} offline field record(s) waiting to sync to the server.`}
        </span>
      </div>

      {pendingCount > 0 && (
        <button
          onClick={handleSync}
          disabled={isSyncing || !isOnline}
          className="ml-3 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
        </button>
      )}
    </div>
  );
}
