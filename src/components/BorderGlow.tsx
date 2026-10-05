// Adapted from React Bits Border Glow; license: public/licenses/react-bits.txt.
import type { PointerEvent, ReactNode } from "react";
import "./border-glow.css";

type BorderGlowProps = {
  children: ReactNode;
  className?: string;
};

export default function BorderGlow({
  children,
  className = "",
}: BorderGlowProps) {
  function trackPointer(event: PointerEvent<HTMLElement>) {
    if (
      event.pointerType === "touch" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const card = event.currentTarget;
    const { left, top, width, height } = card.getBoundingClientRect();
    if (!width || !height) return;
    const dx = event.clientX - left - width / 2;
    const dy = event.clientY - top - height / 2;
    const edge = Math.min(
      1,
      Math.max(Math.abs(dx) / (width / 2), Math.abs(dy) / (height / 2)),
    );
    const angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 450) % 360;
    card.style.setProperty("--edge-proximity", (edge * 100).toFixed(3));
    card.style.setProperty("--cursor-angle", `${angle.toFixed(3)}deg`);
  }

  function resetPointer(event: PointerEvent<HTMLElement>) {
    event.currentTarget.style.removeProperty("--edge-proximity");
    event.currentTarget.style.removeProperty("--cursor-angle");
  }

  return (
    <article
      className={`border-glow-card ${className}`}
      onPointerMove={trackPointer}
      onPointerLeave={resetPointer}
      onPointerCancel={resetPointer}
    >
      <span className="edge-light" aria-hidden="true" />
      <div className="border-glow-inner">{children}</div>
    </article>
  );
}
