import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Swords,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react'
import { useGame, usePlayer } from '../../context/GameContext'
import type { ActiveBout, FightResult } from '../../types/camp'

interface Props {
  bout: ActiveBout
  onClose: () => void
}

const METHODS_WIN = [
  'KO / TKO (Golpes en el suelo)',
  'KO (Gancho certero a la mandíbula)',
  'Sumisión (Rear-Naked Choke)',
  'Sumisión (Guillotina ajustada)',
  'Decisión Unánime (30-27, 30-27, 29-28)',
  'Decisión Dividida (29-28, 28-29, 29-28)',
]

const METHODS_LOSS = [
  'Decisión Unánime (28-29, 28-29, 27-30)',
  'TKO (Parada del árbitro en el asalto 2)',
  'Sumisión (Palanca de brazo / Armbar)',
  'Decisión Dividida (28-29, 29-28, 28-29)',
]

export default function FightNightModal({ bout, onClose }: Props) {
  const player = usePlayer()
  const { finishFightNight } = useGame()
  const [stage, setStage] = useState<'intro' | 'simulating' | 'result'>('intro')
  const [result, setResult] = useState<FightResult | null>(null)

  const simulateFight = () => {
    setStage('simulating')

    setTimeout(() => {
      // Cálculo probabilístico basado en OVR, GamePlan e Intensidad
      let playerEffectiveOvr = player.overall
      if (bout.intensity === 'light') playerEffectiveOvr += 2
      else if (bout.intensity === 'normal') playerEffectiveOvr += 4
      else if (bout.intensity === 'brutal') playerEffectiveOvr += 7

      // Game Plan matching
      if (bout.gamePlan === 'anti-wrestling' && bout.opponent.style.includes('Wrestler')) {
        playerEffectiveOvr += 5
      } else if (bout.gamePlan === 'grappling' && bout.opponent.style.includes('Striker')) {
        playerEffectiveOvr += 5
      } else if (bout.gamePlan === 'counter-boxing' && bout.opponent.style.includes('Brawler')) {
        playerEffectiveOvr += 5
      } else {
        playerEffectiveOvr += 3
      }

      const orgUpper = (bout.organization || '').toUpperCase()
      const isDwcs = Boolean(bout.isDwcs || orgUpper.includes('DWCS') || orgUpper.includes('CONTENDER'))
      const isCageWarriors = orgUpper.includes('CAGE') || orgUpper.includes('WARRIORS')
      const isRizin = orgUpper.includes('RIZIN')

      // RIZIN open rules bonus
      if (isRizin && (bout.gamePlan === 'striking' || bout.gamePlan === 'counter-boxing')) {
        playerEffectiveOvr += 2
      }

      const diff = playerEffectiveOvr - bout.opponent.ovr
      const winProbability = Math.min(0.9, Math.max(0.12, 0.5 + diff * 0.04))
      const won = Math.random() < winProbability

      const methodPool = won ? METHODS_WIN : METHODS_LOSS
      const method = methodPool[Math.floor(Math.random() * methodPool.length)]
      const isFinish = !method.includes('Decisión')
      const round = !isFinish ? 3 : Math.floor(Math.random() * 3) + 1
      const seconds = Math.floor(Math.random() * 59)
      const minutes = Math.floor(Math.random() * 4) + 1
      const time = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`

      // Finish bonus for Cage Warriors
      const finishBonus = isCageWarriors && won && isFinish ? 1000 : 0
      const totalPayout = (won ? bout.showPurse + bout.winPurse : bout.showPurse) + finishBonus

      // Cage Warriors +200% fans multiplier
      const fanMultiplier = isCageWarriors ? 3 : 1
      const baseFans = won
        ? Math.floor(Math.random() * 200 + 350)
        : Math.floor(Math.random() * 60 + 40)
      const fansGained = baseFans * fanMultiplier

      // Dana White Contract Decision Rule
      let contractGranted = false
      let contractDecisionNote = ''

      if (isDwcs) {
        if (won) {
          if (isFinish) {
            contractGranted = true
            contractDecisionNote = 'Dana White subió al octágono eufórico tras tu finalización: "¡Ese es el instinto asesino que busco! Tienes tu contrato de UFC, bienvenido."'
          } else {
            // Decision: 50% chance Dana rejects contract
            const gotContract = Math.random() < 0.5
            if (gotContract) {
              contractGranted = true
              contractDecisionNote = 'Dana White deliberó: "No fue una finalización espectacular, pero mostraste coraje y control. Bienvenido a la UFC."'
            } else {
              contractGranted = false
              contractDecisionNote = 'Dana White fue tajante: "Ganaste la pelea, pero esto no es un torneo de puntos. No vi el instinto de rematar. Esta noche no hay contrato de UFC para ti."'
            }
          }
        } else {
          contractGranted = false
          contractDecisionNote = 'Derrota en DWCS: Las puertas de UFC quedan cerradas por 52 semanas. Vuelves al circuito regional a reconstruir tu récord.'
        }
      }

      let narrative = ''
      if (won) {
        narrative = `Gran actuación de ${player.name}. Siguiendo la estrategia del campamento (${bout.gamePlan}), neutralizó a ${bout.opponent.name} y selló la victoria por ${method} en el asalto ${round}.`
      } else {
        narrative = `${bout.opponent.name} logró imponer su ritmo competitivo. Pese a momentos destacados de ${player.name}, el combate terminó a favor de ${bout.opponent.name} por ${method}.`
      }

      setResult({
        won,
        method,
        round,
        time,
        narrative,
        payout: totalPayout,
        fansGained,
        contractGranted,
        contractDecisionNote,
      })
      setStage('result')
    }, 1600)
  }

  const handleFinalize = () => {
    if (result) {
      finishFightNight(result)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-red-500/30 bg-[#0b0f17] p-6 shadow-2xl ring-1 ring-white/10 sm:p-8">
        {/* Glow de fondo */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-red-600/20 blur-3xl" />

        {stage === 'intro' && (
          <div className="relative flex flex-col gap-6 text-center">
            {/* Header del evento */}
            <div>
              <span className="rounded-full border border-red-500/40 bg-red-600/20 px-4 py-1 text-xs font-black tracking-widest text-red-300 uppercase">
                {bout.organization} · NOCHE DE PELEA OFICIAL
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                FIGHT NIGHT
              </h2>
              <p className="text-xs text-slate-400 sm:text-sm">
                Las Vegas, Nevada · División {player.division}
              </p>
            </div>

            {/* Cara a cara */}
            <div className="grid grid-cols-5 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-6">
              {/* Esquina Azul: Jugador */}
              <div className="col-span-2 flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/50 bg-blue-950/40 text-xl font-black text-blue-300 shadow-lg">
                  {player.name.charAt(0)}
                </div>
                <h4 className="mt-2 text-base font-extrabold text-white">{player.name}</h4>
                <p className="text-xs text-slate-400">
                  {player.record.wins}-{player.record.losses} · OVR {player.overall}
                </p>
                <span className="mt-1 rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                  ESQUINA AZUL
                </span>
              </div>

              {/* VS */}
              <div className="col-span-1 flex flex-col items-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-orange-500 text-sm font-black text-white shadow-lg">
                  VS
                </span>
              </div>

              {/* Esquina Roja: Rival */}
              <div className="col-span-2 flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/50 bg-red-950/40 text-xl font-black text-red-300 shadow-lg">
                  {bout.opponent.name.charAt(0)}
                </div>
                <h4 className="mt-2 text-base font-extrabold text-white">{bout.opponent.name}</h4>
                <p className="text-xs text-slate-400">
                  {bout.opponent.record.wins}-{bout.opponent.record.losses} · OVR {bout.opponent.ovr}
                </p>
                <span className="mt-1 rounded-md bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-300">
                  ESQUINA ROJA
                </span>
              </div>
            </div>

            {/* Bonificaciones preparadas del campamento */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Game Plan Elegido</p>
                <p className="text-sm font-black text-white capitalize">{bout.gamePlan.replace('-', ' ')}</p>
                <p className="text-[10px] text-emerald-400">+15% Eficacia táctica</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Intensidad de Campamento</p>
                <p className="text-sm font-black text-white capitalize">{bout.intensity}</p>
                <p className="text-[10px] text-amber-400">Preparación completa</p>
              </div>
            </div>

            {/* Bolsas en juego */}
            <div className="flex items-center justify-around rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-emerald-300">
              <span>Bolsa presentación: <strong>${bout.showPurse.toLocaleString()}</strong></span>
              <span>•</span>
              <span>Bono de victoria: <strong>+${bout.winPurse.toLocaleString()}</strong></span>
            </div>

            {/* Botón de inicio */}
            <button
              onClick={simulateFight}
              className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 py-4 text-base font-black tracking-wider text-white shadow-xl shadow-red-900/50 transition hover:brightness-110 active:scale-[0.98]"
            >
              <Swords className="h-5 w-5" />
              ¡ENTRAR AL OCTÁGONO Y PELEAR!
            </button>
          </div>
        )}

        {stage === 'simulating' && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-600/20 text-red-400 ring-2 ring-red-500/40 animate-pulse">
              <Swords className="h-10 w-10 animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-white">¡COMBATE EN CURSO!</h3>
            <p className="mt-2 max-w-sm text-sm text-slate-400">
              Los peleadores intercambian en el centro de la jaula. El árbitro sigue atentamente cada acción...
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-amber-400">
              <Zap className="h-4 w-4 animate-spin" /> Aplicando Game Plan y ajustes de asalto...
            </div>
          </div>
        )}

        {stage === 'result' && result && (
          <div className="relative flex flex-col gap-6 text-center">
            <div>
              {result.won ? (
                <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-900/30">
                  <Trophy className="h-8 w-8" />
                </div>
              ) : (
                <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/40 bg-rose-500/20 text-rose-400 shadow-lg shadow-rose-900/30">
                  <XCircle className="h-8 w-8" />
                </div>
              )}

              <h3 className={`text-3xl font-black sm:text-4xl ${result.won ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.won ? '¡VICTORIA OFICIAL!' : 'DERROTA'}
              </h3>
              <p className="mt-1 text-sm font-bold text-white">
                Método: {result.method} · Asalto {result.round} ({result.time})
              </p>
            </div>

            {/* Narrativa oficial */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left text-sm leading-relaxed text-slate-300">
              {result.narrative}
            </div>

            {/* Recompensas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Bolsa Cobrada</p>
                <p className="text-xl font-black text-emerald-400">+${result.payout.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Nuevos Fanáticos</p>
                <p className="text-xl font-black text-amber-400">+{result.fansGained.toLocaleString()}</p>
              </div>
            </div>

            {/* Feedback Especial de Promotora y DWCS */}
            {bout.isDwcs && (
              result.won && result.contractGranted ? (
                <div className="flex items-center gap-3 rounded-2xl border border-amber-500/50 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 p-4 text-left text-xs font-semibold text-amber-200">
                  <Sparkles className="h-6 w-6 shrink-0 text-amber-400" />
                  <div>
                    <p className="font-black text-amber-300 uppercase tracking-wider text-sm">¡CONTRATO UFC OTORGADO POR DANA WHITE!</p>
                    <p className="mt-0.5 text-slate-200 leading-snug">{result.contractDecisionNote}</p>
                  </div>
                </div>
              ) : result.won && !result.contractGranted ? (
                <div className="flex items-center gap-3 rounded-2xl border border-rose-500/50 bg-rose-950/40 p-4 text-left text-xs font-semibold text-rose-200">
                  <AlertTriangle className="h-6 w-6 shrink-0 text-rose-400" />
                  <div>
                    <p className="font-black text-rose-300 uppercase tracking-wider text-sm">REGLA DANA WHITE: SIN CONTRATO UFC</p>
                    <p className="mt-0.5 text-slate-200 leading-snug">{result.contractDecisionNote}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl border border-rose-500/50 bg-rose-950/40 p-4 text-left text-xs font-semibold text-rose-200">
                  <ShieldAlert className="h-6 w-6 shrink-0 text-rose-400" />
                  <div>
                    <p className="font-black text-rose-300 uppercase tracking-wider text-sm">VETO DE UFC: 52 SEMANAS</p>
                    <p className="mt-0.5 text-slate-200 leading-snug">{result.contractDecisionNote}</p>
                  </div>
                </div>
              )
            )}

            {(bout.organization || '').toUpperCase().includes('CAGE') && result.won && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-left text-xs font-bold text-emerald-300">
                <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>+200% Fama Europea masiva aplicada en tu ganancia de fanáticos.{!result.method.includes('Decisión') ? ' ¡+$1,000 extra por Finalización cobrados!' : ''}</span>
              </div>
            )}

            <button
              onClick={handleFinalize}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 py-3.5 text-base font-black tracking-wider text-white shadow-xl shadow-red-900/40 transition hover:brightness-110 active:scale-[0.98]"
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
