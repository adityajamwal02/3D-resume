import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CodeXml,
  Layers,
  Mail,
  Menu,
  Printer,
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
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [expanded]);

  return (
    <header
      ref={island}
      className={`site-header dynamic-island ${expanded ? "is-expanded" : ""}`}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setExpanded(false);
          toggle.current?.focus();
        }
      }}
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
        <a
          className="header-contact"
          href="mailto:aditya.vicky01@gmail.com"
          title="Email Aditya"
          aria-label="Email Aditya"
        >
          <ArrowUpRight size={18} />
        </a>
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
            <button
              onClick={() => {
                setExpanded(false);
                window.print();
              }}
            >
              <Printer size={16} /> Print resume
            </button>
            <a
              href="https://github.com/adityajamwal02"
              target="_blank"
              rel="noreferrer"
            >
              <CodeXml size={16} /> GitHub <ArrowUpRight size={13} />
            </a>
            <a href="mailto:aditya.vicky01@gmail.com">
              <Mail size={16} /> Get in touch
            </a>
          </div>
        </div>
      )}
      <div className="island-progress" aria-hidden="true" />
    </header>
  );
}
