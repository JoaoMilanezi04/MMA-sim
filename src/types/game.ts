import type { WorldState } from './career'
import type { ActiveBout } from './camp'
import type { FighterAppearance } from './appearance'

export type Section = 'home' | 'gym' | 'fights' | 'rankings' | 'life' | 'settings'

export type Archetype =
  | 'Pressure Wrestler'
  | 'Counter Striker'
  | 'BJJ Specialist'
  | 'Kickboxing / Muay Thai'
  | 'Wild Brawler'

export type ReachType = 'compact' | 'balanced' | 'rangy'

/** 7 days x 3 slots (morning, afternoon, night); each holds an activity id or null. */
export type Schedule = (string | null)[][]

export type DietPlan = 'EXTREME_CUT' | 'STRICT_CUT' | 'MODERATE_CUT' | 'MAINTENANCE' | 'CLEAN_BULK'
export type DietId = 'extreme-cut' | 'strict-cut' | 'moderate-cut' | 'maintenance' | 'clean-bulk' | DietPlan

export type Division =
  | 'Flyweight'
  | 'Bantamweight'
  | 'Featherweight'
  | 'Lightweight'
  | 'Welterweight'
  | 'Middleweight'
  | 'Light Heavyweight'
  | 'Heavyweight'

export interface FighterRecord {
  wins: number
  losses: number
  draws: number
}

export interface FighterStats {
  // Striking
  punching: number
  kicking: number
  headMovement: number
  defense: number
  // Wrestling
  takedowns: number
  takedownDefense: number
  clinch: number
  // Grappling
  submissions: number
  groundControl: number
  submissionDefense: number
  // Physical
  cardio: number
  power: number
  speed: number
  chin: number
  recovery: number
}

export interface FighterContract {
  id: string
  organization: 'LFA' | 'CAGE_WARRIORS' | 'RIZIN' | 'DWCS' | 'UFC'
  organizationName: string
  totalFights: number
  fightsRemaining: number
  showPurse: number
  winPurse: number
  isDwcs?: boolean
  isLfa?: boolean
  isCageWarriors?: boolean
  isRizin?: boolean
  description: string
  tierTitle?: string
}

export type InjuryType = 'facial_cut' | 'joint_sprain' | 'muscle_strain'

export interface FighterInjury {
  id: string
  name: string
  type: InjuryType
  severity: 'minor' | 'moderate'
  weeksRemaining: number
  penaltyDescription: string
}

export interface Fighter {
  id: string
  name: string
  nickname: string
  /** Flag emoji / code and country name, e.g. "🇧🇷 Brazil" */
  country: string
  age: number
  /** Height in cm */
  height: number
  record: FighterRecord
  money: number
  fans: number
  division: Division
  /** Current weight in lbs */
  weight: number
  /** Natural walk-around weight outside camp */
  walkingWeight?: number
  /** Synchronized current weight in lbs */
  currentWeight?: number
  targetWeight: number
  currentDiet?: DietPlan
  energy: number
  maxEnergy: number
  overall: number
  stats: FighterStats
  status: 'Amateur' | 'Pro'
  reputation: 'Neutral Professional' | string
  /** Path to avatar image (legacy fallback) */
  avatar?: string
  /** Modular vector SVG appearance */
  appearance?: FighterAppearance
  archetype?: Archetype
  /** Reach in cm */
  reach?: number
  /** Fractional training progress per stat, not yet converted to whole points. */
  statProgress?: Partial<Record<keyof FighterStats, number>>
  /** Current signed organization */
  organization?: string
  /** Active professional contract */
  contract?: FighterContract
  /** Weeks remaining of UFC/DWCS interest lockout after a loss */
  ufcLockoutWeeks?: number
  /** True if fighter achieved regional championship status */
  isRegionalChampion?: boolean
  /** Official rank in current organization (0 = champion, 1..N = ranked, UNRANKED = unranked) */
  rank?: number
  /** Active dynamic physical injuries */
  injuries?: FighterInjury[]
}

/** Answers collected by the character creation wizard. */
export interface CharacterDraft {
  firstName: string
  lastName: string
  nickname: string
  age: number
  avatar: number
  appearance?: FighterAppearance
  countryId: string | null
  division: Division | null
  /** Height in cm */
  height: number
  reach: ReachType
  archetype: Archetype | null
}

export interface HistoryEntry {
  id: string
  week: number
  year: number
  text: string
}

export interface WeeklyProgressReport {
  statGains: { stat: string; label: string; gain: number }[]
  weightChange: { before: number; after: number; delta: number }
  financialChange: { before: number; after: number; gymFee: number; sponsorIncome: number }
  overtrained: boolean
  sessionsCount: number
  newsHeadline?: string
}

export interface GameState {
  currentWeek: number
  currentYear: number
  /** null until the character has been created */
  player: Fighter | null
  history: HistoryEntry[]
  schedule: Schedule
  diet: DietId
  gymId: string
  strikingPartnerId: string | null
  grapplingPartnerId: string | null
  /** Living world: other fighters, rankings and news. */
  world: WorldState
  /** Active scheduled fight and camp */
  activeBout: ActiveBout | null
  /** Last weekly report shown when advancing a week */
  lastWeeklyReport?: WeeklyProgressReport | null
  /** Lifestyle: Subsistence job id */
  jobId?: 'full_time_athlete' | 'gym_instructor' | 'night_security'
  /** Active sponsorship agreements */
  activeSponsors?: string[]
  /** Hired private support staff */
  hiredStaff?: string[]
}

/** Weigh-in limit in lbs for each division. */
export const DIVISION_LIMITS: Record<Division, number> = {
  Flyweight: 125,
  Bantamweight: 135,
  Featherweight: 145,
  Lightweight: 155,
  Welterweight: 170,
  Middleweight: 185,
  'Light Heavyweight': 205,
  Heavyweight: 265,
}

export const DIVISION_ABBR: Record<Division, string> = {
  Flyweight: 'FLW',
  Bantamweight: 'BW',
  Featherweight: 'FW',
  Lightweight: 'LW',
  Welterweight: 'WW',
  Middleweight: 'MW',
  'Light Heavyweight': 'LHW',
  Heavyweight: 'HW',
}
