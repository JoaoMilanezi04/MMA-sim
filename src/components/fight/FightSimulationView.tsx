import { useState, useEffect, useRef } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  Pause,
  Play,
  Scale,
  Shield,
  ShieldAlert,
  SkipForward,
  Sparkles,
  Swords,
  Trophy,
} from 'lucide-react'
import { useGame, usePlayer } from '../../context/GameContext'
import { DIVISION_LIMITS } from '../../types/game'
import type { ActiveBout, FightResult } from '../../types/camp'
import FighterAvatar from '../common/FighterAvatar'

interface Props {
  bout: ActiveBout
  onClose: () => void
}

type Position = 'standing' | 'clinch' | 'ground_guard' | 'ground_mount'
type CornerTactic = 'wrestling' | 'pressure' | 'distance' | 'survival'

interface FighterCombatant {
  name: string
  nickname: string
  country: string
  ovr: number
  style: string
  head: number
  body: number
  legs: number
  stamina: number
  isStunned: boolean
  sigStrikes: number
  totalStrikes: number
  takedowns: number
  knockdowns: number
}

interface PlayAction {
  id: string
  round: number
  timeStr: string
  text: string
  type: 'strike' | 'takedown' | 'stun' | 'grapple' | 'info'
  actor: 'player' | 'opponent' | 'neutral'
}

const POSITION_NAMES: Record<Position, string> = {
  standing: 'EN PIE (Distancia)',
  clinch: 'CLINCH (Muro de la Jaula)',
  ground_guard: 'SUELO (En la Guardia)',
  ground_mount: 'SUELO (Montada Dominante)',
}

