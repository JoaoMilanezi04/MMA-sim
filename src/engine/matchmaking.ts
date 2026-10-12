import type { BoutOpponent, NoticeType } from '../types/camp'
import type { Division, Fighter } from '../types/game'
import type { FighterRank, Organization, WorldState } from '../types/career'
import { MAX_RANK, UNRANKED } from '../types/career'
import { makeRng } from './rng'

const SCOUT_DESCRIPTIONS: Record<string, string> = {
  'BJJ Specialist': 'Cinturón negro de élite en Jiu-Jitsu. Peligro constante en la lona buscando sumisiones desde cualquier posición.',
  'Pressure Wrestler': 'Ritmo asfixiante de derribos, clinch y control contra la jaula. Buscará desgastarte físicamente.',
  'Muay Thai': 'Devastador en el golpeo a media distancia y clinch. Patadas bajas implacables y rodillazos peligrosos.',
  'Counter Striker': 'Gran timing y juego de contragolpe. Espera los errores para conectar con precisión quirúrgica.',
  'Wild Brawler': 'Poco ortodoxo pero con poder de nocaut demoledor. Cómodo en los intercambios feroces.',
  'Boxer': 'Velocidad de manos, juego de pies depurado y combinaciones de 1-2 potentes al mentón.',
  'Kickboxer': 'Arsenal completo de patadas altas y combinaciones fluidas. Peligroso en la distancia larga.',
  'Well-Rounded': 'Peleador completo sin debilidades marcadas. Capaz de adaptarse a cualquier fase del combate.',
}

function getScoutReport(fighter: FighterRank): string {
  const base = SCOUT_DESCRIPTIONS[fighter.style] ?? 'Peleador competitivo y peligroso.'
  if (fighter.rank === 0) {
    return `👑 CAMPEÓN OFICIAL: Posee el cinturón. ${base} Máxima experiencia en rounds de campeonato.`
  }
  if (fighter.rank <= 5) {
    return `🔥 CONTENDIENTE TOP 5 (#${fighter.rank}): ${base} Victoria obligatoria para aspirar al título.`
  }
  if (fighter.rank <= 15) {
    return `Ranked #${fighter.rank}: ${base} Pelea crucial para posicionarse en los puestos de vanguardia.`
  }
  return `No Clasificado (Unranked): ${base} Prospecto con hambre de irrumpir en los rankings oficiales.`
}

function toBoutOpponent(
  f: FighterRank,
  playerOvr: number,
  noticeType: NoticeType,
  durationWeeks: number,
  purseMultiplier: number,
): BoutOpponent {
  const ovrDiff = f.ovr - playerOvr
  let difficulty: 'favorable' | 'even' | 'dangerous' = 'even'
  if (ovrDiff <= -3) difficulty = 'favorable'
  else if (ovrDiff >= 3) difficulty = 'dangerous'

  return {
    id: f.id,
    fighterId: f.id,
    name: f.name,
    nickname: f.nickname,
    country: f.country,
    record: { ...f.record },
    ovr: f.ovr,
    rank: f.rank,
    style: f.style,
    scoutReport: getScoutReport(f),
    difficulty,
    division: f.division,
    organization: f.organization,
    noticeType,
    durationWeeks,
    purseMultiplier,
  }
}

/**
 * Genera 4 ofertas de combate basadas directamente en la base de datos oficial
 * de rankings y peleadores de la organización en la que compite el jugador.
 */
