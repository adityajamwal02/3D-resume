import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import "./brand-carousel.css";

const brands = [
  { name: "CodeRabbit", logo: "coderabbit.svg" },
  { name: "Cursor", logo: "cursor.svg" },
  { name: "Gamma", logo: "gamma.png" },
  { name: "magicpin", logo: "magicpin.svg" },
  { name: "ProPeers", logo: "propeers.svg" },
  { name: "Nebius", logo: "nebius.svg" },
  { name: "MuscleBlaze", logo: "muscleblaze.svg" },
  { name: "CodeAnt AI", logo: "codeant-ai.png" },
  { name: "Wispr Flow", logo: "wispr-flow.svg" },
  { name: "Nimbalyst", logo: "nimbalyst.svg" },
  { name: "Replit", logo: "replit.png" },
  { name: "AON Meetings", logo: "aonmeetings.webp" },
  { name: "takeUforward", logo: "takeuforward.png" },
  { name: "Paytm", logo: "paytm.svg" },
  { name: "Matiks", logo: "matiks.png" },
];

function BrandLogo({ name, logo }: (typeof brands)[number]) {
  const [failed, setFailed] = useState(false);
  return (
    <>
      <span className="brand-logo-frame">
        {failed ? (
          <span className="brand-logo-unavailable">Logo unavailable</span>
        ) : (
          <img
            src={`${import.meta.env.BASE_URL}brands/${logo}`}
            alt=""
            width="120"
            height="40"
            decoding="async"
            onError={() => {
              console.warn(`Unable to load the ${name} collaboration logo.`);
              setFailed(true);
            }}
          />
        )}
      </span>
      <strong className="brand-carousel-name">{name}</strong>
    </>
  );
}

export default function BrandCarousel() {
  const [paused, setPaused] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const resetScroll = () => {
      viewport.current?.scrollTo({ left: 0, behavior: "instant" });
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
            viewport.current?.scrollTo({ left: 0, behavior: "instant" });
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
          if (!paused)
            viewport.current?.scrollTo({ left: 0, behavior: "instant" });
        }}
        onKeyDown={(event) => {
          if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
            return;
          const element = event.currentTarget;
          const step = element.clientWidth * 0.75;
          const offsets: Record<string, number> = {
            ArrowLeft: element.scrollLeft - step,
            ArrowRight: element.scrollLeft + step,
            Home: 0,
            End: element.scrollWidth,
          };
          if (!(event.key in offsets)) return;
          event.preventDefault();
          element.scrollTo({ left: offsets[event.key], behavior: "instant" });
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
