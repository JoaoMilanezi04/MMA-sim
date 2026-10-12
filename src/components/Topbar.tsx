import { Bell, DollarSign, Zap } from 'lucide-react'
import { useGame, usePlayer } from '../context/GameContext'

export default function Topbar() {
  const { state } = useGame()
  const p = usePlayer()
  const energyPct = Math.round((p.energy / p.maxEnergy) * 100)

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] bg-[#05070a]/95 px-6 py-3.5 backdrop-blur-md font-chakra xl:px-10">
      {/* Indicador de Transmisión / Ubicación */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] border-t-white/[0.15] bg-[#111622]/90 px-3.5 py-1.5 shadow-md">
          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-[11px] font-black uppercase tracking-wider text-white">
            TEMPORADA {state.currentYear}
          </span>
          <span className="text-[11px] font-black text-rose-400">
            · SEMANA {state.currentWeek}
          </span>
        </div>
      </div>

      {/* Bloque HUD Financiero y Físico */}
      <div className="flex flex-wrap items-center gap-3 xl:gap-4">
        {/* Cartera de Dinero */}
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 border-t-emerald-400/50 bg-[#064e3b]/20 px-3.5 py-1.5 text-sm font-black text-emerald-400 font-mono shadow-md">
          <DollarSign className="h-4 w-4" />
          <span>${p.money.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">USD</span>
        </div>

        {/* Medidor de Energía Semanal (Batería Deportiva) */}
        <div className="flex min-w-56 items-center gap-3 rounded-xl border border-white/[0.08] border-t-white/[0.15] bg-[#111622]/90 px-3.5 py-1.5 shadow-md">
          <Zap className="h-4 w-4 shrink-0 text-amber-300 drop-shadow" fill="currentColor" />
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-[10px] font-black tracking-wider uppercase text-slate-300">
              <span>ENERGÍA</span>
              <span className="text-amber-300 font-mono">
                {p.energy} / {p.maxEnergy} <span className="text-slate-500">({energyPct}%)</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 transition-all duration-500"
                style={{ width: `${energyPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Buzón de Notificaciones */}
        <button
          id="inbox-button"
          title="Buzón de notificaciones"
          className="relative cursor-pointer rounded-xl border border-white/[0.08] border-t-white/[0.15] bg-[#111622]/90 p-2 text-slate-400 transition hover:border-red-500/50 hover:bg-white/10 hover:text-white"
        >
          <Bell className="h-4 w-4" />
          {state.world.news.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white ring-2 ring-[#0a0d14]">
              {Math.min(9, state.world.news.length)}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
