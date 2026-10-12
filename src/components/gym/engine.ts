import type { DietId, Fighter, FighterInjury, FighterStats, InjuryType, Schedule, WeeklyProgressReport } from '../../types/game'
import { DIVISION_LIMITS } from '../../types/game'
import { ENERGY_BUDGET, getActivity, getDiet, getGym, getPartner } from './data'

type StatKey = keyof FighterStats

export const STAT_LABELS: Record<StatKey, string> = {
  punching: 'Potencia de Puños',
  kicking: 'Potencia de Patadas',
  headMovement: 'Movimiento de Cabeza',
  defense: 'Defensa de Pie',
  takedowns: 'Derribos',
  takedownDefense: 'Defensa de Derribos',
  clinch: 'Control de Clinch',
  submissions: 'Sumisiones',
  groundControl: 'Control en el Suelo',
  submissionDefense: 'Defensa de Sumisiones',
  cardio: 'Resistencia Aeróbica',
  power: 'Fuerza Muscular',
  speed: 'Velocidad Atlética',
  chin: 'Mandíbula / Asimilación',
  recovery: 'Recuperación',
}

/** Total energy cost of a schedule, after fatigue relief from recovery sessions. */
export function scheduleUsage(schedule: Schedule) {
  let total = 0
  let relief = 0
  let sessions = 0
  for (const id of schedule.flat()) {
    const act = getActivity(id)
    if (!act) continue
    sessions++
    total += act.cost
    relief += act.relief ?? 0
  }
  return { total, relief, used: Math.max(0, total - relief), sessions }
}

export interface WeekInput {
  player: Fighter
  schedule: Schedule
  diet: DietId
  gymId: string
  strikingPartnerId: string | null
  grapplingPartnerId: string | null
  /** True when a new 4-week month starts and the gym fee is due. */
  billing: boolean
  /** True when the fighter is in an active fight camp. */
  hasActiveBout?: boolean
  campIntensity?: 'light' | 'normal' | 'brutal'
  promoEnergyCost?: number
  hasPhysio?: boolean
}

const INJURY_TEMPLATES: { type: InjuryType; name: string; penalty: string }[] = [
  {
    type: 'facial_cut',
    name: 'Corte en la ceja / Contusión facial',
    penalty: '-10% salud de cabeza inicial en la pelea',
  },
  {
    type: 'joint_sprain',
    name: 'Esguince de tobillo / Rodilla inflamada',
    penalty: '-15% velocidad y daño de patadas',
  },
  {
    type: 'muscle_strain',
    name: 'Sobrecarga muscular / Costillas magulladas',
    penalty: '-15% estamina inicial en el combate',
  },
]

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