export function generateMatchmakingBouts(
  world: WorldState,
  player: Fighter,
  seedKey: number,
): BoutOpponent[] {
  const r = makeRng(seedKey + (player.record.wins * 17) + (player.record.losses * 31))
  const org = (player.organization || (player.status === 'Pro' ? 'LFA' : 'AMATEUR')) as Organization
  const division = player.division

  // Caso: Circuito Amateur
  if (org === 'AMATEUR' || player.status === 'Amateur') {
    return generateAmateurBouts(player, division, r)
  }

  // Caso: DWCS (Dana White's Contender Series)
  if (player.contract?.isDwcs || org === 'DWCS') {
    return generateDwcsBouts(player, division, r)
  }

  // Caso: Organizaciones Profesionales (UFC, LFA, CAGE_WARRIORS, RIZIN)
  const maxRank = MAX_RANK[org] ?? 15
  const roster = (world.fighters || []).filter(
    (f) => f.organization === org && f.division === division && !f.retired && !f.isPlayer,
  )

  // Encontrar el rank actual del jugador en la organización
  const playerInWorld = world.fighters.find(
    (f) => f.isPlayer && f.organization === org && f.division === division,
  )
  const playerRank = playerInWorld?.rank ?? player.rank ?? UNRANKED

  const champion = roster.find((f) => f.rank === 0)
  const ranked = roster
    .filter((f) => f.rank >= 1 && f.rank <= maxRank)
    .sort((a, b) => a.rank - b.rank)
  const unranked = roster.filter((f) => f.rank === UNRANKED || f.rank > maxRank)

  const selectedOpponents: {
    fighter: FighterRank
    noticeType: NoticeType
    weeks: number
    mult: number
  }[] = []

  const usedIds = new Set<string>()

  const addPick = (
    fighter: FighterRank | undefined,
    noticeType: NoticeType,
    weeks: number,
    mult: number,
  ) => {
    if (!fighter || usedIds.has(fighter.id)) return false
    usedIds.add(fighter.id)
    selectedOpponents.push({ fighter, noticeType, weeks, mult })
    return true
  }

  // Lógica según estatus y ranking del jugador
  if (playerRank === 0) {
    // EL JUGADOR ES EL CAMPEÓN: Defensas de Título
    // Opción 1: Contendiente #1 obligatorio (8 semanas, Championship)
    const c1 = ranked.find((f) => f.rank === 1)
    addPick(c1, 'championship', 8, 1.5)

    // Opción 2: Contendiente #2
    const c2 = ranked.find((f) => f.rank === 2)
    addPick(c2, 'championship', 8, 1.5)

    // Opción 3: Contendiente #3 o #4
    const c3 = ranked.find((f) => f.rank === 3) || ranked.find((f) => f.rank === 4)
    addPick(c3, 'championship', 8, 1.5)

    // Opción 4: Contendiente top 5
    const c4 = ranked.find((f) => f.rank === 5) || r.pick(ranked.filter((f) => !usedIds.has(f.id)))
    addPick(c4, 'standard', 6, 1.25)
  } else if (playerRank === 1 || playerRank === 2) {
    // EL JUGADOR ES #1 O #2: Pelea por el Título Mundial disponible
    // Opción 1: ¡PELEA POR EL CAMPEONATO CONTRA EL CAMPEÓN OFICIAL!
    if (champion) {
      addPick(champion, 'championship', 8, 1.5)
    }

    // Opción 2: El otro contendiente élite del top 3
    const rivalElite = ranked.find((f) => f.rank !== playerRank && f.rank <= 3 && !usedIds.has(f.id))
    addPick(rivalElite, 'standard', 6, 1.1)

    // Opción 3: Contendiente #4-#6 defendiendo posición
    const rivalMid = ranked.find((f) => f.rank >= 4 && f.rank <= 6 && !usedIds.has(f.id))
    addPick(rivalMid, 'standard', 4, 1.0)

    // Opción 4: Aviso corto de alto riesgo (+35% bolsa)
    const rivalShort = ranked.find((f) => f.rank >= 3 && !usedIds.has(f.id))
    addPick(rivalShort, 'short_notice', 2, 1.35)
  } else if (playerRank >= 3 && playerRank <= maxRank) {
    // EL JUGADOR ESTÁ EN EL TOP 15 / TOP REGIONAL
    // Opción 1: Rival por encima para escalar puestos importantes
    const stepUpTarget = Math.max(1, playerRank - r.int(2, 4))
    const climber =
      ranked.find((f) => f.rank === stepUpTarget && !usedIds.has(f.id)) ||
      ranked.find((f) => f.rank < playerRank && !usedIds.has(f.id))
    addPick(climber, 'standard', 6, 1.1)

    // Opción 2: Rival cercano para consolidar / defender posición
    const defender =
      ranked.find((f) => Math.abs(f.rank - playerRank) === 1 && !usedIds.has(f.id)) ||
      ranked.find((f) => Math.abs(f.rank - playerRank) <= 2 && !usedIds.has(f.id))
    addPick(defender, 'standard', 4, 1.0)

    // Opción 3: Pelea trampa contra prospecto peligroso o ranked inferior
    const trap =
      unranked.find((f) => f.streak.type === 'W' && !usedIds.has(f.id)) ||
      ranked.find((f) => f.rank > playerRank && !usedIds.has(f.id)) ||
      r.pick(unranked.filter((f) => !usedIds.has(f.id)))
    addPick(trap, 'standard', 4, 1.0)

    // Opción 4: Pelea a corto plazo (Short Notice, 2 semanas, +35% bolsa)
    const shortNoticeRival =
      ranked.find((f) => !usedIds.has(f.id)) ||
      unranked.find((f) => !usedIds.has(f.id))
    addPick(shortNoticeRival, 'short_notice', 2, 1.35)
  } else {
    // EL JUGADOR ES NO CLASIFICADO (UNRANKED)
    // Opción 1: Puerta de entrada al ranking (Gatekeeper #13 - #15 en UFC, #4-#5 en regional)
    const gatekeeperMin = Math.max(1, maxRank - 2)
    const gatekeeper =
      ranked.find((f) => f.rank >= gatekeeperMin && f.rank <= maxRank && !usedIds.has(f.id)) ||
      ranked.find((f) => f.rank === maxRank && !usedIds.has(f.id))
    addPick(gatekeeper, 'standard', 5, 1.1)

    // Opción 2: Contendiente no clasificado establecido
    const unrankedA = unranked.find((f) => !usedIds.has(f.id))
    addPick(unrankedA, 'standard', 4, 1.0)

    // Opción 3: Aviso Corto (Short Notice, 2 semanas, +35% bolsa)
    const unrankedShort = unranked.find((f) => !usedIds.has(f.id))
    addPick(unrankedShort, 'short_notice', 2, 1.35)

    // Opción 4: Otro contendiente no clasificado
    const unrankedB = unranked.find((f) => !usedIds.has(f.id))
    addPick(unrankedB, 'standard', 4, 1.0)
  }

  // Rellenar hasta 4 si aún faltan rivales
  const allAvailable = [...ranked, ...unranked, champion].filter(
    (f): f is FighterRank => Boolean(f && !usedIds.has(f.id)),
  )

  while (selectedOpponents.length < 4 && allAvailable.length > 0) {
    const f = allAvailable.shift()!
    addPick(f, 'standard', 4, 1.0)
  }

  return selectedOpponents.map((item) =>
    toBoutOpponent(item.fighter, player.overall, item.noticeType, item.weeks, item.mult),
  )
}

