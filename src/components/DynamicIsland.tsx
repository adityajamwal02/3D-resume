import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CodeXml,
  Layers,
  Mail,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";

const destinations = [
  { id: "experience", label: "Experience", icon: BriefcaseBusiness },
  { id: "work", label: "Work", icon: Layers },
  { id: "expertise", label: "Expertise", icon: CodeXml },
  { id: "mentorship", label: "Mentorship", icon: CalendarDays },
  { id: "contact", label: "Contact", icon: Mail },
];

export default function DynamicIsland() {
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState("home");
  const island = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === "light" ? "light" : "dark",
  );
  const explicitTheme = useRef(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-color-scheme: light)");
    const applyTheme = (value: string) => {
      document.documentElement.dataset.theme = value;
      document.documentElement.style.colorScheme = value;
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", value === "light" ? "#f4f7f6" : "#111216");
      setTheme(value);
    };
    const syncPreference = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem("portfolio-theme");
      } catch {}
      if (saved === "light" || saved === "dark") {
        explicitTheme.current = true;
        applyTheme(saved);
      } else if (!explicitTheme.current) {
        applyTheme(preference.matches ? "light" : "dark");
      }
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "portfolio-theme" || event.key === null) {
        explicitTheme.current = false;
        syncPreference();
      }
    };
    syncPreference();
    preference.addEventListener("change", syncPreference);
    window.addEventListener("storage", onStorage);
    return () => {
      preference.removeEventListener("change", syncPreference);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  function switchTheme() {
    const next = theme === "dark" ? "light" : "dark";
    explicitTheme.current = true;
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next === "light" ? "#f4f7f6" : "#111216");
    setTheme(next);
    try {
      localStorage.setItem("portfolio-theme", next);
    } catch {}
  }

  useEffect(() => {
    let frame = 0;
    const sections = ["home", ...destinations.map(({ id }) => id)].map((id) =>
      document.getElementById(id)!,
    );
    const update = () => {
      frame = 0;
      const distance =
        document.documentElement.scrollHeight - window.innerHeight;
      island.current?.style.setProperty(
        "--reading-progress",
        `${distance > 0 ? window.scrollY / distance : 0}`,
      );
      const current = sections
        .filter(
          (section) =>
            section.getBoundingClientRect().top <= window.innerHeight * 0.4,
        )
        .at(-1);
      setActive(current?.id ?? "home");
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const onPointer = (event: PointerEvent) => {
      if (!island.current?.contains(event.target as Node)) setExpanded(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpanded(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  return (
    <header
      ref={island}
      className={`site-header dynamic-island ${expanded ? "is-expanded" : ""}`}
    >
      <div className="island-main">
        <a
          className="wordmark"
          href="#home"
          aria-label="Aditya Jamwal home"
          onClick={() => setExpanded(false)}
        >
          <img
            className="brand-mark"
            src={`${import.meta.env.BASE_URL}monogram.svg`}
            alt=""
            width="44"
            height="44"
          />
        </a>
        <span className="island-divider" aria-hidden="true" />
        <span className="island-context" aria-hidden="true">
          {destinations.find(({ id }) => id === active)?.label ??
            "Software Engineer"}
        </span>
        <nav
          className={expanded ? "navigation is-open" : "navigation"}
          aria-label="Main navigation"
        >
          {destinations.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
              onClick={() => setExpanded(false)}
            >
              <Icon size={15} />
              <span>{label}</span>
            </a>
          ))}
        </nav>
        <button
          className="icon-button theme-toggle"
          type="button"
          title={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          onClick={switchTheme}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          ref={toggle}
          className="icon-button island-toggle"
          aria-label={expanded ? "Close menu" : "Open menu"}
          aria-expanded={expanded}
          aria-controls="island-actions"
          title={expanded ? "Close quick actions" : "Open quick actions"}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {expanded && (
        <div className="island-actions" id="island-actions">
          <div className="island-identity">
            <span className="status-dot" />
            <div>
              <strong>Aditya Jamwal</strong>
              <span>Software Engineer · Microsoft</span>
            </div>
          </div>
          <div className="island-shortcuts">
            <a
              href="https://www.linkedin.com/in/adityajamwal02/"
              target="_blank"
              rel="noreferrer"
            >
              <BriefcaseBusiness size={16} /> LinkedIn{" "}
              <ArrowUpRight size={13} />
            </a>
            <a
              href="https://github.com/adityajamwal02"
              target="_blank"
              rel="noreferrer"
            >
              <CodeXml size={16} /> GitHub <ArrowUpRight size={13} />
            </a>
            <a href="#contact" onClick={() => setExpanded(false)}>
              <Mail size={16} /> Get in touch
            </a>
          </div>
        </div>
      )}
      <div className="island-progress" aria-hidden="true" />
    </header>
  );
}
