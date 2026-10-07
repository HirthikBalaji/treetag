"use client";

export interface PendingTreeSync {
  localId: string;
  timestamp: number;
  payload: any;
  status: "pending" | "syncing" | "failed";
  error?: string;
}

const STORAGE_KEY = "treetag_offline_pending_queue";

export function getPendingQueue(): PendingTreeSync[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePendingTree(payload: any): PendingTreeSync {
  const queue = getPendingQueue();
  const newItem: PendingTreeSync = {
    localId: `local-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: Date.now(),
    payload,
    status: "pending",
  };
  queue.push(newItem);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new Event("treetag_queue_updated"));
  }
  return newItem;
}

export function removePendingTree(localId: string) {
  const queue = getPendingQueue().filter((item) => item.localId !== localId);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new Event("treetag_queue_updated"));
  }
}

export async function syncPendingQueue(
  onSuccessItem?: (item: PendingTreeSync, serverTree: any) => void
): Promise<{ synced: number; failed: number }> {
  const queue = getPendingQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      const res = await fetch("/api/trees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.payload),
      });

      if (res.ok) {
        const data = await res.json();
        removePendingTree(item.localId);
        synced++;
        if (onSuccessItem) onSuccessItem(item, data);
      } else {
        failed++;
      }
    } catch (err) {
      failed++;
    }
  }

  return { synced, failed };
}
