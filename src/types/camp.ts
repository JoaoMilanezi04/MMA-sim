import type { Division } from './game'

export type GamePlan =
  | 'anti-wrestling'
  | 'striking'
  | 'grappling'
  | 'counter-boxing'

export type CampIntensity = 'light' | 'normal' | 'brutal'

export type NoticeType = 'short_notice' | 'standard' | 'championship'

export interface BoutOpponent {
  id: string
  name: string
  nickname: string
  country: string
  record: { wins: number; losses: number; draws: number }
  ovr: number
  style: string
  scoutReport: string
  difficulty: 'favorable' | 'even' | 'dangerous'
  division: Division
  organization: string
  fighterId?: string
  rank?: number
  noticeType?: NoticeType
  durationWeeks?: number
  purseMultiplier?: number
}

export type CornerDirective =
  | 'wrestling'
  | 'pressure'
  | 'distance'
  | 'survival'
  | 'takedown_control'
  | 'boxing_pressure'
  | 'distance_counter'
  | 'defensive_survival'

export type PromoActionId = 'stream' | 'interview' | 'press_conference'
export type PressStance = 'trash_talk' | 'respect' | 'mind_games'

export interface ActiveBout {
  id: string
  opponent: BoutOpponent
  totalWeeks: number
  weeksRemaining: number
  gamePlan: GamePlan
  intensity: CampIntensity
  showPurse: number
  winPurse: number
  organization: string
  isDwcs?: boolean
  noticeType?: NoticeType
  weighInStatus?: 'passed' | 'sauna_cut' | 'missed'
  hype: number
  promoEnergySpent?: number
  composureModifier?: number
  opponentComposureModifier?: number
  trashTalkActive?: boolean
  selectedCornerTactic?: CornerDirective
}

export interface FightResult {
  won: boolean
  method: string
  round: number
  time: string
  narrative: string
  payout: number
  fansGained: number
  contractGranted?: boolean
  contractDecisionNote?: string
}
