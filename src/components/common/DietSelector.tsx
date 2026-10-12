import { Flame, Salad, Scale, ShieldAlert, Sparkles, TrendingDown, TrendingUp } from 'lucide-react'
import { useGame, usePlayer } from '../../context/GameContext'
import { DIVISION_LIMITS, type DietId } from '../../types/game'
import { DIETS } from '../gym/data'

interface Props {
  className?: string
  compact?: boolean
}

export default function DietSelector({ className = '', compact = false }: Props) {
  const { state, setDiet } = useGame()
  const p = usePlayer()
  const limit = DIVISION_LIMITS[p.division]
  const currentWeight = p.currentWeight ?? p.weight
  const diff = Number((currentWeight - limit).toFixed(1))
  const isOnWeight = currentWeight >= limit - 1.5 && currentWeight <= limit
  const overLimit = currentWeight > limit

  return (
    <div className={`flex flex-col gap-5 ${className}`}>
      {/* Resumen de Báscula y Estado Nutricional */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent p-4 shadow-inner">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
              isOnWeight
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : overLimit
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-400'
            }`}>
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Control de Báscula · {p.division}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">
                  {currentWeight.toFixed(1)} <span className="text-xs font-normal text-slate-400">lbs</span>
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  / Objetivo: <strong className="text-white">{limit} lbs</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-black uppercase tracking-wider ${
                isOnWeight
                  ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                  : overLimit
                  ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40'
              }`}
            >
              {isOnWeight
                ? diff === 0
                  ? '¡En Peso Exacto!'
                  : `${Math.abs(diff).toFixed(1)} lbs Bajo Límite (En Peso)`
                : overLimit
                ? `+${diff.toFixed(1)} lbs · Corte Pendiente`
                : `${Math.abs(diff).toFixed(1)} lbs · Bajo Peso Crítico`}
            </span>
            {p.walkingWeight && (
              <p className="mt-1 text-[10px] text-slate-400">
                Peso Natural Fuera de Campamento: <strong className="text-slate-300">{p.walkingWeight.toFixed(1)} lbs</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Selector de Planes de Dieta */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Salad className="h-4 w-4 text-emerald-400" />
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Estrategia Nutricional y Corte Semanal
            </h4>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Afecta el peso y el rendimiento en la jaula
          </span>
        </div>

        <div className={`grid gap-3 ${compact ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-5'}`}>
          {DIETS.map((d) => {
            const active = state.diet === d.id
            const isExtreme = d.id === 'extreme-cut'
            const isStrict = d.id === 'strict-cut'
            const isBulk = d.id === 'clean-bulk'

            // Cálculo de semanas estimadas para dar el peso si está con sobrepeso y en déficit
            const weeksToTarget = diff > 0 && d.delta < 0
              ? Math.ceil(diff / Math.abs(d.delta))
              : null

            return (
              <button
                key={d.id}
                type="button"
                id={`diet-plan-${d.id}`}
                onClick={() => setDiet(d.id as DietId)}
                className={`group relative flex cursor-pointer flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${
                  active
                    ? isExtreme
                      ? 'border-rose-500 bg-rose-950/30 shadow-lg shadow-rose-950/50 ring-2 ring-rose-500/50'
                      : isStrict
                        ? 'border-amber-500 bg-amber-950/30 shadow-lg shadow-amber-950/50 ring-2 ring-amber-500/50'
                        : 'border-red-500 bg-red-950/30 shadow-lg shadow-red-950/50 ring-2 ring-red-500/50'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-black uppercase tracking-tight text-white group-hover:text-red-300 transition-colors">
                      {d.name}
                    </p>
                    {isExtreme ? (
                      <Flame className="h-4 w-4 text-rose-400" />
                    ) : isBulk ? (
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                    ) : null}
                  </div>

                  <div className="my-2 flex items-baseline gap-1">
                    {d.delta < 0 ? (
                      <TrendingDown className="h-4 w-4 text-sky-400 shrink-0" />
                    ) : d.delta > 0 ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : null}
                    <span
                      className={`text-xl font-black font-mono ${
                        d.delta < 0
                          ? 'text-sky-400'
                          : d.delta > 0
                            ? 'text-emerald-400'
                            : 'text-slate-300'
                      }`}
                    >
                      {d.delta > 0 ? `+${d.delta.toFixed(1)}` : d.delta.toFixed(1)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      lbs/sem
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-tight">
                    {d.description}
                  </p>
                </div>

                <div className="mt-3 border-t border-white/5 pt-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold">
                    {isExtreme ? (
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    ) : null}
                    <span className={isExtreme ? 'text-rose-300' : isStrict ? 'text-amber-300' : isBulk ? 'text-emerald-300' : 'text-slate-300'}>
                      {d.effect}
                    </span>
                  </div>

                  {weeksToTarget && (
                    <p className="mt-1 text-[10px] font-black text-amber-400">
                      ⏱ Meta en ~{weeksToTarget} {weeksToTarget === 1 ? 'sem' : 'sems'}
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
