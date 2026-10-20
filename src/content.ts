export const creatorImpressions = 17_200_000;

export const collaborationFormats = [
  {
    title: "Sponsored post",
    format: "IMAGE OR VIDEO",
    description:
      "Put your brand or tool in context with a thoughtful LinkedIn post, supported by an image or video that makes the value clear.",
    focus: "Product launches, practical use cases, and brand introductions.",
  },
  {
    title: "Custom carousel",
    format: "VISUAL STORYTELLING",
    description:
      "Turn a complex idea into a clear, swipeable story. A custom LinkedIn carousel guides readers through your product, its benefits, and how it works.",
    focus: "Feature explainers, educational content, and step-by-step guides.",
  },
  {
    title: "Two-post campaign",
    format: "CONNECTED CONTENT",
    description:
      "Build a cohesive narrative across two sponsored LinkedIn posts, moving from an introduction to a deeper use case with brand-supplied or custom assets.",
    focus: "Sequential storytelling and a more complete product conversation.",
  },
  {
    title: "On-camera walkthrough",
    format: "FACE-TO-CAMERA VIDEO",
    description:
      "Bring your product to life with a personalized technical walkthrough and on-camera narration that connects features to real-world use.",
    focus: "Product demos, technical tutorials, and hands-on explanations.",
  },
];

export const experience = [
  {
    company: "Microsoft",
    role: "Software Engineer",
    date: "FEB 2026 — PRESENT",
    bullets: [
      "Developing Azure Resource Mover v2 to move Azure resources across regions via intelligent discovery, execution and co-pilot integrations.",
      "Architected end-to-end load balancer system to provision OpenAI model endpoints to distribute scale for intelligent workflows. Designed and coded MoveApplications CRUD APIs",
      "Planned Geneva telemetric system for synthetic logs, metrics and monitors for backend service and infrastructure to support alerting, mapped KQL queries and incident management (IcM) calls",
    ],
    skills: [".NET", "Azure", "Cloud management", "Agentic AI", "REST APIs"],
  },
  {
    company: "Cisco",
    role: "Software Engineer",
    date: "FEB – JUN 2024 · AUG 2024 – JAN 2026",
    bullets: [
      "Architected a scalable C++ Exporter plugin for low-latency data transfer from 150M+ endpoints to Splunk HEC, using batch processing in a distributed environment.",
      "Led cloud-native microservice migration to GitHub Cloud with CMake, Conan, and GitHub Actions build pipelines.",
      "Optimized backend Splunk API scripts for NVM-to-SCC app updates and developed Process Tree analytics for the Splunk dashboard.",
      "Developed an agentic log analyser, improving debugging accuracy and reducing manual effort by 80%.",
      "Designed ML-driven Python scripts to detect beacons in network traffic, improving detection accuracy by 37%.",
      "Developed a multithreaded fallback mechanism to automate build-server backups in 25% less time.",
    ],
    skills: [
      "C++",
      "Python",
      "JavaScript",
      "Splunk",
      "GitHub Actions",
      "Agentic AI",
      "Machine learning",
      "Perforce",
      "Web APIs",
    ],
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
      "JavaScript",
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
