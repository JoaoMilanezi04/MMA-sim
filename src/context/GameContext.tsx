/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import type { ReactNode } from 'react'
import { DIVISION_LIMITS, type DietId, type Fighter, type FighterContract, type GameState, type Schedule, type Section } from '../types/game'
import type { ActiveBout, BoutOpponent, CampIntensity, CornerDirective, FightResult, GamePlan, PressStance, PromoActionId } from '../types/camp'
import type { JobId } from '../types/lifestyle'
import { JOBS, SPONSORS, SUPPORT_STAFF } from '../types/lifestyle'
import { EMPTY_SCHEDULE, getGym } from '../components/gym/data'
import { trainWeek } from '../components/gym/engine'
import { createWorld, ensureWorldRosters } from '../data/roster'
import { insertPlayerIntoRanking, simulateAmateurFight, simulateWorldWeek } from '../engine/world'
import { applyFightResultToRankings } from '../engine/rankings'
import { applyPlayerAging } from '../engine/aging'

const WEEKS_PER_YEAR = 52
const START_YEAR = 2025
/** The gym fee is due every 4 weeks. */
const WEEKS_PER_MONTH = 4
const BOUT_STORAGE_KEY = 'mma_sim_active_bout'
const SAVE_GAME_KEY = 'mma_sim_game_state_v1'

