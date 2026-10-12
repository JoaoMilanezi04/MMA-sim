import type { Division, Fighter } from '../types/game'
import { DIVISION_ABBR } from '../types/game'
import type {
  FighterRank,
  FightNewsEvent,
  Organization,
  UFCEventType,
  WorldState,
} from '../types/career'
import { ALL_DIVISIONS, MAX_RANK, RIZIN_DIVISIONS, UNRANKED } from '../types/career'
import { MIN_PROSPECTS, REGIONAL_EVENTS, generateFighter, prospectOpts, randomName } from '../data/roster'
import { makeRng } from './rng'
import type { Rng } from './rng'
import { ageOvrDelta, shouldRetire } from './aging'

/** A fighter must wait this many weeks between fights. */
const MIN_REST_WEEKS = 8

const FINISH_RATES: Record<string, { ko: number; sub: number }> = {
  'Wild Brawler': { ko: 0.5, sub: 0.05 },
  'Muay Thai': { ko: 0.4, sub: 0.04 },
  Kickboxer: { ko: 0.4, sub: 0.04 },
  Boxer: { ko: 0.4, sub: 0.03 },
  'Counter Striker': { ko: 0.35, sub: 0.05 },
  'Well-Rounded': { ko: 0.25, sub: 0.12 },
  'Pressure Wrestler': { ko: 0.15, sub: 0.2 },
  'BJJ Specialist': { ko: 0.08, sub: 0.45 },
}

export function effectiveOvr(f: FighterRank): number {
  let o = f.ovr
  if (f.temporaryNerfs?.chinDamageDurationWeeks) o -= 3
  if (f.temporaryNerfs?.slumpDebuff) o -= 2
  return o
}

const cloneFighter = (f: FighterRank): FighterRank => ({
  ...f,
  record: { ...f.record },
  streak: { ...f.streak },
  temporaryNerfs: f.temporaryNerfs ? { ...f.temporaryNerfs } : undefined,
})

interface FightLine {
  division: Division
  text: string
  title: boolean
}

interface Ctx {
  fighters: FighterRank[]
  r: Rng
  totalWeeks: number
  lines: FightLine[]
  moves: string[]
  titleChanges: string[]
}

const league = (c: Ctx, org: Organization, div: Division) =>
  c.fighters.filter((f) => f.organization === org && f.division === div && !f.retired)

const rankedOf = (c: Ctx, org: Organization, div: Division) =>
  league(c, org, div)
    .filter((f) => f.rank !== UNRANKED)
    .sort((a, b) => a.rank - b.rank)

const isEligible = (f: FighterRank, totalWeeks: number) =>
  !f.isPlayer && (f.lastFightWeek === undefined || totalWeeks - f.lastFightWeek >= MIN_REST_WEEKS)

function renumber(list: FighterRank[], org: Organization) {
  const max = MAX_RANK[org] ?? 15
  list.forEach((f, i) => {
    f.rank = i <= max ? i : UNRANKED
  })
}

/** Puts `fighter` at ranking position `index`, pushing everyone below down by one. */
function insertAt(c: Ctx, org: Organization, div: Division, fighter: FighterRank, index: number) {
  const list = rankedOf(c, org, div).filter((f) => f.id !== fighter.id)
  list.splice(Math.min(index, list.length), 0, fighter)
  renumber(list, org)
}

const rankLabel = (rank: number) => (rank === 0 ? 'campeón' : `#${rank}`)

