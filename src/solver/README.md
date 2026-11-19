# Solver layer

Off-main-thread Kociemba solver for cubicPro.

- `solver.worker.ts` — Vite module Web Worker wrapping `../puzzle/engine`
  (`initSolver`, `solve`, `randomStateScramble`). Also owns the protocol types.
- `client.ts` — `SolverClient`, a promise-based client for the worker, plus the
  lazy `getSolver()` singleton.

## Why a worker

`initSolver()` builds Kociemba's move and pruning tables and takes **~4-5 s**
(`solve()` itself is typically tens of milliseconds after that). It must run
in the worker: on the main thread it would freeze the UI for the whole build.
The worker builds the tables once and then serves any number of requests.

## Protocol

Main thread -> worker (`SolverRequest`):

| Message | Payload | Meaning |
| --- | --- | --- |
| `init` | — | Build solver tables, then reply `ready` |
| `solve` | `id: number`, `state: CubeState` | Solve this cubie state |
| `scramble` | `id: number` | Uniform random-state scramble |

Worker -> main thread (`SolverResponse`):

| Message | Payload | Meaning |
| --- | --- | --- |
| `ready` | — | Solver tables are built; requests may be sent |
| `solution` | `id: number`, `moves: MoveSequence` | Reply to `solve` |
| `scramble` | `id: number`, `moves: MoveSequence` | Reply to `scramble` |
| `error` | `id?: number`, `message: string` | Request failed; `id` is absent when the failure is not tied to a request (e.g. init) |

`id` is a monotonically increasing integer chosen by the client; the worker
echoes it back so replies can be matched to promises. Requests are handled
one at a time in the worker, so a heavy solve delays later requests rather
than interleaving with them.

## Usage

```ts
import { getSolver } from './solver/client';

const solver = getSolver();
await solver.init(); // ~4-5 s, once per worker; idempotent
const scramble = await solver.scramble();
const solution = await solver.solve(state);
```

`solve()` / `scramble()` call `init()` implicitly: the first request starts
the worker and waits for `ready`, so an explicit `init()` is optional but
recommended (it lets you show a loading state before the first real request).
Only `MoveSequence` (`{ face, turns }[]`) crosses the boundary — no cubejs
types leak out.

## Lifecycle and errors

- The worker is created lazily on first use, so importing this module never
  touches `Worker` (safe under Node/vitest).
- A request-scoped failure (e.g. an unsolvable state) rejects only that
  promise; the client stays usable.
- A worker-level failure (`error` event, `messageerror`, or an `error` reply
  without an `id`) rejects everything in flight and drops the worker. The next
  call spawns a fresh worker and pays the init cost again.
- `terminate()` rejects in-flight work, kills the worker, and clears the
  singleton so a later `getSolver()` starts clean.

## Files

Only files under `src/solver/` are owned by this layer; the cube state types
and the cubejs wrapper live in `src/types/` and `src/puzzle/` respectively.
