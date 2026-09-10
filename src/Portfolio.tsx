import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Copy,
  CodeXml as Github,
  BriefcaseBusiness as Linkedin,
  Mail,
  Printer,
} from "lucide-react";
import { experience, skillGroups } from "./content";
import SystemsScene from "./components/SystemsScene";
import DynamicIsland from "./components/DynamicIsland";
import "./island.css";

const mentorshipSessions = [
  {
    name: "1:1 Mentorship",
    detail:
      "A focused conversation about your goals, preparation, and next steps.",
    href: "https://topmate.io/adityajamwal/1828897",
    duration: "45 min",
  },
  {
    name: "Career Guidance",
    detail:
      "Find direction for your tech career and build a preparation roadmap.",
    href: "https://topmate.io/adityajamwal/1552849",
    duration: "45 min",
  },
  {
    name: "Resume Review",
    detail:
      "Get feedback on how you present your experience, projects, and skills.",
    href: "https://topmate.io/adityajamwal/1552120",
    duration: "45 min",
  },
  {
    name: "Mock Interview (DSA)",
    detail:
      "Practice problem solving and explaining your approach in an interview setting.",
    href: "https://topmate.io/adityajamwal/1553022",
    duration: "75 min",
  },
];

export default function Portfolio() {
  const [selectedSkill, setSelectedSkill] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText("aditya.vicky01@gmail.com");
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <DynamicIsland />
      <main id="main">
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-topline">
            <span>
              <i className="status-dot" /> SOFTWARE ENGINEER
            </span>
            <span className="hero-edition">PORTFOLIO / 2026</span>
          </div>
          <div className="hero-copy">
            <p className="eyebrow">
              BUILDING SYSTEMS. CONNECTING POSSIBILITIES.
            </p>
            <h1 id="hero-title">
              Aditya
              <br />
              <span>Jamwal</span>
              <span className="name-period">.</span>
            </h1>
            <p className="hero-description">
              From cloud infrastructure to intelligent tools.
              <br />I build software that makes complexity work.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#experience">
                Explore my journey <ArrowDown size={17} />
              </a>
              <button
                className="button button-secondary"
                onClick={() => window.print()}
              >
                <Printer size={16} /> Resume
              </button>
            </div>
          </div>
          <SystemsScene />
          <div className="hero-footer">
            <div className="current-role">
              <span className="microsoft-mark" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
              <div>
                <span>Currently building at</span>
                <strong>
                  Microsoft <span>/ Software Engineer</span>
                </strong>
              </div>
            </div>
            <a className="scroll-link" href="#mentorship">
              EXPLORE MENTORSHIP <ArrowDown size={15} />
            </a>
          </div>
        </section>
        <div className="impact-strip" aria-label="Career highlights">
          <div>
            <strong>
              150M<span>+</span>
            </strong>
            <p>Endpoints in exporter architecture</p>
          </div>
          <div>
            <strong>
              80<span>%</span>
            </strong>
            <p>Less manual log-analysis effort</p>
          </div>
          <div>
            <strong>
              Top 2.63<span>%</span>
            </strong>
            <p>LeetCode · Knight</p>
          </div>
          <div className="impact-note">
            <span className="eyebrow">THE THROUGHLINE</span>
            <p>
              Built for scale.
              <br />
              Driven by impact.
            </p>
          </div>
        </div>
        <section
          className="section experience-section"
          id="experience"
          aria-labelledby="experience-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <span>01 /</span> THE JOURNEY
              </p>
              <h2 id="experience-title">
                Experience that
                <br />
                <em>compounds.</em>
              </h2>
            </div>
            <p>
              Cloud platforms, network intelligence, and the systems that
              connect them.
            </p>
          </div>
          <div className="timeline">
            {experience.map((job, index) => (
              <article className="job" key={job.company + job.role}>
                <div className="job-meta">
                  <span className="job-date">{job.date}</span>
                  {index === 0 && (
                    <span className="current-badge">
                      <i className="status-dot" /> CURRENT
                    </span>
                  )}
                  <span className="job-index">
                    0{experience.length - index}
                  </span>
                </div>
                <div className="job-body">
                  <div className="job-title">
                    <h3>
                      {job.company}
                      <span>{job.role}</span>
                    </h3>
                    <span
                      className={`company-symbol company-${job.company.toLowerCase()}`}
                      aria-hidden="true"
                    >
                      {job.company === "Microsoft"
                        ? "M"
                        : job.company === "Cisco"
                          ? "cisco"
                          : "a."}
                    </span>
                  </div>
                  <ul>
                    {job.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <div className="tags">
                    {job.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section
          className="section work-section"
          id="work"
          aria-labelledby="work-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <span>02 /</span> SELECTED WORK
              </p>
              <h2 id="work-title">Ideas, engineered.</h2>
            </div>
            <a
              className="text-link"
              href="https://github.com/adityajamwal02"
              target="_blank"
              rel="noreferrer"
            >
              Explore GitHub <ArrowUpRight size={17} />
            </a>
          </div>
          <div className="project-grid">
            <article className="project">
              <div className="project-visual hash-visual" aria-hidden="true">
                <span className="visual-caption">
                  HASHIMAGIN / CONTENT ENGINE
                </span>
                <div className="hash-art">
                  <span>#</span>
                  <div />
                  <div />
                  <div />
                </div>
                <span className="visual-footer">
                  CREATE. CONNECT. SHARE.
                  <ArrowUpRight size={20} />
                </span>
              </div>
              <div className="project-content">
                <div className="project-type">
                  PERSONAL PROJECT <span>2023</span>
                </div>
                <h3>
                  HashImagin<span>01</span>
                </h3>
                <p>
                  A full-stack AI content platform for real-time generation,
                  storage, and sharing. Secure payments meet a collaborative
                  content dashboard.
                </p>
                <div className="tags">
                  <span>JavaScript</span>
                  <span>MongoDB</span>
                  <span>Web APIs</span>
                </div>
                <a
                  className="text-link"
                  href="https://github.com/adityajamwal02"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub profile <ArrowUpRight size={16} />
                </a>
              </div>
            </article>
            <article className="project">
              <div className="project-visual log-visual" aria-hidden="true">
                <span className="visual-caption">
                  CISCO / ENGINEERING HIGHLIGHT
                </span>
                <div className="log-art">
                  <div>
                    <span>01</span> ingest.log_stream
                    <span className="log-state">READY</span>
                  </div>
                  <div>
                    <span>02</span> agent.analyze
                    <span className="log-state">READY</span>
                  </div>
                  <div>
                    <span>03</span> surface.insights
                    <span className="log-state">READY</span>
                  </div>
                  <p>
                    <span>−80%</span> manual effort
                  </p>
                </div>
                <span className="visual-footer">
                  FROM LOGS TO CLARITY.
                  <ArrowUpRight size={20} />
                </span>
              </div>
              <div className="project-content">
                <div className="project-type">
                  PROFESSIONAL WORK <span>CISCO</span>
                </div>
                <h3>
                  Agentic log analyser<span>02</span>
                </h3>
                <p>
                  Developed an agentic log analyser to improve debugging
                  accuracy and reduce manual effort by 80%.
                </p>
                <div className="tags">
                  <span>Agentic AI</span>
                  <span>Developer tooling</span>
                  <span>Log analysis</span>
                </div>
                <a className="text-link" href="#experience">
                  View role context <ArrowUpRight size={16} />
                </a>
              </div>
            </article>
          </div>
        </section>
        <section
          className="section expertise-section"
          id="expertise"
          aria-labelledby="expertise-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <span>03 /</span> THE TOOLKIT
              </p>
              <h2 id="expertise-title">
                Depth meets
                <br />
                <em>curiosity.</em>
              </h2>
            </div>
            <p>
              A foundation in algorithms.
              <br />
              An instinct for building what’s next.
            </p>
          </div>
          <div className="expertise-layout">
            <div className="skill-filters" aria-label="Skill categories">
              {skillGroups.map((group, index) => (
                <button
                  key={group.title}
                  aria-pressed={selectedSkill === index}
                  onClick={() => setSelectedSkill(index)}
                >
                  <span>0{index + 1}</span>
                  {group.title}
                  <ArrowUpRight size={19} />
                </button>
              ))}
            </div>
            <div className="skill-panel" aria-live="polite">
              <p className="eyebrow">{skillGroups[selectedSkill].subtitle}</p>
              <h3>{skillGroups[selectedSkill].heading}</h3>
              <div className="skill-list">
                {skillGroups[selectedSkill].skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
              <p className="skill-description">
                {skillGroups[selectedSkill].description}
              </p>
            </div>
          </div>
          <div className="print-skills">
            {skillGroups.map((group) => (
              <div key={group.title}>
                <h3>{group.title}</h3>
                <p>{group.skills.join(" · ")}</p>
                <p>{group.description}</p>
              </div>
            ))}
          </div>
        </section>
        <section
          className="section credentials-section"
          aria-labelledby="credentials-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <span>04 /</span> BEYOND THE BUILD
              </p>
              <h2 id="credentials-title">A competitive edge.</h2>
            </div>
          </div>
          <div className="credentials-grid">
            <div className="education">
              <p className="eyebrow">EDUCATION</p>
              <span className="education-year">2020 — 2024</span>
              <h3>
                Jaypee Institute of
                <br />
                Information Technology
              </h3>
              <p>B.Tech · Computer Science & Engineering</p>
              <strong>
                8.0 <span>CGPA</span>
              </strong>
            </div>
            <div className="achievements">
              <div>
                <span>01</span>
                <h3>
                  LeetCode Knight<small>Top 2.63% · Peak rating 1994</small>
                </h3>
                <span className="achievement-detail">DSA</span>
              </div>
              <div>
                <span>02</span>
                <h3>
                  Codeforces Specialist
                  <small>
                    Rating 1556 · Global rank 1148 in a Div. 2 contest
                  </small>
                </h3>
                <span className="achievement-detail">CP</span>
              </div>
              <div>
                <span>03</span>
                <h3>
                  Code Gladiators ’23 Finalist
                  <small>TechGig · DSA · Global rank 465</small>
                </h3>
                <span className="achievement-detail">DSA</span>
              </div>
              <div>
                <span>04</span>
                <h3>
                  Building with the community
                  <small>
                    Code with Cisco finalist · 5+ hackathons
                    <br />
                    Coding contributions: 47,100+ views · 340+ upvotes
                  </small>
                </h3>
                <ArrowUpRight size={20} />
              </div>
            </div>
          </div>
        </section>
        <section
          className="section mentorship-section"
          id="mentorship"
          aria-labelledby="mentorship-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <span>05 /</span> ABOUT & MENTORSHIP
              </p>
              <h2 id="mentorship-title">
                Your next step.
                <br />
                <em>A shared perspective.</em>
              </h2>
            </div>
            <a
              className="text-link"
              href="https://topmate.io/adityajamwal"
              target="_blank"
              rel="noreferrer"
            >
              Meet me on Topmate <ArrowUpRight size={17} />
            </a>
          </div>
          <div className="mentor-intro">
            <img
              className="mentor-portrait"
              src={`${import.meta.env.BASE_URL}aditya-topmate.jpg`}
              alt="Aditya Jamwal"
              width="240"
              height="240"
              loading="lazy"
              decoding="async"
            />
            <div className="mentor-bio">
              <p className="eyebrow">ENGINEER. PROBLEM SOLVER. MENTOR.</p>
              <h3>A little context. A clearer direction.</h3>
              <p>
                I'm a software engineer at Microsoft, previously at Cisco, with
                a curiosity for software development, agentic AI, data, and the
                web. Beyond building systems, I help people work through the
                next step in their own tech journey.
              </p>
              <p>
                I've interviewed at Microsoft, Amazon, Cisco, Adobe, and
                Blinkit. I bring that firsthand preparation experience to resume
                feedback, mock interviews, and conversations about ML/AI and
                project roadmaps.
              </p>
              <a
                className="button button-primary"
                href="https://topmate.io/adityajamwal/1828897"
                target="_blank"
                rel="noreferrer"
              >
                <CalendarDays size={17} /> Book 1:1 mentorship{" "}
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
          <div className="mentorship-services" aria-label="Mentorship sessions">
            {mentorshipSessions.map((session) => (
              <a
                className="mentorship-service"
                key={session.name}
                href={session.href}
                target="_blank"
                rel="noreferrer"
              >
                <span className="session-format">
                  <CalendarDays size={15} /> 1:1 VIDEO CALL{" "}
                  <span>{session.duration}</span>
                </span>
                <h3>
                  {session.name}
                  <ArrowUpRight size={20} />
                </h3>
                <p>{session.detail}</p>
                <span className="session-book">
                  Book on Topmate <ArrowRight size={16} />
                </span>
              </a>
            ))}
          </div>
          <div className="mentorship-footer">
            <p>For a question between milestones.</p>
            <a
              className="text-link"
              href="https://topmate.io/adityajamwal/1551326/pay"
              target="_blank"
              rel="noreferrer"
            >
              <Mail size={16} /> Send a priority DM <ArrowUpRight size={16} />
            </a>
            <a
              className="text-link"
              href="https://topmate.io/adityajamwal"
              target="_blank"
              rel="noreferrer"
            >
              All sessions & reviews <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
        <section
          className="section contact-section"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="contact-top">
            <p className="eyebrow">
              <span>06 /</span> WHAT’S NEXT?
            </p>
            <span className="contact-spark" aria-hidden="true">
              ✳
            </span>
          </div>
          <h2 id="contact-title">
            Let’s build something
            <br />
            <em>that matters.</em>
          </h2>
          <div className="contact-bottom">
            <div>
              <a className="email-link" href="mailto:aditya.vicky01@gmail.com">
                aditya.vicky01@gmail.com <ArrowUpRight />
              </a>
              <button className="copy-button" onClick={copyEmail}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Email copied" : "Copy email"}
              </button>
              <span className="sr-only" role="status">
                {copied
                  ? "Email address copied to clipboard."
                  : copyError
                    ? "Clipboard unavailable. Use the email link above."
                    : ""}
              </span>
            </div>
            <div className="social-links">
              <a
                href="https://github.com/adityajamwal02"
                target="_blank"
                rel="noreferrer"
              >
                <Github size={18} /> GitHub <ArrowUpRight size={15} />
              </a>
              <a
                href="https://www.linkedin.com/in/adityajamwal02/"
                target="_blank"
                rel="noreferrer"
              >
                <Linkedin size={18} /> LinkedIn <ArrowUpRight size={15} />
              </a>
              <a href="mailto:aditya.vicky01@gmail.com">
                <Mail size={18} /> Email <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <a className="wordmark" href="#home" aria-label="Back to top">
          aj<span>.</span>
        </a>
        <span>© {new Date().getFullYear()} Aditya Jamwal</span>
        <a href="#home">
          BACK TO TOP <ArrowRight size={15} className="up-arrow" />
        </a>
      </footer>
    </>
  );
}