/** Applies one week of training, diet and gym billing. Returns the updated fighter, news line, and detailed report. */
export function trainWeek(input: WeekInput): {
  player: Fighter
  text: string
  report: WeeklyProgressReport
} {
  const { player } = input
  const gym = getGym(input.gymId)
  const diet = getDiet(input.diet)
  const { used, sessions } = scheduleUsage(input.schedule)

  // 1. Proceso de rehabilitación de lesiones previas
  const hasSaunaRecovery = input.schedule.flat().includes('recovery-sauna')
  const existingInjuries: FighterInjury[] = []

  for (const inj of player.injuries || []) {
    let reduction = 1
    if (hasSaunaRecovery) reduction += 1
    if (input.hasPhysio && Math.random() < 0.5) reduction += 1

    const remaining = inj.weeksRemaining - reduction
    if (remaining > 0) {
      existingInjuries.push({ ...inj, weeksRemaining: remaining })
    }
  }

  // 2. Presupuesto disponible considerando costo de promoción de medios
  const baseBudget = player.maxEnergy ?? ENERGY_BUDGET
  const promoCost = input.promoEnergyCost ?? 0
  const effectiveEnergyBudget = Math.max(20, baseBudget - promoCost)
  const overtrained = used > effectiveEnergyBudget
  const isHighFatigue = used > effectiveEnergyBudget * 0.9

  // 3. Riesgo de nueva lesión por sobreentrenamiento o campamento brutal
  let injuryRisk = 0
  if (overtrained) injuryRisk += 0.22
  else if (isHighFatigue) injuryRisk += 0.12

  if (input.campIntensity === 'brutal') injuryRisk += 0.12

  // El Fisioterapeuta privado reduce un 60% la probabilidad de lesión
  if (input.hasPhysio) {
    injuryRisk *= 0.40
  }

  const parts: string[] = []
  if ((player.injuries?.length ?? 0) > existingInjuries.length) {
    parts.push('¡Rehabilitación exitosa! Lesión superada')
  }

  if (Math.random() < injuryRisk && existingInjuries.length < 2) {
    const tmpl = INJURY_TEMPLATES[Math.floor(Math.random() * INJURY_TEMPLATES.length)]
    const newInjury: FighterInjury = {
      id: `injury-${Date.now()}-${Math.random()}`,
      name: tmpl.name,
      type: tmpl.type,
      severity: 'minor',
      weeksRemaining: 2,
      penaltyDescription: tmpl.penalty,
    }
    existingInjuries.push(newInjury)
    parts.push(`⚠️ Lesión: ${tmpl.name} (${tmpl.penalty})`)
  }

  const progress: Partial<Record<StatKey, number>> = { ...player.statProgress }
  const addedGains: Partial<Record<StatKey, number>> = {}

  const add = (k: StatKey, v: number) => {
    progress[k] = (progress[k] ?? 0) + v
    addedGains[k] = (addedGains[k] ?? 0) + v
  }

  for (const id of input.schedule.flat()) {
    const act = getActivity(id)
    if (!act) continue
    let mult = (overtrained ? 0.5 : 1) * (1 + gym.bonus)
    if (act.partner) {
      const partner = getPartner(
        act.partner === 'striking' ? input.strikingPartnerId : input.grapplingPartnerId,
      )
      if (!partner) mult *= 0.5
      else if (partner.ovr > player.overall) mult *= 1.25
    }
    for (const [k, v] of Object.entries(act.gains)) add(k as StatKey, v * mult)
  }
  for (const [k, v] of Object.entries(diet.progress)) add(k as StatKey, v)

  const stats = { ...player.stats }
  for (const k of Object.keys(progress) as StatKey[]) {
    const p = progress[k] ?? 0
    const whole = Math.trunc(p)
    if (whole !== 0) {
      stats[k] = clamp(stats[k] + whole, 1, 99)
      progress[k] = p - whole
    }
  }

  const keys = Object.keys(stats) as StatKey[]
  const avg = Math.round(keys.reduce((s, k) => s + stats[k], 0) / keys.length)

  const limit = DIVISION_LIMITS[player.division]
  const minWeight = Number((limit - 1.5).toFixed(1))
  const walkingWeight = player.walkingWeight ?? Number((limit + 14.0).toFixed(1))
  const maxWeight = Number((walkingWeight + 8.0).toFixed(1))

  let weightDelta = diet.delta
  if (!input.hasActiveBout) {
    // Fuera de campamento: el peso tiende a recuperarse naturalmente hacia su walkingWeight
    if (player.weight < walkingWeight) {
      const deficit = Number((walkingWeight - player.weight).toFixed(1))
      weightDelta = Math.min(1.5, Math.max(0.5, deficit))
    } else if (diet.id === 'maintenance') {
      weightDelta = 0
    }
  }

  const rawWeight = player.weight + weightDelta
  const weight = Number(clamp(rawWeight, minWeight, maxWeight).toFixed(1))
  const money = player.money - (input.billing ? gym.fee : 0)

  if (sessions > 0) {
    parts.push(`${sessions} sesiones de entrenamiento${overtrained ? ' (sobreentrenamiento: progreso reducido)' : ''}`)
  }
  if (weight !== player.weight) parts.push(`peso ${weight.toFixed(1)} lbs`)
  if (input.billing) parts.push(`mensualidad del gimnasio −$${gym.fee}`)

  const statGains = (Object.entries(addedGains) as [StatKey, number][])
    .filter(([_, v]) => v > 0.05)
    .map(([k, v]) => ({
      stat: k,
      label: STAT_LABELS[k] || k,
      gain: Number(v.toFixed(2)),
    }))
    .sort((a, b) => b.gain - a.gain)

  const report: WeeklyProgressReport = {
    statGains,
    weightChange: {
      before: player.weight,
      after: weight,
      delta: Number((weight - player.weight).toFixed(1)),
    },
    financialChange: {
      before: player.money,
      after: money,
      gymFee: input.billing ? gym.fee : 0,
      sponsorIncome: 0,
    },
    overtrained,
    sessionsCount: sessions,
  }

  return {
    player: {
      ...player,
      stats,
      statProgress: progress,
      overall: Math.max(player.overall, avg),
      weight,
      currentWeight: weight,
      walkingWeight: player.walkingWeight ?? Number((limit + 14.0).toFixed(1)),
      money,
      injuries: existingInjuries,
    },
    text: parts.length ? parts.join(' · ') : '',
    report,
  }
}

