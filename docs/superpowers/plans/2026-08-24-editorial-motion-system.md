# Editorial Motion System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a restrained GSAP/ScrollTrigger motion system with a complete Hero opening, one-time section and card entrances, masked image reveals, and subtle static-image parallax.

**Architecture:** A centralized `useEditorialMotion` hook owns one GSAP context, the opening timeline, ScrollTrigger creation, refresh listeners, reduced-motion bypass, and cleanup. `App.jsx` exposes stable semantic `data-motion` targets while existing visual components retain ownership of their own transforms, especially `DepthCarousel` and `Topography`.

**Tech Stack:** React 19, GSAP 3.15, GSAP ScrollTrigger, Vite 8, Vitest 4, Testing Library, CSS

**Spec:** `docs/superpowers/specs/2026-08-24-editorial-motion-system-design.md`

## Global Constraints

- Play the full opening once per full page load or hard refresh; never replay it for anchor navigation or ordinary interaction.
- Set every section and card entrance ScrollTrigger to `once: true`.
- Use `power3.out`, `power4.inOut`, and limited `expo.out`; never use bounce, elastic, spring, or visible overshoot.
- Keep content visible by default and apply initial states only after successful JavaScript initialization.
- Skip opening, stagger, parallax, scrub, and large displacement when `prefers-reduced-motion: reduce` is active.
- Animate transforms, opacity, and short-lived clip paths; do not animate layout dimensions during scrolling.
- Never animate transforms on `.depth-carousel__card`, `.depth-carousel__stage`, or the Topography canvas.
- Always restore scrolling and revert the GSAP context on completion, interruption, and cleanup.
- Preserve the existing layout, Maillard palette, kraft navigation, project data, and accessible document order.

## File Structure

- Create `src/useEditorialMotion.js`: centralized GSAP and ScrollTrigger orchestration, reduced-motion handling, opening lifecycle, refresh listeners, and cleanup.
- Create `src/useEditorialMotion.test.js`: behavior tests for reduced-motion bypass, scroll locking, motion-ready state, and cleanup.
- Modify `src/App.jsx`: add one page root ref, invoke the hook, render the decorative opening curtain, and add semantic `data-motion` targets.
- Modify `src/App.test.jsx`: verify the opening structure and stable target markup without testing GSAP internals.
- Modify `src/styles.css`: add opening curtain, mask wrappers, motion-safe rendering hints, and responsive/reduced-motion safeguards.

---

