# Personal Resume Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable single-page React + Vite resume website for Qi Cui with a Maillard editorial visual system, five required page sections, and verified resume content.

**Architecture:** A small Vite React application renders one semantic page from structured resume data. `App.jsx` owns section composition, `resumeData.js` owns all editable content, and `styles.css` owns the visual system and responsive behavior; static portrait and themed media live under `public/media` with graceful CSS fallbacks.

**Tech Stack:** React 19, Vite 7, Vitest, Testing Library, semantic HTML, CSS custom properties.

**Spec:** `docs/superpowers/specs/2026-08-24-personal-resume-site-design.md`

## Global Constraints

- Use only facts verified in `/Users/sam/Documents/简历内容/output/pdf/崔琪简历_photo.pdf`.
- Show both `cq030317@gmail.com` and `185-1913-1780` publicly.
- Use a Maillard palette with paper beige, caramel, ochre, cocoa, and dark coffee.
- Hero uses abstract geological or aerial-strata video with a readable static fallback.
- Selected Work contains Inner Mongolia Mining, PwC battery carbon governance, Wangju Capital, Xiahe, and Sanjiangyuan.
- Desktop content width is approximately `1700px`; tablet and mobile layouts remain usable.
- No CMS, backend form, analytics, authentication, router, or speculative achievements.

---

### Task 1: Runnable Vite Shell and Resume Data Contract

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.js`
- Create: `src/main.jsx`
- Create: `src/resumeData.js`
- Create: `src/resumeData.test.js`

**Interfaces:**
- Consumes: Confirmed copy and metrics from the source PDF.
- Produces: named exports `profile`, `projects`, and `strengths`; `projects` has exactly five records with `id`, `kind`, `title`, `organization`, `period`, `summary`, `metrics`, `tags`, and `image`.

- [ ] **Step 1: Create the Vite package manifest and app entry files**

Define `dev`, `build`, `preview`, and `test` scripts. Configure Vitest with a `jsdom` environment and load React from `src/main.jsx` into `#root`.

- [ ] **Step 2: Write the failing resume-data test**

```js
import { describe, expect, it } from 'vitest'
import { profile, projects, strengths } from './resumeData'

describe('resume data', () => {
  it('contains the confirmed public profile and five work records', () => {
    expect(profile.email).toBe('cq030317@gmail.com')
    expect(profile.phone).toBe('185-1913-1780')
    expect(projects).toHaveLength(5)
    expect(projects.map((item) => item.organization)).toEqual(
      expect.arrayContaining(['中国内蒙古矿业有限公司', '中国网聚资本有限公司'])
    )
    expect(strengths).toHaveLength(4)
  })
})
```

- [ ] **Step 3: Run the test and verify the missing module failure**

Run: `npm test -- --run src/resumeData.test.js`

Expected: FAIL because `src/resumeData.js` does not yet export the required data.

- [ ] **Step 4: Implement the verified structured data**

Populate the public identity, Imperial College education, four strengths, and five Work records using only the source PDF. Keep descriptions concise enough for large editorial cards and keep numeric evidence in the `metrics` arrays.

- [ ] **Step 5: Run the data test**

Run: `npm test -- --run src/resumeData.test.js`

Expected: one passing test file.

- [ ] **Step 6: Commit the runnable data shell**

```bash
git add package.json package-lock.json index.html vite.config.js src/main.jsx src/resumeData.js src/resumeData.test.js
git commit -m "feat: scaffold resume site data"
```

### Task 2: Resume Media Extraction and Local Fallbacks

**Files:**
- Create: `public/media/portrait.png`
- Create: `public/media/hero-poster.jpg`
- Create: `public/media/work-mining.jpg`
- Create: `public/media/work-carbon.jpg`
- Create: `public/media/work-supply-chain.jpg`
- Create: `public/media/work-xiahe.jpg`
- Create: `public/media/work-sanjiangyuan.jpg`
- Modify: `src/resumeData.js`

**Interfaces:**
- Consumes: the source PDF and the image paths declared in `projects`.
- Produces: local media paths that resolve under `/media/*`; portrait is extracted from the supplied resume rather than replaced with a generated person.

- [ ] **Step 1: Render and inspect the source resume page**

Run: `pdftoppm -png -r 150 '/Users/sam/Documents/简历内容/output/pdf/崔琪简历_photo.pdf' /tmp/cui-resume-page`

Expected: a readable one-page PNG suitable for locating the portrait crop.

- [ ] **Step 2: Extract the embedded portrait**

Use `pdfimages -list` to identify the portrait image, extract it with `pdfimages`, convert it to `public/media/portrait.png`, and verify that the result is a valid portrait rather than a full-page render or decorative asset.

- [ ] **Step 3: Add local themed first-version imagery**

Add five reusable, license-safe geological, ecological, industrial, and supply-chain images plus one Hero poster. Record their source URLs and licenses in `public/media/SOURCES.md`; label them as thematic visuals in accessible alt text.

- [ ] **Step 4: Verify every media path**

Run: `find public/media -type f -maxdepth 1 -print`

Expected: portrait, Hero poster, five Work images, and `SOURCES.md` are present.

- [ ] **Step 5: Commit local media**

