import { useLayoutEffect } from "react";

export default function useScrollRestoration() {
  useLayoutEffect(() => {
    const storageKey = "portfolio-reload-position";
    const url = window.location.href;
    const initialHash = window.location.hash;
    let savedY: number | undefined;
    const navigation = performance.getEntriesByType("navigation")[0] as
      PerformanceNavigationTiming | undefined;
    if (navigation?.type === "reload") {
      try {
        const stored = sessionStorage.getItem(storageKey);
        if (stored) {
          const position: unknown = JSON.parse(stored);
          if (
            position &&
            typeof position === "object" &&
            "url" in position &&
            position.url === url &&
            "y" in position &&
            typeof position.y === "number" &&
            Number.isFinite(position.y) &&
            position.y >= 0
          ) {
            savedY = position.y;
          }
        }
      } catch {
        console.warn(
          "Saved reading position unavailable; using normal section navigation.",
        );
      }
    }

    const savePosition = () => {
      try {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({ url: window.location.href, y: window.scrollY }),
        );
      } catch {
        console.warn("Reading position could not be saved for reload.");
      }
    };
    window.addEventListener("pagehide", savePosition);
    let target: HTMLElement | null = null;
    if (savedY === undefined && initialHash) {
      try {
        target = document.getElementById(
          decodeURIComponent(initialHash.slice(1)),
        );
      } catch {
        console.warn("Unable to navigate to a malformed section fragment.");
      }
    }
    const restore = () => {
      if (savedY !== undefined) {
        window.scrollTo({ top: savedY, behavior: "instant" });
      } else {
        target?.scrollIntoView({ behavior: "instant", block: "start" });
      }
    };
    restore();
    const initialScroll = window.scrollY;
    let cancelled = false;
    // Correct font-induced movement without overriding subsequent user navigation.
    void document.fonts.ready.then(() => {
      if (
        !cancelled &&
        window.location.hash === initialHash &&
        Math.abs(window.scrollY - initialScroll) < 1
      ) {
        restore();
      }
    });
    return () => {
      cancelled = true;
      window.removeEventListener("pagehide", savePosition);
    };
  }, []);
}
