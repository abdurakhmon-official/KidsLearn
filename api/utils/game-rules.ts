import { shuffle } from '@/utils/shuffle';

export type Move = readonly [number, number];

export const FALLBACK_FACES = ['🍎', '🐻', '⭐', '🚗', '🌸', '🐟', '🎈', '🍌', '🦋', '🌙', '🍇', '🐸'];

export const PUZZLE_MIN_SIDE = 2;
export const PUZZLE_MAX_SIDE = 5;
export const MEMORY_MIN_PAIRS = 2;
export const MEMORY_MAX_PAIRS = 8;

export const MAX_MOVES = 500;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, Math.floor(value) || min));

export const puzzleSide = (value: unknown, fallback: number) => clamp(Number(value) || fallback, PUZZLE_MIN_SIDE, PUZZLE_MAX_SIDE);

export const memoryPairs = (value: unknown) => clamp(Number(value) || 6, MEMORY_MIN_PAIRS, MEMORY_MAX_PAIRS);

export function buildPuzzleLayout(rows: number, cols: number): number[] {
  const count = rows * cols;
  const ordered = Array.from({ length: count }, (_, index) => index);

  let layout = shuffle(ordered);

  while (isSolved(layout)) {
    layout = shuffle(ordered);
  }

  return layout;
}

export function verifyPuzzle(layout: number[], moves: Move[]): boolean {
  if (!Array.isArray(layout) || !layout.length) return false;
  if (moves.length > MAX_MOVES) return false;

  const board = [...layout];

  for (const [from, to] of moves) {
    if (!inRange(from, board.length) || !inRange(to, board.length) || from === to) {
      return false;
    }

    [board[from], board[to]] = [board[to], board[from]];
  }

  return isSolved(board);
}

export function buildMemoryLayout(pairs: number, faces: string[]): string[] {
  const usable = [...faces.filter(face => face && face.length <= 4), ...FALLBACK_FACES].slice(0, pairs);

  return shuffle(usable.flatMap(face => [face, face]));
}

export function verifyMemory(layout: string[], moves: Move[]): boolean {
  if (!Array.isArray(layout) || layout.length < 2) return false;
  if (moves.length > MAX_MOVES) return false;

  const matched = new Set<number>();

  for (const [first, second] of moves) {
    if (!inRange(first, layout.length) || !inRange(second, layout.length) || first === second) {
      return false;
    }

    if (matched.has(first) || matched.has(second)) continue;

    if (layout[first] === layout[second]) {
      matched.add(first);
      matched.add(second);
    }
  }

  return matched.size === layout.length;
}

function isSolved(board: number[]) {
  return board.every((piece, index) => piece === index);
}

function inRange(value: number, length: number) {
  return Number.isInteger(value) && value >= 0 && value < length;
}
