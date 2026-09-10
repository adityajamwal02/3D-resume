# 3D Resume Portfolio

A career portfolio with a floating, glossy Three.js sculpture. Built with React 19, TypeScript, Vite 8, and CSS. No custom backend, private API keys, analytics, or remote model services. Contact delivery uses EmailJS once configured.

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
  components/ContactForm.tsx   Private-recipient EmailJS contact form
  scene/createSculptureScene.ts Three.js sculpture, studio reflections, cursor response
  styles.css                  Design tokens, responsive layout, print styles
  scene.css                   Scene composition and device adaptations
  island.css                  Gradient glass theme and vertical career timeline
tests/portfolio.spec.ts       Production-browser regression suite
playwright.config.ts         Isolated preview server and Chromium configuration
```

The rendering engine is dynamically imported after the content mounts. Three.js does not run through React state on each frame. Three interlocking rings share geometry and use physical clearcoat materials. A locally generated RoomEnvironment provides studio reflections through a PMREM texture; no downloaded models or HDR maps are needed. The typography uses self-hosted Google Sans (OFL-1.1), with IBM Plex Mono for technical labels. A custom geometric AJ monogram is shared by the header, footer, and favicon.

Mouse movement gently tilts the floating sculpture through damped interpolation. A subtle linear-gradient background animates behind the name and bio. The pause control freezes both the sculpture and ambient gradient; reduced-motion preferences disable automatic motion. The existing discipline selection, assembly, rotation, and reset controls remain available, as do the dynamic island, vertical experience timeline, skills, and contact sections.

The renderer targets 30 fps, caps device pixel ratio at 1 on mobile and 1.5 on desktop, suspends animation outside the viewport or in a hidden tab, and disposes GPU resources on unmount. Reduced-motion preferences start the scene paused. It can also be paused manually. Mouse orbit, layer selection, and keyboard-accessible rotation/reset controls all work without scroll capture. One-finger mobile scrolling is preserved.

If WebGL or the deferred chunk fails, a CSS illustration remains alongside functional discipline selection. Every resume section is ordinary HTML and independent of the renderer. Fonts are self-hosted through Fontsource.

## Content Provenance

The remote repository was empty when work began on September 10, 2026. There was no earlier implementation or checked-in CV to preserve. The resume text supplied in the coding session is the source for all employment dates, project descriptions, metrics, skills, education, and achievements.

- Career: Microsoft, Cisco, and Ambee. Cisco engineering and internship achievements are combined under one Software Engineer entry at the owner's request; the two original employment periods are preserved in its date label.
- HashImagin is the personal project from the resume. The agentic log analyser is explicitly identified as professional work at Cisco, not a separate personal project.
- GitHub and LinkedIn links use the handles supplied in the resume. The parsed attachment did not contain the exact HashImagin, LeetCode, Codeforces, or standings URLs. These are not guessed; HashImagin links honestly to the GitHub profile.
- The public contact surface contains professional profiles and a contact form. Personal recipient addresses, mailto links, and phone numbers are omitted from the frontend. Previous Git history may contain older public contact details; deployment does not rewrite repository history.
- The mentorship biography, portrait, session names, durations, and booking URLs come from [Aditya's public Topmate profile](https://topmate.io/adityajamwal), checked September 10, 2026. The portrait is served locally. Pricing, availability, payments, and reviews remain on Topmate; booking links open there directly, without an embedded third-party widget. Mentorship content is excluded from the printed resume.
- No resume download or print controls are offered. The hero and expanded menu link to LinkedIn instead. Visitors can still use their browser's built-in print/save features, as with any public webpage. Topmate's Resume Review service is independent of downloading the owner's resume.
- Experience logos are self-hosted: [Microsoft mark](https://commons.wikimedia.org/wiki/File:Microsoft_logo.svg), [Cisco logo](https://commons.wikimedia.org/wiki/File:Cisco_logo_blue_2016.svg), and [Ambee's official white logo](https://cdn.prod.website-files.com/6242a3f6d206db221c2b13e8/627de922222f9769ff40c945_Ambee%20White%20logo.svg). Logos identify employers; their trademarks belong to their respective owners.
- Project visuals are conceptual artwork, not screenshots of proprietary company products. No employer code, internal links, or environment configuration is exposed.

## Validation

The suite checks content, company logos, LinkedIn links, absence of public email/download controls, anchor navigation, skill filters, contact validation/consent, duplicate submissions, API failures, missing configuration, mobile menus and keyboard focus, reduced motion, scene rotation/reset, actual canvas pixels, animated frame changes, and forced WebGL or renderer-download failure. Full-page screenshots are captured at 320, 375, 390, 768, 1440, and 1920 pixels. Axe checks WCAG 2.0, 2.1, and 2.2 A/AA rules at desktop and mobile widths, including expanded navigation and the enabled contact form.

Focused Chromium, Firefox, and WebKit checks cover navigation, asset delivery, expanded-menu accessibility, contact forms, and renderer-download failure. Contact tests intercept EmailJS requests and never send real messages. These tests verify client behavior, not inbox delivery. Short-screen checks cover 320x568, 667x375, 844x390, and 1024x768. Expanded menus scroll within the viewport, and Escape closes them and restores toggle focus even when pointer clicks do not focus buttons.

```sh
npx playwright install chromium firefox webkit
npx playwright test --browser all --grep 'cross-browser|short-screen|contact form|failed 3D download'
```

To test a deployed build instead of starting the local preview, set `PLAYWRIGHT_BASE_URL` to its full URL including the trailing slash. For example, in PowerShell:

```powershell
$env:PLAYWRIGHT_BASE_URL = 'https://adityajamwal02.github.io/3D-resume/'
try { npm test } finally { Remove-Item Env:PLAYWRIGHT_BASE_URL }
```

Full-page screenshots may omit offscreen compositor layers on very tall pages; inspect viewport screenshots when a full-page capture looks inconsistent.

Screenshots and traces are written to ignored `test-results/`. GitHub Actions runs lint, production build, and the browser suite. The automated renderer uses Chromium software WebGL so CI does not require a GPU. Automated checks complement, rather than replace, device and assistive-technology testing.

## Deployment

Live at [adityajamwal02.github.io/3D-resume](https://adityajamwal02.github.io/3D-resume/). Pushes to `main` deploy to GitHub Pages after lint, build, and browser tests pass.

This is a static application. Publish the `dist/` directory from `npm run build` to a static host with HTTPS. No private secrets or environment variables belong in the frontend. Vite uses relative asset URLs so the build can also be hosted below a repository subpath, including `/3D-resume/`. Navigation uses local anchors rather than history routes.

Cache hashed assets immutably, but revalidate `index.html` on deployment. Do not publish the source repository, node_modules, or local test artifacts as the web root.

## Contact Delivery Setup

The checked-in `public/contact-config.json` is intentionally unconfigured. Until activated, the form disables submission and offers LinkedIn instead. This is not a working email delivery setup yet.

1. In an owner-controlled [EmailJS account](https://dashboard.emailjs.com/), connect and verify an email service. Keep all mailbox credentials in EmailJS, never in this repository.
2. Create a template with **To Email** fixed to the owner's requested receiving inbox. Do not use a visitor-controlled recipient variable. Set **Reply-To** to `{{reply_to}}`, and include `{{from_name}}` and `{{message}}` in a plain-text or escaped template. Avoid auto-replies that reveal the private sending or receiving address.
3. Restrict allowed origins to `https://adityajamwal02.github.io` in EmailJS account security. Use provider rate limits and monitor quota/abuse. The hidden field and duplicate-submit guard are convenience checks, not server-side spam protection. CAPTCHA requires additional frontend integration before enabling it on the template.
4. Put only the service ID, template ID, and public key in `public/contact-config.json` as `serviceId`, `templateId`, and `publicKey`. These are browser-visible identifiers, not secrets. Never put a recipient address or EmailJS private key in that file.
5. Deploy, submit one authorized live test message, and verify receipt and Reply-To in the private inbox. An EmailJS `200 OK` confirms service acceptance, not final mailbox delivery. Real delivery remains unverified until this check is completed.

Messages are sent only after consent. They are not stored in browser storage or logged by the app. Failed requests retain the fields in the current page; successful requests clear them. EmailJS receives the visitor's details under its linked privacy policy. Requests time out after 15 seconds and are never retried automatically.

## Known Limits and Next Steps

- The lazy Three.js chunk is approximately 139 KB gzipped. Vite reports its uncompressed size above the default 500 KB advisory threshold; it is deliberately kept off the initial content bundle.
- The full suite runs in Chromium; focused navigation, accessibility, and resilience checks also run in Firefox and Playwright WebKit. Emulated viewports and WebKit are not substitutes for physical iOS/Android devices, shipping Safari, manual screen-reader testing, or real Topmate booking/payment transactions.
- Add the original PDF and exact project/competitive-programming URLs when available.
- Add a deployment-specific canonical URL, social preview image, and custom domain when needed.
