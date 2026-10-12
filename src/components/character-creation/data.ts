import type {
  Archetype,
  CharacterDraft,
  Division,
  Fighter,
  FighterStats,
  ReachType,
} from '../../types/game'
import { DIVISION_LIMITS } from '../../types/game'
import { DEFAULT_APPEARANCE } from '../../types/appearance'

type StatKey = keyof FighterStats

export const AVATARS = [1, 2, 3, 4, 5, 6].map((n) => `/avatars/avatar-${n}.jpg`)

export const DIVISIONS: Division[] = [
  'Flyweight',
  'Bantamweight',
  'Featherweight',
  'Lightweight',
  'Welterweight',
  'Middleweight',
  'Light Heavyweight',
  'Heavyweight',
]

/** Country bonuses are shown at full value in the UI but applied at this scale to keep starting OVR 35-45. */
const COUNTRY_SCALE = 0.5
const BASE_STAT = 34

export const EMPTY_DRAFT: CharacterDraft = {
  firstName: '',
  lastName: '',
  nickname: '',
  age: 18,
  avatar: 0,
  appearance: { ...DEFAULT_APPEARANCE },
  countryId: null,
  division: null,
  height: 175,
  reach: 'balanced',
  archetype: null,
}

/* ------------------------------ Countries ------------------------------ */

export interface CountryBonus {
  label: string
  value: number
  /** Existing stats this bonus feeds into (value is split across them). */
  targets: StatKey[]
}

export interface CountryOption {
  id: string
  flag: string
  name: string
  tagline: string
  bonuses: CountryBonus[]
}

export const COUNTRIES: CountryOption[] = [
  {
    id: 'br',
    flag: '🇧🇷',
    name: 'Brasil',
    tagline: 'Cuna del BJJ',
    bonuses: [
      { label: 'Submission Offense', value: 16, targets: ['submissions'] },
      { label: 'Guard', value: 12, targets: ['groundControl', 'submissionDefense'] },
      { label: 'Sweeps', value: 10, targets: ['groundControl'] },
      { label: 'Scrambles', value: 8, targets: ['takedownDefense'] },
    ],
  },
  {
    id: 'us',
    flag: '🇺🇸',
    name: 'Estados Unidos',
    tagline: 'Pipeline de Wrestling',
    bonuses: [
      { label: 'Takedowns', value: 12, targets: ['takedowns'] },
      { label: 'Takedown Defense', value: 10, targets: ['takedownDefense'] },
      { label: 'Clinch', value: 8, targets: ['clinch'] },
      { label: 'Cardio', value: 6, targets: ['cardio'] },
    ],
  },
  {
    id: 'ru',
    flag: '🇷🇺',
    name: 'Rusia / Daguestán',
    tagline: 'Escuela de Sambo y lucha',
    bonuses: [
      { label: 'Takedowns', value: 16, targets: ['takedowns'] },
      { label: 'Top Control', value: 14, targets: ['groundControl'] },
      { label: 'Sambo / Cage Wrestling', value: 10, targets: ['takedowns', 'clinch'] },
      { label: 'Resistencia mental', value: 8, targets: ['recovery'] },
    ],
  },
  {
    id: 'th',
    flag: '🇹🇭',
    name: 'Tailandia',
    tagline: 'Muay Thai de élite',
    bonuses: [
      { label: 'Clinch Striking', value: 16, targets: ['clinch'] },
      { label: 'Codos / Rodillas', value: 14, targets: ['power', 'clinch'] },
      { label: 'Leg Kicks', value: 12, targets: ['kicking'] },
      { label: 'Patadas', value: 10, targets: ['kicking'] },
    ],
  },
  {
    id: 'mx',
    flag: '🇲🇽',
    name: 'México',
    tagline: 'Estilo boxeo agresivo',
    bonuses: [
      { label: 'Punching Power', value: 14, targets: ['power', 'punching'] },
      { label: 'Movimiento de cabeza', value: 10, targets: ['headMovement'] },
      { label: 'Resistencia al dolor / Chin', value: 8, targets: ['chin'] },
    ],
  },
  {
    id: 'nl',
    flag: '🇳🇱',
    name: 'Países Bajos',
    tagline: 'Kickboxing holandés',
    bonuses: [
      { label: 'Kicking Power', value: 14, targets: ['kicking', 'power'] },
      { label: 'Kickboxing holandés', value: 12, targets: ['kicking', 'punching'] },
      { label: 'Combinaciones de boxeo', value: 8, targets: ['punching'] },
    ],
  },
  {
    id: 'ie',
    flag: '🇮🇷',
    name: 'Irlanda',
    tagline: 'Striking de contra',
    bonuses: [
      { label: 'Timing', value: 10, targets: ['headMovement'] },
      { label: 'Counter Striking', value: 10, targets: ['defense'] },
      { label: 'Precisión de golpeo', value: 8, targets: ['punching'] },
    ],
  },
  {
    id: 'jp',
    flag: '🇯🇵',
    name: 'Japón',
    tagline: 'Judo y técnica',
    bonuses: [
      { label: 'Submission Defense', value: 10, targets: ['submissionDefense'] },
      { label: 'Fight IQ', value: 10, targets: ['defense', 'recovery'] },
      { label: 'Judo / Catch Wrestling', value: 8, targets: ['takedowns', 'clinch'] },
    ],
  },
]

