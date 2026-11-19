// Type declarations for the MIT-licensed cubejs package (ldez/cubejs).
// There are no upstream types; these cover the API surface we use.

declare module 'cubejs' {
  export interface CubeJSON {
    center: number[];
    cp: number[];
    co: number[];
    ep: number[];
    eo: number[];
  }

  export default class Cube {
    constructor(state?: Cube | CubeJSON);
    static fromString(s: string): Cube;
    static random(): Cube;
    static inverse(a: string | number | number[]): string | number | number[];
    static initSolver(): void;
    static scramble(): string;
    init(state: Cube | CubeJSON): void;
    identity(): void;
    toJSON(): CubeJSON;
    asString(): string;
    clone(): Cube;
    randomize(): void;
    isSolved(): boolean;
    move(a: string | number | number[]): void;
    solve(maxDepth?: number): string;
  }
}

declare module 'cubejs/lib/solve';
