import type { Fighter, FighterStats } from '../types/game'
import type { Rng } from './rng'

export interface AgeStage {
  id: 'young' | 'prime' | 'veteran' | 'decline'
  label: string
  description: string
}

export function ageStage(age: number): AgeStage {
  if (age <= 24) {
    return { id: 'young', label: 'Joven', description: 'Alta velocidad, agilidad y cardio; menor Fight IQ y compostura.' }
  }
  if (age <= 31) {
    return { id: 'prime', label: 'Prime', description: 'Pico de rendimiento atlético y técnico.' }
  }
  if (age <= 35) {
    return { id: 'veteran', label: 'Veterano', description: 'Máximo Fight IQ; ligero declive en velocidad y cardio (−1% a −2% anual).' }
  }
  return { id: 'decline', label: 'Declive severo', description: 'Caída rápida en Chin, velocidad y recuperación. Riesgo inminente de retiro.' }
}

/** Yearly OVR change for AI fighters, applied after they turn `age`. */
export function ageOvrDelta(age: number): number {
  if (age <= 24) return 1
  if (age <= 31) return 0
  if (age <= 35) return -1
  return -3
}

export function shouldRetire(age: number, rng: Rng): boolean {
  if (age < 36) return false
  if (age >= 41) return true
  return rng.chance(0.25 + (age - 36) * 0.1)
}

type StatKey = keyof FighterStats

/** Applies the yearly age curve to the player's stats (age must already be incremented). */
export function applyPlayerAging(player: Fighter): Fighter {
  const stage = ageStage(player.age).id
  const progress = { ...player.statProgress }
  const add = (k: StatKey, v: number) => {
    progress[k] = (progress[k] ?? 0) + v
  }
  const s = player.stats

  if (stage === 'young') {
    add('speed', 0.3)
    add('cardio', 0.3)
  } else if (stage === 'veteran') {
    add('speed', -s.speed * 0.015)
    add('cardio', -s.cardio * 0.015)
    add('defense', 0.4)
    add('headMovement', 0.4)
  } else if (stage === 'decline') {
    add('chin', -s.chin * 0.05)
    add('speed', -s.speed * 0.05)
    add('recovery', -s.recovery * 0.05)
  }

  const stats = { ...s }
  for (const k of Object.keys(progress) as StatKey[]) {
    const p = progress[k] ?? 0
    const whole = Math.trunc(p)
    if (whole !== 0) {
      stats[k] = Math.max(1, Math.min(99, stats[k] + whole))
      progress[k] = p - whole
    }
  }

  const keys = Object.keys(stats) as StatKey[]
  const avg = (st: Fighter['stats']) => Math.round(keys.reduce((sum, k) => sum + st[k], 0) / keys.length)
  const overall = Math.max(1, player.overall + (avg(stats) - avg(s)))

  return { ...player, stats, statProgress: progress, overall }
}