/* ------------------------------ Physique ------------------------------ */

export const HEIGHT_RANGES: Record<Division, [number, number]> = {
  Flyweight: [160, 175],
  Bantamweight: [163, 178],
  Featherweight: [167, 183],
  Lightweight: [170, 186],
  Welterweight: [175, 191],
  Middleweight: [178, 195],
  'Light Heavyweight': [183, 198],
  Heavyweight: [185, 203],
}

export function defaultHeight(division: Division): number {
  const [min, max] = HEIGHT_RANGES[division]
  return Math.round((min + max) / 2)
}

const REACH_OFFSET: Record<ReachType, number> = { compact: -3, balanced: 3, rangy: 9 }
const AVG_REACH_OFFSET = 3

export function reachCm(height: number, reach: ReachType): number {
  return height + REACH_OFFSET[reach]
}

/** Reach difference in cm versus an average fighter of the same height. */
export function reachAdvantage(reach: ReachType): number {
  return REACH_OFFSET[reach] - AVG_REACH_OFFSET
}

export interface ReachOption {
  id: ReachType
  title: string
  subtitle: string
  positives: string[]
  negatives: string[]
  mods: Partial<Record<StatKey, number>>
}

export const REACH_OPTIONS: ReachOption[] = [
  {
    id: 'compact',
    title: 'Corto',
    subtitle: 'Compact',
    positives: ['+Velocidad', '+Poder en el clinch'],
    negatives: ['−Distancia / Jab'],
    mods: { speed: 3, clinch: 3, power: 2, punching: -1 },
  },
  {
    id: 'balanced',
    title: 'Promedio',
    subtitle: 'Balanced',
    positives: ['Sin penalizaciones'],
    negatives: [],
    mods: {},
  },
  {
    id: 'rangy',
    title: 'Largo',
    subtitle: 'Rangy',
    positives: ['+Distancia', '+Jab'],
    negatives: ['−Velocidad en corta distancia', '−Clinch'],
    mods: { punching: 3, defense: 3, speed: -2, clinch: -3 },
  },
]

/* ------------------------------ Archetypes ------------------------------ */

export interface ArchetypeOption {
  id: Archetype
  reference: string
  description: string
  longevity: number
  finish: { ko: number; sub: number; dec: number }
  mods: Partial<Record<StatKey, number>>
}

export const ARCHETYPES: ArchetypeOption[] = [
  {
    id: 'Pressure Wrestler',
    reference: 'Estilo Khabib / Islam',
    description: 'Derribos continuos y control de suelo pesado.',
    longevity: 4,
    finish: { ko: 15, sub: 25, dec: 60 },
    mods: { takedowns: 8, groundControl: 8, takedownDefense: 6, cardio: 6, clinch: 4 },
  },
  {
    id: 'Counter Striker',
    reference: 'Estilo Anderson Silva / Adesanya',
    description: 'Defensa paciente, timing y precisión.',
    longevity: 5,
    finish: { ko: 45, sub: 10, dec: 45 },
    mods: { headMovement: 8, defense: 8, speed: 6, punching: 5, kicking: 3 },
  },
  {
    id: 'BJJ Specialist',
    reference: 'Estilo Oliveira / Maia',
    description: 'Peligro absoluto en sumisiones y guardia amenazante.',
    longevity: 4,
    finish: { ko: 5, sub: 55, dec: 40 },
    mods: { submissions: 9, submissionDefense: 7, groundControl: 6, takedownDefense: 3 },
  },
  {
    id: 'Kickboxing / Muay Thai',
    reference: 'Estilo Pereira',
    description: 'Poder destructivo con patadas, rodillas y codos en el clinch.',
    longevity: 3,
    finish: { ko: 45, sub: 5, dec: 50 },
    mods: { kicking: 8, clinch: 6, power: 5, punching: 3 },
  },
  {
    id: 'Wild Brawler',
    reference: 'Estilo Gaethje / Wanderlei',
    description: 'Ritmo frenético, peleas espectaculares, alto riesgo y alto poder.',
    longevity: 2,
    finish: { ko: 50, sub: 10, dec: 40 },
    mods: { power: 9, punching: 7, chin: 6, recovery: 2, headMovement: -3, defense: -3 },
  },
]

