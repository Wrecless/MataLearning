import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'mata-hub:completed-games';
const listeners = new Set();

function readStoredCompleted() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

let completedGames = readStoredCompleted();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function markGameComplete(gameId) {
  if (completedGames.has(gameId)) {
    return;
  }

  completedGames = new Set(completedGames).add(gameId);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedGames]));
  } catch {
    // Storage unavailable (private browsing, disabled cookies) - progress just won't persist.
  }

  emitChange();
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return completedGames;
}

export function useCompletedGames() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
