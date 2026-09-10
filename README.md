<img src="docs/banner.svg?v=5" width="100%"/>

<h1 align="center">قائمة المهام · ToDo-List</h1>
<p align="center">
  <em>Sleek, minimalist, and ultra-responsive Arabic RTL task list —<br>petrol ink, manuscript gold, and light that never stops moving.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Puppeteer-40B5A4?style=for-the-badge&logo=puppeteer&logoColor=white" alt="Puppeteer">
  <img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" alt="License">
</p>

<p align="center">
  <strong><a href="https://bassam-alhindi.github.io/ToDo-List/">Live Demo</a></strong>
</p>

---

## Features

### Modern & Fluid UI

A dark-luxury aesthetic built on a deep midnight-petrol ground, accented exclusively with warm manuscript gold — reserved only for progress, action, and achievement.

- **Glassmorphism** — `backdrop-filter: blur(24px) saturate(180%)` over a living ambient aurora of drifting orbs and a rotating conic beam
- **Ambient Motion** — Four blurred orbs on mismatched cycles (14s / 17s / 21s / 25s) that fall in and out of phase, ensuring the pattern never visibly repeats
- **GPU-Composited** — All animations transform-only, locked at **60fps** with zero dropped frames
- **Gold Accent Discipline** — Gold appears **only** where something is achieved or actionable; everything else stays quiet

### Smart Compound Sorting

Tasks are automatically re-sorted after every state change using a strict three-tier priority system:

| Tier | Criterion | Order |
|:---:|---|---|
| 1 | **Due Date** | Ascending — nearest deadlines first, undated tasks fall to the bottom |
| 2 | **Priority** | High → Medium → Low |
| 3 | **Creation Time** | Newest first (breaks ties within the same date + priority) |

### Micro-Interactions

A completion sequence that runs as a staggered cascade, not a single snap:

- **Liquid Fill** — The checkbox fills with gold as the checkmark SVG draws itself stroke-by-stroke
- **Strikethrough Sweep** — The underline animates across the task text while it dims
- **Celebration Burst** — Gold spark particles and a pulse ring land on top of the checkbox
- **Draw-In** — New tasks slide into the list with a smooth clip-path reveal

### Mobile-First Optimization

Designed at the phone and scaled up — not shrunk down:

- **Single-Tap Responsiveness** — `pointerdown` event handlers with `preventDefault()` bypass the 300ms mobile click delay entirely
- **Touch-Action: Manipulation** — Applied to `li`, `.check`, and `.task-text` to eliminate double-tap-to-zoom interference
- **44px Touch Targets** — Every control meets the WCAG minimum comfortable touch area
- **Hover Isolation** — All `:hover` effects live inside `@media (hover: hover) and (pointer: fine)` so touch devices never see stuck hover states
- **16px Input Font** — Prevents iOS Safari from force-zooming on focus
- **Safe-Area Insets** — Respected via `viewport-fit=cover`

### Clean Architecture

Three files. No framework, no build step, no `node_modules`.

```
ToDo-List/
├── index.html    # structure + ambient layer markup
├── style.css     # theme tokens, aurora, glass, layout, motion
└── script.js     # state, date picker, persistence, interactions
```

- **Zero dependencies** — Vanilla ES6+ JavaScript with no runtime libraries
- **localStorage persistence** — Everything stays on-device; no account, no backend, no tracking
- **`Intl` API** — Uses `Intl.DateTimeFormat` and `Intl.NumberFormat` for native Arabic dates and numerals
- **CSS Logical Properties** — `inset-inline-*` for structural RTL support, not bolted-on mirroring

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Structure** | HTML5 — Semantic, `dir="rtl"`, ARIA roles (`dialog`, `progressbar`, `status`) |
| **Styling** | CSS3 — `backdrop-filter`, `@keyframes`, custom properties, `mix-blend-mode`, `conic-gradient`, `clamp()` type scale |
| **Logic** | Vanilla JavaScript — ES6+, no dependencies |
| **Typography** | Cairo via Google Fonts, system fallback stack |
| **Testing** | Puppeteer — Headless Chrome visual regression tests |

---

## Quick Start

No install, no build. Clone and open.

```bash
git clone https://github.com/Bassam-Alhindi/ToDo-List.git
cd ToDo-List
```

Then open `index.html` in your browser.

For a local server (recommended — fonts and `localStorage` behave exactly as in production):

```bash
# Python
python -m http.server 8000     # http://localhost:8000

# Node
npx serve .                    # http://localhost:3000
```

---

## UI Testing

Puppeteer drives a headless Chrome to capture the UI and assert layout, fonts, and interaction state.

```bash
npm install              # puppeteer is a devDependency
npm run test:ui          # mobile 390×844  →  docs/preview.png
npm run test:ui:all      # adds desktop + date-picker captures
npm run test:prod        # runs checks against the deployed site
```

**Verified on every run:**

- Title renders in Cairo on a single line
- Checkbox is a `<label>` with a 44px tap area
- Add button stays smaller than the input line
- Filter tabs meet the 44px touch target
- Card fits the viewport with no horizontal overflow
- Ambient animations are running
- Tapping the label toggles the task and persists the state
- No console errors, page errors, or failed requests

> If `npm install` skips Puppeteer's browser download, run `npx puppeteer browsers install chrome`.

---

## Browser Support

| Browser | Version |
|---|---|
| Chrome / Edge | 76+ |
| Safari | 9+ |
| Firefox | 103+ |

Full visual effect requires `backdrop-filter`, `mix-blend-mode`, and `conic-gradient`. Older browsers degrade gracefully to a flat dark theme — the app remains fully functional.

---

## Notes

- The interface is **Arabic and RTL** throughout. Layout mirroring is structural via CSS logical properties, not an afterthought.
- The aurora is the most expensive part of the page — on older phones, remove `.beam` or reduce orb `blur()` radii in `style.css` to lighten it.
- `prefers-reduced-motion` stops the aurora, the beam, and the spark burst completely while keeping the app fully usable.
- Text contrast holds at **8.9:1 or better** even at the brightest point of the background cycle — past WCAG AAA.

---

<p align="center">
  <sub>Built with care. Zero dependencies, zero tracking, zero compromise.</sub>
</p>
