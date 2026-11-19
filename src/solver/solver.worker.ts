/**
 * Solver Web Worker (Vite module worker).
 *
 * Runs the Kociemba solver from `../puzzle/engine` off the main thread. The
 * worker owns the one-time solver-table build (`initSolver()`, ~4-5 s) and
 * serves solve / scramble requests afterwards.
 *
 * Protocol (see ./README.md for the full table):
 *   in  { type: 'init' }
 *       { type: 'solve', id, state }
 *       { type: 'scramble', id }
 *   out { type: 'ready' }
 *       { type: 'solution', id, moves }
 *       { type: 'scramble', id, moves }
 *       { type: 'error', id?, message }
 */
import type { CubeState, MoveSequence } from '../types/cube';
import { initSolver, randomStateScramble, solve } from '../puzzle/engine';

// ---------------------------------------------------------------------------
// Protocol types
// ---------------------------------------------------------------------------

/** Requests sent from the main thread to this worker. */
export interface InitRequest {
  type: 'init';
}

export interface SolveRequest {
  type: 'solve';
  id: number;
  state: CubeState;
}

export interface ScrambleRequest {
  type: 'scramble';
  id: number;
}

export type SolverRequest = InitRequest | SolveRequest | ScrambleRequest;

/** Replies sent from this worker to the main thread. */
export interface ReadyResponse {
  type: 'ready';
}

export interface SolutionResponse {
  type: 'solution';
  id: number;
  moves: MoveSequence;
}

export interface ScrambleResponse {
  type: 'scramble';
  id: number;
  moves: MoveSequence;
}

/** `id` is present for request-scoped failures and absent for init failures. */
export interface ErrorResponse {
  type: 'error';
  id?: number;
  message: string;
}

export type SolverResponse =
  | ReadyResponse
  | SolutionResponse
  | ScrambleResponse
  | ErrorResponse;

// ---------------------------------------------------------------------------
// Worker scope typing
// ---------------------------------------------------------------------------

/**
 * The project compiles with the DOM lib (no `webworker` lib, which would clash
 * with DOM declarations), so `self` is typed as a Window. Describe just the
 * slice of DedicatedWorkerGlobalScope this worker actually uses.
 */
interface WorkerScope {
  onmessage: ((event: MessageEvent<unknown>) => void) | null;
  postMessage(message: SolverResponse): void;
}

const scope = self as unknown as WorkerScope;

// ---------------------------------------------------------------------------
// Solver state
// ---------------------------------------------------------------------------

let solverInitialized = false;

/**
 * Build the solver tables once. `cubejs` throws deep inside `solve()` if the
 * tables are missing, so requests also lazily initialise as a safety net even
 * if the client forgot to send `init`.
 */
function ensureSolver(): void {
  if (solverInitialized) return;
  initSolver();
  solverInitialized = true;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return String(error);
}

function reply(message: SolverResponse): void {
  scope.postMessage(message);
}

// ---------------------------------------------------------------------------
// Message validation
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCubeStateLike(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    Array.isArray(value.cp) &&
    Array.isArray(value.co) &&
    Array.isArray(value.ep) &&
    Array.isArray(value.eo)
  );
}

function isSolverRequest(value: unknown): value is SolverRequest {
  if (!isRecord(value)) return false;
  switch (value.type) {
    case 'init':
      return true;
    case 'solve':
      return typeof value.id === 'number' && isCubeStateLike(value.state);
    case 'scramble':
      return typeof value.id === 'number';
    default:
      return false;
  }
}

// ---------------------------------------------------------------------------
// Request handling
// ---------------------------------------------------------------------------

function handleRequest(request: SolverRequest): void {
  switch (request.type) {
    case 'init':
      ensureSolver();
      reply({ type: 'ready' });
      return;
    case 'solve':
      ensureSolver();
      reply({ type: 'solution', id: request.id, moves: solve(request.state) });
      return;
    case 'scramble':
      ensureSolver();
      reply({ type: 'scramble', id: request.id, moves: randomStateScramble() });
      return;
    default: {
      // Unreachable for well-typed callers; guards against stale protocol use.
      const exhaustive: never = request;
      reply({
        type: 'error',
        message: `Unsupported message type: ${String((exhaustive as { type?: unknown }).type)}`,
      });
    }
  }
}

scope.onmessage = (event: MessageEvent<unknown>): void => {
  const request: unknown = event.data;
  if (!isSolverRequest(request)) {
    reply({ type: 'error', message: 'Malformed solver worker message' });
    return;
  }

  try {
    handleRequest(request);
  } catch (error) {
    const id = 'id' in request ? request.id : undefined;
    reply({ type: 'error', id, message: errorMessage(error) });
  }
};
