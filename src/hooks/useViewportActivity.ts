import { useEffect, useState, type RefObject } from "react";

export default function useViewportActivity(
  target: RefObject<HTMLElement | null>,
  margin = "0px",
) {
  const [activity, setActivity] = useState({ entered: false, active: false });

  useEffect(() => {
    const element = target.current;
    if (!element) return;
    let near = false;
    const update = () => {
      const active = near && !document.hidden;
      setActivity((previous) =>
        previous.active === active && (previous.entered || !active)
          ? previous
          : { entered: previous.entered || active, active },
      );
    };
    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver === "undefined") {
      console.warn(
        "Viewport observation unavailable; loading content without deferral.",
      );
      near = true;
      update();
    } else {
      observer = new IntersectionObserver(
        ([entry]) => {
          near = entry?.isIntersecting ?? false;
          update();
        },
        { rootMargin: margin },
      );
      observer.observe(element);
    }
    document.addEventListener("visibilitychange", update);
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [target, margin]);

  return activity;
}