### Task 1: Add Stable Motion Markup and Opening Structure

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`

**Interfaces:**
- Consumes: existing `SectionHeading`, Hero, Profile, Work, Strengths, and Contact markup.
- Produces: a root element with `ref={motionRootRef}` and stable targets including `data-motion="hero-title"`, `data-motion="section-heading"`, `data-motion="work-card"`, and `data-motion="contact"` for `useEditorialMotion(rootRef)`.

- [ ] **Step 1: Write the failing structure test**

Add this test to `src/App.test.jsx`:

```jsx
it('exposes the opening curtain and centralized editorial motion targets', () => {
  render(<App />)

  expect(document.querySelector('.opening-curtain[aria-hidden="true"]')).toBeInTheDocument()
  expect(document.querySelector('[data-motion="hero-title"]')).toHaveTextContent('崔琪')
  expect(document.querySelectorAll('[data-motion="section-heading"]')).toHaveLength(3)
  expect(document.querySelectorAll('[data-motion="work-card"]')).toHaveLength(5)
  expect(document.querySelector('[data-motion="contact"]')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run:

```bash
CI=true PATH=/Users/sam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/sam/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test --run src/App.test.jsx
```

Expected: FAIL because `.opening-curtain` and the `data-motion` targets do not exist.

- [ ] **Step 3: Add the motion root and semantic targets**

Update imports and the component root in `src/App.jsx`:

```jsx
import { useEffect, useRef, useState } from 'react'
import useEditorialMotion from './useEditorialMotion'

function App() {
  const motionRootRef = useRef(null)
  const [isNavFloating, setIsNavFloating] = useState(false)

  useEditorialMotion(motionRootRef)

  return (
    <div className="site" ref={motionRootRef}>
      <div className="opening-curtain" aria-hidden="true">
        <span className="opening-curtain__rule" />
      </div>
      {/* existing page content */}
    </div>
  )
}
```

Create a temporary `src/useEditorialMotion.js` so the markup task compiles:

```js
export default function useEditorialMotion() {}
```

Apply these targets without changing accessible text:

```jsx
<header className="section-heading" data-motion="section-heading">
<span className="hero__name-primary" data-motion="hero-title">崔琪</span>
<article className="work-card" data-motion="work-card" ...>
<article className="strength-card" data-motion="strength-card" ...>
<footer className="contact" id="contact" data-motion="contact">
```

Add `data-motion` markers to `.hero__kicker`, `.hero__name-secondary`, `.hero__footer`, `.hero__folio`, `.portrait-frame`, `.profile__copy`, `.profile__facts > div` through their rendered elements, `.tools-line`, `.contact__intro`, `.contact__details`, `.contact__actions`, and `.contact__foot`.

- [ ] **Step 4: Run the test and verify it passes**

Run the same command from Step 2.

Expected: all `src/App.test.jsx` tests PASS.

- [ ] **Step 5: Commit the markup contract**

```bash
git add src/App.jsx src/App.test.jsx src/useEditorialMotion.js
git commit -m "feat: add editorial motion targets"
```

---

### Task 2: Implement Reduced-Motion Safety and the Opening Timeline

**Files:**
- Modify: `src/useEditorialMotion.js`
- Create: `src/useEditorialMotion.test.js`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `useEditorialMotion(rootRef: React.RefObject<HTMLElement>)` and the Task 1 motion targets.
- Produces: `prefersReducedMotion(): boolean`, `restoreMotionState(root: HTMLElement): void`, and the opening lifecycle managed inside `useEditorialMotion`.

- [ ] **Step 1: Write failing reduced-motion and cleanup tests**

Create `src/useEditorialMotion.test.js`:

```js
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { useRef } from 'react'
import useEditorialMotion, { prefersReducedMotion, restoreMotionState } from './useEditorialMotion'

afterEach(() => {
  cleanup()
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  vi.unstubAllGlobals()
})

function Harness() {
  const rootRef = useRef(null)
  useEditorialMotion(rootRef)
  return <div ref={rootRef}><div className="opening-curtain" /></div>
}

it('detects the operating-system reduced-motion preference', () => {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
  expect(prefersReducedMotion()).toBe(true)
})

it('leaves scrolling unlocked and marks reduced motion as ready', () => {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
  const { container } = render(<Harness />)
  expect(container.firstChild).toHaveClass('motion-ready', 'motion-reduced')
  expect(document.documentElement.style.overflow).toBe('')
})

it('restores scrolling and removes transient motion state', () => {
  const root = document.createElement('div')
  root.className = 'motion-ready motion-opening'
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'

  restoreMotionState(root)

  expect(root).not.toHaveClass('motion-opening')
  expect(document.documentElement.style.overflow).toBe('')
  expect(document.body.style.overflow).toBe('')
})
```

- [ ] **Step 2: Run the tests and verify they fail**

Run:

```bash
CI=true PATH=/Users/sam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/sam/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test --run src/useEditorialMotion.test.js
```

Expected: FAIL because the exported helpers and behavior are missing.

- [ ] **Step 3: Implement safety helpers and hook initialization**

Replace `src/useEditorialMotion.js` with this foundation:

```js
import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function restoreMotionState(root) {
  root?.classList.remove('motion-opening')
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
}

export default function useEditorialMotion(rootRef) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    root.classList.add('motion-ready')

    if (prefersReducedMotion()) {
      root.classList.add('motion-reduced')
      restoreMotionState(root)
      return () => root.classList.remove('motion-ready', 'motion-reduced')
    }

    root.classList.add('motion-opening')
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    const context = gsap.context(() => {
      // Opening timeline is added in the next step.
    }, root)

    return () => {
      context.revert()
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      restoreMotionState(root)
      root.classList.remove('motion-ready')
    }
  }, [rootRef])
}
```

- [ ] **Step 4: Add the 2.8-second opening timeline**

Inside the GSAP context, create one timeline:

```js
const opening = gsap.timeline({
  defaults: { ease: 'power3.out' },
  onComplete: () => restoreMotionState(root),
})

gsap.set('[data-motion="hero-title"]', { yPercent: 115, scaleX: 0.82, transformOrigin: 'left center' })
gsap.set('[data-motion="hero-kicker"], [data-motion="hero-secondary"], [data-motion="hero-copy"]', {
  y: 42,
  opacity: 0,
})
gsap.set('.site-nav, [data-motion="hero-actions"], [data-motion="hero-folio"]', { y: -24, opacity: 0 })
gsap.set('.hero__video', { scale: 1.08, scaleY: 0.92, filter: 'brightness(0.62)' })

opening
  .fromTo('.opening-curtain__rule', { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'power4.inOut' }, 0)
  .to('.opening-curtain', { clipPath: 'inset(0 0 0 100%)', duration: 0.7, ease: 'power4.inOut' }, 0.35)
  .to('.hero__video', { scale: 1, scaleY: 1, filter: 'brightness(1)', duration: 1.05, ease: 'power4.inOut' }, 0.35)
  .to('[data-motion="hero-title"]', { yPercent: 0, scaleX: 1, duration: 0.9, ease: 'expo.out' }, 0.75)
  .to('[data-motion="hero-kicker"], [data-motion="hero-secondary"], [data-motion="hero-copy"]', {
    y: 0,
    opacity: 1,
    duration: 0.72,
    stagger: 0.13,
  }, 1.25)
  .to('.site-nav, [data-motion="hero-actions"], [data-motion="hero-folio"]', {
    y: 0,
    opacity: 1,
    duration: 0.7,
    stagger: 0.1,
  }, 1.75)
  .to({}, { duration: 0.3 }, 2.5)
  .set('.opening-curtain', { display: 'none' }, 2.8)
```

Ensure the Task 1 markup assigns the exact target names used above.

- [ ] **Step 5: Add opening and mask CSS**

Append to `src/styles.css`:

```css
.site { position: relative; }

.opening-curtain {
  position: fixed;
  z-index: 10000;
  inset: 0;
  display: grid;
  place-items: center;
  background: #2b211c;
  pointer-events: none;
  clip-path: inset(0);
}

.opening-curtain__rule {
  width: min(34vw, 520px);
  height: 1px;
  background: #c88952;
  transform-origin: center;
}

.hero h1,
.section-heading > div,
.contact h2 {
  overflow: hidden;
}

.motion-reduced .opening-curtain { display: none; }
```

- [ ] **Step 6: Run hook and app tests**

```bash
CI=true PATH=/Users/sam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/sam/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test --run src/useEditorialMotion.test.js src/App.test.jsx
```

Expected: PASS with no test warnings and scrolling unlocked after cleanup.

- [ ] **Step 7: Commit the opening system**

```bash
git add src/useEditorialMotion.js src/useEditorialMotion.test.js src/styles.css src/App.jsx
git commit -m "feat: add cinematic hero opening"
```

---

### Task 3: Add Section, Profile, Strength, and Contact Entrances

**Files:**
- Modify: `src/useEditorialMotion.js`
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`

**Interfaces:**
- Consumes: `data-motion="section-heading"`, `portrait`, `profile-copy`, `profile-fact`, `strength-card`, and `contact` targets.
- Produces: one-time ScrollTriggers at `start: 'top 72%'` with shared heading choreography and module-specific timelines.

- [ ] **Step 1: Write a failing target coverage test**

Add to `src/App.test.jsx`:

```jsx
it('marks profile, strength, and contact content for hierarchical scroll entrances', () => {
  render(<App />)

  expect(document.querySelector('[data-motion="portrait"]')).toBeInTheDocument()
  expect(document.querySelector('[data-motion="profile-copy"]')).toBeInTheDocument()
  expect(document.querySelectorAll('[data-motion="profile-fact"]')).toHaveLength(3)
  expect(document.querySelectorAll('[data-motion="strength-card"]')).toHaveLength(4)
  expect(document.querySelector('[data-motion="contact-details"]')).toBeInTheDocument()
  expect(document.querySelector('[data-motion="contact-actions"]')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run the App test command from Task 1.

Expected: FAIL for missing module-level target markers.

- [ ] **Step 3: Add exact module targets to `App.jsx`**

Add these attributes to the existing elements:

```jsx
<figure className="portrait-frame" data-motion="portrait">
<div className="profile__copy" data-motion="profile-copy">
<div key={fact.label} data-motion="profile-fact">
<article className="strength-card" data-motion="strength-card" ...>
<div className="contact__details" data-motion="contact-details">
<div className="contact__actions" data-motion="contact-actions">
```

- [ ] **Step 4: Add a shared section-heading animator**

Inside the GSAP context in `src/useEditorialMotion.js`:

```js
gsap.utils.toArray('[data-motion="section-heading"]').forEach(heading => {
  const index = heading.querySelector('.section-heading__index')
  const eyebrow = heading.querySelector('.eyebrow')
  const title = heading.querySelector('h2')

  gsap.timeline({
    scrollTrigger: { trigger: heading, start: 'top 72%', once: true },
  })
    .from(index, { x: -34, opacity: 0, duration: 0.55, ease: 'power3.out' })
    .from(heading, { '--heading-rule-scale': 0, duration: 0.75, ease: 'power4.inOut' }, 0.05)
    .from(eyebrow, { y: 24, opacity: 0, duration: 0.55 }, 0.2)
    .from(title, { y: 105, scaleX: 0.9, transformOrigin: 'left center', duration: 1.1, ease: 'expo.out' }, 0.25)
})
```

Change the existing heading rule to consume `--heading-rule-scale`:

```css
.section-heading::before {
  transform: scaleX(var(--heading-rule-scale, 1));
  transform-origin: left;
}
```

If the existing rule is a border rather than a pseudo-element, add the pseudo-element and remove the duplicate border only for `.motion-ready`.

- [ ] **Step 5: Add Profile, Strengths, and Contact timelines**

Use these timelines in the same GSAP context:

```js
gsap.timeline({ scrollTrigger: { trigger: '.profile__layout', start: 'top 72%', once: true } })
  .from('[data-motion="portrait"]', { clipPath: 'inset(100% 0 0)', y: 48, duration: 1.05, ease: 'power4.inOut' })
  .from('[data-motion="profile-copy"] > *', { y: 42, opacity: 0, duration: 0.75, stagger: 0.1 }, 0.35)
  .from('[data-motion="profile-fact"]', { y: 34, scaleX: 0.94, opacity: 0, duration: 0.65, stagger: 0.1 }, 0.7)

gsap.from('[data-motion="strength-card"]', {
  scrollTrigger: { trigger: '.strength-grid', start: 'top 72%', once: true },
  y: 62,
  scaleX: 0.94,
  opacity: 0,
  duration: 0.9,
  stagger: 0.12,
  ease: 'power3.out',
})

gsap.timeline({ scrollTrigger: { trigger: '[data-motion="contact"]', start: 'top 75%', once: true } })
  .from('.contact__inner > .eyebrow', { y: 28, opacity: 0, duration: 0.55 })
  .from('.contact h2', { y: 120, scaleX: 0.88, transformOrigin: 'left center', duration: 1.1, ease: 'expo.out' }, 0.15)
  .from('.contact__intro, [data-motion="contact-details"], [data-motion="contact-actions"], .contact__foot', {
    y: 38,
    opacity: 0,
    duration: 0.72,
    stagger: 0.11,
  }, 0.58)
```

- [ ] **Step 6: Run the focused tests and full suite**

```bash
CI=true PATH=/Users/sam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/sam/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test --run
```

Expected: all test files PASS.

- [ ] **Step 7: Commit section motion**

```bash
git add src/App.jsx src/App.test.jsx src/useEditorialMotion.js src/styles.css
git commit -m "feat: choreograph section entrances"
```

---

### Task 4: Add Work-Card Reveals and Safe Static-Image Parallax

**Files:**
- Modify: `src/useEditorialMotion.js`
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: five `data-motion="work-card"` elements and `data-motion="parallax-image"` only on the profile portrait and static `.work-card__image` elements.
- Produces: per-card one-time reveal timelines and scrubbed parallax that never targets carousel cards.

- [ ] **Step 1: Write a failing test for safe parallax targeting**

Add to `src/App.test.jsx`:

```jsx
it('marks only static images and the portrait for parallax', () => {
  render(<App />)

  const parallaxTargets = document.querySelectorAll('[data-motion="parallax-image"]')
  expect(parallaxTargets).toHaveLength(4)
  expect(document.querySelector('.depth-carousel__card [data-motion="parallax-image"]')).toBeNull()
  expect(document.querySelector('.profile__topography [data-motion="parallax-image"]')).toBeNull()
})
```

The expected count is one portrait plus the three projects that still use a static image.

- [ ] **Step 2: Run the test and verify it fails**

Run the App test command from Task 1.

Expected: FAIL because no safe parallax markers exist.

- [ ] **Step 3: Add safe parallax markers**

Update the portrait and static project image only:

```jsx
<img src="/media/portrait.jpg" alt="崔琪个人头像" data-motion="parallax-image" />

<img
  className="work-card__image"
  data-motion="parallax-image"
  src={project.image}
  alt={`${project.title}主题视觉，非项目现场照片`}
/>
```

Do not pass the marker into `DepthCarousel`.

- [ ] **Step 4: Implement card reveal timelines**

Add inside the GSAP context:

```js
gsap.utils.toArray('[data-motion="work-card"]').forEach((card, index) => {
  const imageWrap = card.querySelector('.work-card__image-wrap')
  const copy = card.querySelectorAll('.work-card__meta, h3, .work-card__role, .work-card__summary, .work-card__metrics, .work-card__tags')
  const fromLeft = index % 2 === 0

  gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 72%', once: true } })
    .from(imageWrap, {
      clipPath: fromLeft ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)',
      scale: 1.045,
      duration: 1.15,
      ease: 'power4.inOut',
    })
    .from(copy, {
      y: 48,
      opacity: 0,
      duration: 0.72,
      stagger: 0.085,
      ease: 'power3.out',
    }, 0.38)
})
```

- [ ] **Step 5: Implement scrubbed static-image parallax**

Use `gsap.matchMedia()` to disable parallax on narrow screens:

```js
const media = gsap.matchMedia()

media.add('(min-width: 901px)', () => {
  gsap.utils.toArray('[data-motion="parallax-image"]').forEach(image => {
    gsap.fromTo(image,
      { yPercent: -3.5, scale: 1.055 },
      {
        yPercent: 3.5,
        ease: 'none',
        scrollTrigger: {
          trigger: image.closest('.work-card__image-wrap, .portrait-frame'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
      },
    )
  })
})
```

Call `media.revert()` during hook cleanup before `context.revert()`.

- [ ] **Step 6: Add clipping safeguards**

Ensure static image frames hide parallax edges while carousel depth remains visible:

```css
.portrait-frame,
.work-card__image-wrap:not(.work-card__image-wrap--carousel) {
  overflow: hidden;
}

.motion-ready [data-motion="parallax-image"] {
  transform-origin: center;
}
```

- [ ] **Step 7: Run the full suite**

```bash
CI=true PATH=/Users/sam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/sam/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test --run
```

Expected: all tests PASS and both carousel integration tests remain green.

- [ ] **Step 8: Commit work and parallax motion**

```bash
git add src/App.jsx src/App.test.jsx src/useEditorialMotion.js src/styles.css
git commit -m "feat: reveal work cards with subtle parallax"
```

---

### Task 5: Add Refresh Lifecycle and Responsive Motion Limits

**Files:**
- Modify: `src/useEditorialMotion.js`
- Modify: `src/useEditorialMotion.test.js`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: the centralized GSAP context and existing image elements.
- Produces: image-load and resize refresh behavior plus guaranteed cleanup of listeners, scrolling, GSAP context, matchMedia, and ScrollTriggers.

- [ ] **Step 1: Write a failing cleanup behavior test**

Add to `src/useEditorialMotion.test.js`:

```js
it('restores scroll state when the motion root unmounts', () => {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
  const { container, unmount } = render(<Harness />)

  expect(container.firstChild).toHaveClass('motion-opening')
  expect(document.documentElement.style.overflow).toBe('hidden')

  unmount()

  expect(document.documentElement.style.overflow).toBe('')
  expect(document.body.style.overflow).toBe('')
})
```

- [ ] **Step 2: Run the hook test and verify it fails if cleanup is incomplete**

Run the hook test command from Task 2.

Expected: FAIL if overflow or transient classes survive unmount.

- [ ] **Step 3: Add refresh listeners and bounded resize handling**

Inside the hook after timeline creation:

```js
const images = [...root.querySelectorAll('img')]
const pendingImages = images.filter(image => !image.complete)
const refresh = () => ScrollTrigger.refresh()
pendingImages.forEach(image => image.addEventListener('load', refresh, { once: true }))

let resizeFrame = 0
const onResize = () => {
  cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(refresh)
}
window.addEventListener('resize', onResize, { passive: true })
```

Extend cleanup:

```js
pendingImages.forEach(image => image.removeEventListener('load', refresh))
window.removeEventListener('resize', onResize)
cancelAnimationFrame(resizeFrame)
media.revert()
context.revert()
restoreMotionState(root)
root.classList.remove('motion-ready', 'motion-reduced')
```

- [ ] **Step 4: Add responsive and reduced-motion CSS guards**

Append:

```css
@media (max-width: 900px) {
  .opening-curtain__rule { width: min(56vw, 360px); }
}

@media (prefers-reduced-motion: reduce) {
  .opening-curtain { display: none !important; }
  [data-motion] {
    clip-path: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}
```

Keep the existing global reduced-motion safeguards; do not duplicate rules that already provide the same final state.

- [ ] **Step 5: Run tests and production build**

```bash
CI=true PATH=/Users/sam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/sam/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test --run
CI=true PATH=/Users/sam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/sam/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm build
git diff --check
```

Expected: every test passes, Vite produces `dist/`, and `git diff --check` prints nothing.

- [ ] **Step 6: Commit lifecycle safeguards**

```bash
git add src/useEditorialMotion.js src/useEditorialMotion.test.js src/styles.css
git commit -m "perf: harden editorial motion lifecycle"
```

---

### Task 6: Browser Motion QA and Final Tuning

**Files:**
- Modify if required by observed issues: `src/useEditorialMotion.js`
- Modify if required by observed issues: `src/styles.css`
- Test if behavior changes: `src/useEditorialMotion.test.js` or `src/App.test.jsx`

**Interfaces:**
- Consumes: the completed motion system from Tasks 1–5.
- Produces: browser-verified timing, trigger behavior, reduced-motion behavior, and regression-free production output.

- [ ] **Step 1: Start or confirm the local Vite server**

```bash
CI=true PATH=/Users/sam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/sam/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm dev --host 127.0.0.1
```

Open `http://127.0.0.1:5173/` in the in-app browser.

- [ ] **Step 2: Verify the hard-refresh opening**

Check these observable outcomes:

- espresso curtain appears immediately without a white flash;
- ochre rule expands from the center;
- video reveals and settles before the title finishes;
- “崔琪” performs masked upward travel and horizontal decompression;
- secondary text, navigation, actions, and folio follow in the approved order;
- scrolling is restored no later than 2.8 seconds;
- content remains visible if JavaScript is disabled or the motion hook is temporarily removed.

- [ ] **Step 3: Verify one-time scroll choreography**

Scroll through Profile, all five Work cards, Strengths, and Contact. Confirm:

- headings trigger around 72% viewport height;
- content overlaps the heading timeline rather than waiting for it to end;
- completed modules remain visible when scrolling upward;
- all five work cards reveal once and alternate direction correctly;
- the two DepthCarousel instances remain draggable and their buttons still work;
- static images move subtly without exposed edges;
- the Topography background remains independent.

- [ ] **Step 4: Verify fixed navigation and anchor behavior**

Click About, Work, Strengths, Contact, and Return to top. Confirm:

- the kraft navigation still becomes fixed after the Hero;
- anchor movement does not replay the opening;
- focus rings and buttons remain usable after animations complete.

- [ ] **Step 5: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce`, hard refresh, and confirm:

- no curtain blocks the page;
- all content is immediately visible;
- no parallax or scrubbed motion runs;
- carousel reduced-motion behavior remains intact;
- scrolling is never locked.

- [ ] **Step 6: Check target viewports and performance**

Inspect at approximately 1700px desktop width and the current 796px browser width. Confirm no horizontal overflow, no visible layout jump, and no large frame hitch while scrolling through Work.

If a visual defect is found, create a focused failing test when the behavior is automatable, make one minimal timing or CSS correction, and repeat the relevant browser check.

- [ ] **Step 7: Run final verification**

```bash
CI=true PATH=/Users/sam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/sam/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test --run
CI=true PATH=/Users/sam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/sam/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm build
git diff --check
git status --short
```

Expected: all tests pass, production build succeeds, no whitespace errors are reported, and only intentional motion-system files are modified.

- [ ] **Step 8: Commit final tuning if any files changed**

```bash
git add src/useEditorialMotion.js src/useEditorialMotion.test.js src/App.jsx src/App.test.jsx src/styles.css
git commit -m "style: refine editorial motion timing"
```

Skip this commit only when browser QA required no code or CSS changes.
