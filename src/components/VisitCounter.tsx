import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

const counterURL = "https://hits.sh/adityajamwal02.github.io/3D-resume";
const badgeURL =
  `${counterURL}.svg?label=Profile%20views&style=flat-square` +
  "&color=transparent&labelColor=transparent";

type CounterStatus =
  "waiting" | "loading" | "ready" | "unavailable" | "preview";

export default function VisitCounter() {
  const [status, setStatus] = useState<CounterStatus>(() =>
    import.meta.env.PROD &&
    location.origin === "https://adityajamwal02.github.io" &&
    /^\/3D-resume(?:\/(?:index\.html)?)?$/.test(location.pathname) &&
    !navigator.webdriver
      ? "waiting"
      : "preview",
  );

  useEffect(() => {
    if (status !== "waiting") return;
    const start = () => {
      if (
        document.readyState === "complete" &&
        document.visibilityState === "visible"
      ) {
        setStatus("loading");
      }
    };
    // Never let an external counter delay the page's load event.
    const timer = window.setTimeout(start, 0);
    window.addEventListener("load", start);
    document.addEventListener("visibilitychange", start);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", start);
      document.removeEventListener("visibilitychange", start);
    };
  }, [status]);

  useEffect(() => {
    if (status !== "loading") return;
    const timer = window.setTimeout(() => {
      console.warn("Visit counter timed out; no automatic retry was made.");
      setStatus("unavailable");
    }, 12_000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const unavailable = () => {
    console.warn("Visit counter could not load; no automatic retry was made.");
    setStatus("unavailable");
  };
  const description =
    status === "preview"
      ? "Local previews and automated checks do not add visits."
      : "Page loads, including repeat visits, counted by Hits.sh. No visitor identities are shown.";

  return (
    <a
      className="visit-counter"
      data-counter-state={status}
      href={`${counterURL}/`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Profile views: open total and daily visit statistics on Hits.sh"
      aria-describedby={
        status === "ready"
          ? "visit-counter-description"
          : "visit-counter-description visit-counter-status"
      }
      title={description}
    >
      <Eye size={16} aria-hidden="true" />
      <span className="visit-counter-value">
        {(status === "loading" || status === "ready") && (
          <img
            src={badgeURL}
            alt=""
            width="136"
            height="20"
            referrerPolicy="no-referrer"
            decoding="async"
            fetchPriority="low"
            onLoad={() => setStatus("ready")}
            onError={unavailable}
          />
        )}
        {status !== "ready" && (
          <span id="visit-counter-status" role="status">
            {status === "unavailable"
              ? "Views unavailable"
              : status === "preview"
                ? "Views: preview"
                : "Loading views"}
          </span>
        )}
      </span>
      <span className="sr-only" id="visit-counter-description">
        {description}
      </span>
    </a>
  );
}
