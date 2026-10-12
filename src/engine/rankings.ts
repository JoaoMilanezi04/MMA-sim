import type { BoutOpponent } from '../types/camp'
import type { Fighter } from '../types/game'
import type { FighterRank, Organization, WorldState } from '../types/career'
import { MAX_RANK, UNRANKED } from '../types/career'

export interface ProcessRankingsResult {
  updatedWorld: WorldState
  newPlayerRank: number
  isChampion: boolean
  newsHeadline: string
  newsImpact: string
}

/**
 * Normaliza y renumera la lista clasificada de una división garantizando:
 * - Exactamente 1 Campeón (rank 0)
 * - Ranks 1..maxRank únicos y consecutivos
 * - Todos los demás asignados a UNRANKED (99)
 */
function normalizeRankings(
  list: FighterRank[],
  maxRank: number,
): void {
  list.forEach((f, idx) => {
    if (idx === 0) {
      f.rank = 0
    } else if (idx <= maxRank) {
      f.rank = idx
    } else {
      f.rank = UNRANKED
    }
  })
}

/**
 * Procesa el resultado de un combate oficial y recalcula los rankings oficiales
 * de la división y organización correspondiente.
 */
export function applyFightResultToRankings(
  world: WorldState,
  player: Fighter,
  opp: BoutOpponent,
  won: boolean,
): ProcessRankingsResult {
  const org = (opp.organization || player.organization || 'UFC') as Organization
  const division = player.division

  // Si es circuito amateur, no hay rankings oficiales de organización
  if (org === 'AMATEUR' || player.status === 'Amateur') {
    return {
      updatedWorld: world,
      newPlayerRank: UNRANKED,
      isChampion: false,
      newsHeadline: won
        ? `Victoria de fogueo: ${player.name} derrotó a ${opp.name}`
        : `Derrota formativa: ${player.name} cayó ante ${opp.name}`,
      newsImpact: won ? '+1 victoria amateur' : '+1 derrota amateur',
    }
  }

  const maxRank = MAX_RANK[org] ?? 15
  const fighters = [...world.fighters.map((f) => ({ ...f, record: { ...f.record }, streak: { ...f.streak } }))]

  // 1. Obtener o crear la entidad del jugador en world.fighters
  let playerEntry = fighters.find(
    (f) => f.isPlayer && f.organization === org && f.division === division,
  )

  if (!playerEntry) {
    playerEntry = {
      id: `player-${player.id}`,
      name: player.name,
      nickname: player.nickname || '',
      country: player.country,
      age: player.age,
      record: {
        wins: player.record.wins + (won ? 1 : 0),
        losses: player.record.losses + (won ? 0 : 1),
        draws: player.record.draws,
      },
      ovr: player.overall,
      rank: player.rank ?? UNRANKED,
      streak: won
        ? { count: Math.max(1, (player.record.wins || 0) + 1), type: 'W' }
        : { count: 1, type: 'L' },
      style: player.archetype ?? 'Well-Rounded',
      organization: org,
      division,
      isPlayer: true,
    }
    fighters.push(playerEntry)
  } else {
    playerEntry.record = {
      wins: player.record.wins + (won ? 1 : 0),
      losses: player.record.losses + (won ? 0 : 1),
      draws: player.record.draws,
    }
    playerEntry.ovr = player.overall
    playerEntry.streak = won
      ? { count: playerEntry.streak?.type === 'W' ? playerEntry.streak.count + 1 : 1, type: 'W' }
      : { count: playerEntry.streak?.type === 'L' ? playerEntry.streak.count + 1 : 1, type: 'L' }
  }

  // 2. Obtener la entidad del rival en world.fighters
  let oppEntry = fighters.find(
    (f) =>
      (opp.fighterId && f.id === opp.fighterId) ||
      f.id === opp.id ||
      (f.name.toLowerCase() === opp.name.toLowerCase() && f.organization === org && f.division === division),
  )

  if (oppEntry) {
    if (won) {
      oppEntry.record.losses++
      oppEntry.streak = {
        count: oppEntry.streak.type === 'L' ? oppEntry.streak.count + 1 : 1,
        type: 'L',
      }
    } else {
      oppEntry.record.wins++
      oppEntry.streak = {
        count: oppEntry.streak.type === 'W' ? oppEntry.streak.count + 1 : 1,
        type: 'W',
      }
    }
  }

  const oppRankBefore = oppEntry?.rank ?? opp.rank ?? UNRANKED
  const playerRankBefore = playerEntry.rank

  let newsHeadline = ''
  let newsImpact = ''

  // 3. Obtener lista ordenada de contendientes clasificados de esta división
  // Campeón en index 0, Top 1..maxRank en índices 1..maxRank
  const divFighters = fighters.filter(
    (f) => f.organization === org && f.division === division && !f.retired,
  )

  const rankedList = divFighters
    .filter((f) => f.rank !== UNRANKED && f.rank <= maxRank)
    .sort((a, b) => a.rank - b.rank)

  if (won) {
    // ==========================================
    // VICTORIA DEL JUGADOR
    // ==========================================
    if (oppRankBefore === 0) {
      // CASO A: ¡VENCE AL CAMPEÓN! Se corona nuevo campeón mundial / regional
      // El jugador va al puesto 0. El excampeón va al puesto 1.
      const withoutPlayerOrChamp = rankedList.filter(
        (f) => f.id !== playerEntry!.id && (oppEntry ? f.id !== oppEntry.id : true),
      )

      const newOrder: FighterRank[] = [playerEntry]
      if (oppEntry) {
        newOrder.push(oppEntry)
      }
      newOrder.push(...withoutPlayerOrChamp)
      normalizeRankings(newOrder, maxRank)

      newsHeadline = `¡NUEVO CAMPEÓN DE ${org}! ${player.name} derrota a ${opp.name} y se consagra campeón de peso ${division}.`
      newsImpact = `¡Cinturón obtenido! El excampeón ${opp.name} cae al puesto #1.`
    } else if (oppRankBefore <= maxRank) {
      // CASO B: Vence a un rival clasificado
      const withoutPlayer = rankedList.filter((f) => f.id !== playerEntry!.id)
      
      // Encontrar la posición donde estaba el rival en la lista
      const oppIdx = withoutPlayer.findIndex((f) => oppEntry && f.id === oppEntry.id)
      const targetRank = oppIdx !== -1 ? oppIdx : Math.min(oppRankBefore, withoutPlayer.length)

      // El jugador toma la posición del rival derrotado
      withoutPlayer.splice(targetRank, 0, playerEntry)

      // El rival desciende 2 posiciones por la derrota
      if (oppEntry) {
        const curOppIdx = withoutPlayer.findIndex((f) => f.id === oppEntry!.id)
        if (curOppIdx !== -1) {
          withoutPlayer.splice(curOppIdx, 1)
          const newOppIdx = Math.min(withoutPlayer.length, curOppIdx + 2)
          withoutPlayer.splice(newOppIdx, 0, oppEntry)
        }
      }

      normalizeRankings(withoutPlayer, maxRank)

      newsHeadline = playerRankBefore === UNRANKED
        ? `¡Irrupción en los rankings! ${player.name} entra al Top de ${org} (#${playerEntry.rank}) tras superar a ${opp.name}.`
        : `¡Ascenso en ${org}! ${player.name} sube al puesto #${playerEntry.rank} tras vencer a ${opp.name}.`
      newsImpact = `Sube a la posición #${playerEntry.rank}. ${opp.name} desciende en la tabla.`
    } else {
      // CASO C: Vence a un rival No Clasificado (Unranked)
      if (playerRankBefore !== UNRANKED) {
        // El jugador ya estaba en el ranking: defiende su posición
        newsHeadline = `${player.name} defiende con éxito su lugar en los rankings (#${playerRankBefore}) ante ${opp.name}.`
        newsImpact = `Mantiene el puesto #${playerRankBefore} con racha activa.`
      } else {
        // Ambos eran unranked: si tiene racha de 3+, entra al último puesto (#maxRank)
        if (playerEntry.streak.count >= 3 && rankedList.length >= maxRank) {
          const withoutPlayer = rankedList.filter((f) => f.id !== playerEntry!.id)
          withoutPlayer.push(playerEntry)
          normalizeRankings(withoutPlayer, maxRank)
          newsHeadline = `¡Entrada al ranking! Con 3 victorias seguidas, ${player.name} ingresa como #${playerEntry.rank} en ${org}.`
          newsImpact = `Debuta en el Top oficial de ${division}.`
        } else {
          newsHeadline = `Victoria en combate no clasificado: ${player.name} derrotó a ${opp.name}.`
          newsImpact = `Suma +1 victoria en ${org}. Continúa su ascenso al Top 15.`
        }
      }
    }
  } else {
    // ==========================================
    // DERROTA DEL JUGADOR
    // ==========================================
    if (playerRankBefore === 0) {
      // Pierde el título como campeón: el rival se corona
      if (oppEntry) {
        const withoutCombatants = rankedList.filter(
          (f) => f.id !== playerEntry!.id && f.id !== oppEntry!.id,
        )
        const newOrder: FighterRank[] = [oppEntry, playerEntry, ...withoutCombatants]
        normalizeRankings(newOrder, maxRank)
      }
      newsHeadline = `¡Pérdida del título! ${player.name} cae ante ${opp.name} y entrega el campeonato de ${division}.`
      newsImpact = `Deja el cinturón y queda clasificado como contendiente #1.`
    } else if (playerRankBefore <= maxRank) {
      // El jugador pierde estando en el ranking: cae 2-3 puestos o sale del ranking
      const withoutPlayer = rankedList.filter((f) => f.id !== playerEntry!.id)
      const newDropIdx = playerRankBefore + 2

      if (newDropIdx > maxRank) {
        playerEntry.rank = UNRANKED
        normalizeRankings(withoutPlayer, maxRank)
        newsHeadline = `Caída amarga: ${player.name} pierde ante ${opp.name} y sale del ranking oficial de ${org}.`
        newsImpact = `Desciende a la lista de contendientes No Clasificados.`
      } else {
        withoutPlayer.splice(Math.min(withoutPlayer.length, newDropIdx), 0, playerEntry)
        normalizeRankings(withoutPlayer, maxRank)
        newsHeadline = `Duro revés: ${player.name} cae derrotado ante ${opp.name} y desciende al puesto #${playerEntry.rank}.`
        newsImpact = `Cae posiciones en el ranking de ${division}.`
      }
    } else {
      // El jugador ya era unranked y pierde
      newsHeadline = `Derrota ante ${opp.name}: ${player.name} frena su avance hacia los rankings.`
      newsImpact = `Permanece como no clasificado en ${org}.`
    }
  }

  const finalPlayerRank = playerEntry.rank
  const isChampion = finalPlayerRank === 0

  return {
    updatedWorld: {
      ...world,
      fighters,
    },
    newPlayerRank: finalPlayerRank,
    isChampion,
    newsHeadline,
    newsImpact,
  }
}
