import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CodeXml as Github,
  BriefcaseBusiness as Linkedin,
  Mail,
  Quote,
  Star,
  Zap,
} from "lucide-react";
import { experience, skillGroups } from "./content";
import topmate from "./data/topmate.json";
import SystemsScene from "./components/SystemsScene";
import DynamicIsland from "./components/DynamicIsland";
import BrandCarousel from "./components/BrandCarousel";
import "./island.css";
import "./theme.css";

const mentorshipSessions = [
  {
    name: "1:1 Mentorship",
    detail:
      "A focused conversation about your goals, preparation, and next steps.",
    goal: "Build a plan for your growth",
    prepare:
      "Your current experience, goals, and the questions holding you back.",
    takeaway:
      "Clearer priorities and practical next steps for your development.",
    href: "https://topmate.io/adityajamwal/1828897",
    duration: "45 min",
  },
  {
    name: "Career Guidance",
    detail:
      "Find direction for your tech career and build a preparation roadmap.",
    goal: "Choose your next direction",
    prepare:
      "The roles you are considering and where you are in your preparation.",
    takeaway: "A clearer direction and a preparation roadmap to work toward.",
    href: "https://topmate.io/adityajamwal/1552849",
    duration: "45 min",
  },
  {
    name: "Resume Review",
    detail:
      "Get feedback on how you present your experience, projects, and skills.",
    goal: "Make your resume tell your story",
    prepare: "Your latest resume and a target role or job description.",
    takeaway:
      "Actionable feedback on structure, clarity, and how you communicate impact.",
    href: "https://topmate.io/adityajamwal/1552120",
    duration: "45 min",
  },
  {
    name: "Mock Interview (DSA)",
    detail:
      "Practice problem solving and explaining your approach in an interview setting.",
    goal: "Practice before the real interview",
    prepare:
      "Your preferred coding language and the topics you want to practice.",
    takeaway:
      "Feedback on your approach, communication, and areas to practice next.",
    href: "https://topmate.io/adityajamwal/1553022",
    duration: "75 min",
  },
];

const testimonials = [
  {
    name: "Anushka Bhardwaj",
    date: "22nd Aug, 2026",
    dateTime: "2026-08-22",
    quote:
      "Attending the career guidance session with Aditya was truly a helpful for me. I was feeling quite uncertain about my next steps, but the insights and structured advice he provided brought complete clarity to my thoughts. His guidance was practical and gave me a clear sense of direction on moving forward. I highly recommend a session with Aditya to anyone looking to align their goals and elevate their career trajectory.",
  },
  {
    name: "SHAIK NASHEERA",
    date: "11th Jul, 2026",
    dateTime: "2026-07-11",
    quote:
      "This was an incredibly valuable session. He broke down the importance of a well-crafted resume and an optimized LinkedIn profile in a way that was easy to understand. Beyond that, he gave me a clear roadmap on what to learn and how to approach my career growth. I walked away with actionable steps and a lot more clarity. Truly grateful for the time and advice.",
  },
  {
    name: "Aditya Pratap Singh",
    date: "30th May, 2026",
    dateTime: "2026-05-30",
    quote:
      "The session gave me much-needed clarity on the next steps and boosted my confidence in the direction I'm taking and What stood out most was his ability to break down complex topics into simple, actionable advice. I truly appreciate the guidance and insights shared during the call.",
  },
];