/* ------------------------------ Calculation ------------------------------ */

const STAT_KEYS: StatKey[] = [
  'punching',
  'kicking',
  'headMovement',
  'defense',
  'takedowns',
  'takedownDefense',
  'clinch',
  'submissions',
  'groundControl',
  'submissionDefense',
  'cardio',
  'power',
  'speed',
  'chin',
  'recovery',
]

export function getCountry(id: string | null): CountryOption | undefined {
  return COUNTRIES.find((c) => c.id === id)
}

export function getArchetype(id: Archetype | null): ArchetypeOption | undefined {
  return ARCHETYPES.find((a) => a.id === id)
}

export function computeStats(draft: CharacterDraft): FighterStats {
  const raw = Object.fromEntries(STAT_KEYS.map((k) => [k, BASE_STAT])) as Record<StatKey, number>

  const add = (key: StatKey, amount: number) => {
    raw[key] += amount
  }

  getCountry(draft.countryId)?.bonuses.forEach((b) => {
    const share = (b.value * COUNTRY_SCALE) / b.targets.length
    b.targets.forEach((t) => add(t, share))
  })
  Object.entries(getArchetype(draft.archetype)?.mods ?? {}).forEach(([k, v]) => add(k as StatKey, v))
  Object.entries(REACH_OPTIONS.find((r) => r.id === draft.reach)?.mods ?? {}).forEach(([k, v]) =>
    add(k as StatKey, v),
  )

  return Object.fromEntries(
    STAT_KEYS.map((k) => [k, Math.max(1, Math.min(99, Math.round(raw[k])))]),
  ) as unknown as FighterStats
}

/** Starting OVR: average of all stats, kept in the 35-45 range. */
export function computeOverall(stats: FighterStats): number {
  const avg = STAT_KEYS.reduce((sum, k) => sum + stats[k], 0) / STAT_KEYS.length
  return Math.max(35, Math.min(45, Math.round(avg)))
}

/** Builds a Fighter from the (possibly incomplete) draft. Also used for the live preview. */
export function buildFighter(draft: CharacterDraft): Fighter {
  const division = draft.division ?? 'Featherweight'
  const limit = DIVISION_LIMITS[division]
  const country = getCountry(draft.countryId)
  const stats = computeStats(draft)
  const name = `${draft.firstName.trim()} ${draft.lastName.trim()}`.trim()

  return {
    id: `player-${Date.now()}`,
    name,
    nickname: draft.nickname.trim(),
    country: country ? `${country.flag} ${country.name}` : '🏳️ Sin país',
    age: draft.age,
    height: draft.height,
    reach: reachCm(draft.height, draft.reach),
    record: { wins: 0, losses: 0, draws: 0 },
    money: 500,
    fans: 0,
    division,
    walkingWeight: Number((limit + 14.0).toFixed(1)),
    weight: Number((limit + 14.0).toFixed(1)),
    currentWeight: Number((limit + 14.0).toFixed(1)),
    targetWeight: limit,
    currentDiet: 'MODERATE_CUT',
    energy: 100,
    maxEnergy: 100,
    overall: computeOverall(stats),
    stats,
    status: 'Amateur',
    reputation: 'Neutral Professional',
    avatar: AVATARS[draft.avatar],
    appearance: draft.appearance ? { ...draft.appearance } : { ...DEFAULT_APPEARANCE },
    archetype: draft.archetype ?? undefined,
  }
}
