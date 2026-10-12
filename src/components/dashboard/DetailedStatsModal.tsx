import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Award, Shield, Swords, Users, X, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FighterStats } from '../../types/game'

interface StatDetail {
  key: keyof FighterStats
  label: string
  desc: string
}

interface DisciplineCategory {
  id: string
  title: string
  subtitle: string
  icon: LucideIcon
  accentColor: string
  gaugeColor: string
  keys: (keyof FighterStats)[]
  details: StatDetail[]
}

const CATEGORIES: DisciplineCategory[] = [
  {
    id: 'striking',
    title: 'STRIKING',
    subtitle: 'Combate en Pie',
    icon: Swords,
    accentColor: 'text-red-400',
    gaugeColor: 'from-red-600 to-rose-400',
    keys: ['punching', 'kicking', 'defense', 'headMovement'],
    details: [
      { key: 'punching', label: 'Boxeo / Manos', desc: 'Precisión y pegada con combinaciones de puños.' },
      { key: 'kicking', label: 'Patadas / Piernas', desc: 'Rango y daño con patadas a las piernas y cabeza.' },
      { key: 'defense', label: 'Guardia & Bloqueo', desc: 'Capacidad para absorber y amortiguar golpes limpios.' },
      { key: 'headMovement', label: 'Movimiento de Cabeza', desc: 'Esquivas, cabeceo y balance defensivo.' },
    ],
  },
  {
    id: 'wrestling',
    title: 'WRESTLING',
    subtitle: 'Lucha & Derribos',
    icon: Users,
    accentColor: 'text-amber-400',
    gaugeColor: 'from-amber-500 to-yellow-400',
    keys: ['takedowns', 'takedownDefense', 'clinch'],
    details: [
      { key: 'takedowns', label: 'Entradas de Derribo', desc: 'Double legs, single legs y levantamientos explosivos.' },
      { key: 'takedownDefense', label: 'Defensa TDD / Sprawl', desc: 'Reacción inmediata de sprawl y defensa de caderas.' },
      { key: 'clinch', label: 'Control de Clinch / Malla', desc: 'Presión asfixiante contra la jaula y rodillazos cortos.' },
    ],
  },
  {
    id: 'grappling',
    title: 'GRAPPLING',
    subtitle: 'Lona & Sumisiones',
    icon: Shield,
    accentColor: 'text-sky-400',
    gaugeColor: 'from-sky-500 to-blue-400',
    keys: ['submissions', 'groundControl', 'submissionDefense'],
    details: [
      { key: 'submissions', label: 'Ataque de Sumisión', desc: 'Peligro con estrangulaciones y palancas articulares.' },
      { key: 'groundControl', label: 'Control Posicional', desc: 'Retención de guardia, montada y toma de espalda.' },
      { key: 'submissionDefense', label: 'Defensa & Escapes', desc: 'Técnica para zafarse de llaves y evitar finalizar.' },
    ],
  },
  {
    id: 'athleticism',
    title: 'ATLETISMO',
    subtitle: 'Condición Física',
    icon: Zap,
    accentColor: 'text-emerald-400',
    gaugeColor: 'from-emerald-500 to-teal-400',
    keys: ['cardio', 'power', 'speed', 'chin', 'recovery'],
    details: [
      { key: 'cardio', label: 'Cardio & Resistencia', desc: 'Estamina aeróbica para mantener ritmo en asaltos 2 y 3.' },
      { key: 'power', label: 'Potencia & Fuerza', desc: 'Fuerza explosiva para knockdowns y forcejeos.' },
      { key: 'speed', label: 'Velocidad & Timing', desc: 'Rapidez de manos, pies y reflejos visuales.' },
      { key: 'chin', label: 'Barbilla (Chin)', desc: 'Tolerancia a impactos para resistir el KO o aturdimiento.' },
      { key: 'recovery', label: 'Recuperación', desc: 'Habilidad de regenerar energía en el minuto de descanso.' },
    ],
  },
]

function getScore(stats: FighterStats, keys: (keyof FighterStats)[]): number {
  const sum = keys.reduce((acc, k) => acc + (stats[k] || 0), 0)
  return Math.round(sum / keys.length)
}

function getValueColor(val: number): string {
  if (val >= 75) return 'text-emerald-300'
  if (val >= 55) return 'text-amber-300'
  return 'text-rose-300'
}

interface Props {
  stats: FighterStats
  isOpen: boolean
  onClose: () => void
}

export default function DetailedStatsModal({ stats, isOpen, onClose }: Props) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#090d19] shadow-2xl ring-1 ring-white/10"
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-white/10 p-5 sm:px-7 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 text-white shadow-lg shadow-red-950/60">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-wide text-white sm:text-xl">
                FICHA TÉCNICA DETALLADA
              </h3>
              <p className="text-xs text-slate-400">
                Desglose biométrico y técnico de los 15 atributos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-red-500/50 hover:bg-red-600/20 hover:text-white active:scale-95"
          >
            <X className="h-4 w-4" />
            <span>✕ Cerrar</span>
          </button>
        </div>

        {/* Contenedor Scrolleable con los 15 Atributos */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {CATEGORIES.map((cat) => {
              const score = getScore(stats, cat.keys)
              const Icon = cat.icon

              return (
                <div
                  key={cat.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 shadow-inner"
                >
                  {/* Título de Disciplina con score */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${cat.accentColor}`} />
                      <h4 className="text-sm font-black text-white">{cat.title}</h4>
                      <span className="text-xs text-slate-400">· {cat.subtitle}</span>
                    </div>
                    <span className={`font-mono text-base font-black ${cat.accentColor}`}>
                      PROM {score}
                    </span>
                  </div>

                  {/* Lista de Atributos Específicos */}
                  <div className="mt-3 flex flex-col gap-3.5">
                    {cat.details.map((item) => {
                      const val = stats[item.key] || 0
                      return (
                        <div key={item.key} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-200">{item.label}</span>
                            <span className={`font-mono font-black ${getValueColor(val)}`}>
                              {val}
                            </span>
                          </div>

                          {/* Barra individual */}
                          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${cat.gaugeColor} transition-all duration-300`}
                              style={{ width: `${Math.min(100, val)}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 leading-tight">
                            {item.desc}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pie del Modal */}
        <div className="flex items-center justify-between border-t border-white/10 bg-[#060913] px-5 py-4 sm:px-7">
          <p className="text-xs text-slate-500">
            Valores actualizados según tu plan de entrenamiento semanal.
          </p>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-red-950 transition hover:brightness-110 active:scale-95"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
