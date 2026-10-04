import { useEffect, useRef, useState } from "react";

type CountUpProps = {
  value: number;
  format: (value: number) => string;
  suffix?: string;
};

export default function CountUp({ value, format, suffix = "" }: CountUpProps) {
  const element = useRef<HTMLElement>(null);
  const [animation, setAnimation] = useState<{
    value: number;
    displayed: number;
  }>();
  const displayed = animation?.value === value ? animation.displayed : value;

  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error("CountUp requires a nonnegative safe integer");
  }

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;
    if (typeof IntersectionObserver === "undefined") {
      console.warn("Count-up animation unavailable; showing the final metric.");
      return;
    }

    let frame = 0;
    let started = false;
    let finished = false;
    let startTime: number | undefined;
    const finish = () => {
      finished = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      setAnimation({ value, displayed: value });
    };
    const tick = (time: number) => {
      if (finished) return;
      startTime ??= time;
      const progress = Math.min((time - startTime) / 1200, 1);
      if (progress === 1) {
        finish();
        return;
      }
      setAnimation({
        value,
        displayed: Math.floor(value * (1 - (1 - progress) ** 3)),
      });
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (finished || !entry) return;
        if (
          entry.isIntersecting &&
          entry.intersectionRatio >= 0.25 &&
          !started
        ) {
          started = true;
          setAnimation({ value, displayed: 0 });
          frame = requestAnimationFrame(tick);
        } else if (!entry.isIntersecting && started) {
          finish();
        }
      },
      { threshold: 0.25 },
    );
    const onPreference = () => {
      if (preference.matches) finish();
    };
    const onVisibility = () => {
      if (document.hidden && started) finish();
    };
    observer.observe(element.current!);
    preference.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      finished = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      preference.removeEventListener("change", onPreference);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [value]);

  return (
    <strong ref={element} className="count-up">
      {/* Keep one stable value accessible instead of announcing animation frames. */}
      <span className="sr-only">
        {format(value)}
        {suffix}
      </span>
      <span className="count-up-visual" aria-hidden="true">
        {format(displayed)}
        {suffix && <span className="count-up-suffix">{suffix}</span>}
      </span>
    </strong>
  );
}