function resolveFight(c: Ctx, a: FighterRank, b: FighterRank, title: boolean) {
  const org = a.organization
  const div = a.division
  const ea = effectiveOvr(a)
  const eb = effectiveOvr(b)
  const pa = 1 / (1 + Math.pow(10, (eb - ea) / 10))

  a.lastFightWeek = c.totalWeeks
  b.lastFightWeek = c.totalWeeks

  if (c.r.chance(0.02)) {
    a.record.draws++
    b.record.draws++
    c.lines.push({ division: div, title, text: `${a.name} y ${b.name} empatan` })
    return
  }

  const aWins = c.r.chance(pa)
  const winner = aWins ? a : b
  const loser = aWins ? b : a
  const winnerRankBefore = winner.rank
  const loserRankBefore = loser.rank

  const rates = FINISH_RATES[winner.style] ?? { ko: 0.25, sub: 0.1 }
  let ko = rates.ko
  if (loser.temporaryNerfs?.chinDamageDurationWeeks) ko += 0.2
  if (loser.age >= 36) ko += 0.1
  const roll = c.r.next()
  const method = roll < ko ? 'KO/TKO' : roll < ko + rates.sub ? 'Sumisión' : 'Decisión'

  winner.record.wins++
  loser.record.losses++
  winner.streak = { count: winner.streak.type === 'W' ? winner.streak.count + 1 : 1, type: 'W' }
  loser.streak = { count: loser.streak.type === 'L' ? loser.streak.count + 1 : 1, type: 'L' }
  winner.temporaryNerfs = { ...winner.temporaryNerfs, slumpDebuff: false }
  if (loser.streak.count >= 2) loser.temporaryNerfs = { ...loser.temporaryNerfs, slumpDebuff: true }
  if (method === 'KO/TKO') {
    loser.temporaryNerfs = { ...loser.temporaryNerfs, chinDamageDurationWeeks: c.r.int(8, 12) }
  }

  // Ranking movement: a lower-ranked (or unranked) winner takes the loser's position.
  if (winnerRankBefore > loserRankBefore && loserRankBefore !== UNRANKED) {
    insertAt(c, org, div, winner, loserRankBefore)
    const abbr = DIVISION_ABBR[div]
    if (winner.rank === 0) c.titleChanges.push(`Nuevo campeón ${abbr}: ${winner.name}`)
    else c.moves.push(`${winner.name} sube al ${rankLabel(winner.rank)} (${abbr})`)
  }

  let text: string
  if (title) {
    text =
      winnerRankBefore === 0
        ? `${winner.name} retiene el título ante ${loser.name} por ${method}`
        : `${winner.name} gana el título al derrotar a ${loser.name} por ${method}`
  } else {
    text = `${winner.name} derrota a ${loser.name} por ${method}`
  }
  c.lines.push({ division: div, title, text })
}

function pickPair(c: Ctx, pool: FighterRank[]): [FighterRank, FighterRank] | null {
  if (pool.length < 2) return null
  const a = c.r.pick(pool)
  const b = c.r.pick(pool.filter((f) => f.id !== a.id))
  return [a, b]
}

function runTitleFight(c: Ctx, org: Organization, div: Division, challengerMaxRank: number): boolean {
  const ranked = rankedOf(c, org, div)
  const champ = ranked.find((f) => f.rank === 0)
  if (!champ || !isEligible(champ, c.totalWeeks)) return false
  const cands = ranked.filter((f) => f.rank >= 1 && f.rank <= challengerMaxRank && isEligible(f, c.totalWeeks))
  if (!cands.length) return false
  const challenger = cands.length > 1 && !c.r.chance(0.65) ? cands[1] : cands[0]
  resolveFight(c, champ, challenger, true)
  return true
}

function runUfcEvent(c: Ctx, type: UFCEventType) {
  for (const div of ALL_DIVISIONS) {
    if (type === 'NUMBERED_PPV') {
      runTitleFight(c, 'UFC', div, 2)
      const top = rankedOf(c, 'UFC', div).filter(
        (f) => f.rank >= 1 && f.rank <= 5 && isEligible(f, c.totalWeeks),
      )
      const pair = pickPair(c, top)
      if (pair) resolveFight(c, pair[0], pair[1], false)
    } else if (type === 'FIGHT_NIGHT') {
      const mid = rankedOf(c, 'UFC', div).filter(
        (f) => f.rank >= 6 && f.rank <= 15 && isEligible(f, c.totalWeeks),
      )
      if (!mid.length) continue
      const prospects = league(c, 'UFC', div).filter(
        (f) => f.rank === UNRANKED && isEligible(f, c.totalWeeks),
      )
      if (prospects.length && c.r.chance(0.35)) {
        resolveFight(c, c.r.pick(mid), c.r.pick(prospects), false)
      } else {
        const pair = pickPair(c, mid)
        if (pair) resolveFight(c, pair[0], pair[1], false)
      }
    }
  }
}

function runRizinEvent(c: Ctx) {
  for (const div of RIZIN_DIVISIONS) {
    if (c.r.chance(0.4) && runTitleFight(c, 'RIZIN', div, 2)) continue
    const pool = rankedOf(c, 'RIZIN', div).filter((f) => f.rank >= 1 && isEligible(f, c.totalWeeks))
    const pair = pickPair(c, pool)
    if (pair) resolveFight(c, pair[0], pair[1], false)
  }
}

