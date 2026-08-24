# Editorial Motion System Design

**Date:** 2026-08-24

## Goal

Transform the resume site from a mostly static portfolio into a restrained, high-end editorial motion experience inspired by designer portfolios and creative-agency websites. The result should feel deliberate and cinematic without bounce, excessive speed, or continuous distraction.

The system covers a complete Hero opening sequence, one-time scroll entrances for every major section, staged card reveals, and subtle image parallax. It must preserve the existing Maillard palette, kraft-paper navigation, Topography background, two DepthCarousel instances, content truthfulness, and responsive layout.

## Approved Interaction Rules

- Play the full opening once on every full page load or hard refresh.
- Do not replay the opening for anchor navigation, browser history navigation within the loaded page, or ordinary interaction.
- Play each scroll-triggered section entrance only once per page load.
- Never hide completed sections again when the user scrolls upward.
- Skip the full motion treatment when `prefers-reduced-motion: reduce` is active.

## Architecture

Use a centralized GSAP motion controller rather than placing animation logic in each visual component.

The controller will:

- register `ScrollTrigger` once;
- create the Hero opening timeline;
- create one-time section and card triggers;
- create scrubbed parallax only for eligible static images;
- refresh trigger measurements after images load and on responsive layout changes;
- restore scrolling and revert all GSAP contexts during cleanup.

React components remain responsible for markup and content. They expose semantic motion targets through stable class names or `data-motion` attributes. The motion controller owns timing, easing, trigger thresholds, and teardown.

The existing DepthCarousel continues to own transforms on its cards. The motion system may reveal the carousel's outer image wrapper but must never animate the carousel card transforms directly.

## Progressive Enhancement

Content is visible by default. The page receives a motion-ready state only after the controller initializes successfully. Initial hidden or clipped states are applied through GSAP after initialization, not as unconditional CSS that could leave content invisible when JavaScript fails.

Reduced-motion users see the final layout immediately. The controller does not create opening, stagger, parallax, scrub, or large displacement animations in that mode. Existing reduced-motion CSS remains as a secondary safeguard.

## Opening Animation

Target total duration: approximately 2.8 seconds.

### Sequence

1. **0.00–0.45 seconds — curtain and rule**
   - A full-screen espresso curtain covers the Hero.
   - A thin ochre rule grows outward from the center.
   - Scrolling is temporarily locked.

2. **0.35–1.05 seconds — background reveal**
   - The curtain reveals horizontally.
   - The Hero video begins slightly enlarged, darker, and vertically compressed, then eases to its final state.

3. **0.75–1.65 seconds — primary name**
   - “崔琪” enters through an overflow-hidden mask.
   - The text travels upward by a large distance and restores from roughly `scaleX(0.82)` to its natural width.
   - The motion emphasizes compression and release without overshoot.

4. **1.35–2.05 seconds — secondary information**
   - “QI CUI”, the discipline kicker, and the Hero introduction enter in sequence.
   - Movement combines mask reveal, vertical translation, and letter-spacing restoration instead of a plain opacity fade.

5. **1.80–2.50 seconds — navigation and actions**
   - Navigation, primary actions, folio text, and dividers enter last.
   - Rules grow along the horizontal axis.

6. **2.50–2.80 seconds — release**
   - Remove the opening curtain from interaction and rendering.
   - Restore document scrolling.
   - Leave all Hero elements in stable final positions.

### Easing

Use `power3.out`, `power4.inOut`, and limited `expo.out`. Do not use bounce, elastic, spring, or visible overshoot easing.

## Scroll Motion

Each major section begins when its heading approaches roughly 72% of the viewport height. All entrance triggers use `once: true`.

### Shared section heading

- Reveal the section index first.
- Grow the rule from left to right.
- Bring the large heading from approximately 80–120 pixels below its final position.
- Restore a small horizontal compression through a line-level mask.
- Duration is approximately 1.1 seconds.
- Begin section content when the heading is about 35% complete to maintain flow.

### Profile

- Reveal the portrait upward inside its existing frame.
- Enter the introduction, education rows, and contact rows in hierarchy order.
- Stagger the three profile facts by approximately 0.10 seconds.
- Do not animate the Topography canvas transform.

### Selected Work

- Give each work card its own one-time trigger.
- Reveal the image wrapper with a directional `clip-path` and gentle scale restoration.
- Enter metadata, title, role, summary, metrics, and tags in hierarchy order.
- Alternate only the reveal direction to match the existing left/right card layout; keep timing consistent.
- Reveal DepthCarousel instances through their wrapper only.

### Strengths

- Bring the heading in first.
- Reveal the four cards with a 0.12-second stagger.
- Use small positional offsets and horizontal compression; do not use bouncing or large rotations.

### Contact

- Expand the full-screen background treatment first.
- Reveal the two headline lines through separate masks.
- Enter contact details and actions afterward.
- End in a stable, quiet state suitable for the final page.

## Image Reveal and Parallax

- Use `clip-path`, scale, and transform-only movement for initial image reveals.
- Apply subtle scrubbed parallax only to static work images and the profile portrait.
- Limit travel to approximately 4–7% of the image area.
- Do not animate layout dimensions.
- Do not apply parallax to DepthCarousel cards or the Topography canvas.
- Use a smooth scrub value rather than immediate pointer-like tracking.

## Performance

- Prefer `transform`, `opacity`, and short-lived `clip-path` animation.
- Avoid continuous width, height, top, left, margin, or layout measurement changes during scrolling.
- Add `will-change` only while an animation is active when practical; do not leave it broadly applied to the entire page.
- Use one GSAP context scoped to the page root and revert it on cleanup.
- Kill ScrollTriggers and timelines created by the controller during cleanup.
- Refresh ScrollTrigger after relevant images load and after responsive geometry changes.
- Pause naturally with browser animation scheduling when the page is backgrounded; do not add independent high-frequency loops.

## Accessibility and Failure Safety

- Preserve document order and semantic headings.
- Animation wrappers must not change accessible names.
- The opening curtain is decorative and hidden from assistive technology.
- Keyboard focus remains usable after the opening; no permanent focus trap is created.
- Scroll locking must be restored on completion, interruption, reduced-motion bypass, and component cleanup.
- If GSAP or initialization fails, content remains visible and scrolling remains enabled.

## Responsive Behavior

The original product focus remains PC presentation. Tablet and narrow layouts keep the same hierarchy with reduced displacement and shorter stagger intervals. Motion must never introduce horizontal overflow.

On small screens:

- reduce large title travel;
- avoid parallax that exposes image edges;
- keep the opening duration shorter if necessary;
- retain the same reduced-motion bypass.

## Testing and Verification

Automated tests will cover:

- presence of the opening curtain and required motion targets;
- initialization of the centralized motion controller;
- reduced-motion bypass behavior;
- cleanup that restores scrolling and removes created triggers;
- preservation of existing navigation, profile, work cards, carousels, strengths, and contacts.

Manual browser verification will cover:

- the complete opening on a hard refresh;
- no opening replay during anchor navigation;
- one-time section and card triggers;
- heading mask reveals and stagger order;
- static-image reveal and parallax;
- fixed kraft navigation behavior;
- correct operation of both DepthCarousel instances;
- reduced-motion behavior;
- scroll smoothness and absence of visible layout jumps at the target PC viewport and the current narrower browser viewport.

## Out of Scope

- page transitions between multiple routes;
- cursor-following effects;
- WebGL distortion beyond the existing Topography background;
- animated typography that splits Chinese characters into unreadable fragments;
- sound, bounce, elastic motion, or infinite decorative loops;
- redesigning content, color palette, layout, or project data.
