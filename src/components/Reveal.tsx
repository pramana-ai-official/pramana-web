"use client";

import { useEffect } from "react";

/**
 * Watches every element marked `data-reveal` and marks it `data-seen` the first time it
 * scrolls into view. The CSS in globals.css ("motion") does the animating.
 *
 * A number marked `data-count="<start>"` inside it counts up from that start to the
 * figure written in the page, and always ends on exactly that figure.
 */
export function RevealObserver() {
  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.dataset.seen = "";
          observer.unobserve(el);
          if (!calm) el.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
        }
      },
      { rootMargin: "0px 0px -18% 0px" },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}

function countUp(el: HTMLElement) {
  const figure = el.textContent ?? "";
  const to = Number(figure);
  const from = Number(el.dataset.count);
  if (el.dataset.counted !== undefined || !Number.isFinite(to)) return;
  el.dataset.counted = "";
  const start = performance.now();
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / 1100);
    el.textContent = p < 1 ? String(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 4)))) : figure;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
