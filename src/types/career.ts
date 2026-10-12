import type { Division } from './game'

export type Organization = 'AMATEUR' | 'REGIONAL' | 'LFA' | 'CAGE_WARRIORS' | 'RIZIN' | 'ONE' | 'DWCS' | 'UFC'

/** Rank value for fighters outside the ranked list. 0 = champion, 1..N = ranked. */
export const UNRANKED = 99

/** Highest ranked slot per organization (UFC Top 15, LFA Top 5, Cage Warriors Top 5, RIZIN Top 6 plus champion). */
export const MAX_RANK: Partial<Record<Organization, number>> = {
  UFC: 15,
  LFA: 5,
  CAGE_WARRIORS: 5,
  RIZIN: 6,
}

export const ALL_DIVISIONS: Division[] = [
  'Flyweight',
  'Bantamweight',
  'Featherweight',
  'Lightweight',
  'Welterweight',
  'Middleweight',
  'Light Heavyweight',
  'Heavyweight',
]

export const RIZIN_DIVISIONS: Division[] = [
  'Flyweight',
  'Bantamweight',
  'Featherweight',
  'Lightweight',
  'Welterweight',
]

export interface FighterRank {
  id: string
  name: string
  nickname: string
  /** Flag and country name, e.g. "🇬🇪 Georgia" */
  country: string
  age: number
  record: { wins: number; losses: number; draws: number }
  ovr: number
  /** 0 = champion, 1-15 ranked, UNRANKED otherwise */
  rank: number
  streak: { count: number; type: 'W' | 'L' }
  style: string
  organization: Organization
  division: Division
  temporaryNerfs?: {
    /** Weeks left of reduced chin after being knocked out */
    chinDamageDurationWeeks?: number
    /** Confidence debuff after a severe losing streak */
    slumpDebuff?: boolean
  }
  /** Absolute week number of the last fight (used to space out bookings). */
  lastFightWeek?: number
  retired?: boolean
  /** True for the user's fighter once inserted into the world. */
  isPlayer?: boolean
}

export type UFCEventType = 'NUMBERED_PPV' | 'FIGHT_NIGHT' | 'OFF_WEEK'

export interface FightNewsEvent {
  id: string
  week: number
  year: number
  headline: string
  details: string
  eventType: 'UFC_PPV' | 'UFC_FIGHT_NIGHT' | 'REGIONAL' | 'GENERAL'
  impact: string
}

export interface WorldState {
  fighters: FighterRank[]
  news: FightNewsEvent[]
  /** Number of the next UFC numbered event (e.g. 315). */
  ufcNumber: number
  /** PRNG state, keeps simulation deterministic inside the reducer. */
  seed: number
}
