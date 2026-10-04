# 3D Resume Portfolio

Aditya Jamwal's portfolio as a software engineer, mentor, and technology content
creator. Built with React, TypeScript, Vite, and Three.js, with an interactive
3D sculpture, light/dark themes, and accessible responsive layouts.

**[Visit the website](https://adityajamwal02.github.io/3D-resume/)**

## Website Sections

- **Introduction:** Engineering and mentorship focus, interactive sculpture, and career highlights.
- **Experience:** Microsoft, Cisco, and Ambee.
- **Work:** HashImagin and Multi-Agentic System.
- **Expertise:** Skills, education, and achievements.
- **Mentorship:** Session guide, booking links, and testimonials.
- **Content:** LinkedIn community and impressions counters, social links, and brand collaborations.
- **Contact:** Professional links and a dynamic copyright footer.

## Architecture

Low-level component and data flow. The static site is built and deployed to
GitHub Pages; public-profile refreshes run outside the visitor's browser.

```mermaid
flowchart TD
    Refresh["Scheduled public-profile refresh scripts"] --> Snapshots["linkedin.json / topmate.json"]
    Content["content.ts: resume data + manual impressions"] --> Portfolio["Portfolio.tsx: sections and metric formatting"]
    Snapshots --> Portfolio
    Main["main.tsx: React root + styles"] --> Portfolio
    Portfolio --> Island["DynamicIsland: navigation, theme, reading progress"]
    Portfolio --> Scene["SystemsScene: controls and fallback"]
    Scene -. "lazy import" .-> Renderer["createSculptureScene: Three.js renderer"]
    Portfolio --> Metrics["CountUp: community + impressions"]
    Metrics --> Motion["IntersectionObserver + animation frames; reduced-motion fallback"]
    Portfolio --> Brands["BrandCarousel: motion and keyboard controls"]
    Assets["Local logos + Google Sans fonts"] --> Brands
```

Development, content maintenance, testing, deployment, and implementation history
are documented in the [maintainer guide](docs/maintainer-guide.md).