export default function FightSimulationView({ bout, onClose }: Props) {
  const player = usePlayer()
  const { finishFightNight, setCornerTactic } = useGame()

  const maxRounds = bout.organization.includes('UFC') && bout.isDwcs === false ? 3 : 3

  // Verificación de Báscula y Peso Reglamentario
  const targetWeight = DIVISION_LIMITS[player.division] || 155
  const currentWeight = player.currentWeight ?? player.weight
  const weightDiff = Number((currentWeight - targetWeight).toFixed(1))

  const weighInStatus = weightDiff <= 0 ? 'on_weight' : weightDiff <= 2.0 ? 'mild_overweight' : 'severe_overweight'

  const [weighInChoice, setWeighInChoice] = useState<'pending' | 'passed' | 'sauna' | 'catchweight'>('pending')
  const [pursePenalty, setPursePenalty] = useState(0)

  // Verificación de Lesiones Activas previas a la pelea
  const hasFacialCut = player.injuries?.some((i) => i.type === 'facial_cut')
  const hasMuscleStrain = player.injuries?.some((i) => i.type === 'muscle_strain')
  const hasJointSprain = player.injuries?.some((i) => i.type === 'joint_sprain')

  // Estado del combate
  const [stage, setStage] = useState<'weigh_in' | 'intro' | 'fight' | 'corner' | 'verdict'>('weigh_in')
  const [round, setRound] = useState(1)
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutos = 300 segs
  const [position, setPosition] = useState<Position>('standing')
  const [speed, setSpeed] = useState<1 | 2 | 4>(1)
  const [isPaused, setIsPaused] = useState(false)
  const [tactic, setTactic] = useState<CornerTactic>('distance')

  // Combatientes con penalizaciones por lesión y bonos de conferencia/hype
  const [combatantA, setCombatantA] = useState<FighterCombatant>(() => ({
    name: player.name,
    nickname: player.nickname,
    country: player.country,
    ovr: player.overall + (bout.composureModifier ? Math.round(bout.composureModifier / 2) : 0),
    style: player.archetype || 'Balanced',
    head: hasFacialCut ? 90 : 100, // -10% salud de cabeza por corte
    body: 100,
    legs: hasJointSprain ? 90 : 100, // -15% piernas por esguince
    stamina: hasMuscleStrain ? 85 : 100, // -15% estamina por sobrecarga
    isStunned: false,
    sigStrikes: 0,
    totalStrikes: 0,
    takedowns: 0,
    knockdowns: 0,
  }))

  const [combatantB, setCombatantB] = useState<FighterCombatant>(() => ({
    name: bout.opponent.name,
    nickname: bout.opponent.nickname,
    country: bout.opponent.country,
    ovr: Math.max(40, bout.opponent.ovr + (bout.opponentComposureModifier ? Math.round(bout.opponentComposureModifier / 2) : 0)),
    style: bout.opponent.style,
    head: 100,
    body: 100,
    legs: 100,
    stamina: 100,
    isStunned: false,
    sigStrikes: 0,
    totalStrikes: 0,
    takedowns: 0,
    knockdowns: 0,
  }))

  const [playFeed, setPlayFeed] = useState<PlayAction[]>([])
  const [finalResult, setFinalResult] = useState<FightResult | null>(null)
  const feedEndRef = useRef<HTMLDivElement>(null)

  const orgUpper = (bout.organization || '').toUpperCase()
  const isDwcs = Boolean(bout.isDwcs || orgUpper.includes('DWCS') || orgUpper.includes('CONTENDER'))
  const isCageWarriors = orgUpper.includes('CAGE') || orgUpper.includes('WARRIORS')

  // Scroll automático del play-by-play
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [playFeed])

  // Formato mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Finalizar combate
  const handleFinishFight = (
    winner: 'player' | 'opponent',
    method: string,
    finalRound: number,
    finalSecs: number
  ) => {
    const won = winner === 'player'
    const finishBonus = isCageWarriors && won && !method.includes('Decisión') ? 1000 : 0
    const rawPayout = (won ? bout.showPurse + bout.winPurse : bout.showPurse) + finishBonus
    const totalPayout = pursePenalty > 0 ? Math.round(rawPayout * (1 - pursePenalty)) : rawPayout
    const fanMultiplier = isCageWarriors ? 3 : 1
    const baseFans = won ? Math.floor(Math.random() * 250 + 350) : Math.floor(Math.random() * 60 + 40)
    const fansGained = baseFans * fanMultiplier

    let contractGranted = false
    let contractDecisionNote = ''

    if (isDwcs) {
      if (won) {
        if (!method.includes('Decisión')) {
          contractGranted = true
          contractDecisionNote = 'Dana White subió al octágono eufórico tras tu brutal finalización: "¡Ese es el instinto asesino que busco! Tienes tu contrato de UFC, chico."'
        } else {
          const gotContract = Math.random() < 0.5
          contractGranted = gotContract
          contractDecisionNote = gotContract
            ? 'Dana White deliberó: "No fue una finalización espectacular, pero mostraste coraje y control. Bienvenido a la UFC."'
            : 'Dana White fue tajante: "Ganaste la pelea, pero esto no es un torneo de puntos. No vi el instinto de rematar. Esta noche no hay contrato de UFC para ti."'
        }
      } else {
        contractGranted = false
        contractDecisionNote = 'Derrota en DWCS: Las puertas de UFC quedan cerradas por 52 semanas. Vuelves al circuito regional.'
      }
    }

    const weighInNote = pursePenalty > 0
      ? ` [Combate en Catchweight: Multa del 30% de la bolsa pactada cedida al oponente (-$${Math.round(rawPayout * pursePenalty).toLocaleString()}) por exceder el límite oficial].`
      : weighInChoice === 'sauna'
      ? ` [Corte de Emergencia: Superó la báscula tras sauna extrema, con merma del -10% en cabeza y -15% en cardio].`
      : ` [Pesaje Oficial: Marcó ${currentWeight.toFixed(1)} lbs con bono de compostura].`

    const narrative = won
      ? `Gran actuación de ${player.name}.${weighInNote} Siguiendo la estrategia del campamento (${bout.gamePlan}), logró imponerse sobre ${bout.opponent.name} y selló la victoria por ${method} en el asalto ${finalRound}.`
      : `${bout.opponent.name} impuso su ritmo.${weighInNote} Pese a momentos destacados de ${player.name}, el combate terminó a favor de ${bout.opponent.name} por ${method}.`

    const res: FightResult = {
      won,
      method,
      round: finalRound,
      time: formatTime(finalSecs),
      narrative,
      payout: totalPayout,
      fansGained,
      contractGranted,
      contractDecisionNote,
    }

    setFinalResult(res)
    setStage('verdict')
  }

  // Saltar simulación instantáneamente
  const handleSkipToEnd = () => {
    const effectivePlayerOvr = player.overall + (bout.intensity === 'brutal' ? 6 : 3)
    const ovrDiff = effectivePlayerOvr - bout.opponent.ovr
    const winProb = Math.min(0.9, Math.max(0.12, 0.5 + ovrDiff * 0.04))
    const won = Math.random() < winProb
    const method = won
      ? Math.random() > 0.45
        ? 'Decisión Unánime (29-28, 30-27, 30-27)'
        : 'KO / TKO (Golpes en el suelo)'
      : Math.random() > 0.5
        ? 'Decisión Dividida (28-29, 29-28, 28-29)'
        : 'KO (Gancho certero a la mandíbula)'

    handleFinishFight(won ? 'player' : 'opponent', method, 3, 0)
  }

  // Motor de simulación en vivo (Tick por segundo con factor de velocidad)
  useEffect(() => {
    if (stage !== 'fight' || isPaused) return

    const tickMs = Math.max(250, 1000 / speed)
    const interval = setInterval(() => {
      setTimeRemaining((prevTime) => {
        const nextTime = Math.max(0, prevTime - 8) // Avanza ~8 segundos de pelea por tick

        // Simular acción en este tick
        const isPlayerTurn = Math.random() < (combatantA.ovr / (combatantA.ovr + combatantB.ovr + 5))
        const timeStr = formatTime(nextTime)

        // Recuperación o bonificación pasiva por táctica de esquina
        if (tactic === 'distance') {
          setCombatantA((a) => ({ ...a, stamina: Math.min(100, a.stamina + 1) }))
        } else if (tactic === 'survival') {
          setCombatantA((a) => ({ ...a, stamina: Math.min(100, a.stamina + 2) }))
        }

        // Variaciones de acción
        if (Math.random() < 0.65) {
          if (isPlayerTurn) {
            // Acción ofensiva del jugador
            let dmg = Math.floor(Math.random() * 8 + 4)

            // Directiva: Presión de Boxeo (+20% poder)
            if (tactic === 'pressure') {
              dmg = Math.round(dmg * 1.20)
            }

            // Lesión: Esguince de tobillo (-15% patadas)
            if (hasJointSprain && Math.random() < 0.4) {
              dmg = Math.round(dmg * 0.85)
            }

            const isStunImpact = dmg > 9 && Math.random() < 0.25

            // Directiva: Buscar el Derribo (+20% éxito takedown)
            if (tactic === 'wrestling' && (position === 'standing' || position === 'clinch') && Math.random() < 0.45) {
              setPosition('ground_mount')
              setCombatantA((a) => ({ ...a, takedowns: a.takedowns + 1 }))
              setPlayFeed((prev) => [
                ...prev.slice(-30),
                {
                  id: `act-${Date.now()}-${Math.random()}`,
                  round,
                  timeStr,
                  text: '¡Cambias de nivel con potencia y consigues un derribo a dos piernas dominante!',
                  type: 'takedown',
                  actor: 'player',
                },
              ])
            } else {
              const strikeTypes = [
                '¡Conectas un jab punzante directo a la mandíbula!',
                '¡Combinación de 1-2 al mentón que hace retroceder al rival!',
                '¡Patada baja certera a la pierna delantera!',
                '¡Gancho de izquierda demoledor al hígado!',
                '¡Uppercut potente que entra limpio por la guardia!',
              ]
              const actionText = strikeTypes[Math.floor(Math.random() * strikeTypes.length)]

              setCombatantB((b) => {
                const newHead = Math.max(0, b.head - dmg)
                const newStam = Math.max(10, b.stamina - 2)
                if (newHead <= 0) {
                  setTimeout(() => handleFinishFight('player', 'KO / TKO (Golpes demoledores)', round, nextTime), 200)
                }
                return {
                  ...b,
                  head: newHead,
                  stamina: newStam,
                  isStunned: isStunImpact,
                  sigStrikes: b.sigStrikes + 1,
                }
              })

              setPlayFeed((prev) => [
                ...prev.slice(-30),
                {
                  id: `act-${Date.now()}-${Math.random()}`,
                  round,
                  timeStr,
                  text: actionText,
                  type: isStunImpact ? 'stun' : 'strike',
                  actor: 'player',
                },
              ])
            }
          } else {
            // Acción del rival
            let dmg = Math.floor(Math.random() * 8 + 3)

            // Directiva: Gestionar distancia (-15% daño)
            if (tactic === 'distance') {
              dmg = Math.round(dmg * 0.85)
            }
            // Directiva: Protegerse y sobrevivir (-45% daño recibido)
            else if (tactic === 'survival') {
              dmg = Math.round(dmg * 0.55)
            }
            // Directiva: Presión (Mayor exposición al contragolpe)
            else if (tactic === 'pressure' && Math.random() < 0.25) {
              dmg = Math.round(dmg * 1.15)
            }

            const isStunImpact = dmg > 9 && Math.random() < 0.2
            const strikeTypes = [
              `${combatantB.name} conecta un recto de derecha con peligro.`,
              `${combatantB.name} castiga con una patada al cuerpo pesada.`,
              `${combatantB.name} intercambia en el bolsillo y roza tu barbilla.`,
              `${combatantB.name} busca el derribo a dos piernas... ¡pero defiendes con sprawl!`,
            ]
            const actionText = strikeTypes[Math.floor(Math.random() * strikeTypes.length)]

            setCombatantA((a) => {
              const newHead = Math.max(0, a.head - dmg)
              const newStam = Math.max(10, a.stamina - 2)
              if (newHead <= 0) {
                setTimeout(() => handleFinishFight('opponent', 'KO / TKO (Poderoso castigo)', round, nextTime), 200)
              }
              return {
                ...a,
                head: newHead,
                stamina: newStam,
                isStunned: isStunImpact,
              }
            })

            setPlayFeed((prev) => [
              ...prev.slice(-30),
              {
                id: `act-${Date.now()}-${Math.random()}`,
                round,
                timeStr,
                text: actionText,
                type: isStunImpact ? 'stun' : 'strike',
                actor: 'opponent',
              },
            ])
          }
        }

        // Cambio posicional dinámico
        if (Math.random() < 0.15) {
          const positions: Position[] = ['standing', 'clinch', 'ground_guard', 'ground_mount']
          const nextPos = positions[Math.floor(Math.random() * positions.length)]
          setPosition(nextPos)
          setPlayFeed((prev) => [
            ...prev.slice(-30),
            {
              id: `pos-${Date.now()}-${Math.random()}`,
              round,
              timeStr,
              text: `Transición táctica: La acción pasa a ${POSITION_NAMES[nextPos]}.`,
              type: 'grapple',
              actor: 'neutral',
            },
          ])
        }

        // Fin de asalto
        if (nextTime === 0) {
          if (round < maxRounds) {
            setStage('corner')
            setTimeRemaining(300)
            setPosition('standing')
            // Recuperación parcial entre asaltos
            setCombatantA((a) => ({ ...a, stamina: Math.min(100, a.stamina + 25), isStunned: false }))
            setCombatantB((b) => ({ ...b, stamina: Math.min(100, b.stamina + 25), isStunned: false }))
          } else {
            // Decisión de los jueces al terminar todos los asaltos
            const playerScoredHigher = combatantA.head >= combatantB.head
            const winner = playerScoredHigher ? 'player' : 'opponent'
            const method = playerScoredHigher
              ? 'Decisión Unánime (29-28, 30-27, 29-28)'
              : 'Decisión Dividida (28-29, 29-28, 28-29)'
            setTimeout(() => handleFinishFight(winner, method, maxRounds, 0), 200)
          }
        }

        return nextTime
      })
    }, tickMs)

    return () => clearInterval(interval)
  }, [stage, isPaused, speed, round, combatantA.ovr, combatantB.ovr, maxRounds, tactic, position, hasJointSprain])

  const handleStartNextRound = () => {
    setRound((r) => r + 1)
    setStage('fight')
  }

  const handleFinalize = () => {
    if (finalResult) {
      finishFightNight(finalResult)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex max-h-[96vh] w-full max-w-5xl flex-col overflow-y-auto rounded-3xl border border-red-500/40 bg-[#070b14] p-4 shadow-2xl ring-1 ring-white/10 sm:p-6 lg:p-8">
        {/* Glow deportivo superior */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-96 rounded-full bg-red-600/25 blur-3xl" />

        {/* ============================================================ */}
        {/* 0. ETAPA DE PESAJE OFICIAL (OFFICIAL WEIGH-IN CEREMONY) */}
        {/* ============================================================ */}
        {stage === 'weigh_in' && (
          <div className="relative flex flex-col items-center justify-center py-6 text-center animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-1.5 text-xs font-black tracking-widest text-sky-300 uppercase">
              <Scale className="h-4 w-4" />
              COMISIÓN ATLÉTICA OFICIAL · PESAJE REGLAMENTARIO
            </div>

            <h2 className="mt-4 text-3xl font-black text-white sm:text-5xl">
              PESAJE OFICIAL
            </h2>
            <p className="mt-2 text-sm text-slate-300 max-w-xl">
              Subida a la báscula de la Comisión Atlética antes de la cartelera de {bout.organization}. Todos los ojos de la prensa y tu esquina están sobre ti.
            </p>

            {/* Plataforma de Báscula Digital */}
            <div className="my-6 w-full max-w-2xl rounded-3xl border border-white/10 bg-gradient-to-b from-[#11192e] to-[#0a0f1d] p-6 shadow-2xl ring-1 ring-white/5">
              <div className="flex flex-col items-center justify-center">
                {/* Visual Avatar on Scale */}
                <div className="relative mb-4 flex flex-col items-center">
                  <div className="h-28 w-28 overflow-hidden rounded-3xl border-2 border-sky-400 bg-slate-950 p-1 shadow-2xl ring-4 ring-sky-500/20">
                    <FighterAvatar appearance={player.appearance} seed={player.name} className="h-full w-full rounded-2xl" />
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-base font-black text-white">{player.name}</p>
                    <p className="text-xs text-slate-400">División {player.division} · Límite Oficial: <strong className="text-slate-200">{targetWeight} lbs</strong></p>
                  </div>
                </div>

                {/* Gran Display Digital LED */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/60 px-8 py-5 shadow-inner">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lectura Digital Oficial</span>
                  <div className="my-1 flex items-baseline gap-3">
                    <span className={`font-mono text-4xl sm:text-5xl font-black tracking-wider ${
                      weighInStatus === 'on_weight'
                        ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]'
                        : weighInStatus === 'mild_overweight'
                        ? 'text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                        : 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                    }`}>
                      {currentWeight.toFixed(1)} <span className="text-xl">LBS</span>
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      ({(currentWeight * 0.453592).toFixed(1)} KG)
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Límite Permitido: <strong className="text-slate-200">{targetWeight} lbs</strong></span>
                    <span className="text-slate-600">·</span>
                    <span className={`text-xs font-bold ${
                      weighInStatus === 'on_weight' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {weightDiff <= 0 ? `${Math.abs(weightDiff).toFixed(1)} lbs de margen` : `+${weightDiff.toFixed(1)} lbs exceso`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Veredicto de la Comisión */}
              <div className="mt-6 border-t border-white/10 pt-5">
                {weighInStatus === 'on_weight' && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-300">
                      <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
                      <div className="text-left text-xs leading-relaxed">
                        <p className="text-sm font-black text-emerald-300 uppercase tracking-wider">¡PESAJE SUPERADO OFICIALMENTE!</p>
                        <p className="mt-0.5 text-slate-200">
                          Marcaste el peso reglamentario de forma impecable. Tu preparación física es óptima y recibes un <strong>bono de +5% de compostura</strong> en la jaula.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setWeighInChoice('passed')
                        setCombatantA((prev) => ({
                          ...prev,
                          head: 100,
                          stamina: 100,
                          ovr: prev.ovr + 2,
                        }))
                        setPursePenalty(0)
                        setStage('intro')
                      }}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-sm font-black uppercase tracking-wider text-slate-950 shadow-xl shadow-emerald-950 transition hover:brightness-110 active:scale-95"
                    >
                      <Swords className="h-5 w-5" />
                      CONFIRMAR PESAJE Y CONTINUAR A LA PELEA ➔
                    </button>
                  </div>
                )}

                {weighInStatus === 'mild_overweight' && (
                  <div className="flex flex-col gap-4 text-left">
                    <div className="flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-300">
                      <AlertTriangle className="h-6 w-6 shrink-0 text-amber-400" />
                      <div className="text-xs leading-relaxed">
                        <p className="text-sm font-black text-amber-300 uppercase tracking-wider">SOBREPESO LEVE (+{weightDiff} LBS)</p>
                        <p className="mt-0.5 text-slate-200">
                          La báscula arrojó un exceso de {weightDiff} lbs. La Comisión Médica te otorga una ventana reglamentaria de 1 hora. Debes tomar una decisión crítica para el combate:
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {/* Opción 1: Sauna */}
                      <button
                        onClick={() => {
                          setWeighInChoice('sauna')
                          setCombatantA((prev) => ({
                            ...prev,
                            head: 90,
                            stamina: 85,
                          }))
                          setPursePenalty(0)
                          setStage('intro')
                        }}
                        className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-orange-500/40 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent p-4 transition hover:border-orange-500 hover:bg-orange-500/20 active:scale-98"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-black uppercase text-orange-300">Opción 1</span>
                            <span className="rounded bg-orange-500/20 px-2 py-0.5 text-[10px] font-black text-orange-200">100% Bolsa</span>
                          </div>
                          <h4 className="mt-1 text-sm font-black text-white group-hover:text-orange-300 transition-colors">
                            🔥 Corte de Agua en Sauna (Última Hora)
                          </h4>
                          <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                            45 minutos de sudoración extrema en sauna caliente para sudar las {weightDiff} lbs restantes. Das el peso oficial a tiempo.
                          </p>
                        </div>

                        <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-[11px] font-bold text-rose-300">
                          ⚠️ Penalización: -10% Vida en Cabeza, -15% Estamina inicial por deshidratación cerebral.
                        </div>
                      </button>

                      {/* Opción 2: Catchweight */}
                      <button
                        onClick={() => {
                          setWeighInChoice('catchweight')
                          setCombatantA((prev) => ({
                            ...prev,
                            head: 100,
                            stamina: 75,
                          }))
                          setPursePenalty(0.30)
                          setStage('intro')
                        }}
                        className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-rose-500/40 bg-gradient-to-br from-rose-500/10 via-red-500/5 to-transparent p-4 transition hover:border-rose-500 hover:bg-rose-500/20 active:scale-98"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-black uppercase text-rose-300">Opción 2</span>
                            <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-black text-rose-200">Salud Protegida</span>
                          </div>
                          <h4 className="mt-1 text-sm font-black text-white group-hover:text-rose-300 transition-colors">
                            ⚖️ Declarar Pelea en Catchweight
                          </h4>
                          <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                            Rechazas el corte forzado en sauna para no poner en riesgo tus riñones. La pelea se pacta en peso acordado.
                          </p>
                        </div>

                        <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-[11px] font-bold text-rose-300">
                          ⚠️ Penalización: Cedes 30% de tu bolsa al rival y -25% de estamina inicial.
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {weighInStatus === 'severe_overweight' && (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex items-start gap-3 rounded-2xl border border-rose-500/50 bg-rose-950/30 p-4 text-left text-rose-300">
                      <ShieldAlert className="h-6 w-6 shrink-0 text-rose-400" />
                      <div className="text-xs leading-relaxed">
                        <p className="text-sm font-black text-rose-300 uppercase tracking-wider">PESAJE FALLIDO · SOBREPESO SEVERO (+{weightDiff} LBS)</p>
                        <p className="mt-0.5 text-slate-200">
                          Excedes el límite por más de 2.0 lbs. La Comisión Atlética y el médico de turno <strong>prohíben la sauna de emergencia</strong> por riesgo de fallo orgánico.
                        </p>
                        <p className="mt-2 font-bold text-rose-200">
                          El combate se declara oficialmente en Catchweight: Cedes el 30% de toda tu bolsa a tu rival ({bout.opponent.name}) y arrancarás con -25% de estamina.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setWeighInChoice('catchweight')
                        setCombatantA((prev) => ({
                          ...prev,
                          head: 100,
                          stamina: 75,
                        }))
                        setPursePenalty(0.30)
                        setStage('intro')
                      }}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 px-8 py-4 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-red-950 transition hover:brightness-110 active:scale-95"
                    >
                      <Swords className="h-5 w-5" />
                      ASUMIR SANCIÓN CATCHWEIGHT Y ENTRAR A LA PELEA ➔
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 1. ETAPA INTRO */}
        {/* ============================================================ */}
        {stage === 'intro' && (
          <div className="relative flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95 duration-300">
            <span className="rounded-full border border-red-500/50 bg-red-600/20 px-4 py-1 text-xs font-black tracking-widest text-red-300 uppercase">
              {bout.organization} · NOCHE DE PELEA OFICIAL
            </span>
            <h2 className="mt-4 text-3xl font-black text-white sm:text-5xl">
              FIGHT NIGHT EN VIVO
            </h2>
            <p className="mt-2 text-sm text-slate-300 max-w-lg">
              Ambos peleadores han dado el peso y están en sus esquinas. El árbitro da las últimas instrucciones en el centro de la jaula.
            </p>

            {/* Face-off de entrada */}
            <div className="my-8 flex w-full max-w-xl items-center justify-around rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-inner">
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 overflow-hidden rounded-2xl border-2 border-blue-500/50 bg-slate-950 p-1 shadow-lg ring-2 ring-blue-500/30">
                  <FighterAvatar appearance={player.appearance} seed={player.name} className="h-full w-full rounded-xl" />
                </div>
                <h3 className="mt-2 text-base font-black text-white">{player.name}</h3>
                <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-300">OVR {player.overall}</span>
              </div>

              <div className="flex flex-col items-center justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-orange-500 font-black text-white shadow-xl text-lg">
                  VS
                </span>
                <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">3 Asaltos</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-24 w-24 overflow-hidden rounded-2xl border-2 border-red-500/50 bg-slate-950 p-1 shadow-lg ring-2 ring-red-500/30">
                  <FighterAvatar seed={bout.opponent.name} country={bout.opponent.country} className="h-full w-full rounded-xl" />
                </div>
                <h3 className="mt-2 text-base font-black text-white">{bout.opponent.name}</h3>
                <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-300">OVR {bout.opponent.ovr}</span>
              </div>
            </div>

            <button
              onClick={() => setStage('fight')}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-10 py-4 text-base font-black uppercase tracking-wider text-white shadow-xl shadow-red-950 transition hover:brightness-110 active:scale-95 animate-pulse"
            >
              <Swords className="h-5 w-5" />
              COMENZAR COMBATE ➔
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* 2. ETAPA DE PELEA EN VIVO */}
        {/* ============================================================ */}
        {stage === 'fight' && (
          <div className="relative flex flex-col gap-4">
            {/* MARCADOR SUPERIOR TELEVISIVO */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-[#121829] via-[#0b101c] to-[#121829] p-3.5 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white font-black text-base shadow-md">
                  R{round}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <span className="font-mono text-2xl font-black text-white tracking-wider">
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400">
                    Asalto {round} de {maxRounds}
                  </span>
                </div>
              </div>

              {/* Posición en el Octágono */}
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black text-amber-300">
                <Activity className="h-4 w-4 text-amber-400" />
                <span>{POSITION_NAMES[position]}</span>
              </div>

              {/* Controles de Velocidad */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/15"
                  title={isPaused ? 'Reanudar' : 'Pausar'}
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </button>
                {([1, 2, 4] as const).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSpeed(spd)}
                    className={`rounded-xl border px-2.5 py-1 text-xs font-black transition ${
                      speed === spd
                        ? 'border-red-500 bg-red-600 text-white shadow'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
                <button
                  onClick={handleSkipToEnd}
                  className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-300 transition hover:bg-white/15"
                  title="Saltar al final del combate"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Saltar</span>
                </button>
              </div>
            </div>

            {/* BARRAS DE ESTADO CARA A CARA */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Esquina Azul: Jugador */}
              <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 overflow-hidden rounded-xl border border-blue-400 bg-slate-950 p-0.5 shrink-0">
                    <FighterAvatar appearance={player.appearance} seed={player.name} className="h-full w-full rounded-lg" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-white truncate">{player.name}</h4>
                      <span className="text-xs font-bold text-blue-300 font-mono">OVR {combatantA.ovr}</span>
                    </div>
                    {combatantA.isStunned && (
                      <span className="flex items-center gap-1 text-[10px] font-black text-amber-400 animate-pulse">
                        <AlertTriangle className="h-3 w-3" /> ¡ATURDIDO!
                      </span>
                    )}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {weighInChoice === 'sauna' && (
                        <span className="inline-flex items-center gap-1 rounded bg-orange-500/20 px-1.5 py-0.5 text-[9px] font-bold text-orange-300 ring-1 ring-orange-500/40">
                          🔥 Corte Sauna (-10% Cabeza, -15% Estamina)
                        </span>
                      )}
                      {weighInChoice === 'catchweight' && (
                        <span className="inline-flex items-center gap-1 rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-300 ring-1 ring-rose-500/40">
                          ⚖️ Catchweight (-25% Estamina)
                        </span>
                      )}
                      {weighInChoice === 'passed' && (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 ring-1 ring-emerald-500/40">
                          ⚖️ En Peso (+5% Compostura)
                        </span>
                      )}
                      {hasFacialCut && (
                        <span className="inline-flex items-center gap-1 rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-300 ring-1 ring-rose-500/40">
                          🩸 Corte Facial (-10% Cabeza)
                        </span>
                      )}
                      {hasJointSprain && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 ring-1 ring-amber-500/40">
                          🦵 Esguince (-15% Patadas)
                        </span>
                      )}
                      {hasMuscleStrain && (
                        <span className="inline-flex items-center gap-1 rounded bg-yellow-500/20 px-1.5 py-0.5 text-[9px] font-bold text-yellow-300 ring-1 ring-yellow-500/40">
                          ⚡ Sobrecarga (-15% Estamina)
                        </span>
                      )}
                      {bout.composureModifier && bout.composureModifier > 0 && (
                        <span className="inline-flex items-center gap-1 rounded bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-bold text-sky-300 ring-1 ring-sky-500/40">
                          🎯 Respeto Marcial (+{bout.composureModifier}% Moral)
                        </span>
                      )}
                      {bout.trashTalkActive && (
                        <span className="inline-flex items-center gap-1 rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-300 ring-1 ring-red-500/40">
                          🔥 Trash Talk Activo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Barras de Daño y Estamina */}
                <div className="space-y-2 text-xs font-bold">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                      <span>CABEZA</span>
                      <span className="font-mono text-white">{combatantA.head}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          combatantA.head > 50 ? 'bg-emerald-500' : combatantA.head > 25 ? 'bg-amber-500' : 'bg-rose-600'
                        }`}
                        style={{ width: `${combatantA.head}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                      <span>ESTAMINA / ENERGÍA</span>
                      <span className="font-mono text-cyan-300">{combatantA.stamina}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 transition-all duration-300"
                        style={{ width: `${combatantA.stamina}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Esquina Roja: Rival */}
              <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-4 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 overflow-hidden rounded-xl border border-red-400 bg-slate-950 p-0.5 shrink-0">
                    <FighterAvatar seed={bout.opponent.name} country={bout.opponent.country} className="h-full w-full rounded-lg" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-white truncate">{bout.opponent.name}</h4>
                      <span className="text-xs font-bold text-red-300 font-mono">OVR {combatantB.ovr}</span>
                    </div>
                    {combatantB.isStunned && (
                      <span className="flex items-center gap-1 text-[10px] font-black text-amber-400 animate-pulse">
                        <AlertTriangle className="h-3 w-3" /> ¡RIVAL ATURDIDO!
                      </span>
                    )}
                    {bout.opponentComposureModifier && bout.opponentComposureModifier < 0 && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-purple-300 ring-1 ring-purple-500/40">
                        🧠 Intimidado por Guerra Psicológica ({bout.opponentComposureModifier}% Moral)
                      </span>
                    )}
                  </div>
                </div>

                {/* Barras de Daño y Estamina Rival */}
                <div className="space-y-2 text-xs font-bold">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                      <span>CABEZA</span>
                      <span className="font-mono text-white">{combatantB.head}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          combatantB.head > 50 ? 'bg-emerald-500' : combatantB.head > 25 ? 'bg-amber-500' : 'bg-rose-600'
                        }`}
                        style={{ width: `${combatantB.head}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                      <span>ESTAMINA / ENERGÍA</span>
                      <span className="font-mono text-cyan-300">{combatantB.stamina}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 transition-all duration-300"
                        style={{ width: `${combatantB.stamina}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FEED PLAY-BY-PLAY GOLPE A GOLPE */}
            <div className="rounded-2xl border border-white/10 bg-black/50 p-4 shadow-inner">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-3">
                <Flame className="h-4 w-4 text-orange-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Comentarios en Vivo (Play-by-Play)
                </h4>
              </div>

              <div className="flex h-52 flex-col gap-2 overflow-y-auto pr-2 text-xs leading-relaxed font-medium">
                {playFeed.length === 0 ? (
                  <p className="text-slate-500 italic">Suena la campana. Ambos peleadores se estudian en el centro...</p>
                ) : (
                  playFeed.map((action) => (
                    <div
                      key={action.id}
                      className={`flex items-start gap-2 rounded-xl p-2 transition ${
                        action.actor === 'player'
                          ? 'border border-blue-500/30 bg-blue-950/20 text-blue-200'
                          : action.actor === 'opponent'
                            ? 'border border-red-500/30 bg-red-950/20 text-red-200'
                            : 'bg-white/[0.02] text-slate-300'
                      }`}
                    >
                      <span className="font-mono text-[10px] font-bold text-slate-500 shrink-0">
                        [{action.timeStr}]
                      </span>
                      <span>{action.text}</span>
                    </div>
                  ))
                )}
                <div ref={feedEndRef} />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. ETAPA DE ESQUINA ENTRE ASALTOS (THE CORNER) */}
        {/* ============================================================ */}
        {stage === 'corner' && (
          <div className="relative flex flex-col items-center justify-center py-4 text-center animate-in zoom-in-95 duration-200">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 mb-3">
              <Shield className="h-7 w-7" />
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black text-amber-300 uppercase tracking-widest border border-amber-500/30">
                DESCANSO EN LA ESQUINA · THE CORNER
              </span>
              <span className="text-xs font-bold text-slate-400">
                Fin del Asalto {round} de {maxRounds}
              </span>
            </div>

            {/* Bocadillo Dinámico del Entrenador Principal (Head Coach) */}
            <div className="my-4 w-full max-w-2xl rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-[#10131a] to-amber-950/30 p-4 text-left shadow-xl ring-1 ring-white/5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs">
                  COACH
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      Diagnóstico del Head Coach (Esquina Azul)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Golpes Conectados: {combatantA.sigStrikes} vs {combatantB.sigStrikes}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-200 leading-relaxed italic">
                    "{combatantA.head < 50
                      ? '¡Cuidado con la cabeza! Te están conectando golpes de poder. Sube la guardia, mueve la cintura y busca el derribo o la distancia para enfriar la pelea.'
                      : combatantB.head < 50
                      ? '¡Lo tienes con las piernas temblando! Su quijada está sentida. Presiónalo contra la reja y descarga combinaciones de boxeo, ¡el KO está ahí si no te descuidas!'
                      : combatantA.stamina < 45
                      ? '¡Respira hondo! Estás forzando demasiado el ritmo y te estás quedando sin aire. Administra la distancia, suelta el jab y recupera estamina.'
                      : combatantA.takedowns > 0
                      ? '¡Gran trabajo llevándolo a la lona! El control en el suelo te está asegurando las tarjetas. Sigue castigando desde arriba sin arriesgar la posición.'
                      : '¡Buen asalto! Estás en la pelea y ejecutando con disciplina. Elige tu ajuste para el siguiente round y sal a imponer nuestras reglas.'}"
                  </p>
                </div>
              </div>
            </div>

            {/* Directivas Tácticas de Esquina */}
            <div className="mb-4 text-center">
              <h4 className="text-sm font-black uppercase tracking-wider text-white">
                Selecciona la Directiva Táctica para el Asalto {round + 1}
              </h4>
              <p className="text-[11px] text-slate-400">
                Los ajustes tácticos modifican las probabilidades de golpeo, derribos y daño en tiempo real
              </p>
            </div>

            <div className="my-2 grid w-full max-w-2xl grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {[
                {
                  id: 'wrestling' as CornerTactic,
                  title: '1. Buscar Derribo y Control en Lona',
                  tag: 'Grappling & Control',
                  tagColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
                  desc: '+20% éxito en derribos, transiciones a montada dominante y menor desgaste de estamina en clinch.',
                },
                {
                  id: 'pressure' as CornerTactic,
                  title: '2. Presión de Boxeo y Caza del KO',
                  tag: 'Striking Ofensivo',
                  tagColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
                  desc: '+20% daño en golpes a la cabeza. Mayor riesgo de recibir contragolpes en el bolsillo.',
                },
                {
                  id: 'distance' as CornerTactic,
                  title: '3. Gestionar Distancia y Contragolpe',
                  tag: 'Defensa & Salida',
                  tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                  desc: '+15% esquiva de golpes y movimiento de cabeza. Regeneración pasiva de estamina por round.',
                },
                {
                  id: 'survival' as CornerTactic,
                  title: '4. Protegerse y Sobrevivir al Asalto',
                  tag: 'Guardia Hermética',
                  tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                  desc: '-45% de daño recibido. Guardia ultra cerrada y repliegue defensivo si estás lastimado.',
                },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTactic(t.id)
                    setCornerTactic(t.id)
                  }}
                  className={`group relative cursor-pointer rounded-2xl border p-4 text-left transition ${
                    tactic === t.id
                      ? 'border-red-500 bg-red-600/20 ring-2 ring-red-500/40 shadow-lg shadow-red-950/40'
                      : 'border-white/10 bg-[#10131a] hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-black uppercase ${t.tagColor}`}>
                      {t.tag}
                    </span>
                    {tactic === t.id && (
                      <span className="flex items-center gap-1 text-[10px] font-black text-red-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> SELECCIONADA
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs font-black text-white group-hover:text-red-300 transition-colors">
                    {t.title}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                    {t.desc}
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={handleStartNextRound}
              className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-8 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-red-950 transition hover:brightness-110 active:scale-95"
            >
              <Swords className="h-4 w-4" />
              SALIR AL ASALTO {round + 1} ➔
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* 4. ETAPA DE VEREDICTO FINAL OFICIAL */}
        {/* ============================================================ */}
        {stage === 'verdict' && finalResult && (
          <div className="relative flex flex-col items-center justify-center py-6 text-center animate-in zoom-in-95 duration-300">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-3xl shadow-2xl mb-4 ${
                finalResult.won
                  ? 'bg-gradient-to-br from-emerald-400 to-lime-500 text-slate-950 shadow-emerald-500/40'
                  : 'bg-gradient-to-br from-rose-600 to-red-800 text-white shadow-red-900/40'
              }`}
            >
              {finalResult.won ? <Trophy className="h-10 w-10" /> : <ShieldAlert className="h-10 w-10" />}
            </div>

            <span
              className={`rounded-full px-4 py-1 text-xs font-black tracking-widest uppercase ${
                finalResult.won
                  ? 'border border-emerald-400/40 bg-emerald-500/20 text-emerald-300'
                  : 'border border-rose-500/40 bg-rose-600/20 text-rose-300'
              }`}
            >
              {finalResult.won ? '¡VICTORIA OFICIAL!' : 'DERROTA OFICIAL'}
            </span>

            <h2 className="mt-3 text-2xl font-black text-white sm:text-4xl">
              {finalResult.won ? `Ganador: ${player.name}` : `Ganador: ${bout.opponent.name}`}
            </h2>
            <p className="mt-1 text-sm font-bold text-amber-300">
              Por {finalResult.method} en el Asalto {finalResult.round} ({finalResult.time})
            </p>

            {/* Narrativa del combate */}
            <div className="my-5 w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left text-xs leading-relaxed text-slate-300">
              {finalResult.narrative}
            </div>

            {/* Recompensas */}
            <div className="grid w-full max-w-xl grid-cols-2 gap-3 mb-4">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Bolsa Cobrada</p>
                <p className="text-xl font-black text-emerald-400">+${finalResult.payout.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Nuevos Seguidores</p>
                <p className="text-xl font-black text-amber-400">+{finalResult.fansGained.toLocaleString()}</p>
              </div>
            </div>

            {/* Clausula DWCS / Cage Warriors Feedback */}
            {isDwcs && (
              finalResult.won && finalResult.contractGranted ? (
                <div className="mb-4 flex w-full max-w-xl items-center gap-3 rounded-2xl border border-amber-500/50 bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-4 text-left text-xs font-semibold text-amber-200">
                  <Sparkles className="h-6 w-6 shrink-0 text-amber-400" />
                  <div>
                    <p className="font-black text-amber-300 uppercase tracking-wider text-sm">¡DANA WHITE TE ENTREGA EL CONTRATO UFC!</p>
                    <p className="mt-0.5 text-slate-200">{finalResult.contractDecisionNote}</p>
                  </div>
                </div>
              ) : finalResult.won && !finalResult.contractGranted ? (
                <div className="mb-4 flex w-full max-w-xl items-center gap-3 rounded-2xl border border-rose-500/50 bg-rose-950/40 p-4 text-left text-xs font-semibold text-rose-200">
                  <AlertTriangle className="h-6 w-6 shrink-0 text-rose-400" />
                  <div>
                    <p className="font-black text-rose-300 uppercase tracking-wider text-sm">REGLA DANA WHITE: SIN CONTRATO UFC</p>
                    <p className="mt-0.5 text-slate-200">{finalResult.contractDecisionNote}</p>
                  </div>
                </div>
              ) : (
                <div className="mb-4 flex w-full max-w-xl items-center gap-3 rounded-2xl border border-rose-500/50 bg-rose-950/40 p-4 text-left text-xs font-semibold text-rose-200">
                  <ShieldAlert className="h-6 w-6 shrink-0 text-rose-400" />
                  <div>
                    <p className="font-black text-rose-300 uppercase tracking-wider text-sm">VETO DE UFC: 52 SEMANAS</p>
                    <p className="mt-0.5 text-slate-200">{finalResult.contractDecisionNote}</p>
                  </div>
                </div>
              )
            )}

            <button
              onClick={handleFinalize}
              className="mt-2 flex w-full max-w-md cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 py-4 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-red-950/60 transition hover:brightness-110 active:scale-95"
            >
              <CheckCircle2 className="h-5 w-5" />
              COBRAR BOLSA Y REGRESAR AL DASHBOARD
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
