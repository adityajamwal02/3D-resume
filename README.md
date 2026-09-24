# 3D Resume Portfolio

A career portfolio with a floating, glossy Three.js sculpture. Built with React 19, TypeScript, Vite 8, and CSS. No custom backend, API keys, analytics, or email delivery. Contact links lead directly to LinkedIn, Topmate, and GitHub.

## Local Development

Use Node.js 22.12+ (Node 24 recommended) and npm.

```sh
npm ci
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173`. To choose another port, use `npm run dev -- --port 5174`.

```sh
npm run lint
npm run test:sync
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
  data/topmate.json           Last verified public Topmate metrics and timestamp
  components/SystemsScene.tsx Accessible scene controls and deferred loading
  components/DynamicIsland.tsx Floating navigation, reading progress, quick actions
  scene/createSculptureScene.ts Three.js sculpture, studio reflections, cursor response
  styles.css                  Design tokens, responsive layout, print styles
  scene.css                   Scene composition and device adaptations
  island.css                  Gradient glass theme and vertical career timeline
  theme.css                   Light palette, theme control, and contact invitation
tests/portfolio.spec.ts       Production-browser regression suite
playwright.config.ts         Isolated preview server and Chromium configuration
scripts/refresh-topmate.mjs   Validated, atomic public-profile metric refresh
scripts/refresh-topmate.test.mjs Parser, freshness, and failure regression tests
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
- The public contact surface contains a conversation invitation and direct professional-profile and mentorship links. There is no form or email delivery service. Personal recipient addresses, mailto links, and phone numbers are omitted from the frontend. Previous Git history may contain older public contact details; deployment does not rewrite repository history.
- The mentorship biography, portrait, session names, durations, and booking URLs come from [Aditya's public Topmate profile](https://topmate.io/adityajamwal), checked September 10, 2026. The portrait is served locally. Pricing, availability, payments, and the full review collection remain on Topmate; booking links open there directly, without an embedded third-party widget. Mentorship content is excluded from the printed resume.
- Three selected testimonials preserve the quotes, author names, and dates supplied by the owner. The aggregate rating, ratings count, bookings, testimonials count, and Helpful/Insightful/Friendly feedback counts are refreshed from the public Topmate profile every three days. The visible update date identifies the last verified snapshot; these are periodically refreshed aggregates, not real-time figures or individual reviewer ratings. Testimonials sit inside mentorship without a separate navigation destination.
- Microsoft's experience bullets use the owner's updated wording supplied September 24, 2026. The footer copyright derives its year from the visitor's current date on render, independently of build or deployment dates.
- No resume download or print controls are offered. The hero and expanded menu link to LinkedIn instead. Visitors can still use their browser's built-in print/save features, as with any public webpage. Topmate's Resume Review service is independent of downloading the owner's resume.
- Experience logos are self-hosted: [Microsoft mark](https://commons.wikimedia.org/wiki/File:Microsoft_logo.svg), [Cisco logo](https://commons.wikimedia.org/wiki/File:Cisco_logo_blue_2016.svg), and [Ambee's official white logo](https://cdn.prod.website-files.com/6242a3f6d206db221c2b13e8/627de922222f9769ff40c945_Ambee%20White%20logo.svg). Logos identify employers; their trademarks belong to their respective owners.
- Project visuals are conceptual artwork, not screenshots of proprietary company products. No employer code, internal links, or environment configuration is exposed.

## Validation

Testimonial checks cover the supplied quotes, current snapshot metrics and update date, unchanged navigation, desktop author alignment, mobile stacking, print exclusion, and accessibility in both themes at 320, 768, and 1440 pixels. Additional tests verify the exact Microsoft bullets and copyright rendering in 2026, 2027, and 2030. Sync tests cover parsing, true zero counts, invalid/missing data, the exact 72-hour threshold across month/year/leap-day boundaries, skipped network requests, successful persistence, and preservation of the previous snapshot on HTTP, network, timeout, or markup failures.

The suite checks content, company logos, LinkedIn links, absence of public email/download controls, anchor navigation, skill filters, direct contact links, theme preferences and persistence, blocked local storage, mobile menus and keyboard focus, reduced motion, scene rotation/reset, actual canvas pixels, animated frame changes, and forced WebGL or renderer-download failure. Full-page screenshots are captured at 320, 375, 390, 768, 1440, and 1920 pixels. Axe checks WCAG 2.0, 2.1, and 2.2 A/AA rules in both themes at desktop and mobile widths, including expanded navigation.

Focused Chromium, Firefox, and WebKit checks cover navigation, asset delivery, expanded-menu accessibility, themes, direct contact links, and renderer-download failure. Short-screen checks cover 320x568, 667x375, 844x390, and 1024x768. Expanded menus scroll within the viewport, and Escape closes them and restores toggle focus even when pointer clicks do not focus buttons.

```sh
npx playwright install chromium firefox webkit
npx playwright test --browser all --grep 'cross-browser|short-screen|theme|contact invitation|failed 3D download'
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