function loadSavedBout(): ActiveBout | null {
  try {
    const raw = localStorage.getItem(BOUT_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveBout(bout: ActiveBout | null) {
  try {
    if (bout) localStorage.setItem(BOUT_STORAGE_KEY, JSON.stringify(bout))
    else localStorage.removeItem(BOUT_STORAGE_KEY)
  } catch {
    // ignore in environments without localStorage
  }
}

/** Dev shortcut fighter, used by the "Usar peleador de prueba" button. */
export const TEST_FIGHTER: Fighter = {
  id: 'player-test',
  name: 'João Milanezi',
  nickname: 'The Ripper',
  country: '🇧🇷 Brasil',
  age: 18,
  height: 175,
  reach: 178,
  record: { wins: 0, losses: 0, draws: 0 },
  money: 500,
  fans: 0,
  division: 'Featherweight',
  weight: 144.6,
  targetWeight: 145,
  energy: 100,
  maxEnergy: 100,
  overall: 40,
  stats: {
    punching: 40,
    kicking: 38,
    headMovement: 35,
    defense: 37,
    takedowns: 36,
    takedownDefense: 38,
    clinch: 35,
    submissions: 34,
    groundControl: 36,
    submissionDefense: 35,
    cardio: 45,
    power: 40,
    speed: 44,
    chin: 42,
    recovery: 43,
  },
  status: 'Amateur',
  reputation: 'Neutral Professional',
  avatar: '/avatars/avatar-1.jpg',
  appearance: {
    skin: 1,
    hairStyle: 1,
    hairColor: 0,
    facialHair: 1,
    eyebrows: 0,
  },
  archetype: 'BJJ Specialist',
}

const initialState: GameState = {
  currentWeek: 1,
  currentYear: 2025,
  player: null,
  history: [],
  schedule: EMPTY_SCHEDULE,
  diet: 'maintenance',
  gymId: 'local',
  strikingPartnerId: null,
  grapplingPartnerId: null,
  world: createWorld(12345),
  activeBout: loadSavedBout(),
  jobId: 'full_time_athlete',
  activeSponsors: [],
  hiredStaff: [],
}

function getInitialGameState(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_GAME_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as GameState
      if (parsed && parsed.player) {
        // Auto-sanitización de peso físico para partidas guardadas
        const limit = DIVISION_LIMITS[parsed.player.division] || 155
        const minWeight = Number((limit - 1.5).toFixed(1))
        const walkingWeight = parsed.player.walkingWeight ?? Number((limit + 14.0).toFixed(1))

        let sanitizedWeight = parsed.player.currentWeight ?? parsed.player.weight
        let sanitizedDiet = parsed.diet || 'maintenance'

        if (!parsed.activeBout) {
          // Fuera de campamento activo: dieta mantenimiento y peso natural
          sanitizedDiet = 'maintenance'
          if (sanitizedWeight < minWeight) {
            sanitizedWeight = walkingWeight
          }
        } else {
          if (sanitizedWeight < minWeight) {
            sanitizedWeight = minWeight
          }
        }

        return {
          ...parsed,
          diet: sanitizedDiet,
          jobId: parsed.jobId || 'full_time_athlete',
          activeSponsors: parsed.activeSponsors || [],
          hiredStaff: parsed.hiredStaff || [],
          player: {
            ...parsed.player,
            weight: sanitizedWeight,
            currentWeight: sanitizedWeight,
            walkingWeight,
          },
          world: ensureWorldRosters(parsed.world),
        }
      }
    }
  } catch (err) {
    console.error('Error loading game from localStorage:', err)
  }
  return {
    ...initialState,
    world: ensureWorldRosters(initialState.world),
  }
}

type Action =
  | { type: 'NEXT_WEEK' }
  | { type: 'CREATE_CHARACTER'; fighter: Fighter }
  | { type: 'SET_SCHEDULE'; schedule: Schedule }
  | { type: 'SET_DIET'; diet: DietId }
  | { type: 'SWITCH_GYM'; gymId: string }
  | { type: 'SET_PARTNER'; kind: 'striking' | 'grappling'; id: string | null }
  | { type: 'SIMULATE_AMATEUR_FIGHT' }
  | { type: 'DEV_INSERT_RANKING' }
  | { type: 'SIGN_CONTRACT'; contract: FighterContract }
  | { type: 'ACCEPT_BOUT'; opponent: BoutOpponent; weeks?: number }
  | { type: 'SET_GAME_PLAN'; gamePlan: GamePlan }
  | { type: 'SET_CAMP_INTENSITY'; intensity: CampIntensity }
  | { type: 'FINISH_FIGHT_NIGHT'; result: FightResult }
  | { type: 'CANCEL_BOUT' }
  | { type: 'PERFORM_PROMO'; actionId: PromoActionId; stance?: PressStance; interviewAnswer?: 'humble' | 'provocative' }
  | { type: 'SET_CORNER_TACTIC'; tactic: CornerDirective }
  | { type: 'SET_JOB'; jobId: JobId }
  | { type: 'TOGGLE_SPONSOR'; sponsorId: string }
  | { type: 'TOGGLE_STAFF'; staffId: string }
  | { type: 'DISMISS_WEEKLY_REPORT' }
  | { type: 'RESET_GAME' }

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'CREATE_CHARACTER':
      return {
        ...state,
        player: action.fighter,
        history: [
          {
            id: 'h-0',
            week: state.currentWeek,
            year: state.currentYear,
            text: `${action.fighter.name} begins an amateur MMA career.`,
          },
        ],
      }
    case 'SET_SCHEDULE':
      return { ...state, schedule: action.schedule }
    case 'SET_DIET':
      return { ...state, diet: action.diet }
    case 'SET_PARTNER':
      return action.kind === 'striking'
        ? { ...state, strikingPartnerId: action.id }
        : { ...state, grapplingPartnerId: action.id }
    case 'SWITCH_GYM': {
      if (!state.player || action.gymId === state.gymId) return state
      const fee = getGym(action.gymId).fee
      // Joining a gym costs the first monthly fee, paid upfront.
      if (state.player.money < fee) return state
      return {
        ...state,
        gymId: action.gymId,
        player: { ...state.player, money: state.player.money - fee },
        history: [
          {
            id: `h-${state.history.length}`,
            week: state.currentWeek,
            year: state.currentYear,
            text: `Te uniste a ${getGym(action.gymId).name} (−$${fee}).`,
          },
          ...state.history,
        ],
      }
    }
    case 'DEV_INSERT_RANKING': {
      if (!state.player) return state
      return {
        ...state,
        world: insertPlayerIntoRanking(state.world, state.player),
      }
    }
    case 'SIGN_CONTRACT': {
      if (!state.player) return state
      const player = state.player
      const updatedPlayer: Fighter = {
        ...player,
        status: 'Pro',
        organization: action.contract.organization,
        contract: action.contract,
      }
      let currentWorld = ensureWorldRosters(state.world)
      const targetOrg = action.contract.organization
      if (targetOrg && targetOrg !== 'DWCS') {
        const playerInWorld = currentWorld.fighters.some(
          (f) => f.isPlayer && f.organization === targetOrg && f.division === player.division,
        )
        if (!playerInWorld) {
          currentWorld = {
            ...currentWorld,
            fighters: [
              ...currentWorld.fighters,
              {
                id: `player-${player.id}`,
                name: player.name,
                nickname: player.nickname || '',
                country: player.country,
                age: player.age,
                record: { ...player.record },
                ovr: player.overall,
                rank: 99,
                streak: { count: 1, type: 'W' },
                style: player.archetype || 'Well-Rounded',
                organization: targetOrg,
                division: player.division,
                isPlayer: true,
              },
            ],
          }
        }
      }
      const headline = action.contract.isDwcs
        ? `¡Oportunidad Dorada! ${state.player.name} firma para competir en Dana White's Contender Series (DWCS)`
        : `¡Salto al Profesionalismo! ${state.player.name} firma contrato con ${action.contract.organizationName}`
      const details = action.contract.isDwcs
        ? `Una oportunidad única en Las Vegas ante los ojos de Dana White para ganar un contrato con UFC.`
        : `Contrato por ${action.contract.totalFights} combates. Bolsa pactada: $${action.contract.showPurse.toLocaleString()} por presentación / $${action.contract.winPurse.toLocaleString()} por victoria.`
      return {
        ...state,
        player: updatedPlayer,
        world: {
          ...currentWorld,
          news: [
            {
              id: `contract-${state.currentYear}-${state.currentWeek}-${Date.now()}`,
              week: state.currentWeek,
              year: state.currentYear,
              headline,
              details,
              eventType: 'GENERAL',
              impact: `Nuevo peleador profesional en la división ${state.player.division}.`,
            },
            ...currentWorld.news,
          ],
        },
        history: [
          {
            id: `h-${state.history.length}`,
            week: state.currentWeek,
            year: state.currentYear,
            text: headline,
          },
          ...state.history,
        ],
      }
    }
    case 'SIMULATE_AMATEUR_FIGHT': {
      if (!state.player) return state
      const res = simulateAmateurFight(state.world.seed, state.player)
      const isOfferEligible = res.player.record.wins >= 4 && res.player.status === 'Amateur'
      const updatedPlayer: Fighter = {
        ...res.player,
        money: res.player.money + 100, // $100 per amateur bout
        fans: res.player.fans + (res.player.record.wins > state.player.record.wins ? 50 : 10),
      }
      return {
        ...state,
        player: updatedPlayer,
        world: {
          ...state.world,
          seed: res.seed,
          news: [
            {
              id: `amateur-${state.currentYear}-${state.currentWeek}-${Date.now()}`,
              week: state.currentWeek,
              year: state.currentYear,
              headline: `Circuito Amateur: ${res.player.name} compitió este fin de semana`,
              details: res.text,
              eventType: 'REGIONAL',
              impact: isOfferEligible ? '¡Llegó a 4 victorias! Ofertas profesionales disponibles.' : `Récord actual: ${res.player.record.wins}-${res.player.record.losses}.`,
            },
            ...state.world.news,
          ],
        },
        history: [
          {
            id: `h-${state.history.length}`,
            week: state.currentWeek,
            year: state.currentYear,
            text: res.text,
          },
          ...state.history,
        ],
      }
    }
    case 'ACCEPT_BOUT': {
      if (!state.player) return state
      const baseShowPurse = state.player.contract?.showPurse ?? (state.player.status === 'Pro' ? 2000 : 150)
      const baseWinPurse = state.player.contract?.winPurse ?? (state.player.status === 'Pro' ? 2000 : 150)
      const totalWeeks = action.weeks ?? action.opponent.durationWeeks ?? 4
      const purseMultiplier = action.opponent.purseMultiplier ?? (totalWeeks <= 2 ? 1.35 : totalWeeks >= 8 ? 1.5 : 1.0)
      const showPurse = Math.round(baseShowPurse * purseMultiplier)
      const winPurse = Math.round(baseWinPurse * purseMultiplier)
      const noticeType = action.opponent.noticeType ?? (totalWeeks <= 2 ? 'short_notice' : totalWeeks >= 8 ? 'championship' : 'standard')
      const baseHype = Math.min(80, 20 + Math.floor((state.player.fans / 200)) + (action.opponent.ovr > 70 ? 15 : 5))
      const activeBout: ActiveBout = {
        id: `bout-${Date.now()}`,
        opponent: action.opponent,
        totalWeeks,
        weeksRemaining: totalWeeks,
        noticeType,
        gamePlan: 'anti-wrestling',
        intensity: 'normal',
        showPurse,
        winPurse,
        organization: action.opponent.organization || (state.player.organization ?? (state.player.status === 'Pro' ? 'LFA' : 'Amateur Circuit')),
        isDwcs: state.player.contract?.isDwcs,
        hype: baseHype,
        promoEnergySpent: 0,
        composureModifier: 0,
        opponentComposureModifier: 0,
        trashTalkActive: false,
      }
      saveBout(activeBout)
      return {
        ...state,
        activeBout,
        history: [
          {
            id: `h-${state.history.length}`,
            week: state.currentWeek,
            year: state.currentYear,
            text: `Pactaste combate contra ${action.opponent.name} (${action.opponent.record.wins}-${action.opponent.record.losses}). Campamento de 4 semanas iniciado (Hype Inicial: ${baseHype}%).`,
          },
          ...state.history,
        ],
      }
    }
    case 'SET_GAME_PLAN': {
      if (!state.activeBout) return state
      const updatedBout: ActiveBout = { ...state.activeBout, gamePlan: action.gamePlan }
      saveBout(updatedBout)
      return { ...state, activeBout: updatedBout }
    }
    case 'SET_CAMP_INTENSITY': {
      if (!state.activeBout) return state
      const updatedBout: ActiveBout = { ...state.activeBout, intensity: action.intensity }
      saveBout(updatedBout)
      return { ...state, activeBout: updatedBout }
    }
    case 'PERFORM_PROMO': {
      if (!state.player || !state.activeBout) return state
      const bout = state.activeBout
      let energyCost = 0
      let hypeGain = 0
      let fanGain = 0
      let composureMod = bout.composureModifier || 0
      let oppComposureMod = bout.opponentComposureModifier || 0
      let trashTalk = bout.trashTalkActive || false
      let actionTitle = ''

      if (action.actionId === 'stream') {
        energyCost = 10
        hypeGain = 10
        fanGain = 150
        actionTitle = 'Stream en Vivo / Contenido de Entrenamiento'
      } else if (action.actionId === 'interview') {
        energyCost = 15
        if (action.interviewAnswer === 'provocative') {
          hypeGain = 25
          fanGain = 350
          trashTalk = true
          actionTitle = 'Entrevista Picante (ESPN / Ariel Helwani) - Declaraciones explosivas'
        } else {
          hypeGain = 15
          fanGain = 250
          composureMod += 2
          actionTitle = 'Entrevista Profesional (ESPN / Ariel Helwani) - Enfoque humilde y marcial'
        }
      } else if (action.actionId === 'press_conference') {
        energyCost = 25
        fanGain = 500
        if (action.stance === 'trash_talk') {
          hypeGain = 40
          trashTalk = true
          actionTitle = 'Conferencia de Prensa Oficial - Trash Talk agresivo en el cara a cara'
        } else if (action.stance === 'respect') {
          hypeGain = 25
          composureMod += 5
          actionTitle = 'Conferencia de Prensa Oficial - Respeto marcial (+5% Compostura)'
        } else {
          hypeGain = 30
          if (Math.random() < 0.75) {
            oppComposureMod -= 10
            actionTitle = 'Conferencia de Prensa Oficial - Guerra psicológica exitosa (Rival intimidado)'
          } else {
            actionTitle = 'Conferencia de Prensa Oficial - Guerra psicológica en el cara a cara'
          }
        }
      }

      const newHype = Math.min(100, (bout.hype || 20) + hypeGain)
      const newPromoEnergy = (bout.promoEnergySpent || 0) + energyCost
      const updatedPlayer: Fighter = {
        ...state.player,
        fans: state.player.fans + fanGain,
      }

      const updatedBout: ActiveBout = {
        ...bout,
        hype: newHype,
        promoEnergySpent: newPromoEnergy,
        composureModifier: composureMod,
        opponentComposureModifier: oppComposureMod,
        trashTalkActive: trashTalk,
      }
      saveBout(updatedBout)

      return {
        ...state,
        player: updatedPlayer,
        activeBout: updatedBout,
        history: [
          {
            id: `h-${state.history.length}`,
            week: state.currentWeek,
            year: state.currentYear,
            text: `Promoción de combate: ${actionTitle} (+${hypeGain}% Hype, +${fanGain} fans).`,
          },
          ...state.history,
        ],
      }
    }
    case 'SET_CORNER_TACTIC': {
      if (!state.activeBout) return state
      const updatedBout: ActiveBout = { ...state.activeBout, selectedCornerTactic: action.tactic }
      saveBout(updatedBout)
      return { ...state, activeBout: updatedBout }
    }
    case 'CANCEL_BOUT': {
      saveBout(null)
      return { ...state, activeBout: null, diet: 'maintenance' }
    }
    case 'SET_JOB': {
      if (!state.player) return state
      const job = JOBS.find((j) => j.id === action.jobId) || JOBS[0]
      const maxEnergy = Math.max(50, 100 - job.energyCost)
      const updatedPlayer: Fighter = {
        ...state.player,
        maxEnergy,
        energy: Math.min(state.player.energy, maxEnergy),
      }
      return {
        ...state,
        jobId: action.jobId,
        player: updatedPlayer,
        history: [
          {
            id: `h-${state.history.length}`,
            week: state.currentWeek,
            year: state.currentYear,
            text: `Ocupación actualizada: ${job.title} (${job.salaryWeekly > 0 ? `+$${job.salaryWeekly}/sem` : 'Tiempo Completo'}).`,
          },
          ...state.history,
        ],
      }
    }
    case 'TOGGLE_SPONSOR': {
      const active = state.activeSponsors || []
      const isSigned = active.includes(action.sponsorId)
      const sponsor = SPONSORS.find((s) => s.id === action.sponsorId)
      const nextActive = isSigned
        ? active.filter((id) => id !== action.sponsorId)
        : [...active, action.sponsorId]
      return {
        ...state,
        activeSponsors: nextActive,
        history: sponsor
          ? [
              {
                id: `h-${state.history.length}`,
                week: state.currentWeek,
                year: state.currentYear,
                text: isSigned
                  ? `Contrato con patrocinador ${sponsor.name} rescindido.`
                  : `¡Acuerdo comercial firmado con ${sponsor.name}! (+$${sponsor.payoutPerFight.toLocaleString()}/pelea).`,
              },
              ...state.history,
            ]
          : state.history,
      }
    }
    case 'TOGGLE_STAFF': {
      const hired = state.hiredStaff || []
      const isHired = hired.includes(action.staffId)
      const staff = SUPPORT_STAFF.find((s) => s.id === action.staffId)
      const nextHired = isHired
        ? hired.filter((id) => id !== action.staffId)
        : [...hired, action.staffId]
      return {
        ...state,
        hiredStaff: nextHired,
        history: staff
          ? [
              {
                id: `h-${state.history.length}`,
                week: state.currentWeek,
                year: state.currentYear,
                text: isHired
                  ? `Prescindiste de los servicios de ${staff.name} (${staff.role}).`
                  : `Contrataste a ${staff.name} (${staff.role}) por $${staff.monthlyFee}/mes.`,
              },
              ...state.history,
            ]
          : state.history,
      }
    }
    case 'FINISH_FIGHT_NIGHT': {
      if (!state.player || !state.activeBout) return state
      const { won, payout, fansGained, method, narrative } = action.result
      const opp = state.activeBout.opponent
      const updatedWins = won ? state.player.record.wins + 1 : state.player.record.wins
      const updatedLosses = won ? state.player.record.losses : state.player.record.losses + 1

      // Pagos de patrocinadores activos
      let sponsorTotal = 0
      const activeSponsorList = state.activeSponsors || []
      for (const spId of activeSponsorList) {
        const sp = SPONSORS.find((s) => s.id === spId)
        if (sp) {
          sponsorTotal += sp.payoutPerFight
        }
      }

      // Multiplicador de Hype de Pelea y Bonos de Taquilla / PPV
      const boutHype = state.activeBout.hype || 20
      const hypeMultiplier = boutHype >= 86 ? 2.5 : boutHype >= 56 ? 1.5 : boutHype >= 26 ? 1.2 : 1.0
      const ppvBonus = Math.round(state.activeBout.showPurse * (boutHype / 100) * 0.75)
      const totalFightEarnings = payout + sponsorTotal + ppvBonus

      let updatedContract = state.player.contract
        ? {
            ...state.player.contract,
            fightsRemaining: Math.max(0, state.player.contract.fightsRemaining - 1),
          }
        : undefined

      let newOrg = state.player.organization
      let extraNewsText = ''
      let ufcLockoutWeeks = state.player.ufcLockoutWeeks
      let isRegionalChampion = state.player.isRegionalChampion
      let fansAdjustment = won ? Math.round(fansGained * hypeMultiplier) : 0

      if (!won) {
        if (state.activeBout.trashTalkActive) {
          // Trash Talk Agresivo castiga con el doble de daño a los seguidores
          fansAdjustment = -Math.min(state.player.fans, Math.floor(state.player.fans * 0.35))
          extraNewsText += ' [Penalización: Tu Trash Talk previo se volvió en tu contra].'
        } else {
          fansAdjustment = -Math.min(state.player.fans, Math.floor(state.player.fans * 0.15))
        }
      }

      // DWCS Bout Outcome
      if (state.activeBout.isDwcs) {
        if (won) {
          if (action.result.contractGranted) {
            newOrg = 'UFC'
            updatedContract = {
              id: `ufc-contract-${Date.now()}`,
              organization: 'UFC',
              organizationName: 'Ultimate Fighting Championship (UFC)',
              totalFights: 4,
              fightsRemaining: 4,
              showPurse: 12000,
              winPurse: 12000,
              description: 'Contrato oficial de UFC ganado tras impresionar a Dana White en DWCS.',
            }
            extraNewsText = ' ¡DANA WHITE LE OTORGA UN CONTRATO OFICIAL DE UFC!'
          } else {
            // Won by decision without contract
            newOrg = 'LFA'
            updatedContract = undefined
            extraNewsText = ' Pese a la victoria, Dana White decidió no ofrecerle contrato de UFC por falta de agresividad.'
          }
        } else {
          // Lost in DWCS
          newOrg = 'LFA'
          updatedContract = undefined
          ufcLockoutWeeks = 52
          fansAdjustment = -Math.min(state.player.fans, Math.floor(state.player.fans * 0.2))
          extraNewsText = ' Derrota en DWCS: Las puertas de UFC quedan cerradas por 52 semanas.'
        }
      } else if (
        state.player.contract?.organization === 'LFA' &&
        won &&
        updatedContract &&
        updatedContract.fightsRemaining === 0
      ) {
        // LFA Championship Rule: 3 fights completed and won!
        newOrg = 'UFC'
        isRegionalChampion = true
        updatedContract = {
          id: `ufc-champion-contract-${Date.now()}`,
          organization: 'UFC',
          organizationName: 'Ultimate Fighting Championship (UFC)',
          totalFights: 4,
          fightsRemaining: 4,
          showPurse: 20000,
          winPurse: 20000,
          description: 'Contrato élite de UFC como Campeón Regional de LFA con debut en Cartelera Principal.',
          tierTitle: 'Campeón Regional LFA',
        }
        extraNewsText = ' ¡SE CORONA CAMPEÓN DE LFA Y FIRMA CONTRATO ESTELAR CON UFC ($20K / $20K)!'
      }

      const updatedPlayer: Fighter = {
        ...state.player,
        record: {
          ...state.player.record,
          wins: updatedWins,
          losses: updatedLosses,
        },
        money: state.player.money + totalFightEarnings,
        fans: Math.max(0, state.player.fans + fansAdjustment),
        organization: newOrg,
        contract: updatedContract,
        ufcLockoutWeeks,
        isRegionalChampion,
        status: state.player.status === 'Amateur' && state.activeBout.organization !== 'Amateur Circuit' ? 'Pro' : state.player.status,
      }

      saveBout(null)

      const rankResult = applyFightResultToRankings(
        state.world,
        updatedPlayer,
        opp,
        won,
      )

      const finalPlayer: Fighter = {
        ...updatedPlayer,
        rank: rankResult.newPlayerRank,
        isRegionalChampion: isRegionalChampion || rankResult.isChampion,
      }

      const headline = rankResult.newsHeadline || (won
        ? `¡Victoria contundente! ${state.player.name} derrotó a ${opp.name} por ${method}`
        : `Derrota amarga: ${state.player.name} cayó ante ${opp.name} por ${method}`)

      const sponsorNote = sponsorTotal > 0 ? ` (+$${sponsorTotal.toLocaleString()} patrocinio)` : ''
      const ppvNote = ppvBonus > 0 ? ` (+$${ppvBonus.toLocaleString()} bono Hype/PPV)` : ''

      return {
        ...state,
        player: finalPlayer,
        diet: 'maintenance',
        activeBout: null,
        world: {
          ...rankResult.updatedWorld,
          news: [
            {
              id: `fight-${state.currentYear}-${state.currentWeek}-${Date.now()}`,
              week: state.currentWeek,
              year: state.currentYear,
              headline: headline + extraNewsText,
              details: narrative,
              eventType: 'GENERAL',
              impact: rankResult.newsImpact || (won ? `Gana $${totalFightEarnings.toLocaleString()}${sponsorNote}${ppvNote} y suma +${fansAdjustment.toLocaleString()} fanáticos (Hype x${hypeMultiplier}).` : `Bolsa cobrada: $${totalFightEarnings.toLocaleString()}${sponsorNote}.`),
            },
            ...rankResult.updatedWorld.news,
          ],
        },
        history: [
          {
            id: `h-${state.history.length}`,
            week: state.currentWeek,
            year: state.currentYear,
            text: headline + extraNewsText + sponsorNote + ppvNote,
          },
          ...state.history,
        ],
      }
    }
    case 'NEXT_WEEK': {
      if (!state.player) return state
      const rollover = state.currentWeek >= WEEKS_PER_YEAR
      const currentWeek = rollover ? 1 : state.currentWeek + 1
      const currentYear = rollover ? state.currentYear + 1 : state.currentYear
      const totalWeeks = (currentYear - START_YEAR) * WEEKS_PER_YEAR + currentWeek
      const hasActiveBout = Boolean(state.activeBout)
      const currentDiet = hasActiveBout ? state.diet : 'maintenance'
      const isMonthlyBilling = (totalWeeks - 1) % WEEKS_PER_MONTH === 0
      const trained = trainWeek({
        player: state.player,
        schedule: state.schedule,
        diet: currentDiet,
        gymId: state.gymId,
        strikingPartnerId: state.strikingPartnerId,
        grapplingPartnerId: state.grapplingPartnerId,
        billing: isMonthlyBilling,
        hasActiveBout,
        campIntensity: state.activeBout?.intensity,
        promoEnergyCost: state.activeBout?.promoEnergySpent,
        hasPhysio: Boolean(state.hiredStaff?.includes('physio')),
      })

      // Cálculo de salario semanal de trabajo de subsistencia
      const currentJob = JOBS.find((j) => j.id === (state.jobId || 'full_time_athlete')) || JOBS[0]
      const jobSalary = currentJob.salaryWeekly

      // Deducción mensual de personal contratado
      let staffMonthlyCosts = 0
      if (isMonthlyBilling && state.hiredStaff && state.hiredStaff.length > 0) {
        for (const staffId of state.hiredStaff) {
          const m = SUPPORT_STAFF.find((s) => s.id === staffId)
          if (m) staffMonthlyCosts += m.monthlyFee
        }
      }

      const netMoney = Math.max(0, trained.player.money + jobSalary - staffMonthlyCosts)
      const maxEnergy = Math.max(50, 100 - currentJob.energyCost)

      let player: Fighter = {
        ...trained.player,
        money: netMoney,
        maxEnergy,
        energy: maxEnergy,
        age: rollover ? state.player.age + 1 : state.player.age,
        ufcLockoutWeeks:
          state.player.ufcLockoutWeeks && state.player.ufcLockoutWeeks > 0
            ? state.player.ufcLockoutWeeks - 1
            : undefined,
      }
      if (rollover) {
        player = applyPlayerAging(player)
      }
      const world = simulateWorldWeek({
        world: state.world,
        totalWeeks,
        week: currentWeek,
        year: currentYear,
        rollover,
        player,
        playerDivision: player.division,
        extraNews: [],
      })

      let activeBout = state.activeBout
      let campNote = ''
      if (activeBout) {
        const remaining = Math.max(0, activeBout.weeksRemaining - 1)
        activeBout = {
          ...activeBout,
          weeksRemaining: remaining,
          promoEnergySpent: 0, // Se renueva el cupo de energía semanal para la nueva semana
        }
        saveBout(activeBout)
      }

      const text = rollover
        ? `A new year begins. You turned ${player.age}.`
        : (trained.text || 'Another week passes.') + campNote

      return {
        ...state,
        currentWeek,
        currentYear,
        player,
        diet: currentDiet,
        world,
        activeBout,
        lastWeeklyReport: trained.report,
        history: [
          { id: `h-${state.history.length}`, week: currentWeek, year: currentYear, text },
          ...state.history,
        ],
      }
    }
    case 'DISMISS_WEEKLY_REPORT': {
      return { ...state, lastWeeklyReport: null }
    }
    case 'RESET_GAME': {
      try {
        localStorage.removeItem(SAVE_GAME_KEY)
        localStorage.removeItem(BOUT_STORAGE_KEY)
      } catch {
        // ignore
      }
      return {
        ...initialState,
        world: createWorld(Date.now()),
        player: null,
        activeBout: null,
      }
    }
    default:
      return state
  }
}

