"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "mata-hub:completed-games";
const listeners = new Set<() => void>();
const serverSnapshot: ReadonlySet<string> = new Set();
let completedGames = new Set<string>();
let lastRaw: string | null | undefined;

function getSnapshot(): ReadonlySet<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw !== lastRaw) {
      lastRaw = raw;
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      completedGames = new Set(
        Array.isArray(parsed)
          ? parsed.filter((id): id is string => typeof id === "string")
          : [],
      );
    }
  } catch {
    // Storage can be disabled. Keep in-memory progress usable for this session.
  }
  return completedGames;
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key === STORAGE_KEY || event.key === null) emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function markGameComplete(gameId: string) {
  const current = getSnapshot();
  if (current.has(gameId)) return;
  completedGames = new Set(current).add(gameId);
  try {
    const raw = JSON.stringify([...completedGames]);
    window.localStorage.setItem(STORAGE_KEY, raw);
    lastRaw = raw;
  } catch {
    // Progress still updates in memory when persistence is unavailable.
  }
  emitChange();
}

export function useCompletedGames() {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}