export default function Portfolio() {
  const [selectedSkill, setSelectedSkill] = useState(0);

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
              <i className="status-dot" /> SOFTWARE ENGINEER & MENTOR
            </span>
            <span className="hero-edition">PORTFOLIO / 2026</span>
          </div>
          <div className="hero-copy">
            <p className="eyebrow">BUILDING SYSTEMS. SHARING EXPERIENCE.</p>
            <h1 id="hero-title">
              Aditya
              <br />
              <span>Jamwal</span>
              <span className="name-period">.</span>
            </h1>
            <p className="hero-description">
              Software Engineer at Microsoft, building cloud infrastructure,
              distributed systems, and intelligent tools.
            </p>
            <p className="hero-mentorship">
              I also mentor students and engineers on career direction, resumes,
              and interview preparation.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#experience">
                Explore engineering work <ArrowDown size={17} />
              </a>
              <a
                className="button button-secondary"
                href="https://www.linkedin.com/in/adityajamwal02/"
                target="_blank"
                rel="noreferrer"
              >
                <Linkedin size={16} /> Connect on LinkedIn{" "}
                <ArrowUpRight size={15} />
              </a>
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
              85K<span>+</span>
            </strong>
            <p>Connections in my LinkedIn community</p>
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
                    <img
                      className={`company-logo company-${job.company.toLowerCase()}`}
                      src={`${import.meta.env.BASE_URL}${job.company.toLowerCase()}-logo.svg`}
                      alt=""
                      width="40"
                      height="40"
                    />
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
                  MULTI-AGENTIC SYSTEM / BRAND COLLABORATIONS
                </span>
                <div className="log-art">
                  <div>
                    <span>01</span> discover.brands
                    <span className="log-state">READY</span>
                  </div>
                  <div>
                    <span>02</span> curate.leads
                    <span className="log-state">READY</span>
                  </div>
                  <div>
                    <span>03</span> coordinate.outreach
                    <span className="log-state">READY</span>
                  </div>
                  <p>
                    <span>AI</span> collaboration workflows
                  </p>
                </div>
                <span className="visual-footer">
                  FROM BRAND DISCOVERY TO CONNECTION.
                  <ArrowUpRight size={20} />
                </span>
              </div>
              <div className="project-content">
                <div className="project-type">
                  COLLABORATION PLATFORM <span>AGENTIC AI</span>
                </div>
                <h3>
                  Multi-Agentic System<span>02</span>
                </h3>
                <p>
                  Developed a multi-agentic system to curate brand-deal leads
                  for social media collaborations. The platform helps identify
                  brands and coordinate outreach to growth and marketing
                  specialists, connecting creators with collaboration
                  opportunities.
                </p>
                <div className="tags">
                  <span>Agentic AI</span>
                  <span>Lead curation</span>
                  <span>Brand collaborations</span>
                </div>
                <a className="text-link" href="#content">
                  Explore collaborations <ArrowUpRight size={16} />
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
              <h3>Engineering experience. Practical guidance.</h3>
              <p>
                I build cloud infrastructure and distributed systems at
                Microsoft, with previous experience at Cisco and Ambee. As a
                mentor, I help students and engineers turn career questions into
                practical next steps.
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
          <section
            className="mentorship-guide"
            id="session-guide"
            aria-labelledby="session-guide-title"
          >
            <div className="mentorship-guide-heading">
              <p className="eyebrow">START WITH YOUR GOAL</p>
              <h3 id="session-guide-title">Which session is right for you?</h3>
              <p>
                Choose the conversation that fits where you are today. Bring
                your questions; we will work through the next step together.
              </p>
            </div>
            <div
              className="mentorship-services"
              aria-label="Mentorship sessions"
            >
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
                  <span className="session-goal">{session.goal}</span>
                  <h4>
                    {session.name}
                    <ArrowUpRight size={20} />
                  </h4>
                  <p>{session.detail}</p>
                  <dl className="session-expectations">
                    <div>
                      <dt>What to bring</dt>
                      <dd>{session.prepare}</dd>
                    </div>
                    <div>
                      <dt>What to take away</dt>
                      <dd>{session.takeaway}</dd>
                    </div>
                  </dl>
                  <span className="session-book">
                    Book {session.name} <ArrowUpRight size={16} />
                  </span>
                </a>
              ))}
            </div>
            <p className="mentorship-booking-note">
              Practical feedback, not placement or referral guarantees. Current
              pricing, availability, and booking details are on{" "}
              <a
                href="https://topmate.io/adityajamwal"
                target="_blank"
                rel="noreferrer"
              >
                Topmate <ArrowUpRight size={13} aria-hidden="true" />
              </a>
              .
            </p>
          </section>
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
          <div
            className="testimonials"
            role="region"
            aria-labelledby="testimonials-title"
          >
            <div className="testimonials-heading">
              <div>
                <h3 id="testimonials-title">Testimonials</h3>
                <div className="testimonial-summary">
                  <span className="testimonial-rating">
                    <Star size={19} fill="currentColor" aria-hidden="true" />
                    <strong aria-label={`${topmate.rating} out of 5 stars`}>
                      {topmate.rating}
                    </strong>
                    <span>({topmate.ratings} ratings)</span>
                  </span>
                  <span>
                    <strong>{topmate.bookings}</strong> bookings
                  </span>
                  <span>
                    <strong>{topmate.testimonials}</strong> testimonials
                  </span>
                </div>
              </div>
              <a
                className="text-link"
                href="https://topmate.io/adityajamwal"
                target="_blank"
                rel="noreferrer"
              >
                Reviews on Topmate <ArrowUpRight size={16} />
              </a>
            </div>
            <p className="testimonial-freshness">
              Topmate stats updated{" "}
              <time dateTime={topmate.fetchedAt}>
                {new Date(topmate.fetchedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </time>
              . Refreshes every 3 days; latest figures on Topmate.
            </p>
            <ul
              className="testimonial-highlights"
              aria-label="Mentorship feedback"
            >
              {topmate.feedback.map((feedback) => (
                <li key={feedback.label}>
                  <Zap size={16} aria-hidden="true" />
                  <strong>{feedback.count}</strong> {feedback.label}
                </li>
              ))}
            </ul>
            <div className="testimonial-grid">
              {testimonials.map((testimonial) => (
                <figure className="testimonial-card" key={testimonial.name}>
                  <Quote
                    className="testimonial-quote-mark"
                    size={24}
                    aria-hidden="true"
                  />
                  <blockquote>
                    <p>{testimonial.quote}</p>
                  </blockquote>
                  <figcaption>
                    <span className="testimonial-author">
                      {testimonial.name}
                    </span>
                    <time dateTime={testimonial.dateTime}>
                      {testimonial.date}
                    </time>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
        <section
          className="section creator-section"
          id="content"
          aria-labelledby="creator-title"
        >
          <div className="creator-layout">
            <div className="creator-copy">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">
                    <span>06 /</span> CONTENT CREATION
                  </p>
                  <h2 id="creator-title">
                    Ideas worth
                    <br />
                    <em>sharing.</em>
                  </h2>
                </div>
              </div>
              <p className="creator-description">
                Beyond building software, I create content on LinkedIn about
                technology, AI, and tech marketing. I bring an engineer's
                perspective to the ideas, tools, and stories shaping how we
                work.
              </p>
              <ul className="creator-topics" aria-label="Content topics">
                <li>Technology</li>
                <li>Artificial intelligence</li>
              </ul>
            </div>
            <div className="creator-community">
              <p className="eyebrow">THE LINKEDIN COMMUNITY</p>
              <p className="creator-followers">
                <strong>
                  85,000<span>+</span>
                </strong>
                <span>community connections on LinkedIn</span>
              </p>
              <p className="creator-community-note">
                Sharing ideas. Starting conversations. Connect with me for
                perspectives on tech, AI, and the stories behind the products.
              </p>
              <div className="creator-social-links">
                <a
                  className="button button-primary"
                  href="https://www.linkedin.com/in/adityajamwal02/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Linkedin size={18} /> Connect on LinkedIn{" "}
                  <ArrowUpRight size={16} />
                </a>
                <a
                  className="button button-secondary"
                  href="https://x.com/AdityaJamwal02"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span aria-hidden="true">X</span> Connect on X{" "}
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          </div>
          <BrandCarousel />
        </section>
        <section
          className="section contact-section"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="contact-top">
            <p className="eyebrow">
              <span>07 /</span> WHAT’S NEXT?
            </p>
            <span className="contact-spark" aria-hidden="true">
              ✳
            </span>
          </div>
          <h2 id="contact-title">
            Get in touch<span className="name-period">.</span>
          </h2>
          <div className="contact-bottom">
            <div className="contact-invitation">
              <h3>A conversation can be a starting point.</h3>
              <p>
                Have an engineering challenge, a collaboration in mind, or a
                question about your next career move? Let's connect.
              </p>
              <div className="contact-actions">
                <a
                  className="button contact-primary"
                  href="https://www.linkedin.com/in/adityajamwal02/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Linkedin size={18} /> Connect on LinkedIn{" "}
                  <ArrowUpRight size={16} />
                </a>
                <a
                  className="text-link"
                  href="https://topmate.io/adityajamwal"
                  target="_blank"
                  rel="noreferrer"
                >
                  <CalendarDays size={18} /> Book a conversation{" "}
                  <ArrowUpRight size={16} />
                </a>
              </div>
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
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <a className="wordmark" href="#home" aria-label="Back to top">
          <img
            className="brand-mark"
            src={`${import.meta.env.BASE_URL}monogram.svg`}
            alt=""
            width="44"
            height="44"
          />
        </a>
        <span>© {new Date().getFullYear()} Aditya Jamwal</span>
        <a href="#home">
          BACK TO TOP <ArrowRight size={15} className="up-arrow" />
        </a>
      </footer>
    </>
  );
}
