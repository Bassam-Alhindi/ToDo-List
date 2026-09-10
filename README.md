<div align="center">

# قائمة المهام
### Petrol & Gold Task List

A dark, Arabic-first to-do app — no framework, no build step, no backend.

[![Live Demo](https://img.shields.io/badge/demo-live-d4af37?style=flat-square)](https://bassam-alhindi.github.io/ToDo-List/)
![No dependencies](https://img.shields.io/badge/dependencies-zero-0a131a?style=flat-square&labelColor=0a131a&color=d4af37)
![License](https://img.shields.io/badge/license-ISC-8a99a3?style=flat-square)

<img src="docs/preview.png" alt="قائمة المهام preview" width="360">

**[→ Try it live](https://bassam-alhindi.github.io/ToDo-List/)**

</div>

---

## What it is

A single-page task list built RTL-first for Arabic and mobile-first for touch. The visual idea is simple: a deep petrol-dark background with a slow, animated aurora behind a frosted glass card, and warm gold reserved for exactly one thing — progress. Everything else stays quiet on purpose.

Three files, no dependencies, everything saved locally in the browser.

## Features

- **Add tasks fast** — text field, priority, and due date live behind one composer; new tasks default to today
- **Priorities** — cycle each task between عالية / متوسطة / منخفضة (high / medium / low); the list auto-sorts by priority, then by due date, then by creation time
- **Custom date picker** — a calendar popover (not the native date input) with Saturday-first weeks, Arabic-Indic numerals, and quick shortcuts for اليوم / غدًا / بعد أسبوع
- **Filters** — All / Active / Completed tabs with an animated indicator
- **Completion animation** — checking a task off runs a small staggered sequence (fill → checkmark → strikethrough → dim) instead of a flat state change
- **Live progress bar** — fills as tasks complete, with a running "٣ من ٨ مكتملة" counter
- **Clear completed** — one button to sweep away everything that's done
- **Persistent** — everything is stored in `localStorage`; nothing leaves the device, no account, no backend
- **Accessible** — semantic HTML, ARIA roles on the dialog/progressbar/live regions, and `prefers-reduced-motion` turns off the ambient animation while keeping the app fully usable

## Design

| Token | Value | Role |
|---|---|---|
| Ground | `#0a131a` → `#0d1b2a` | Deep petrol background |
| Gold | `#d4af37` / `#e5c158` | Buttons, checks, active tab, progress — the only warm accent |
| Terracotta | `#d9736a` | Reserved for overdue dates and delete |
| Glass | `rgba(13, 21, 28, 0.58)` | Translucent panel over the moving background |

The background is a rotating conic gradient plus four blurred, independently-timed orbs on `mix-blend-mode: screen`, animated on `transform` only so it stays GPU-composited. Typography is [Cairo](https://fonts.google.com/specimen/Cairo) throughout, loaded from Google Fonts with a system fallback.

## Tech stack

No framework, no bundler, no `node_modules` for the app itself.

```
ToDo-List/
├── index.html    # markup + ambient background layer
├── style.css     # theme tokens, animations, layout, RTL logical properties
└── script.js     # state, date picker, priority sort, localStorage
```

Vanilla ES6+ JavaScript, `Intl.DateTimeFormat` / `Intl.NumberFormat` for Arabic dates and numerals, and CSS `backdrop-filter`, `conic-gradient`, and logical properties (`inset-inline-*`) for the RTL layout.

## Run locally

```bash
git clone https://github.com/Bassam-Alhindi/ToDo-List.git
cd ToDo-List
```

Then just open `index.html` in a browser. For accurate `localStorage` and font behavior, serve it instead:

```bash
python -m http.server 8000     # → http://localhost:8000
# or
npx serve .
```

**Browser support:** any modern evergreen browser. `backdrop-filter`, `mix-blend-mode`, and `conic-gradient` power the full visual effect (Chrome/Edge 76+, Safari 9+, Firefox 103+); older browsers fall back to a flat dark theme and stay fully functional.

## Testing

UI regressions are caught with a small Puppeteer script that drives headless Chrome, checks layout/fonts/interaction state, and saves a fresh screenshot.

```bash
npm install
npm run test:ui       # mobile viewport → docs/preview.png
npm run test:ui:all   # + desktop and date-picker captures
npm run test:prod     # same checks against the deployed site
```

> If `npm install` skips downloading Chrome for Puppeteer, run `npx puppeteer browsers install chrome`.

---

<div align="center">

Built by [Bassam Alhindi](https://github.com/Bassam-Alhindi)

</div>