### Scheduled Topmate refresh

GitHub Actions checks freshness hourly at minute 23 and fetches the public profile only when the checked-in snapshot is at least 72 hours old. This avoids the short intervals at month boundaries caused by day-of-month `*/3` cron schedules. GitHub may delay scheduled runs; the normal refresh window is 72–73 hours, not a real-time guarantee. Fresh snapshots skip installation, build, tests, and deployment.

The fetch uses the profile's public JSON-LD rating, visible booking/testimonial badges, and public feedback data. It validates the account identity, rating range, integer counts, and consistency with the visible rating before atomically replacing the JSON snapshot. It requires no account credentials, browser-side third-party requests, or extra dependencies. The three selected testimonial quotes are deliberately unchanged.

Due refreshes run sync tests, lint, build, and browser tests before committing the snapshot and deploying **in the same workflow**. A bot commit does not need to trigger another workflow. Workflow concurrency serializes releases; a conflicting branch update makes the push fail rather than overwriting changes. The workflow needs `contents: write` to persist the snapshot, plus the existing Pages deployment permissions.

On fetch, schema, or test failure, the workflow fails visibly and the last verified site stays live; its update date remains visible. Check the Actions run and enable GitHub workflow-failure notifications. Scheduled workflows in inactive public repositories can be disabled by GitHub after 60 days without repository activity; verify scheduling remains enabled if automated commits stop.

To refresh immediately locally, run `npm run refresh:topmate`, then run the validation commands above and commit the updated snapshot. To check without fetching early, run `npm run refresh:topmate -- --if-due`. A manual **Run workflow** also checks the 72-hour threshold and validates/deploys the current site; select **Refresh Topmate now** to explicitly bypass the freshness check, for example when verifying the complete automated refresh and deployment path.

This is a static application. Publish the `dist/` directory from `npm run build` to a static host with HTTPS. No private secrets or environment variables belong in the frontend. Vite uses relative asset URLs so the build can also be hosted below a repository subpath, including `/3D-resume/`. Navigation uses local anchors rather than history routes.

Cache hashed assets immutably, but revalidate `index.html` on deployment. Do not publish the source repository, node_modules, or local test artifacts as the web root.

## Appearance

The sun/moon control in the navigation switches between dark and light palettes using the same mint, cool-neutral, and rose accents. The system color preference is applied before React renders, avoiding a wrong-theme flash. An explicit choice is stored as `portfolio-theme` in local storage and synchronized between tabs. Without a saved choice, system preference changes apply automatically. When storage is unavailable, the toggle still works for the current page. Browser chrome and native controls follow the selected mode; reduced-motion behavior remains unchanged. The contact section retains its pastel accent band in both themes.

## Known Limits and Next Steps

- The lazy Three.js chunk is approximately 139 KB gzipped. Vite reports its uncompressed size above the default 500 KB advisory threshold; it is deliberately kept off the initial content bundle.
- The full suite runs in Chromium; focused navigation, accessibility, and resilience checks also run in Firefox and Playwright WebKit. Emulated viewports and WebKit are not substitutes for physical iOS/Android devices, shipping Safari, manual screen-reader testing, or real Topmate booking/payment transactions.
- Add exact project/competitive-programming URLs when available.
- Add a deployment-specific canonical URL, social preview image, and custom domain when needed.
