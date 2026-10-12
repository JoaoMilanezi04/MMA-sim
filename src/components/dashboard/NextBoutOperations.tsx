import { useState } from 'react'
import {
  AlertCircle,
  ChevronRight,
  Clock,
  Flame,
  ShieldAlert,
  Swords,
} from 'lucide-react'
import { useGame, usePlayer } from '../../context/GameContext'
import FighterAvatar from '../common/FighterAvatar'
import FightSimulationView from '../fight/FightSimulationView'

export default function NextBoutOperations() {
  const { state, setSection } = useGame()
  const player = usePlayer()
  const activeBout = state.activeBout
  const contract = player.contract
  const [showFightNight, setShowFightNight] = useState(false)

  const isFightWeek = Boolean(activeBout && activeBout.weeksRemaining <= 0)
  const organization = player.organization || (player.status === 'Pro' ? 'LFA' : 'Circuito Amateur')

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] border-t-white/[0.18] bg-[#111622]/90 p-5 shadow-2xl backdrop-blur-md sm:p-6">
      {/* Resplandor ambiental de combate */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-600/10 blur-3xl" />

      {/* Cabecera del Centro de Operaciones */}
      <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-orange-500 text-white shadow-md shadow-red-950/60 ring-1 ring-white/10">
            <Swords className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
              CENTRO DE OPERACIONES · PRÓXIMO COMBATE
            </h2>
            <p className="text-[11px] text-slate-400">
              {activeBout ? 'Cartelera oficial pactada y campamento de preparación' : 'Gestión de emparejamientos y ofertas de promotoras'}
            </p>
          </div>
        </div>

        <span
          className={`rounded-lg px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-wider ${
            activeBout
              ? isFightWeek
                ? 'border border-rose-500/50 bg-rose-500/20 text-rose-300 animate-pulse'
                : 'border border-amber-500/40 bg-amber-500/15 text-amber-300'
              : 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
          }`}
        >
          {activeBout ? (isFightWeek ? '● FIGHT WEEK' : '● CAMPAMENTO ACTIVO') : '● DISPONIBLE PARA PELEAR'}
        </span>
      </div>

      {/* ========================================================= */}
      {/* CASO 1: PELEA PACTADA (ESCENARIO VISUAL FACE-OFF)         */}
      {/* ========================================================= */}
      {activeBout ? (
        <div className="relative flex flex-col gap-5">
          {/* Tarjeta de Enfrentamiento Cara a Cara */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-blue-950/30 via-black/50 to-red-950/30 p-4 sm:p-5 shadow-inner">
            <div className="grid grid-cols-5 items-center gap-2 sm:gap-4 text-center">
              {/* Esquina Azul: Jugador */}
              <div className="col-span-2 flex flex-col items-center">
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-2xl border-2 border-blue-500/60 bg-slate-950 p-1 shadow-xl shadow-blue-950/60">
                  <FighterAvatar
                    appearance={player.appearance}
                    seed={player.name}
                    className="h-full w-full rounded-xl"
                  />
                </div>
                <h4 className="mt-2 truncate max-w-[140px] text-xs sm:text-sm font-black text-white">
                  {player.name}
                </h4>
                <div className="mt-0.5 flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-blue-300 font-mono">
                  <span>{player.record.wins}-{player.record.losses}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-blue-400">OVR {player.overall}</span>
                </div>
              </div>

              {/* VS Central y Cuenta Regresiva */}
              <div className="col-span-1 flex flex-col items-center justify-center">
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-black uppercase text-slate-300">
                  {activeBout.organization}
                </span>
                <span className="my-2 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 text-sm sm:text-base font-black text-white shadow-xl shadow-red-950 ring-2 ring-black">
                  VS
                </span>
                <span className={`text-[10px] font-black uppercase tracking-wider ${
                  isFightWeek ? 'text-red-400 animate-pulse' : 'text-amber-400'
                }`}>
                  {isFightWeek ? 'SEMANA 0' : `${activeBout.weeksRemaining} SEM`}
                </span>
              </div>

              {/* Esquina Roja: Rival */}
              <div className="col-span-2 flex flex-col items-center">
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-2xl border-2 border-red-500/60 bg-slate-950 p-1 shadow-xl shadow-red-950/60">
                  <FighterAvatar
                    seed={activeBout.opponent.name}
                    country={activeBout.opponent.country}
                    className="h-full w-full rounded-xl"
                  />
                </div>
                <h4 className="mt-2 truncate max-w-[140px] text-xs sm:text-sm font-black text-white">
                  {activeBout.opponent.name}
                </h4>
                <div className="mt-0.5 flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-red-300 font-mono">
                  <span>{activeBout.opponent.record.wins}-{activeBout.opponent.record.losses}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-red-400">OVR {activeBout.opponent.ovr}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fila Informativa: Countdown, Game Plan y Scouting */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
            {/* Cuenta Regresiva */}
            <div className={`rounded-2xl border p-3.5 ${
              isFightWeek
                ? 'border-red-500/60 bg-red-950/30'
                : 'border-white/5 bg-white/[0.02]'
            }`}>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>PLAZO DE PELEA</span>
              </div>
              <p className={`mt-1 font-black ${isFightWeek ? 'text-red-300' : 'text-white'}`}>
                {isFightWeek ? '¡SEMANA DE PELEA!' : `${activeBout.weeksRemaining} ${activeBout.weeksRemaining === 1 ? 'semana restante' : 'semanas restantes'}`}
              </p>
            </div>

            {/* Game Plan */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                <span>GAME PLAN ACTIVO</span>
              </div>
              <p className="mt-1 font-black text-white capitalize truncate">
                {activeBout.gamePlan.replace('-', ' ')}
              </p>
            </div>

            {/* Dificultad */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <AlertCircle className="h-3.5 w-3.5 text-sky-400" />
                <span>NIVEL DEL RIVAL</span>
              </div>
              <p className="mt-1 font-black text-amber-300 capitalize">
                {activeBout.opponent.difficulty === 'favorable' ? 'Combate Favorable' : activeBout.opponent.difficulty === 'dangerous' ? 'Rival Peligroso' : 'Combate Parejo'}
              </p>
            </div>
          </div>

          {/* Scout Report del Head Coach */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 text-xs text-slate-300 leading-relaxed">
            <strong className="text-amber-300">Scout Report:</strong> "{activeBout.opponent.scoutReport}"
          </div>

          {/* Botón de Acción Principal */}
          {isFightWeek ? (
            <button
              onClick={() => setShowFightNight(true)}
              className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-white/20 border-t-white/40 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 py-3.5 text-center text-white shadow-[0_0_35px_rgba(225,29,72,0.7)] transition-all hover:brightness-110 active:scale-[0.98] animate-pulse"
            >
              <Swords className="h-5 w-5" />
              <span className="font-teko text-2xl font-black uppercase tracking-[0.2em] leading-none">
                IR AL PESAJE Y NOCHE DE PELEA
              </span>
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          ) : (
            <button
              onClick={() => setSection('fights')}
              className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 border-t-white/25 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 py-3 text-center text-white shadow-xl shadow-red-950/70 transition-all hover:scale-[1.01] hover:brightness-110 active:scale-[0.98]"
            >
              <span className="font-teko text-xl font-black uppercase tracking-[0.15em] leading-none">
                GESTIONAR CAMPAMENTO & ESTRATEGIA
              </span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </div>
      ) : (
        /* ========================================================= */
        /* CASO 2: SIN PELEA (PANEL TÁCTICO DE MATCHMAKING)          */
        /* ========================================================= */
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] border-t-white/[0.15] bg-[#080c14]/90 p-6 sm:p-8 text-center shadow-inner">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-600/15 text-rose-400 shadow-md">
            <Flame className="h-6 w-6 text-rose-400 animate-pulse" />
          </div>

          <h3 className="font-teko text-2xl sm:text-3xl font-black text-white uppercase tracking-wider leading-none">
            CENTRO DE NEGOCIACIÓN · MATCHMAKING DISPONIBLE
          </h3>
          <p className="mt-1 max-w-lg text-xs text-slate-400 leading-relaxed font-chakra">
            Actualmente sin pelea en el calendario oficial. Oponentes clasificados en tu división esperan negociación de contrato.
          </p>

          {/* Ficha Resumen de la Promotora y Bolsa */}
          <div className="mt-5 grid w-full max-w-md grid-cols-2 gap-3 text-left">
            <div className="rounded-xl border border-white/[0.08] border-t-white/[0.15] bg-[#111622]/90 p-3 text-xs shadow-sm">
              <span className="font-chakra text-[10px] font-black uppercase tracking-wider text-slate-500">Organización</span>
              <p className="mt-1 font-chakra font-black text-amber-300 truncate">
                {contract ? contract.organizationName : organization}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.08] border-t-white/[0.15] bg-[#111622]/90 p-3 text-xs shadow-sm">
              <span className="font-chakra text-[10px] font-black uppercase tracking-wider text-slate-500">Bolsa Base Pactada</span>
              <p className="mt-1 font-mono font-black text-emerald-400 text-sm">
                ${(contract ? contract.showPurse : player.status === 'Pro' ? 2000 : 150).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Botón Táctico de Acción Protagonista */}
          <button
            onClick={() => setSection('fights')}
            className="group mt-6 flex w-full max-w-md cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/20 border-t-white/40 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 py-3.5 text-center text-white shadow-[0_10px_35px_rgba(225,29,72,0.45)] transition-all duration-200 hover:shadow-[0_0_40px_rgba(225,29,72,0.7)] hover:brightness-110 active:scale-[0.98]"
          >
            <span className="font-teko text-2xl font-black uppercase tracking-[0.2em] leading-none">
              PACTAR PRÓXIMO COMBATE ➔
            </span>
          </button>
        </div>
      )}

      {/* Modal de Combate si se activa desde Fight Week */}
      {showFightNight && activeBout && (
        <FightSimulationView
          bout={activeBout}
          onClose={() => setShowFightNight(false)}
        />
      )}
    </section>
  )
}
