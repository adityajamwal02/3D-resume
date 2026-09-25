import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import "./brand-carousel.css";

const brands: { name: string; logo?: string }[] = [
  { name: "CodeRabbit", logo: "coderabbit.svg" },
  { name: "Cursor", logo: "cursor.svg" },
  { name: "Gamma" },
  { name: "magicpin", logo: "magicpin.svg" },
  { name: "ProPeers", logo: "propeers.svg" },
  { name: "Nebius", logo: "nebius.svg" },
  { name: "MuscleBlaze", logo: "muscleblaze.svg" },
  { name: "CodeAnt AI", logo: "codeant-ai.png" },
  { name: "Wispr Flow", logo: "wispr-flow.svg" },
];

function BrandLogo({ name, logo }: (typeof brands)[number]) {
  const [failed, setFailed] = useState(false);
  if (!logo) return <span className="brand-name-only">{name}</span>;
  return (
    <>
      {failed ? (
        <span className="brand-logo-unavailable">Logo unavailable</span>
      ) : (
        <img
          src={`${import.meta.env.BASE_URL}brands/${logo}`}
          alt=""
          width="120"
          height="36"
          decoding="async"
          onError={() => {
            console.warn(`Unable to load the ${name} collaboration logo.`);
            setFailed(true);
          }}
        />
      )}
      <span>{name}</span>
    </>
  );
}

export default function BrandCarousel() {
  const [paused, setPaused] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const resetScroll = () => {
      if (viewport.current) viewport.current.scrollLeft = 0;
    };
    preference.addEventListener("change", resetScroll);
    return () => preference.removeEventListener("change", resetScroll);
  }, []);

  return (
    <section
      className={`creator-collaborations${paused ? " is-paused" : ""}`}
      aria-labelledby="brand-collaborations-title"
    >
      <div className="brand-carousel-heading">
        <div>
          <h3 id="brand-collaborations-title">Brand collaborations</h3>
          <p>Brands I have collaborated with.</p>
        </div>
        <button
          className="brand-carousel-toggle"
          type="button"
          aria-pressed={paused}
          aria-controls="brand-carousel-viewport"
          aria-label={paused ? "Resume brand carousel" : "Pause brand carousel"}
          onClick={() => {
            if (viewport.current) viewport.current.scrollLeft = 0;
            setPaused(!paused);
          }}
        >
          {paused ? (
            <Play size={15} aria-hidden="true" />
          ) : (
            <Pause size={15} aria-hidden="true" />
          )}
          {paused ? "Resume" : "Pause"}
        </button>
      </div>
      <div
        ref={viewport}
        className="brand-carousel-viewport"
        id="brand-carousel-viewport"
        tabIndex={0}
        role="region"
        aria-label="Collaborating brands; focus or pause to scroll through all brands"
        onBlur={() => {
          if (!paused && viewport.current) viewport.current.scrollLeft = 0;
        }}
      >
        <div className="brand-carousel-track">
          {[false, true].map((duplicate) => (
            <ul
              key={String(duplicate)}
              className={`brand-carousel-group${duplicate ? " brand-carousel-copy" : ""}`}
              aria-hidden={duplicate ? true : undefined}
              aria-label={duplicate ? undefined : "Collaborating brands"}
            >
              {brands.map((brand) => (
                <li key={brand.name} className="brand-carousel-item">
                  <BrandLogo {...brand} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
