# Task 6 — Browser Motion QA and Final Tuning

Date: 2026-08-25

## Scope and environment

- Inspected the in-app Browser at desktop `1700 × 1000` and responsive `796 × 1000` viewports.
- Port `5173` was already occupied. It was opened first and showed the expected site; the task worktree was then served by Vite on `http://127.0.0.1:5174/` and used for the source-specific checks below.
- Browser viewport override was reset after QA.
- QA evidence is retained in the ignored Task 6 artifact directory:
  - [desktop hero, 1700 × 1000](/Users/sam/Documents/ChatGPT/个人网站/.worktrees/codex-resume-site/.superpowers/sdd/2026-08-24-editorial-motion-system/task-6-qa/desktop-1700-hero-settled.jpg)
  - [796px opening curtain](/Users/sam/Documents/ChatGPT/个人网站/.worktrees/codex-resume-site/.superpowers/sdd/2026-08-24-editorial-motion-system/task-6-qa/mobile-796-curtain.jpg)
  - [796px Work carousel](/Users/sam/Documents/ChatGPT/个人网站/.worktrees/codex-resume-site/.superpowers/sdd/2026-08-24-editorial-motion-system/task-6-qa/mobile-796-work.jpg)
- Screenshot files were checked with `file`/`sips`: desktop is JPEG `1700 × 1000`; both narrow captures are JPEG `796 × 1000`.
- Round-1 evidence coverage added tests only; production motion and CSS code remain unchanged.

## Opening verification

Desktop hard reload from the top showed an immediate espresso curtain with a centered ochre rule, with no white flash or horizontal overflow. This is an interactive observation; no intermediate opening screenshot was retained.

| Checkpoint | Observed state |
| --- | --- |
| Immediate reload | `body` and `html` overflow were `hidden`; curtain was `display: grid`; page width matched viewport width. |
| ~1.2 s | Video had begun settling (`scale ≈ 1.035`), hero title was visible, and the navigation was entering. |
| ~3.1 s | Curtain was `display: none`; hero title had no transform; scrolling was restored (`body` overflow `visible`) well before the 2.8 s ceiling. |

The retained [desktop-1700-hero-settled.jpg](/Users/sam/Documents/ChatGPT/个人网站/.worktrees/codex-resume-site/.superpowers/sdd/2026-08-24-editorial-motion-system/task-6-qa/desktop-1700-hero-settled.jpg) documents the settled Hero. The video/title sequencing and timing checkpoints above are interactive observations, not retained telemetry or screenshots.

At a genuine 796px viewport, an interactive browser readout recorded `innerWidth: 796` and `scrollWidth - clientWidth: 0`; the retained [mobile-796-curtain.jpg](/Users/sam/Documents/ChatGPT/个人网站/.worktrees/codex-resume-site/.superpowers/sdd/2026-08-24-editorial-motion-system/task-6-qa/mobile-796-curtain.jpg) and [mobile-796-work.jpg](/Users/sam/Documents/ChatGPT/个人网站/.worktrees/codex-resume-site/.superpowers/sdd/2026-08-24-editorial-motion-system/task-6-qa/mobile-796-work.jpg) confirm the actual capture surface was `796 × 1000`, not a desktop-width crop. Static `data-motion="parallax-image"` elements had no parallax custom property/transform on this viewport; this is an unretained interactive property observation. The original browser telemetry preserved the zero-overflow delta but not separate raw `clientWidth` and `scrollWidth` values. A follow-up reconnect attempt to collect those two fields returned `Browser is not available: iab`; they are therefore not inferred or fabricated here.

## Scroll choreography (interactive observations; no retained screenshots or raw telemetry)

- Profile heading began near the configured 72% viewport trigger. Its heading and dependent portrait/copy were overlapping phases, rather than serially blocking one another.
- Work heading moved from its initial masked transform to identity after crossing its trigger.
- All five work cards were observed across the full scroll. Each completed exactly once and remained visible after scrolling upward. Direction alternated as designed: cards 1/3/5 opened from the left; cards 2/4 opened from the right.
- At representative checkpoints, the next card was fully clipped at its pending entrance while the preceding card was already at identity. This confirms that the card choreography does not make the full section wait for earlier cards to finish.
- Desktop layout had `scrollWidth - clientWidth = 0` throughout the Profile, Work, Strengths, and Contact checks. No exposed image edge was visible while parallax/scrub activity was enabled at desktop size.
- Strengths and Contact both began at their configured heading/contact thresholds and reached identity state. At completion all four strength cards and contact heading/details/actions/foot were visible.

