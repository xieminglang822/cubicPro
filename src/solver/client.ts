/**
 * Main-thread client for the solver Web Worker.
 *
 * Wraps the message protocol declared in `./solver.worker.ts` in a promise
 * API. The worker is created lazily on first use (so importing this module,
 * e.g. under Node/vitest, never touches `Worker`), and the ~4-5 s Kociemba
 * table build only happens once per worker.
 */
import type { CubeState, MoveSequence } from '../types/cube';
import type { SolverRequest, SolverResponse } from './solver.worker';

interface PendingRequest {
  resolve: (moves: MoveSequence) => void;
  reject: (error: Error) => void;
}

/** An error that no pending request can recover from. */
function terminateError(): Error {
  return new Error('SolverClient has been terminated');
}

export class SolverClient {
  private worker: Worker | null = null;

  /** In-flight request id -> promise callbacks. */
  private readonly pending = new Map<number, PendingRequest>();

  private nextId = 1;

  /** The single in-flight `init()` promise, or null when not initialising. */
  private initPromise: Promise<void> | null = null;

  private initResolve: (() => void) | null = null;

  private initReject: ((error: Error) => void) | null = null;

  private ready = false;

  private terminated = false;

  /** True once the worker has reported `ready`. */
  get isReady(): boolean {
    return this.ready;
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Spawn the worker (if needed) and resolve once the solver tables are built.
   * Idempotent: concurrent and repeat calls share the first promise; calls
   * made after success resolve immediately.
   */
  init(): Promise<void> {
    if (this.terminated) return Promise.reject(terminateError());
    if (this.ready) return Promise.resolve();
    if (this.initPromise) return this.initPromise;

    const worker = this.ensureWorker();
    const promise = new Promise<void>((resolve, reject) => {
      this.initResolve = resolve;
      this.initReject = reject;
    });
    this.initPromise = promise;

    try {
      worker.postMessage({ type: 'init' } satisfies SolverRequest);
    } catch (error) {
      this.failInit(toError(error, 'Failed to post init message to solver worker'));
    }

    return promise;
  }

  /** Release the worker and reject anything still in flight. */
  terminate(): void {
    if (this.terminated) return;
    this.terminated = true;

    const error = terminateError();
    this.failInit(error);
    this.rejectAll(error);
    this.ready = false;
    this.disposeWorker();

    if (singleton === this) singleton = null;
  }

  // -------------------------------------------------------------------------
  // Requests
  // -------------------------------------------------------------------------

  /** Solve an arbitrary (solvable) cubie state. Rejects on unsolvable input. */
  solve(state: CubeState): Promise<MoveSequence> {
    return this.request({ type: 'solve', state });
  }

  /** Uniform random-state scramble. */
  scramble(): Promise<MoveSequence> {
    return this.request({ type: 'scramble' });
  }

  /**
   * Send a request and await its reply. Ensures the solver is initialised
   * first, so callers may skip an explicit `init()` (it will just be slower
   * on the first call).
   */
  private async request(
    payload: { type: 'solve'; state: CubeState } | { type: 'scramble' },
  ): Promise<MoveSequence> {
    this.assertUsable();
    await this.init();
    this.assertUsable();

    const worker = this.ensureWorker();
    const id = this.nextId++;
    const request: SolverRequest =
      payload.type === 'solve'
        ? { type: 'solve', id, state: payload.state }
        : { type: 'scramble', id };

    return new Promise<MoveSequence>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      try {
        worker.postMessage(request);
      } catch (error) {
        this.pending.delete(id);
        reject(toError(error, 'Failed to post message to solver worker'));
      }
    });
  }

  // -------------------------------------------------------------------------
  // Worker plumbing
  // -------------------------------------------------------------------------

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;

    // Vite turns this into a module worker and bundles `solver.worker.ts`
    // (plus its cubejs dependency) into a separate chunk.
    const worker = new Worker(new URL('./solver.worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = this.handleMessage;
    worker.onerror = this.handleError;
    worker.onmessageerror = this.handleMessageError;

    this.worker = worker;
    return worker;
  }

  private disposeWorker(): void {
    const worker = this.worker;
    this.worker = null;
    if (!worker) return;
    worker.onmessage = null;
    worker.onerror = null;
    worker.onmessageerror = null;
    worker.terminate();
  }

  /** Settle the pending `init()` promise. */
  private failInit(error: Error): void {
    const reject = this.initReject;
    this.initResolve = null;
    this.initReject = null;
    this.initPromise = null;
    this.ready = false;
    reject?.(error);
  }

  private rejectAll(error: Error): void {
    const pending = [...this.pending.values()];
    this.pending.clear();
    for (const request of pending) request.reject(error);
  }

  /**
   * Recover from a worker-level failure: settle every pending request and drop
   * the worker so the next call starts a fresh one (with a fresh init cost).
   */
  private recover(error: Error): void {
    this.failInit(error);
    this.rejectAll(error);
    this.ready = false;
    this.disposeWorker();
  }

  private assertUsable(): void {
    if (this.terminated) throw terminateError();
  }

  // -------------------------------------------------------------------------
  // Worker event handlers
  // -------------------------------------------------------------------------

  private readonly handleMessage = (event: MessageEvent<unknown>): void => {
    const data: unknown = event.data;
    if (!isSolverResponse(data)) return;

    switch (data.type) {
      case 'ready':
        this.ready = true;
        this.initReject = null;
        this.initPromise = null;
        this.initResolve?.();
        this.initResolve = null;
        break;

      case 'solution':
      case 'scramble': {
        const pending = this.pending.get(data.id);
        if (!pending) return; // late reply after recovery / terminate
        this.pending.delete(data.id);
        pending.resolve(data.moves);
        break;
      }

      case 'error': {
        const error = new Error(data.message);
        if (typeof data.id === 'number') {
          const pending = this.pending.get(data.id);
          if (!pending) return;
          this.pending.delete(data.id);
          pending.reject(error);
        } else {
          // No id: the worker failed before/while initialising.
          this.recover(error);
        }
        break;
      }
    }
  };

  private readonly handleError = (event: ErrorEvent): void => {
    this.recover(new Error(`Solver worker error: ${event.message || 'unknown error'}`));
  };

  private readonly handleMessageError = (): void => {
    this.recover(new Error('Solver worker failed to deserialise a message'));
  };
}

// ---------------------------------------------------------------------------
// Response validation
// ---------------------------------------------------------------------------

function isSolverResponse(value: unknown): value is SolverResponse {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  switch (record.type) {
    case 'ready':
      return true;
    case 'solution':
    case 'scramble':
      return typeof record.id === 'number' && Array.isArray(record.moves);
    case 'error':
      return typeof record.message === 'string';
    default:
      return false;
  }
}

function toError(error: unknown, fallback: string): Error {
  if (error instanceof Error) return error;
  return new Error(error === undefined ? fallback : `${fallback}: ${String(error)}`);
}

// ---------------------------------------------------------------------------
// Lazy singleton
// ---------------------------------------------------------------------------

let singleton: SolverClient | null = null;

/**
 * The shared solver client. Created on first call; `terminate()` on the shared
 * instance clears it so a later call starts a fresh worker.
 */
export function getSolver(): SolverClient {
  if (!singleton) singleton = new SolverClient();
  return singleton;
}
