import {
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Newspaper,
  Radio,
  ShieldAlert,
  Swords,
  Trophy,
} from 'lucide-react'
import { useGame, usePlayer } from '../context/GameContext'
import FighterAvatar from './common/FighterAvatar'

export default function CareerPanel() {
  const { state, setSection } = useGame()
  const player = usePlayer()
  const activeBout = state.activeBout
  const contract = player.contract

  return (
    <div className="flex flex-col gap-6">
      {/* 1. CENTRO DE OPERACIONES Y MATCHMAKER */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#111726]/90 via-[#0c101c]/90 to-[#080b14] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-red-600/15 blur-3xl" />

        <div className="relative mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Swords className="h-4 w-4 text-red-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-white">
              CENTRO DE OPERACIONES · MATCHMAKING
            </h2>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${
              activeBout
                ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
            }`}
          >
            {activeBout ? 'COMBATE PACTADO' : 'DISPONIBLE'}
          </span>
        </div>

        {activeBout ? (
          /* Cara a Cara (Face-Off) en Cartelera Oficial */
          <div className="relative flex flex-col gap-4">
            <div className="grid grid-cols-5 items-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-r from-blue-950/20 via-black/40 to-red-950/20 p-3.5 text-center shadow-inner">
              {/* Esquina Azul: Jugador */}
              <div className="col-span-2 flex flex-col items-center">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl border-2 border-blue-500/60 bg-slate-950 p-0.5 shadow-lg shadow-blue-950/50">
                  <FighterAvatar
                    appearance={player.appearance}
                    seed={player.name}
                    className="h-full w-full rounded-xl"
                  />
                </div>
                <p className="mt-1.5 truncate max-w-[110px] text-xs font-black text-white">
                  {player.name}
                </p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-300">
                  <span>{player.record.wins}-{player.record.losses}</span>
                  <span>·</span>
                  <span className="font-mono">OVR {player.overall}</span>
                </div>
              </div>

              {/* VS Central con resplandor */}
              <div className="col-span-1 flex flex-col items-center justify-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-orange-500 text-xs font-black text-white shadow-lg shadow-red-950/80 ring-2 ring-black">
                  VS
                </span>
                <span className="mt-1 text-[8px] font-black uppercase tracking-widest text-slate-500">
                  OCTÁGONO
                </span>
              </div>

              {/* Esquina Roja: Rival */}
              <div className="col-span-2 flex flex-col items-center">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl border-2 border-red-500/60 bg-slate-950 p-0.5 shadow-lg shadow-red-950/50">
                  <FighterAvatar
                    seed={activeBout.opponent.name}
                    country={activeBout.opponent.country}
                    className="h-full w-full rounded-xl"
                  />
                </div>
                <p className="mt-1.5 truncate max-w-[110px] text-xs font-black text-white">
                  {activeBout.opponent.name}
                </p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-red-300">
                  <span>{activeBout.opponent.record.wins}-{activeBout.opponent.record.losses}</span>
                  <span>·</span>
                  <span className="font-mono">OVR {activeBout.opponent.ovr}</span>
                </div>
              </div>
            </div>

            {/* Countdown y Scouting Report Táctico */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <Clock className="h-3 w-3 text-amber-400" />
                  <span>CUENTA REGRESIVA</span>
                </div>
                <p className="mt-1 font-black text-amber-300">
                  {activeBout.weeksRemaining <= 0
                    ? '¡SEMANA DE PELEA!'
                    : `Faltan ${activeBout.weeksRemaining} ${activeBout.weeksRemaining === 1 ? 'semana' : 'semanas'}`}
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <ShieldAlert className="h-3 w-3 text-red-400" />
                  <span>GAME PLAN</span>
                </div>
                <p className="mt-1 font-black text-white capitalize truncate">
                  {activeBout.gamePlan.replace('-', ' ')}
                </p>
              </div>
            </div>

            {/* Botón Ancho Iluminado de Preparación */}
            <button
              onClick={() => setSection('fights')}
              className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 py-3 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-red-950/60 ring-1 ring-red-400/40 transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <span>IR AL CAMPAMENTO Y ENTRENAMIENTO</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        ) : (
          /* SIN PELEA: Gran Banner "OFICINA DE COMBATE" */
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-red-950/30 via-black/40 to-black/60 p-5 text-center shadow-inner">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-600/10 text-red-400 shadow-md">
              <Flame className="h-7 w-7 text-red-400 animate-pulse" />
            </div>

            <h3 className="text-base font-black text-white uppercase tracking-tight">
              OFICINA DE COMBATE · MATCHMAKER
            </h3>
            <p className="mt-1 text-xs text-slate-300">
              No tienes un combate agendado en el calendario. Hay oponentes clasificados listos para firmar contrato.
            </p>

            {/* Resumen del Contrato Activo */}
            <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-xs">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-400">Promotora:</span>
                <span className="font-black text-amber-300">
                  {contract ? contract.organizationName : 'Circuito Amateur Regional'}
                </span>
              </div>
              {contract && (
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Bolsa: <strong className="text-emerald-400">${contract.showPurse.toLocaleString()}</strong></span>
                  <span>Restantes: <strong className="text-white">{contract.fightsRemaining} peleas</strong></span>
                </div>
              )}
            </div>

            {/* Botón Iluminado Rojo Fuego */}
            <button
              onClick={() => setSection('fights')}
              className="group mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-red-950/80 ring-1 ring-red-400/50 transition-all hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
            >
              <span>BUSCAR OPONENTE & PACTAR COMBATE</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </section>

      {/* 2. TICKER MUNDIAL DEPORTIVO (Estilo ESPN / UFC TV) */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#111726]/90 via-[#0c101c]/90 to-[#080b14] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <div className="relative mb-3 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-red-500 animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-wider text-white">
              MMA BROADCAST TICKER · NOTICIAS
            </h2>
          </div>
          <button
            onClick={() => setSection('rankings')}
            className="text-[11px] font-bold text-red-400 hover:text-red-300 transition-colors"
          >
            Feed Global ➔
          </button>
        </div>

        {state.world.news.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-slate-500">
            <Newspaper className="mb-2 h-7 w-7 text-slate-600" />
            <p>Sin noticias registradas aún en esta temporada.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {state.world.news.slice(0, 3).map((item) => {
              const badgeTag =
                item.eventType === 'UFC_PPV'
                  ? 'UFC PPV'
                  : item.eventType === 'REGIONAL'
                    ? 'REGIONAL'
                    : item.eventType === 'UFC_FIGHT_NIGHT'
                      ? 'FIGHT NIGHT'
                      : 'NOTICIA'

              return (
                <div
                  key={item.id}
                  onClick={() => setSection('rankings')}
                  className="group relative flex cursor-pointer flex-col gap-1 rounded-2xl border border-white/5 bg-white/[0.02] p-3 transition-all duration-200 hover:border-red-500/40 hover:bg-white/[0.05]"
                >
                  <div className="flex items-center justify-between gap-2 text-[10px]">
                    <span className="rounded bg-red-600/20 px-1.5 py-0.5 font-black text-red-400 ring-1 ring-red-500/30">
                      [{badgeTag}]
                    </span>
                    <span className="font-semibold text-slate-500">
                      Semana {item.week} · {item.year}
                    </span>
                  </div>
                  <p className="text-xs font-bold leading-snug text-white group-hover:text-red-300 transition-colors">
                    {item.headline}
                  </p>
                  {item.impact && (
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {item.impact}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* 3. ACCESOS RÁPIDOS ERGONÓMICOS */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#111726]/90 via-[#0c101c]/90 to-[#080b14] p-5 shadow-2xl backdrop-blur-xl">
        <h2 className="mb-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
          ACCESOS DIRECTOS DEL ATLETA
        </h2>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setSection('gym')}
            className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center transition hover:border-red-500/40 hover:bg-white/5 hover:text-white"
          >
            <Dumbbell className="h-5 w-5 text-orange-400" />
            <span className="text-[11px] font-bold text-slate-300">Gimnasio</span>
          </button>

          <button
            onClick={() => setSection('fights')}
            className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center transition hover:border-red-500/40 hover:bg-white/5 hover:text-white"
          >
            <Swords className="h-5 w-5 text-red-400" />
            <span className="text-[11px] font-bold text-slate-300">Campamento</span>
          </button>

          <button
            onClick={() => setSection('rankings')}
            className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center transition hover:border-red-500/40 hover:bg-white/5 hover:text-white"
          >
            <Trophy className="h-5 w-5 text-amber-400" />
            <span className="text-[11px] font-bold text-slate-300">Rankings</span>
          </button>
        </div>
      </section>
    </div>
  )
}