## Interaction, navigation, and background (interactive observations; no retained screenshots or raw telemetry)

- Both `DepthCarousel` instances remained usable after their enclosing work-card entrances.
  - Carousel 1: Next changed active dot `0 → 1`; a left drag changed it `1 → 2`.
  - Carousel 2: Previous changed active dot `0 → 1` after its current initial state, confirming buttons are still interactive.
- The kraft navigation became `.site-nav--floating` / `position: fixed` after the Hero threshold (observed at `scrollY 980`, with a 1000 px viewport).
- About, Work, Strengths, Contact, and Return-to-top anchors reached their respective locations (`1000`, `2863`, `7657`, `8973.5`, and `0` px respectively). The curtain remained `display: none` and `motion-opening` remained false for each; anchors do not replay opening motion.
- The Topography background remained rendered and visually independent of the content choreography.
- Carousel buttons were successfully activated after animations. The in-app Browser's Tab-key injection did not move focus from `body`; therefore keyboard focus-ring pixels could not be browser-observed. Existing focus-visible styles were not changed, and this limitation is not evidence of a site regression.

## Reduced-motion result

The in-app Browser exposes only `visibility`, `viewport`, and `pageAssets` capabilities; it has no media-emulation capability. Reduced-motion browser emulation was therefore unavailable. The following deterministic behavior tests now cover the branch instead:

- `useEditorialMotion` under reduced motion leaves the root in `motion-ready motion-reduced`, restores document/body scrolling, leaves target inline opacity/transform/parallax state empty (the final visible state), and creates no GSAP timeline, GSAP media query, or additional ScrollTrigger.
- The DepthCarousel stays manually navigable in reduced motion, does not autoplay after 6000ms, and uses GSAP tween duration `0` after an explicit next action.
- Mutation checks were run: disabling the reduced-motion bypass made the hook test fail; removing the reduced-motion duration guard made the carousel test fail with `duration: 0.7` instead of `0`.

## No-controller fallback and keyboard focus proof

- `motionFallback.test.jsx` renders the actual fallback DOM without invoking `useEditorialMotion`, injects the production stylesheet into JSDOM's CSS engine, and verifies the curtain computes to `display: none` while title/copy compute to visible, untransformed content. This is a reproducible temporarily-removed-hook proof of the no-JS safety contract.
- The same test uses a keyboard-focusable link, sends a Tab key event, focuses the target, and verifies focus ownership plus the parsed production `a:focus-visible` rule (`outline: 2px solid currentColor`, `outline-offset: 5px`). JSDOM does not implement the browser's `:focus-visible` modality heuristic, so direct pseudo-class pixel matching could not be used; this deterministic CSS-and-focus proof guards the actual ring declaration.
- The in-app Browser disconnected before the round-1 focus visual could be re-run, and a documented reconnect retry reported that IAB was unavailable. No alternate browser surface was substituted.

## Final verification

```text
pnpm test --run
  Test Files  7 passed (7)
  Tests  27 passed (27)

pnpm build
  ✓ built in 498ms

git diff --check
  exit 0; no whitespace errors

git status --short
  clean (ignored QA evidence/report artifacts excluded by `.superpowers/sdd/.gitignore`)
```

The test run printed four non-fatal jsdom `Window.scrollTo()` “Not implemented” notices; Vitest exited 0 with 7 test files and 27 tests passing.

## Change record

- Production code/CSS changes: none.
- Added focused evidence tests: `src/useEditorialMotion.test.js`, `src/DepthCarousel.test.jsx`, `src/motionFallback.test.jsx`, and the App focus target assertion.
- Prior evidence-test commit: `95b7bc0 test: prove motion safety fallbacks`.
- This report correction is committed as the latest `docs: correct motion QA evidence` entry in Git history.
- The three screenshot artifacts remain intentionally ignored; this report will be force-added for an auditable correction commit.
