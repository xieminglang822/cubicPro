# cubicPro

A web-based 3×3 Rubik's Cube simulator with **Tutorial**, **Free** and **Challenge** modes, bilingual UI (中文 / English), touch + keyboard + mouse support, and offline (PWA) capability.

> Status: early implementation. Core engine, solver, 3D renderer, three modes, i18n and persistence are in place; 4×4 and Pyraminx are planned.

## Features

- **Tutorial mode** — chapter/step lessons that can start at any chapter, with per-chapter progress saved locally.
- **Free mode** — difficulty-graded scrambles, solve detection, and a "next hint" backed by a real solver.
- **Challenge mode** — timed solves with best-time tracking and new-record detection.
- **Cube engine** — cubie state model, Singmaster notation, undo/redo-ready move history.
- **Kociemba solver** — via the MIT `cubejs` package (see [NOTICE.md](./NOTICE.md)).
- **3D rendering** — Three.js; drag to orbit, wheel/pinch to zoom.
- **i18n** — Simplified Chinese + English, switchable at runtime and persisted.
- **PWA** — installable, offline app-shell caching.

## Tech stack

- Vite + React 18 + TypeScript
- Three.js for 3D
- `cubejs` (MIT) for cube state + Kociemba two-phase solver
- Hand-rolled i18n and a versioned localStorage store (no extra deps)

## Getting started

Requires Node.js ≥ 20.

```sh
npm install
npm run dev      # dev server
npm run build    # typecheck + production build
npm run preview  # preview the build
npm test         # engine + solver unit tests
```

If you use the DSH bundled toolchain instead of a system Node:

```sh
node <node-exe> <pnpm.mjs> install
node <node-exe> <pnpm.mjs> run build
```

## Project structure

```
src/
  types/        shared cube types
  puzzle/       engine (cubejs wrapper) + facelet<->3D mapping
  solver/       Web Worker + client (in progress)
  render/       Three.js CubeView
  i18n/         zh/en dictionaries + provider
  storage/      versioned localStorage
  content/      tutorial curriculum data
  modes/        tutorial / free / challenge components
  ui/           shared controls
  App.tsx       shell + tabs
```

## Attribution

All reused open-source material is documented in [NOTICE.md](./NOTICE.md), including the MIT license text for `cubejs`.

## Roadmap

- [x] Wire the Kociemba solver through the Web Worker (avoids the first-hint stall)
- [x] Replace the seed tutorial with a researched, licensed, engine-verified 8-chapter curriculum
- [x] Bilingual zh/en tutorial content with state-based step grading
- [ ] Drag-on-cube gesture turning (mouse + touch)
- [ ] 4×4 and Pyraminx