/** Keeps rankings contiguous and the prospect pool stocked. */
function rebuild(c: Ctx) {
  const orgs: [Organization, Division[]][] = [
    ['UFC', ALL_DIVISIONS],
    ['RIZIN', RIZIN_DIVISIONS],
  ]
  for (const [org, divs] of orgs) {
    for (const div of divs) {
      renumber(rankedOf(c, org, div), org)
      const unranked = league(c, org, div).filter((f) => f.rank === UNRANKED).length
      for (let i = unranked; i < (MIN_PROSPECTS[org] ?? 0); i++) {
        c.fighters.push(generateFighter(c.r, div, org, prospectOpts(org)))
      }
    }
  }
}

export function eventTypeForWeek(totalWeeks: number, r: Rng): UFCEventType {
  if (totalWeeks % 4 === 0) return 'NUMBERED_PPV'
  return r.chance(0.12) ? 'OFF_WEEK' : 'FIGHT_NIGHT'
}

export function syncPlayerEntry(fighters: FighterRank[], player: Fighter) {
  const entry = fighters.find((f) => f.isPlayer)
  if (!entry) return
  entry.name = player.name
  entry.nickname = player.nickname
  entry.country = player.country
  entry.age = player.age
  entry.record = { ...player.record }
  entry.ovr = player.overall
  entry.division = player.division
  entry.style = player.archetype ?? entry.style
}

export interface WorldWeekInput {
  world: WorldState
  /** Absolute week counter (year offset * 52 + week) of the week that just started. */
  totalWeeks: number
  week: number
  year: number
  rollover: boolean
  player: Fighter
  playerDivision: Division
  extraNews: Omit<FightNewsEvent, 'id' | 'week' | 'year'>[]
}

export function simulateWorldWeek(input: WorldWeekInput): WorldState {
  const { world, totalWeeks, week, year } = input
  const r = makeRng(world.seed)
  const c: Ctx = {
    fighters: world.fighters.map(cloneFighter),
    r,
    totalWeeks,
    lines: [],
    moves: [],
    titleChanges: [],
  }
  const news: Omit<FightNewsEvent, 'id' | 'week' | 'year'>[] = [...input.extraNews]
  let ufcNumber = world.ufcNumber

  // Temporary debuffs tick down every week.
  for (const f of c.fighters) {
    const n = f.temporaryNerfs
    if (n?.chinDamageDurationWeeks !== undefined) {
      n.chinDamageDurationWeeks -= 1
      if (n.chinDamageDurationWeeks <= 0) delete n.chinDamageDurationWeeks
    }
  }

  const type = eventTypeForWeek(totalWeeks, r)
  if (type !== 'OFF_WEEK') runUfcEvent(c, type)

  if (type === 'OFF_WEEK') {
    news.push({
      headline: 'Semana sin eventos mayores en UFC',
      details: 'La organización se toma un respiro antes de la próxima cartelera.',
      eventType: 'GENERAL',
      impact: 'Sin cambios en los rankings.',
    })
  } else {
    const relevant = c.lines.filter((l) => l.title || l.division === input.playerDivision)
    const main =
      c.lines.find((l) => l.title && l.division === input.playerDivision) ??
      c.lines.find((l) => l.title) ??
      c.lines[0]
    const isPpv = type === 'NUMBERED_PPV'
    const impact = [...c.titleChanges, ...c.moves.slice(0, 3)].join(' · ') || 'Sin movimientos importantes en los rankings.'
    news.push({
      headline: isPpv
        ? `UFC ${ufcNumber}: ${main?.text ?? 'cartelera completada'}`
        : `UFC Fight Night: ${main?.text ?? 'cartelera completada'}`,
      details: relevant.map((l) => `[${DIVISION_ABBR[l.division]}] ${l.text}`).join('\n'),
      eventType: isPpv ? 'UFC_PPV' : 'UFC_FIGHT_NIGHT',
      impact,
    })
    if (isPpv) ufcNumber++
  }

  // RIZIN event every 4 weeks, offset from the numbered UFC card.
  if (totalWeeks % 4 === 2) {
    c.lines = []
    c.moves = []
    c.titleChanges = []
    runRizinEvent(c)
    if (c.lines.length) {
      news.push({
        headline: `RIZIN: ${(c.lines.find((l) => l.title) ?? c.lines[0]).text}`,
        details: c.lines.map((l) => `[${DIVISION_ABBR[l.division]}] ${l.text}`).join('\n'),
        eventType: 'REGIONAL',
        impact: [...c.titleChanges, ...c.moves.slice(0, 3)].join(' · ') || 'Sin cambios en el ranking de RIZIN.',
      })
    }
  }

  // One regional circuit headline per week.
  if (r.chance(0.7)) {
    const a = randomName(r)
    const b = randomName(r)
    news.push({
      headline: `${r.pick(REGIONAL_EVENTS)}: ${a} finaliza a ${b} en el round ${r.int(1, 3)}`,
      details: 'Una gran actuación en el circuito regional.',
      eventType: 'REGIONAL',
      impact: 'Prospecto en el radar de las grandes organizaciones.',
    })
  }

  // Yearly aging and retirements for the whole world.
  if (input.rollover) {
    for (const f of c.fighters) {
      if (f.retired || f.isPlayer) continue
      f.age += 1
      f.ovr = Math.max(40, Math.min(97, f.ovr + ageOvrDelta(f.age)))
      if (shouldRetire(f.age, r)) {
        f.retired = true
        const wasRanked = f.rank !== UNRANKED
        f.rank = UNRANKED
        if (wasRanked && f.organization === 'UFC' && f.rank !== undefined) {
          news.push({
            headline: `${f.name} anuncia su retiro a los ${f.age} años`,
            details: `${f.name} (${DIVISION_ABBR[f.division]}) cuelga los guantes tras una larga carrera.`,
            eventType: 'GENERAL',
            impact: 'Se abre un lugar en el ranking.',
          })
        }
      }
    }
  }

  syncPlayerEntry(c.fighters, input.player)
  rebuild(c)

  const stamped: FightNewsEvent[] = news.map((n, i) => ({
    ...n,
    id: `n-${year}-${week}-${i}`,
    week,
    year,
  }))

  return {
    fighters: c.fighters,
    news: [...stamped, ...world.news].slice(0, 80),
    ufcNumber,
    seed: r.state(),
  }
}

