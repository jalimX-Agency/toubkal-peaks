"use client";

import { useEffect } from "react";

/** Form fields stay usable: visitors can still select, copy and paste what they type. */
const editable = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || !!target.closest("input, textarea, select, [contenteditable]"));

const BLOCKED_KEYS = new Set(["c", "x", "a", "s", "u", "p"]);

/**
 * Discourages copying the site's texts and photos: no right-click menu, no copy or cut, no dragging
 * images out, no save / view-source / print shortcuts (the CSS side lives in globals.css).
 * The public site only; the admin is not wrapped. Nothing in a browser can stop screenshots or a
 * determined person reading the page source, so this deters casual copying, it does not lock content.
 */
export function CopyGuard() {
  useEffect(() => {
    const stop = (e: Event) => {
      if (!editable(e.target)) e.preventDefault();
    };
    const keys = (e: KeyboardEvent) => {
      if (e.key === "F12" || ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()))) {
        e.preventDefault();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && BLOCKED_KEYS.has(e.key.toLowerCase()) && !editable(e.target)) e.preventDefault();
    };
    const events = ["contextmenu", "copy", "cut", "dragstart", "selectstart"] as const;
    events.forEach((name) => document.addEventListener(name, stop));
    document.addEventListener("keydown", keys);
    return () => {
      events.forEach((name) => document.removeEventListener(name, stop));
      document.removeEventListener("keydown", keys);
    };
  }, []);
  return null;
}
