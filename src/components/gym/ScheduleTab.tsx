import { useState } from 'react'
import { AlertTriangle, Eraser, Lock, Swords, Zap } from 'lucide-react'
import { useGame } from '../../context/GameContext'
import { DAYS, EMPTY_SCHEDULE, ENERGY_BUDGET, SLOT_LABELS, TEMPLATES, getActivity } from './data'
import { scheduleUsage } from './engine'
import ActivityPicker from './ActivityPicker'
import FightSimulationView from '../fight/FightSimulationView'

export default function ScheduleTab() {
  const { state, setSchedule } = useGame()
  const schedule = state.schedule
  const [selected, setSelected] = useState<{ day: number; slot: number } | null>(null)
  const [showFightNight, setShowFightNight] = useState(false)
  const isFightWeek = Boolean(state.activeBout && state.activeBout.weeksRemaining === 0)

  const usage = scheduleUsage(schedule)
  const over = usage.used > ENERGY_BUDGET
  const pct = Math.min(100, (usage.used / ENERGY_BUDGET) * 100)

  const assign = (day: number, slot: number, id: string | null) => {
    if (isFightWeek) return
    setSchedule(schedule.map((d, i) => (i === day ? d.map((s, j) => (j === slot ? id : s)) : d)))
  }

  const getCategoryStyle = (category?: string, hasRelief?: boolean) => {
    if (hasRelief) {
      return {
        card: 'border-teal-500/30 bg-teal-950/25 hover:border-teal-500/50',
        icon: 'text-teal-400',
        cost: 'text-teal-300',
      }
    }
    switch (category) {
      case 'striking':
        return {
          card: 'border-rose-500/30 bg-rose-950/25 hover:border-rose-500/50',
          icon: 'text-rose-400',
          cost: 'text-rose-300',
        }
      case 'wrestling':
        return {
          card: 'border-amber-500/30 bg-amber-950/25 hover:border-amber-500/50',
          icon: 'text-amber-400',
          cost: 'text-amber-300',
        }
      case 'grappling':
        return {
          card: 'border-sky-500/30 bg-sky-950/25 hover:border-sky-500/50',
          icon: 'text-sky-400',
          cost: 'text-sky-300',
        }
      case 'conditioning':
      default:
        return {
          card: 'border-emerald-500/30 bg-emerald-950/25 hover:border-emerald-500/50',
          icon: 'text-emerald-400',
          cost: 'text-emerald-300',
        }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Banner de Bloqueo de Semana de Pelea (Fight Week) */}
      {isFightWeek && (
        <div className="relative overflow-hidden rounded-2xl border border-red-500/60 border-t-red-400/80 bg-gradient-to-r from-red-950/90 via-[#111622] to-red-950/90 p-6 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-red-400/50 bg-red-600 text-white shadow-xl shadow-red-950 animate-pulse">
                <Lock className="h-7 w-7" />
              </div>
              <div>
                <span className="rounded-md border border-red-500/50 bg-red-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-200">
                  Fight Week Oficial · vs {state.activeBout?.opponent.name}
                </span>
                <h3 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">
                  Semana de pelea: Entrenamiento cerrado. Hora de hacer el peso y pelear.
                </h3>
                <p className="mt-1 text-xs text-slate-300">
                  El campamento preparatorio ha concluido. El gimnasio se encuentra cerrado para evitar desgaste y lesiones previas al combate.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFightNight(true)}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 border-t-white/20 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 px-6 py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-red-950/80 transition hover:brightness-110 active:scale-95 md:w-auto"
            >
              <Swords className="h-5 w-5" />
              IR AL PESAJE Y NOCHE DE PELEA
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {/* Tacómetro / Medidor de Carga de Energía Deportiva */}
          <section className="rounded-2xl border border-white/[0.08] border-t-white/[0.16] bg-[#111622]/90 p-5 shadow-xl backdrop-blur-md">
            <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  <Zap className="h-4 w-4" fill="currentColor" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Carga Energética Semanal</span>
                  <p className="font-mono text-base font-black text-white">
                    {usage.used} <span className="text-xs text-slate-500 font-normal">/ {ENERGY_BUDGET} PTS</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#0a0d14]/70 px-3 py-1.5 text-right">
                <span className="text-xs text-slate-400">
                  Gasto bruto: <strong className="font-mono text-white">{usage.total}</strong>
                </span>
                {usage.relief > 0 && (
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    (−{usage.relief} alivio)
                  </span>
                )}
              </div>
            </div>

            {/* Barra tipo tacómetro con ranuras */}
            <div className="relative h-3.5 w-full overflow-hidden rounded-full border border-white/[0.08] bg-[#0a0d14] p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  over
                    ? 'bg-gradient-to-r from-red-600 via-rose-500 to-red-600 shadow-md shadow-red-500/50'
                    : 'bg-gradient-to-r from-emerald-500 via-amber-400 to-orange-500'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>

            {over && (
              <div className="mt-3.5 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-600/15 p-3 text-xs font-bold text-red-200">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                <span>Riesgo de sobreentrenamiento y fatiga crítica: el progreso de atributos de esta semana se reducirá a la mitad.</span>
              </div>
            )}

            {/* Plantillas predefinidas */}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1">Plantillas:</span>
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  id={`template-${t.id}`}
                  disabled={isFightWeek}
                  onClick={() => {
                    setSchedule(t.schedule)
                    setSelected(null)
                  }}
                  className={`cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                    isFightWeek
                      ? 'cursor-not-allowed border-white/[0.04] bg-white/[0.02] text-slate-600'
                      : 'border-white/[0.08] bg-white/[0.03] text-slate-300 hover:border-red-500/40 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
              <button
                id="template-clear"
                disabled={isFightWeek}
                onClick={() => {
                  setSchedule(EMPTY_SCHEDULE)
                  setSelected(null)
                }}
                className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  isFightWeek
                    ? 'cursor-not-allowed border-transparent text-slate-700'
                    : 'border-transparent text-slate-400 hover:border-white/[0.08] hover:bg-white/[0.03] hover:text-white'
                }`}
              >
                <Eraser className="h-3.5 w-3.5" /> Limpiar
              </button>
            </div>
          </section>

          {/* Grilla Semanal de 7 Días */}
          <section className={`overflow-x-auto rounded-2xl border border-white/[0.08] border-t-white/[0.16] bg-[#111622]/90 p-5 shadow-xl backdrop-blur-md transition-opacity ${
            isFightWeek ? 'opacity-60' : ''
          }`}>
            <div className="grid min-w-[880px] grid-cols-7 gap-3">
              {DAYS.map((day, d) => (
                <div key={day} className="flex flex-col gap-2.5">
                  <div className="border-b border-white/[0.06] pb-1.5 text-center">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{day}</p>
                  </div>
                  {SLOT_LABELS.map((label, s) => {
                    const act = getActivity(schedule[d][s])
                    const isSel = selected?.day === d && selected.slot === s
                    const catStyle = act ? getCategoryStyle(act.category, Boolean(act.relief)) : null

                    return (
                      <div key={label} className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
                        {act && catStyle ? (
                          <div className={`group/slot relative flex h-24 flex-col justify-between rounded-xl border p-2.5 shadow-sm transition-all ${catStyle.card}`}>
                            {!isFightWeek && (
                              <button
                                id={`remove-${d}-${s}`}
                                title="Quitar actividad"
                                onClick={() => assign(d, s, null)}
                                className="absolute right-1.5 top-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-black/40 text-[10px] font-bold text-slate-400 transition hover:border-red-500/50 hover:bg-red-600/40 hover:text-white"
                              >
                                ✕
                              </button>
                            )}
                            <act.icon className={`h-4 w-4 ${catStyle.icon}`} />
                            <div>
                              <p className="text-xs font-bold leading-tight text-white line-clamp-2">{act.name}</p>
                              <p className={`mt-0.5 font-mono text-[10px] font-bold ${catStyle.cost}`}>
                                {act.relief ? `−${act.relief} fatiga` : `${act.cost} pts`}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <button
                            id={`slot-${d}-${s}`}
                            disabled={isFightWeek}
                            onClick={() => !isFightWeek && setSelected({ day: d, slot: s })}
                            className={`flex h-24 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed text-xl font-light transition ${
                              isFightWeek
                                ? 'cursor-not-allowed border-white/[0.04] text-slate-700'
                                : isSel
                                  ? 'border-red-500 bg-red-600/10 text-red-300 shadow-md shadow-red-950/40'
                                  : 'border-white/[0.08] text-slate-600 hover:border-red-500/40 hover:bg-white/[0.03] hover:text-slate-300'
                            }`}
                          >
                            {isFightWeek ? <Lock className="h-4 w-4 text-slate-600" /> : '+'}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </section>
        </div>

        {!isFightWeek && (
          <ActivityPicker
            selected={selected}
            onPick={(id) => {
              if (selected) assign(selected.day, selected.slot, id)
              setSelected(null)
            }}
            onCancel={() => setSelected(null)}
          />
        )}
      </div>

      {showFightNight && state.activeBout && (
        <FightSimulationView
          bout={state.activeBout}
          onClose={() => setShowFightNight(false)}
        />
      )}
    </div>
  )
}