interface GameContextValue {
  state: GameState
  nextWeek: () => void
  /** Saves a newly created fighter as the player and starts the career. */
  createCharacter: (fighter: Fighter) => void
  setSchedule: (schedule: Schedule) => void
  setDiet: (diet: DietId) => void
  /** Switches gym, paying the first monthly fee upfront (ignored if money is insufficient). */
  switchGym: (gymId: string) => void
  setPartner: (kind: 'striking' | 'grappling', id: string | null) => void
  simulateAmateurFight: () => void
  devInsertRanking: () => void
  signContract: (contract: FighterContract) => void
  acceptBout: (opponent: BoutOpponent, weeks?: number) => void
  setGamePlan: (gamePlan: GamePlan) => void
  setCampIntensity: (intensity: CampIntensity) => void
  finishFightNight: (result: FightResult) => void
  cancelBout: () => void
  dismissWeeklyReport: () => void
  resetGame: () => void
  setJob: (jobId: JobId) => void
  toggleSponsor: (sponsorId: string) => void
  toggleStaff: (staffId: string) => void
  performPromo: (
    actionId: PromoActionId,
    stance?: PressStance,
    interviewAnswer?: 'humble' | 'provocative',
  ) => void
  setCornerTactic: (tactic: CornerDirective) => void
  activeSection: Section
  setSection: (section: Section) => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, getInitialGameState)
  const [activeSection, setSection] = useState<Section>('home')

  useEffect(() => {
    try {
      if (state.player) {
        localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(state))
      } else {
        localStorage.removeItem(SAVE_GAME_KEY)
      }
    } catch (err) {
      console.error('Error saving game state to localStorage:', err)
    }
  }, [state])

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      nextWeek: () => dispatch({ type: 'NEXT_WEEK' }),
      createCharacter: (fighter) => {
        setSection('home')
        dispatch({ type: 'CREATE_CHARACTER', fighter })
      },
      setSchedule: (schedule) => dispatch({ type: 'SET_SCHEDULE', schedule }),
      setDiet: (diet) => dispatch({ type: 'SET_DIET', diet }),
      switchGym: (gymId) => dispatch({ type: 'SWITCH_GYM', gymId }),
      setPartner: (kind, id) => dispatch({ type: 'SET_PARTNER', kind, id }),
      simulateAmateurFight: () => dispatch({ type: 'SIMULATE_AMATEUR_FIGHT' }),
      devInsertRanking: () => dispatch({ type: 'DEV_INSERT_RANKING' }),
      signContract: (contract) => dispatch({ type: 'SIGN_CONTRACT', contract }),
      acceptBout: (opponent, weeks) => dispatch({ type: 'ACCEPT_BOUT', opponent, weeks }),
      setGamePlan: (gamePlan) => dispatch({ type: 'SET_GAME_PLAN', gamePlan }),
      setCampIntensity: (intensity) => dispatch({ type: 'SET_CAMP_INTENSITY', intensity }),
      finishFightNight: (result) => dispatch({ type: 'FINISH_FIGHT_NIGHT', result }),
      cancelBout: () => dispatch({ type: 'CANCEL_BOUT' }),
      dismissWeeklyReport: () => dispatch({ type: 'DISMISS_WEEKLY_REPORT' }),
      resetGame: () => {
        setSection('home')
        dispatch({ type: 'RESET_GAME' })
      },
      setJob: (jobId) => dispatch({ type: 'SET_JOB', jobId }),
      toggleSponsor: (sponsorId) => dispatch({ type: 'TOGGLE_SPONSOR', sponsorId }),
      toggleStaff: (staffId) => dispatch({ type: 'TOGGLE_STAFF', staffId }),
      performPromo: (actionId, stance, interviewAnswer) =>
        dispatch({ type: 'PERFORM_PROMO', actionId, stance, interviewAnswer }),
      setCornerTactic: (tactic) => dispatch({ type: 'SET_CORNER_TACTIC', tactic }),
      activeSection,
      setSection,
    }),
    [state, activeSection],
  )
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within a GameProvider')
  return ctx
}

/** Returns the player fighter. Only use inside screens rendered after character creation. */
export function usePlayer(): Fighter {
  const { state } = useGame()
  if (!state.player) throw new Error('usePlayer called before a character was created')
  return state.player
}