```bash
git add public/media src/resumeData.js
git commit -m "feat: add resume and project media"
```

### Task 3: Semantic Five-Section Page

**Files:**
- Create: `src/App.jsx`
- Create: `src/App.test.jsx`
- Modify: `src/main.jsx`

**Interfaces:**
- Consumes: `profile`, `projects`, and `strengths` from `src/resumeData.js`.
- Produces: default React component `App`; section IDs `top`, `about`, `work`, `strengths`, and `contact`.

- [ ] **Step 1: Write the failing page-structure test**

```jsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('resume site', () => {
  it('renders identity, five work cards, strengths, and public contacts', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: /QI CUI/i })).toBeInTheDocument()
    expect(screen.getAllByTestId('work-card')).toHaveLength(5)
    expect(screen.getByText('中国内蒙古矿业有限公司')).toBeInTheDocument()
    expect(screen.getByText('中国网聚资本有限公司')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /cq030317@gmail.com/i })).toHaveAttribute('href', 'mailto:cq030317@gmail.com')
    expect(screen.getByRole('link', { name: /185-1913-1780/i })).toHaveAttribute('href', 'tel:18519131780')
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- --run src/App.test.jsx`

Expected: FAIL because `src/App.jsx` does not exist.

- [ ] **Step 3: Implement the semantic page**

Build the full-screen Hero with navigation and contact button, asymmetrical Profile, five large Work cards, four Strength cards, and full-screen Contact finale. Use a muted looping `<video>` with `poster`, accessible link labels, decorative image alt text that explicitly says “主题视觉”, and a skip-to-content link.

- [ ] **Step 4: Add Testing Library matchers and rerun**

Create the minimal Vitest setup file importing `@testing-library/jest-dom/vitest`, reference it from Vite config, then run `npm test -- --run src/App.test.jsx`.

Expected: the page-structure test passes.

- [ ] **Step 5: Commit the semantic page**

```bash
git add src/App.jsx src/App.test.jsx src/main.jsx vite.config.js
git commit -m "feat: build resume page sections"
```

### Task 4: Maillard Editorial Visual System

**Files:**
- Create: `src/styles.css`
- Modify: `src/main.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: the stable class names and section IDs from `App.jsx`.
- Produces: desktop layout capped at `1700px`, responsive breakpoints, focus states, media fallbacks, and reduced-motion behavior.

- [ ] **Step 1: Add the global paper-and-coffee design tokens**

Define CSS properties for paper beige, caramel, ochre, cocoa, espresso, ink, muted text, rules, and a `1700px` content cap. Use a serif display stack and a modern sans-serif body stack without adding runtime font dependencies.

- [ ] **Step 2: Style the full-screen Hero and navigation**

Layer the Hero poster, video, coffee gradient, editorial navigation, oversized title, identity copy, and two high-contrast calls to action. Keep all copy readable when the video is hidden or fails.

- [ ] **Step 3: Style Profile and five Work cards**

Use asymmetrical page-like grids, subtle numbered rules, restrained corners, large image areas, and alternating card alignment. Do not use generic equal-width three-column card grids.

- [ ] **Step 4: Style Strengths and full-screen Contact finale**

Create four evidence-led cards and a dark espresso closing screen with large contact typography, keyboard focus rings, and a top return link.

- [ ] **Step 5: Add responsive and reduced-motion rules**

At widths below `1100px` and `720px`, simplify grids, wrap navigation safely, preserve minimum tap sizes, and reduce oversized typography. Under `prefers-reduced-motion: reduce`, disable smooth scrolling, transitions, and video animation where CSS can control it.

- [ ] **Step 6: Run automated verification**

Run: `npm test -- --run`

Expected: all data and page tests pass.

- [ ] **Step 7: Commit the visual system**

```bash
git add src/styles.css src/main.jsx src/App.jsx
git commit -m "feat: add maillard editorial styling"
```

### Task 5: Browser-Ready Validation and Handoff

**Files:**
- Modify: `index.html`
- Modify: `README.md`

**Interfaces:**
- Consumes: the completed application.
- Produces: a successful production build, useful metadata, and concise local run instructions.

- [ ] **Step 1: Add page metadata**

Set the document language to `zh-CN`, title to `崔琪 Qi Cui — Earth Science · ESG · GIS`, and add a concise description grounded in the visible profile.

- [ ] **Step 2: Write run instructions**

Document `npm install`, `npm run dev`, `npm test -- --run`, and `npm run build`, plus the exact files to edit when replacing video, portrait, project imagery, or copy.

- [ ] **Step 3: Run the complete test suite**

Run: `npm test -- --run`

Expected: all test files pass with no unhandled errors.

- [ ] **Step 4: Run the production build**

Run: `npm run build`

Expected: Vite completes successfully and emits `dist/index.html` plus bundled assets.

- [ ] **Step 5: Start the local preview and verify the route responds**

Run: `npm run dev -- --host 127.0.0.1`

Then request the printed local URL once. Expected: HTTP 200 with no blocking compile error.

- [ ] **Step 6: Commit the validated handoff**

```bash
git add index.html README.md package-lock.json
git commit -m "docs: finalize resume site handoff"
```

