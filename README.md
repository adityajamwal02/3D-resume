# Aditya Jamwal / Systems Portfolio

A resume-first portfolio with a floating, glossy Three.js sculpture. Built with React 19, TypeScript, Vite 8, and CSS. No backend, API keys, analytics, or remote model services.

## Local Development

Use Node.js 22.12+ (Node 24 recommended) and npm.

```sh
npm ci
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173`. To choose another port, use `npm run dev -- --port 5174`.

```sh
npm run lint
npm run build
npx playwright install chromium
npm test
```

The test suite starts a production preview on port 4173. Run `npm run build` before `npm test` so tests cover the latest changes. Use `npm run preview` to browse the production build manually. `npm run format` formats source and tests.

## Architecture

```text
src/
  main.tsx                    React entry point and styles
  Portfolio.tsx               Semantic resume sections and contact interactions
  content.ts                  Career history and skill category data
  components/SystemsScene.tsx Accessible scene controls and deferred loading
  components/DynamicIsland.tsx Floating navigation, reading progress, quick actions
  scene/createSculptureScene.ts Three.js sculpture, studio reflections, cursor response
  styles.css                  Design tokens, responsive layout, print styles
  scene.css                   Scene composition and device adaptations
  island.css                  Gradient glass theme and vertical career timeline
tests/portfolio.spec.ts       Production-browser regression suite
playwright.config.ts         Isolated preview server and Chromium configuration
```

The rendering engine is dynamically imported after the content mounts. Three.js does not run through React state on each frame. Three interlocking rings share geometry and use physical clearcoat materials. A locally generated RoomEnvironment provides studio reflections through a PMREM texture; no downloaded models or HDR maps are needed. The minimalist typography uses self-hosted Manrope, with IBM Plex Mono for technical labels.

Mouse movement gently tilts the floating sculpture through damped interpolation. A subtle linear-gradient background animates behind the name and bio. The pause control freezes both the sculpture and ambient gradient; reduced-motion preferences disable automatic motion. The existing discipline selection, assembly, rotation, and reset controls remain available, as do the dynamic island, vertical experience timeline, skills, and contact sections.

The renderer targets 30 fps, caps device pixel ratio at 1 on mobile and 1.5 on desktop, suspends animation outside the viewport or in a hidden tab, and disposes GPU resources on unmount. Reduced-motion preferences start the scene paused. It can also be paused manually. Mouse orbit, layer selection, and keyboard-accessible rotation/reset controls all work without scroll capture. One-finger mobile scrolling is preserved.

If WebGL or the deferred chunk fails, a CSS illustration remains alongside functional discipline selection. Every resume section is ordinary HTML and independent of the renderer. Fonts are self-hosted through Fontsource.

## Content Provenance

The remote repository was empty when work began on September 10, 2026. There was no earlier implementation or checked-in CV to preserve. The resume text supplied in the coding session is the source for all employment dates, project descriptions, metrics, skills, education, and achievements.

- Career: Microsoft, Cisco (engineer and intern), and Ambee.
- HashImagin is the personal project from the resume. The agentic log analyser is explicitly identified as professional work at Cisco, not a separate personal project.
- GitHub and LinkedIn links use the handles supplied in the resume. The parsed attachment did not contain the exact HashImagin, LeetCode, Codeforces, or standings URLs. These are not guessed; HashImagin links honestly to the GitHub profile.
- The public contact surface includes the supplied email and professional profiles. The phone number is intentionally omitted to minimize public personal data.
- The resume attachment was supplied as parsed text, not an accessible PDF binary. The Resume button opens a print-ready version of the portfolio, including all skill groups; it does not pretend to download the original PDF.
- Project visuals are conceptual artwork, not screenshots of proprietary company products. No employer code, internal links, or environment configuration is exposed.

## Validation

The suite checks content, anchor navigation, skill filters, email clipboard handling, print behavior, mobile menus and keyboard focus, reduced motion, scene rotation/reset, actual canvas pixels, animated frame changes, and forced WebGL failure. Full-page screenshots are captured at 320, 390, 768, 1440, and 1920 pixels. Axe checks WCAG A/AA rules at desktop and mobile widths.

Screenshots and traces are written to ignored `test-results/`. GitHub Actions runs lint, production build, and the browser suite. The automated renderer uses Chromium software WebGL so CI does not require a GPU. Automated checks complement, rather than replace, device and assistive-technology testing.

## Deployment

This is a static application. Publish the `dist/` directory from `npm run build` to a static host with HTTPS. No secrets or environment variables are required. Vite uses relative asset URLs so the build can also be hosted below a repository subpath, including `/3D-resume/`. Navigation uses local anchors rather than history routes.

Cache hashed assets immutably, but revalidate `index.html` on deployment. Do not publish the source repository, node_modules, or local test artifacts as the web root.

## Known Limits and Next Steps

- The lazy Three.js chunk is approximately 139 KB gzipped. Vite reports its uncompressed size above the default 500 KB advisory threshold; it is deliberately kept off the initial content bundle.
- Validation covers Chromium and emulated viewport sizes, not physical low-power phones, Safari, or Firefox.
- Add the original PDF and exact project/competitive-programming URLs when available.
- Add a deployment-specific canonical URL, social preview image, and custom domain after choosing a public host. No live deployment has been performed.
