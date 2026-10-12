import { useState } from 'react'
import {
  Activity,
  Award,
  ChevronRight,
  Shield,
  Swords,
  Users,
  X,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { usePlayer } from '../context/GameContext'
import type { FighterStats } from '../types/game'

interface StatItem {
  key: keyof FighterStats
  label: string
  desc: string
}

interface DisciplineBlock {
  title: string
  subtitle: string
  icon: LucideIcon
  accentColor: string
  gaugeColor: string
  items: StatItem[]
}

const DISCIPLINES: DisciplineBlock[] = [
  {
    title: 'STRIKING',
    subtitle: 'Combate de Pie',
    icon: Swords,
    accentColor: 'text-red-400',
    gaugeColor: '#ef4444',
    items: [
      { key: 'punching', label: 'Boxeo / Manos', desc: 'Precisión y pegada con puños cerrados' },
      { key: 'kicking', label: 'Patadas / Piernas', desc: 'Rango de golpeo con patadas bajas y altas' },
      { key: 'defense', label: 'Guardia & Bloqueo', desc: 'Capacidad para absorber y desviar golpes' },
      { key: 'headMovement', label: 'Movimiento de Cabeza', desc: 'Esquivas, cabeceo y fintas defensivas' },
    ],
  },
  {
    title: 'WRESTLING',
    subtitle: 'Lucha & Derribos',
    icon: Users,
    accentColor: 'text-amber-400',
    gaugeColor: '#f59e0b',
    items: [
      { key: 'takedowns', label: 'Entradas de Derribo', desc: 'Single legs, double legs y suplexes' },
      { key: 'takedownDefense', label: 'Defensa TDD / Sprawl', desc: 'Resistencia a derribos y reacción de sprawl' },
      { key: 'clinch', label: 'Control de Clinch / Malla', desc: 'Presión contra la jaula y thai clinch' },
    ],
  },
  {
    title: 'GRAPPLING / BJJ',
    subtitle: 'Lona & Sumisiones',
    icon: Shield,
    accentColor: 'text-sky-400',
    gaugeColor: '#38bdf8',
    items: [
      { key: 'submissions', label: 'Ataque de Sumisión', desc: 'Peligro de finalizaciones y llaves articulares' },
      { key: 'groundControl', label: 'Control Posicional', desc: 'Retención de montada, media guardia y espalda' },
      { key: 'submissionDefense', label: 'Defensa & Escapes', desc: 'Resistencia técnica a estrangulamientos y llaves' },
    ],
  },
  {
    title: 'ATLETISMO',
    subtitle: 'Atributos Base',
    icon: Zap,
    accentColor: 'text-emerald-400',
    gaugeColor: '#10b981',
    items: [
      { key: 'cardio', label: 'Cardio & Resistencia', desc: 'Depósito de estamina en asaltos profundos' },
      { key: 'power', label: 'Fuerza Bruta', desc: 'Pegada explosiva y ventaja en forcejeos' },
      { key: 'speed', label: 'Velocidad & Timing', desc: 'Rapidez de pies y tiempo de reacción' },
      { key: 'chin', label: 'Barbilla (Chin)', desc: 'Resistencia a ser noqueado o aturdido' },
      { key: 'recovery', label: 'Recuperación', desc: 'Capacidad de resetear estamina entre rounds' },
    ],
  },
]

function getBarColor(val: number): string {
  if (val >= 75) return 'from-emerald-400 via-teal-400 to-cyan-400'
  if (val >= 55) return 'from-amber-400 via-yellow-400 to-amber-500'
  return 'from-orange-500 to-rose-500'
}

function getValueColor(val: number): string {
  if (val >= 75) return 'text-emerald-300'
  if (val >= 55) return 'text-amber-300'
  return 'text-rose-300'
}

export default function StatsPanel() {
  const stats = usePlayer().stats
  const [showModal, setShowModal] = useState(false)

  return (
    <section className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#111726]/90 via-[#0c101c]/90 to-[#080b14] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
      <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-red-600/10 blur-3xl" />

      <div>
        {/* Título de Sección */}
        <div className="relative mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white drop-shadow">
              Habilidades de Combate
            </h2>
            <p className="text-xs text-slate-400">
              Evaluación de rendimiento en los 4 pilares del MMA
            </p>
          </div>

          <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black tracking-widest text-slate-300 uppercase">
            <Activity className="h-3 w-3 text-red-400" /> ATRIBUTOS LIVE
          </span>
        </div>

        {/* 4 Bloques Cuadrantes con Micro-Anillos y Barras */}
        <div className="relative grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {DISCIPLINES.map((d) => {
            const Icon = d.icon
            const avg = Math.round(
              d.items.reduce((acc, curr) => acc + (stats[curr.key] ?? 0), 0) / d.items.length
            )
            const radius = 18
            const circum = 2 * Math.PI * radius
            const offset = circum - (Math.min(100, avg) / 100) * circum

            return (
              <div
                key={d.title}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.025] p-3.5 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.05]"
              >
                {/* Header del Cuadrante */}
                <div className="mb-2.5 flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-slate-300 group-hover:scale-105 transition-transform">
                      <Icon className={`h-4 w-4 ${d.accentColor}`} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-white">
                        {d.title}
                      </h3>
                      <p className="text-[9px] font-semibold text-slate-500 uppercase">
                        {d.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Micro-Anillo Radial del Promedio */}
                  <div className="relative flex h-11 w-11 items-center justify-center">
                    <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 44 44">
                      <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        className="stroke-white/10"
                        strokeWidth="3.5"
                        fill="transparent"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        stroke={d.gaugeColor}
                        strokeWidth="3.5"
                        fill="transparent"
                        strokeDasharray={circum}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <span className={`absolute text-xs font-black tabular-nums ${getValueColor(avg)}`}>
                      {avg}
                    </span>
                  </div>
                </div>

                {/* Sub-barras compactas */}
                <div className="flex flex-col gap-2">
                  {d.items.slice(0, 3).map(({ key, label }) => {
                    const val = stats[key] ?? 0
                    const barColor = getBarColor(val)
                    const valColor = getValueColor(val)

                    return (
                      <div key={key} className="flex flex-col gap-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-300 truncate pr-2">
                            {label}
                          </span>
                          <span className={`font-black tabular-nums text-xs ${valColor}`}>
                            {val}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
                            style={{ width: `${Math.min(100, Math.max(5, val))}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Botón para abrir el Desglose Avanzado de Atributos */}
      <div className="mt-4 border-t border-white/10 pt-3">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-200 transition-all hover:border-red-500/40 hover:bg-white/[0.08] hover:text-white"
        >
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Desglose Avanzado de Atributos (15 Stats)</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-white" />
        </button>
      </div>

      {/* MODAL: Desglose Avanzado Completo */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/20 bg-gradient-to-b from-[#111728] via-[#0b0f1a] to-[#060810] p-6 shadow-2xl">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/20 text-red-400 ring-1 ring-red-500/40">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">
                    Desglose Completo de Atributos
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ficha analítica exhaustiva de habilidades marciales
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="cursor-pointer rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Listado Completo por Categorías */}
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              {DISCIPLINES.map((d) => (
                <div
                  key={d.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center gap-2 border-b border-white/5 pb-2">
                    <d.icon className={`h-4 w-4 ${d.accentColor}`} />
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      {d.title} · {d.subtitle}
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {d.items.map(({ key, label, desc }) => {
                      const val = stats[key] ?? 0
                      const barColor = getBarColor(val)
                      const valColor = getValueColor(val)

                      return (
                        <div key={key} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-white">{label}</span>
                              <p className="text-[10px] text-slate-400">{desc}</p>
                            </div>
                            <span className={`text-sm font-black tabular-nums ${valColor}`}>
                              {val}
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                              style={{ width: `${Math.min(100, Math.max(5, val))}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Modal */}
            <div className="mt-6 flex justify-end border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="cursor-pointer rounded-xl bg-white/10 px-5 py-2 text-xs font-bold text-white hover:bg-white/20"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
