"use client";

import { useSyncExternalStore } from "react";

type Listener = () => void;

export function createPersistedStore<T>(key: string, initial: T) {
  let state = initial;
  let hydrated = false;
  const listeners = new Set<Listener>();

  function emit() {
    for (const listener of listeners) {
      listener();
    }
  }

  function readStorage(): T {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return initial;
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  }

  function writeStorage(next: T) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // quota / private mode — состояние остаётся в памяти
    }
  }

  function ensureHydrated() {
    if (hydrated || typeof window === "undefined") return;
    state = readStorage();
    hydrated = true;
  }

  function getSnapshot(): T {
    ensureHydrated();
    return state;
  }

  function getServerSnapshot(): T {
    return initial;
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function setState(updater: T | ((prev: T) => T)) {
    ensureHydrated();
    const next =
      typeof updater === "function" ? (updater as (prev: T) => T)(state) : updater;
    state = next;
    writeStorage(next);
    emit();
  }

  function useStore(): T {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  }

  return { useStore, getSnapshot, setState, subscribe };
}
