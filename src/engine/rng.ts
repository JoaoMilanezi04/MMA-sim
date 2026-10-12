/** Small seeded PRNG (mulberry32). State can be saved and restored. */
export interface Rng {
  next: () => number
  int: (min: number, max: number) => number
  pick: <T>(arr: T[]) => T
  chance: (p: number) => boolean
  state: () => number
}

export function makeRng(seed: number): Rng {
  let s = seed >>> 0
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    state: () => s,
  }
}