/** Inserts the player into the UFC rankings at #15 of their division (dev helper). */
export function insertPlayerIntoRanking(world: WorldState, player: Fighter): WorldState {
  if (world.fighters.some((f) => f.isPlayer)) return world
  const entry: FighterRank = {
    id: 'player',
    name: player.name,
    nickname: player.nickname,
    country: player.country,
    age: player.age,
    record: { ...player.record },
    ovr: player.overall,
    rank: UNRANKED,
    streak: { count: 0, type: 'W' },
    style: player.archetype ?? 'Well-Rounded',
    organization: 'UFC',
    division: player.division,
    isPlayer: true,
  }
  const c: Ctx = {
    fighters: [...world.fighters.map(cloneFighter), entry],
    r: makeRng(world.seed),
    totalWeeks: 0,
    lines: [],
    moves: [],
    titleChanges: [],
  }
  insertAt(c, 'UFC', player.division, entry, 15)
  return { ...world, fighters: c.fighters }
}

/** Simulates a dev amateur bout. Returns the updated player, new PRNG seed and a log line. */
export function simulateAmateurFight(
  seed: number,
  player: Fighter,
): { player: Fighter; seed: number; text: string } {
  const r = makeRng(seed)
  const oppOvr = player.overall + r.int(-6, 4)
  const pWin = Math.max(0.2, Math.min(0.9, 0.5 + (player.overall - oppOvr) / 40))
  const won = r.chance(pWin)
  const record = {
    ...player.record,
    wins: player.record.wins + (won ? 1 : 0),
    losses: player.record.losses + (won ? 0 : 1),
  }
  return {
    player: { ...player, record },
    seed: r.state(),
    text: `Combate amateur: ${won ? 'victoria' : 'derrota'} ante ${randomName(r)} (OVR ${oppOvr}). Récord ${record.wins}-${record.losses}-${record.draws}.`,
  }
}

/** P4P top fighters across all UFC divisions. */
export function computeP4P(fighters: FighterRank[], limit = 10): FighterRank[] {
  return fighters
    .filter((f) => f.organization === 'UFC' && !f.retired && f.rank !== UNRANKED)
    .sort((a, b) => effectiveOvr(b) + (b.rank === 0 ? 3 : 0) - (effectiveOvr(a) + (a.rank === 0 ? 3 : 0)))
    .slice(0, limit)
}
