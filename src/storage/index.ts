/** Small, versioned localStorage persistence layer. */

export interface Settings {
  sound: boolean;
  reducedMotion: boolean;
}

export interface ChallengeRecord {
  timeMs: number;
  scramble: string;
  date: string;
}

export interface PersistedState {
  version: 1;
  settings: Settings;
  /** chapterId -> completed step ids */
  tutorialProgress: Record<string, string[]>;
  bestTimeMs: number | null;
  records: ChallengeRecord[];
}

const STORAGE_KEY = 'cubicpro.state.v1';

const DEFAULT_STATE: PersistedState = {
  version: 1,
  settings: { sound: true, reducedMotion: false },
  tutorialProgress: {},
  bestTimeMs: null,
  records: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function migrate(raw: unknown): PersistedState {
  if (!isRecord(raw)) return { ...DEFAULT_STATE, settings: { ...DEFAULT_STATE.settings } };
  const state: PersistedState = {
    version: 1,
    settings: {
      sound: typeof (raw.settings as Settings | undefined)?.sound === 'boolean' ? (raw.settings as Settings).sound : true,
      reducedMotion:
        typeof (raw.settings as Settings | undefined)?.reducedMotion === 'boolean'
          ? (raw.settings as Settings).reducedMotion
          : false,
    },
    tutorialProgress: isRecord(raw.tutorialProgress) ? (raw.tutorialProgress as Record<string, string[]>) : {},
    bestTimeMs: typeof raw.bestTimeMs === 'number' ? raw.bestTimeMs : null,
    records: Array.isArray(raw.records) ? (raw.records as ChallengeRecord[]).slice(0, 100) : [],
  };
  return state;
}

export function loadState(): PersistedState {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_STATE, settings: { ...DEFAULT_STATE.settings } };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE, settings: { ...DEFAULT_STATE.settings } };
    return migrate(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_STATE, settings: { ...DEFAULT_STATE.settings } };
  }
}

export function saveState(state: PersistedState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / privacy failures */
  }
}

export function updateState(mutator: (state: PersistedState) => PersistedState): PersistedState {
  const next = mutator(loadState());
  saveState(next);
  return next;
}
