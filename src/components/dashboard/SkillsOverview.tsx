import { useState } from 'react'
import {
  Activity,
  Eye,
  Shield,
  Swords,
  Users,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { usePlayer } from '../../context/GameContext'
import type { FighterStats } from '../../types/game'
import DetailedStatsModal from './DetailedStatsModal'

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
  badgeBg: string
  gaugeColor: string
  keys: (keyof FighterStats)[]
  highlights: string
  details: StatDetail[]
}

const CATEGORIES: DisciplineCategory[] = [
  {
    id: 'striking',
    title: 'STRIKING',
    subtitle: 'Combate en Pie',
    icon: Swords,
    accentColor: 'text-red-400',
    badgeBg: 'bg-red-500/15 border-red-500/30 text-red-300',
    gaugeColor: 'from-red-600 to-rose-400',
    keys: ['punching', 'kicking', 'defense', 'headMovement'],
    highlights: 'Pegada con manos, patadas bajas/altas, guardia y cabeceo.',
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
    badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
    gaugeColor: 'from-amber-500 to-yellow-400',
    keys: ['takedowns', 'takedownDefense', 'clinch'],
    highlights: 'Entradas de derribo, defensa de sprawl y presión en malla.',
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
    badgeBg: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
    gaugeColor: 'from-sky-500 to-blue-400',
    keys: ['submissions', 'groundControl', 'submissionDefense'],
    highlights: 'Peligro de sumisión, retención posicional y escapes técnicos.',
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
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    gaugeColor: 'from-emerald-500 to-teal-400',
    keys: ['cardio', 'power', 'speed', 'chin', 'recovery'],
    highlights: 'Tanque de oxígeno, dinamita muscular, rapidez y quijada.',
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

export default function SkillsOverview() {
  const stats = usePlayer().stats
  const [showDetailedModal, setShowDetailedModal] = useState(false)

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#111728]/95 via-[#0b101d]/95 to-[#050811] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
      {/* Cabecera */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-orange-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            EVALUACIÓN TÉCNICA · HABILIDADES GLOBALES
          </h3>
        </div>

        <button
          onClick={() => setShowDetailedModal(true)}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-red-500/50 hover:bg-red-600/10 hover:text-white"
        >
          <Eye className="h-3.5 w-3.5 text-red-400" />
          <span>Ver Análisis Detallado (15 Stats)</span>
        </button>
      </div>

      {/* Grid de 4 Módulos Horizontales Sintéticos */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {CATEGORIES.map((cat) => {
          const score = getScore(stats, cat.keys)
          const Icon = cat.icon

          return (
            <div
              key={cat.id}
              onClick={() => setShowDetailedModal(true)}
              className="group relative flex cursor-pointer flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-4 transition-all duration-200 hover:border-white/30 hover:bg-white/[0.07]"
            >
              <div>
                {/* Cabecera de Disciplina */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                      <Icon className={`h-4 w-4 ${cat.accentColor}`} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white group-hover:text-red-300 transition-colors">
                        {cat.title}
                      </p>
                      <p className="text-[10px] text-slate-400 leading-none">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Valor Principal */}
                  <span className={`font-mono text-xl font-black ${cat.accentColor}`}>
                    {score}
                  </span>
                </div>

                {/* Barra de Progreso */}
                <div className="my-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${cat.gaugeColor} transition-all duration-500`}
                    style={{ width: `${Math.min(100, score)}%` }}
                  />
                </div>

                {/* Resumen de Habilidades */}
                <p className="text-[11px] text-slate-400 leading-tight">
                  {cat.highlights}
                </p>
              </div>

              {/* Pie con indicador de detalle */}
              <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-slate-500 group-hover:text-slate-300 transition-colors">
                <span>{cat.keys.length} atributos clave</span>
                <span className="font-bold">Detalle ➔</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Desplegable de Ficha Técnica Detallada (Renderizado vía Portal en body) */}
      <DetailedStatsModal
        stats={stats}
        isOpen={showDetailedModal}
        onClose={() => setShowDetailedModal(false)}
      />
    </section>
  )
}
