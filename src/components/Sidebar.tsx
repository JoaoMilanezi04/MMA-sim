import {
  Briefcase,
  ChevronRight,
  Dumbbell,
  Flame,
  Home,
  Settings,
  Swords,
  Trophy,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useGame } from '../context/GameContext'
import type { Section } from '../types/game'

const ITEMS: { id: Section; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Dashboard / Inicio', icon: Home },
  { id: 'gym', label: 'Gimnasio y Entrenamiento', icon: Dumbbell },
  { id: 'fights', label: 'Campamento y Peleas', icon: Swords },
  { id: 'rankings', label: 'Rankings y Carrera', icon: Trophy },
  { id: 'life', label: 'Vida y Negocios', icon: Briefcase },
  { id: 'settings', label: 'Ajustes', icon: Settings },
]

export default function Sidebar() {
  const { state, activeSection, setSection, nextWeek } = useGame()

  return (
    <aside className="sticky top-0 flex h-screen w-20 shrink-0 flex-col border-r border-white/[0.08] bg-[#05070a] shadow-2xl lg:w-72">
      {/* Brand Header */}
      <div className="flex items-center justify-center gap-3 border-b border-white/[0.08] px-4 py-5 lg:justify-start">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-orange-500 shadow-lg shadow-red-950/60 ring-1 ring-white/20">
          <Flame className="h-5 w-5 text-white" />
        </div>
        <div className="hidden leading-tight lg:block">
          <p className="font-teko text-2xl font-black tracking-wider text-white leading-none">MMA CAREER</p>
          <p className="font-chakra text-[9px] font-black tracking-[0.35em] text-red-500 uppercase mt-0.5">
            SIMULATOR · PRO
          </p>
        </div>
      </div>

      {/* Navegación Vertical */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-5">
        <ul className="flex flex-col gap-1.5">
          {ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeSection === id
            return (
              <li key={id}>
                <button
                  id={`nav-${id}`}
                  title={label}
                  onClick={() => setSection(id)}
                  className={`group relative flex w-full cursor-pointer items-center justify-center gap-3.5 rounded-xl px-3 py-3 text-left font-chakra text-xs font-bold uppercase tracking-wider transition-all duration-150 lg:justify-start lg:px-3.5 ${
                    active
                      ? 'border-l-4 border-red-600 bg-red-600/[0.12] text-white shadow-sm'
                      : 'border-l-4 border-transparent text-slate-400 hover:border-white/20 hover:bg-white/[0.03] hover:text-slate-200'
                  }`}
                >
                  <Icon
                    className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-105 ${
                      active ? 'text-rose-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span className="hidden truncate lg:inline">{label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Botón NEXT WEEK / FIGHT WEEK estilo Disparador de Marquesina Deportiva */}
      <div className="border-t border-white/[0.08] p-3 lg:p-4">
        {state.activeBout?.weeksRemaining === 0 ? (
          <button
            id="fight-week-button"
            title="Ir al pesaje y combate"
            onClick={() => setSection('fights')}
            className="group relative flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/20 border-t-white/40 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 py-3.5 text-center text-white shadow-[0_0_35px_rgba(225,29,72,0.8)] animate-pulse transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
          >
            <Swords className="h-5 w-5 shrink-0" />
            <span className="relative hidden lg:inline font-teko text-2xl font-black uppercase tracking-[0.2em] leading-none">
              PESAJE Y PELEA
            </span>
          </button>
        ) : (
          <button
            id="next-week-button"
            title="Avanzar a la siguiente semana"
            onClick={nextWeek}
            className="group relative flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/20 border-t-white/40 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 py-3.5 text-center text-white shadow-[0_10px_30px_rgba(225,29,72,0.45)] transition-all duration-200 hover:shadow-[0_0_35px_rgba(225,29,72,0.7)] hover:brightness-110 active:scale-[0.98]"
          >
            <span className="relative hidden lg:inline font-teko text-2xl font-black uppercase tracking-[0.2em] leading-none">
              NEXT WEEK
            </span>
            <ChevronRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        )}
      </div>
    </aside>
  )
}
