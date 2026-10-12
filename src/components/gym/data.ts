import {
  Activity,
  Crosshair,
  Dumbbell,
  Flame,
  Footprints,
  Hand,
  Layers,
  Move,
  Shield,
  Swords,
  Target,
  Users,
  Waves,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { DietId, Division, FighterStats, Schedule } from '../../types/game'

type StatKey = keyof FighterStats

export const ENERGY_BUDGET = 100
export const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
export const SLOT_LABELS = ['Mañana', 'Tarde', 'Noche']

/* ------------------------------ Activities ------------------------------ */

export type ActivityCategory = 'striking' | 'wrestling' | 'grappling' | 'conditioning'

export const CATEGORIES: { id: ActivityCategory; label: string; color: string }[] = [
  { id: 'striking', label: 'Striking', color: 'text-red-400' },
  { id: 'wrestling', label: 'Wrestling', color: 'text-amber-400' },
  { id: 'grappling', label: 'Grappling', color: 'text-sky-400' },
  { id: 'conditioning', label: 'Acondicionamiento', color: 'text-emerald-400' },
]

export interface StatBadge {
  label: string
  category: 'striking' | 'wrestling' | 'grappling' | 'physical' | 'recovery'
}

export interface ActivityDef {
  id: string
  name: string
  category: ActivityCategory
  cost: number
  icon: LucideIcon
  /** Which partner type this session requires. Without one it runs at 50%. */
  partner?: 'striking' | 'grappling'
  /** Fatigue relief: reduces the week's total energy cost. */
  relief?: number
  /** Short combat benefit explanation for hover / tooltip */
  description: string
  /** Visual stat badges */
  statBadges: StatBadge[]
  /** Fractional stat progress gained per session. */
  gains: Partial<Record<StatKey, number>>
}

export const ACTIVITIES: ActivityDef[] = [
  // --- Striking ---
  {
    id: 'heavy-bag',
    name: 'Heavy Bag (Saco Pesado)',
    category: 'striking',
    cost: 5,
    icon: Dumbbell,
    description: 'Desarrolla pegada pesada con las manos y resistencia básica.',
    statBadges: [
      { label: '+Potencia Puños', category: 'striking' },
      { label: '+Cardio', category: 'physical' },
    ],
    gains: { punching: 0.35, power: 0.2, cardio: 0.1 },
  },
  {
    id: 'pad-work',
    name: 'Pad Work (Manoplas)',
    category: 'striking',
    cost: 5,
    icon: Hand,
    description: 'Agudiza el timing, velocidad de combinación y puntería quirúrgica.',
    statBadges: [
      { label: '+Precisión de Golpeo', category: 'striking' },
      { label: '+Velocidad de Manos', category: 'physical' },
    ],
    gains: { punching: 0.3, speed: 0.25, headMovement: 0.15 },
  },
  {
    id: 'striking-sparring',
    name: 'Striking Sparring',
    category: 'striking',
    cost: 9,
    icon: Swords,
    partner: 'striking',
    description: 'Aprende a esquivar golpes, absorber castigo y reaccionar bajo presión real.',
    statBadges: [
      { label: '+Defensa Striking', category: 'striking' },
      { label: '+Movimiento de Cabeza', category: 'striking' },
      { label: '+Compostura', category: 'physical' },
    ],
    gains: { defense: 0.35, headMovement: 0.35, chin: 0.2, punching: 0.15 },
  },
  {
    id: 'kicking-drills',
    name: 'Kicking Drills (Drills de Patadas)',
    category: 'striking',
    cost: 6,
    icon: Footprints,
    description: 'Potencia el daño de patadas y castigo a las piernas rivales.',
    statBadges: [
      { label: '+Potencia Patadas', category: 'striking' },
      { label: '+Patadas Bajas (Leg Kicks)', category: 'striking' },
    ],
    gains: { kicking: 0.45, power: 0.15, speed: 0.1 },
  },
  {
    id: 'clinch-work',
    name: 'Clinch Work (Trabajo de Clinch)',
    category: 'striking',
    cost: 7,
    icon: Users,
    description: 'Domina el combate cuerpo a cuerpo con rodillazos y codazos devastadores.',
    statBadges: [
      { label: '+Golpeo en Clinch', category: 'striking' },
      { label: '+Rodillas / Codos', category: 'striking' },
    ],
    gains: { clinch: 0.4, power: 0.15, takedownDefense: 0.1 },
  },

  // --- Wrestling ---
  {
    id: 'live-wrestling',
    name: 'Live Wrestling',
    category: 'wrestling',
    cost: 9,
    icon: Swords,
    partner: 'grappling',
    description: 'Perfecciona entradas a dos piernas y dominio posicional contra rivales reales.',
    statBadges: [
      { label: '+Derribos (Takedowns)', category: 'wrestling' },
      { label: '+Control de Jaula', category: 'wrestling' },
    ],
    gains: { takedowns: 0.35, clinch: 0.25, takedownDefense: 0.25, cardio: 0.15 },
  },
  {
    id: 'takedown-defense',
    name: 'Defensa de Derribo / TDD',
    category: 'wrestling',
    cost: 6,
    icon: Shield,
    description: 'Evita que te lleven a la lona y frena los derribos rivales con sprawls sólidos.',
    statBadges: [
      { label: '+Defensa de Derribos (Sprawl)', category: 'wrestling' },
    ],
    gains: { takedownDefense: 0.5, clinch: 0.15 },
  },
  {
    id: 'get-up-drills',
    name: 'Levantadas contra la Malla / Wall Get-Ups',
    category: 'wrestling',
    cost: 5,
    icon: Move,
    description: 'Técnica para ponerte de pie usando la reja y romper el control en la lona.',
    statBadges: [
      { label: '+Capacidad de Levantarse (Get Up)', category: 'wrestling' },
    ],
    gains: { takedownDefense: 0.3, speed: 0.2, submissionDefense: 0.15 },
  },
  {
    id: 'wall-wrestling',
    name: 'Control contra la Reja / Cage Pinning',
    category: 'wrestling',
    cost: 6,
    icon: Layers,
    description: 'Inmoviliza al rival contra el enrejado y agota su energía con presión constante.',
    statBadges: [
      { label: '+Clinch contra la Reja', category: 'wrestling' },
      { label: '+Fuerza Isométrica', category: 'physical' },
    ],
    gains: { clinch: 0.35, takedowns: 0.2, power: 0.15 },
  },

  // --- Grappling ---
  {
    id: 'position-drills',
    name: 'Drills de Posición',
    category: 'grappling',
    cost: 5,
    icon: Target,
    description: 'Avanza posiciones en el suelo y mantén la montada o control lateral.',
    statBadges: [
      { label: '+Pase de Guardia', category: 'grappling' },
      { label: '+Control Superior (Top Control)', category: 'grappling' },
    ],
    gains: { groundControl: 0.4, submissionDefense: 0.2 },
  },
  {
    id: 'submission-hunting',
    name: 'Caza de Sumisiones',
    category: 'grappling',
    cost: 6,
    icon: Crosshair,
    description: 'Encuentra palancas, estrangulaciones y llaves articulares desde cualquier ángulo.',
    statBadges: [
      { label: '+Ofensiva de Sumisión', category: 'grappling' },
    ],
    gains: { submissions: 0.45, groundControl: 0.15 },
  },
  {
    id: 'submission-defense',
    name: 'Defensa y Escapes',
    category: 'grappling',
    cost: 6,
    icon: Shield,
    description: 'Záfate de sumisiones peligrosas y escapa de posiciones inferiores comprometidas.',
    statBadges: [
      { label: '+Defensa de Sumisiones', category: 'grappling' },
      { label: '+Escapes de Suelo', category: 'grappling' },
    ],
    gains: { submissionDefense: 0.45, groundControl: 0.15 },
  },
  {
    id: 'gnp-drills',
    name: 'Ground & Pound / GnP',
    category: 'grappling',
    cost: 7,
    icon: Hand,
    description: 'Castiga y finaliza al oponente desde la guardia o montada con golpes contundentes.',
    statBadges: [
      { label: '+Daño en el Suelo', category: 'grappling' },
      { label: '+Postura de GnP', category: 'grappling' },
    ],
    gains: { groundControl: 0.3, power: 0.2, punching: 0.15 },
  },
  {
    id: 'scramble-drills',
    name: 'Scramble Drills',
    category: 'grappling',
    cost: 7,
    icon: Activity,
    description: 'Reacciona rápido en transiciones caóticas y recupera la guardia antes de quedar atrapado.',
    statBadges: [
      { label: '+Velocidad de Scramble', category: 'grappling' },
      { label: '+Recuperación de Guardia', category: 'grappling' },
    ],
    gains: { groundControl: 0.25, takedownDefense: 0.2, speed: 0.2, submissionDefense: 0.15 },
  },

  // --- Acondicionamiento Físico ---
  {
    id: 'strength',
    name: 'Fuerza y Potencia',
    category: 'conditioning',
    cost: 8,
    icon: Dumbbell,
    description: 'Aumenta la fuerza muscular explosiva para el golpeo y la lucha.',
    statBadges: [
      { label: '+Fuerza Física', category: 'physical' },
      { label: '+Potencia Bruta', category: 'physical' },
    ],
    gains: { power: 0.45, chin: 0.15 },
  },
  {
    id: 'cardio-run',
    name: 'Cardio HIIT / Running',
    category: 'conditioning',
    cost: 7,
    icon: Flame,
    description: 'Mantén un ritmo asfixiante durante los 3 o 5 asaltos sin perder fuelle.',
    statBadges: [
      { label: '+Cardio', category: 'physical' },
      { label: '+Resistencia Aeróbica', category: 'physical' },
    ],
    gains: { cardio: 0.45, recovery: 0.15 },
  },
  {
    id: 'agility-drills',
    name: 'Velocidad y Agilidad',
    category: 'conditioning',
    cost: 6,
    icon: Zap,
    description: 'Mejora tus reflejos rápidos, entradas y salidas de distancia con agilidad felina.',
    statBadges: [
      { label: '+Velocidad', category: 'physical' },
      { label: '+Juego de Pies (Footwork)', category: 'physical' },
    ],
    gains: { speed: 0.45, headMovement: 0.2 },
  },
  {
    id: 'recovery-sauna',
    name: 'Recuperación Activa / Fisioterapia',
    category: 'conditioning',
    cost: 0,
    icon: Waves,
    relief: 4,
    description: 'Reduce el desgaste acumulado, alivia la fatiga semanal y previene sobreentrenamiento.',
    statBadges: [
      { label: 'Recupera Fatiga', category: 'recovery' },
      { label: 'Previene Lesiones', category: 'recovery' },
    ],
    gains: { recovery: 0.3 },
  },
]

export function getActivity(id: string | null): ActivityDef | undefined {
  return ACTIVITIES.find((a) => a.id === id)
}

/* ------------------------------ Templates ------------------------------ */

const _ = null

function build(rows: (string | null)[][]): Schedule {
  return rows.map((r) => [r[0] ?? null, r[1] ?? null, r[2] ?? null])
}

export const EMPTY_SCHEDULE: Schedule = build([[], [], [], [], [], [], []])

export interface TemplateDef {
  id: string
  label: string
  schedule: Schedule
}

export const TEMPLATES: TemplateDef[] = [
  {
    id: 'balanced',
    label: 'Equilibrado',
    schedule: build([
      ['cardio-run', 'heavy-bag', 'position-drills'],
      ['strength', 'takedown-defense', 'pad-work'],
      ['cardio-run', 'kicking-drills', 'submission-hunting'],
      ['strength', 'wall-wrestling', 'pad-work'],
      ['cardio-run', 'striking-sparring', 'position-drills'],
      ['recovery-sauna', _, _],
      [_, _, _],
    ]),
  },
  {
    id: 'striking',
    label: 'Striking Focus',
    schedule: build([
      ['heavy-bag', 'pad-work', 'kicking-drills'],
      ['cardio-run', 'striking-sparring', 'clinch-work'],
      ['heavy-bag', 'pad-work', 'strength'],
      ['kicking-drills', 'striking-sparring', 'cardio-run'],
      ['heavy-bag', 'pad-work', _],
      ['recovery-sauna', _, _],
      [_, _, _],
    ]),
  },
  {
    id: 'grappling',
    label: 'Wrestling/Grappling Focus',
    schedule: build([
      ['live-wrestling', 'takedown-defense', 'position-drills'],
      ['wall-wrestling', 'submission-hunting', 'cardio-run'],
      ['get-up-drills', 'scramble-drills', 'gnp-drills'],
      ['live-wrestling', 'position-drills', 'strength'],
      ['submission-hunting', 'takedown-defense', _],
      ['recovery-sauna', _, _],
      [_, _, _],
    ]),
  },
  {
    id: 'rest',
    label: 'Descanso / Recuperación',
    schedule: build([
      ['recovery-sauna', _, _],
      ['cardio-run', _, _],
      ['recovery-sauna', _, _],
      ['cardio-run', _, _],
      ['recovery-sauna', _, _],
      [_, _, _],
      ['recovery-sauna', _, _],
    ]),
  },
]

/* ------------------------------ Diets ------------------------------ */

export interface DietDef {
  id: DietId
  name: string
  delta: number
  description: string
  effect: string
  /** Fractional stat progress applied every week on this diet. */
  progress: Partial<Record<StatKey, number>>
}

export const DIETS: DietDef[] = [
  { id: 'extreme-cut', name: 'Extreme Cut', delta: -3.5, description: 'Pérdida de peso acelerada de emergencia.', effect: '−15% Estamina máxima en combate', progress: { cardio: -0.4 } },
  { id: 'strict-cut', name: 'Strict Professional', delta: -2.0, description: 'Déficit calórico estricto y profesional.', effect: '−5% Recuperación entre asaltos', progress: { recovery: -0.1 } },
  { id: 'moderate-cut', name: 'Moderate Cut', delta: -1.0, description: 'Bajada gradual y sostenible.', effect: 'Sin penalizaciones negativas', progress: {} },
  { id: 'maintenance', name: 'Maintenance', delta: 0, description: 'Mantiene el peso actual estable.', effect: 'Sin cambios en la báscula', progress: {} },
  { id: 'clean-bulk', name: 'Clean Bulk', delta: 1.0, description: 'Aumento de masa limpia.', effect: '+5% Bonus temporal a Fuerza y Potencia', progress: { power: 0.3 } },
]

export function getDiet(id: DietId): DietDef {
  return DIETS.find((d) => d.id === id) ?? DIETS[3]
}

/* ------------------------------ Gyms ------------------------------ */

export interface GymDef {
  id: string
  name: string
  fee: number
  quality: number
  /** Extra training progress, e.g. 0.1 = +10%. */
  bonus: number
  description: string
}

export const GYMS: GymDef[] = [
  { id: 'local', name: 'Gimnasio Local MMA', fee: 150, quality: 1, bonus: 0, description: 'Instalaciones básicas, sin bonificación.' },
  { id: 'fight-club', name: 'Iron Fist Fight Club', fee: 400, quality: 2, bonus: 0.1, description: 'Ring, sacos profesionales y entrenadores dedicados.' },
  { id: 'performance', name: 'Apex Performance Center', fee: 900, quality: 3, bonus: 0.2, description: 'Sala de fuerza, recuperación y análisis.' },
  { id: 'academy', name: 'Champions Academy', fee: 1800, quality: 4, bonus: 0.35, description: 'Academia de élite con campeones activos.' },
  { id: 'legends', name: 'Legends Compound', fee: 3500, quality: 5, bonus: 0.5, description: 'El mejor complejo de entrenamiento del mundo.' },
]

export function getGym(id: string): GymDef {
  return GYMS.find((g) => g.id === id) ?? GYMS[0]
}

/* ------------------------------ Sparring partners ------------------------------ */

export interface PartnerDef {
  id: string
  name: string
  age: number
  division: Division
  ovr: number
  type: 'striking' | 'grappling'
}

export const PARTNERS: PartnerDef[] = [
  { id: 'p-marcos', name: 'Marcos Silva', age: 24, division: 'Lightweight', ovr: 52, type: 'striking' },
  { id: 'p-tiago', name: 'Tiago Reis', age: 19, division: 'Featherweight', ovr: 36, type: 'striking' },
  { id: 'p-dmitri', name: 'Dmitri Volkov', age: 27, division: 'Welterweight', ovr: 58, type: 'striking' },
  { id: 'p-carlos', name: 'Carlos Mendes', age: 26, division: 'Featherweight', ovr: 55, type: 'grappling' },
  { id: 'p-jake', name: 'Jake Turner', age: 21, division: 'Bantamweight', ovr: 44, type: 'grappling' },
  { id: 'p-hiro', name: 'Hiro Tanaka', age: 30, division: 'Lightweight', ovr: 32, type: 'grappling' },
]

export function getPartner(id: string | null): PartnerDef | undefined {
  return PARTNERS.find((p) => p.id === id)
}