function generateAmateurBouts(player: Fighter, division: Division, r: ReturnType<typeof makeRng>): BoutOpponent[] {
  const styles = ['BJJ Specialist', 'Pressure Wrestler', 'Muay Thai', 'Wild Brawler', 'Boxer']
  const names = [
    { name: 'Lucas Santos', country: '🇧🇷 Brasil' },
    { name: 'Jake Miller', country: '🇺🇸 Estados Unidos' },
    { name: 'Mateo Gómez', country: '🇲🇽 México' },
    { name: 'Viktor Petrov', country: '🇷🇺 Rusia' },
    { name: 'Arthur Davies', country: '🇬🇧 Reino Unido' },
    { name: 'Liam O’Connor', country: '🇮🇪 Irlanda' },
  ]

  const bouts: BoutOpponent[] = []
  for (let i = 0; i < 4; i++) {
    const pick = names[(i + r.int(0, names.length - 1)) % names.length]
    const style = styles[i % styles.length]
    const ovr = Math.max(34, Math.min(50, player.overall + r.int(-3, 3)))
    const noticeType: NoticeType = i === 0 ? 'short_notice' : 'standard'
    const durationWeeks = i === 0 ? 2 : 4
    const purseMultiplier = i === 0 ? 1.35 : 1.0

    bouts.push({
      id: `amateur-bout-${i}-${r.int(100, 999)}`,
      name: pick.name,
      nickname: '',
      country: pick.country,
      record: { wins: Math.max(1, player.record.wins + r.int(-1, 2)), losses: r.int(0, 2), draws: 0 },
      ovr,
      style,
      scoutReport: SCOUT_DESCRIPTIONS[style] ?? 'Competidor amateur con buenas bases atléticas.',
      difficulty: ovr > player.overall + 2 ? 'dangerous' : ovr < player.overall - 2 ? 'favorable' : 'even',
      division,
      organization: 'Amateur Circuit',
      noticeType,
      durationWeeks,
      purseMultiplier,
    })
  }
  return bouts
}

function generateDwcsBouts(player: Fighter, division: Division, r: ReturnType<typeof makeRng>): BoutOpponent[] {
  const dwcsFighters = [
    { name: 'Sean Strickland Jr.', country: '🇺🇸 Estados Unidos', style: 'Boxer', ovr: 72 },
    { name: 'Renan Barão Jr.', country: '🇧🇷 Brasil', style: 'BJJ Specialist', ovr: 71 },
    { name: 'Igor Volkov', country: '🇷🇺 Rusia', style: 'Pressure Wrestler', ovr: 73 },
    { name: 'Carlos Morales', country: '🇲🇽 México', style: 'Muay Thai', ovr: 70 },
    { name: 'Callum Smith', country: '🇬🇧 Reino Unido', style: 'Counter Striker', ovr: 71 },
  ]

  const bouts: BoutOpponent[] = []
  for (let i = 0; i < 4; i++) {
    const data = dwcsFighters[i % dwcsFighters.length]
    const noticeType: NoticeType = i === 0 ? 'short_notice' : 'standard'
    const durationWeeks = i === 0 ? 2 : 5
    const purseMultiplier = i === 0 ? 1.35 : 1.0

    bouts.push({
      id: `dwcs-opp-${i}-${r.int(100, 999)}`,
      name: data.name,
      nickname: 'Contender',
      country: data.country,
      record: { wins: r.int(6, 9), losses: r.int(0, 1), draws: 0 },
      ovr: data.ovr,
      style: data.style,
      scoutReport: `Aspirante de DWCS. Impresionar a Dana White con un nocaut o sumisión garantizará el contrato oficial de UFC.`,
      difficulty: data.ovr > player.overall + 2 ? 'dangerous' : data.ovr < player.overall - 2 ? 'favorable' : 'even',
      division,
      organization: 'DWCS',
      noticeType,
      durationWeeks,
      purseMultiplier,
    })
  }
  return bouts
}
