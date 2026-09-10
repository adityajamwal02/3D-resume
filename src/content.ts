export const experience = [
  {
    company: "Microsoft",
    role: "Software Engineer",
    date: "FEB 2026 — PRESENT",
    bullets: [
      "Developing RMSv2 to move Azure resources across regions through intelligent discovery and copilot integrations.",
      "Architected a load balancer to provision OpenAI endpoints and implemented MoveApp CRUD APIs.",
      "Migrated classic release pipelines to Ev2 Managed SDP as part of a security-first initiative.",
    ],
    skills: [".NET", "Azure", "Cloud management", "Agentic AI", "REST APIs"],
  },
  {
    company: "Cisco",
    role: "Software Engineer",
    date: "AUG 2024 — JAN 2026",
    bullets: [
      "Architected a scalable C++ Exporter plugin for low-latency data transfer from 150M+ endpoints to Splunk HEC, using batch processing in a distributed environment.",
      "Led cloud-native microservice migration to GitHub Cloud with CMake, Conan, and GitHub Actions build pipelines.",
      "Optimized backend Splunk API scripts for NVM-to-SCC app updates and developed Process Tree analytics for the Splunk dashboard.",
      "Developed an agentic log analyser, improving debugging accuracy and reducing manual effort by 80%.",
    ],
    skills: [
      "C++",
      "Python",
      "JavaScript",
      "Splunk",
      "GitHub Actions",
      "Agentic AI",
    ],
  },
  {
    company: "Cisco",
    role: "Software Engineer Intern",
    date: "FEB 2024 — JUN 2024",
    bullets: [
      "Designed ML-driven Python scripts to detect beacons in network traffic, improving detection accuracy by 37%.",
      "Developed a multithreaded fallback mechanism to automate build-server backups in 25% less time.",
    ],
    skills: ["Python", "Machine learning", "C++", "Perforce", "Web APIs"],
  },
  {
    company: "Ambee",
    role: "Software Engineer Intern",
    date: "MAY 2023 — JUL 2023",
    bullets: [
      "Built and optimized AWS Glue ETL pipelines for batch data processing, achieving 33% data compression.",
      "Developed a sliding-window rate-limiting system for efficient data processing at scale.",
    ],
    skills: ["AWS Glue", "ETL pipelines", "Rate limiting", "Algorithms"],
  },
];

export const skillGroups = [
  {
    title: "Core engineering",
    subtitle: "FOUNDATIONS / HANDS-ON",
    heading: "The fundamentals come first.",
    skills: [
      "C++",
      "Python",
      "Data structures",
      "Algorithms",
      "Problem solving",
      "Software development",
      "HTML & CSS",
    ],
    description:
      "Grounded in object-oriented programming, operating systems, networking, databases, and distributed systems coursework.",
  },
  {
    title: "Cloud & platforms",
    subtitle: "SYSTEMS / APPLIED EXPERIENCE",
    heading: "Thinking beyond one machine.",
    skills: [
      "Azure",
      ".NET",
      "REST APIs",
      "AWS Glue",
      "Splunk",
      "GitHub Actions",
      "CMake",
      "Conan",
      "Perforce",
    ],
    description:
      "Applied across resource migration, distributed data transfer, build automation, and data pipelines. Familiar with AWS, SQL, Linux, and system design.",
  },
  {
    title: "AI & development",
    subtitle: "INTELLIGENCE / CONTINUED EXPLORATION",
    heading: "Making tools more intelligent.",
    skills: [
      "Agentic AI",
      "Machine learning",
      "JavaScript",
      "MongoDB",
      "Web APIs",
      "Git",
    ],
    description:
      "Experience with agentic log analysis, ML-driven network detection, and full-stack content generation. Foundational knowledge of GenAI and LLMs.",
  },
];
