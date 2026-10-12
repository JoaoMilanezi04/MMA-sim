import { useState } from 'react'
import { Info, Users, Zap } from 'lucide-react'
import { ACTIVITIES, CATEGORIES, DAYS, SLOT_LABELS } from './data'
import type { ActivityCategory, StatBadge } from './data'

interface Props {
  selected: { day: number; slot: number } | null
  onPick: (id: string) => void
  onCancel: () => void
}

const BADGE_STYLES: Record<StatBadge['category'], string> = {
  striking: 'border-red-500/30 bg-red-500/15 text-red-300',
  wrestling: 'border-amber-500/30 bg-amber-500/15 text-amber-300',
  grappling: 'border-sky-500/30 bg-sky-500/15 text-sky-300',
  physical: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300',
  recovery: 'border-teal-500/30 bg-teal-500/15 text-teal-300',
}

export default function ActivityPicker({ selected, onPick, onCancel }: Props) {
  const [category, setCategory] = useState<ActivityCategory>('striking')
  const items = ACTIVITIES.filter((a) => a.category === category)

  return (
    <aside className="w-full shrink-0 self-start rounded-2xl border border-white/[0.08] border-t-white/[0.16] bg-[#111622]/90 p-5 shadow-2xl backdrop-blur-md xl:sticky xl:top-28 xl:w-96">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black uppercase tracking-wider text-white">Catálogo de Sesiones</h2>
        <span className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-bold text-slate-300">
          <Zap className="h-3 w-3 text-amber-400" /> {items.length} actividades
        </span>
      </div>

      <p className="mt-1 mb-4 text-xs text-slate-400">
        {selected
          ? `Asignando a: ${DAYS[selected.day]} · ${SLOT_LABELS[selected.slot]}`
          : 'Selecciona una ranura libre (+) en la agenda para asignar entrenamiento.'}
      </p>

      {/* Selector de Categoría */}
      <div className="mb-4 grid grid-cols-2 gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            id={`category-${c.id}`}
            onClick={() => setCategory(c.id)}
            className={`cursor-pointer rounded-xl px-2.5 py-2 text-xs font-bold transition ${
              category === c.id
                ? `border border-white/20 bg-white/10 ${c.color} shadow-sm`
                : 'border border-transparent text-slate-400 hover:border-white/[0.06] hover:bg-white/[0.03] hover:text-slate-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Lista de Actividades */}
      <ul className={`flex flex-col gap-2.5 ${selected ? '' : 'pointer-events-none opacity-50'}`}>
        {items.map((a) => (
          <li key={a.id}>
            <button
              id={`activity-${a.id}`}
              onClick={() => onPick(a.id)}
              className="group relative flex w-full cursor-pointer flex-col gap-2 rounded-xl border border-white/[0.08] bg-[#0a0d14]/70 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-red-500/40 hover:bg-[#141b2a] hover:shadow-lg"
            >
              {/* Fila superior: Icono, Nombre y Costo */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-orange-400 transition group-hover:border-red-500/40 group-hover:scale-105">
                    <a.icon className="h-4 w-4" />
                  </div>
                  <p className="truncate text-sm font-bold text-white transition group-hover:text-red-300">
                    {a.name}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-black ${
                    a.relief
                      ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                      : 'border border-white/10 bg-white/10 text-slate-200'
                  }`}
                >
                  {a.relief ? `−${a.relief} fatiga` : `${a.cost} pts`}
                </span>
              </div>

              {/* Requisito de compañero si aplica */}
              {a.partner && (
                <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-300">
                  <Users className="h-3 w-3 shrink-0" />
                  <span>Requiere compañero de {a.partner}</span>
                </div>
              )}

              {/* Badges de Atributos Mejorados */}
              <div className="flex flex-wrap gap-1">
                {a.statBadges.map((badge, idx) => (
                  <span
                    key={idx}
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-tight ${
                      BADGE_STYLES[badge.category]
                    }`}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>

              {/* Tooltip / Explicación del beneficio en combate */}
              <div className="flex items-start gap-1.5 pt-0.5 text-[11px] leading-tight text-slate-400 transition-colors group-hover:text-slate-300">
                <Info className="mt-0.5 h-3 w-3 shrink-0 text-slate-500 group-hover:text-red-400 transition-colors" />
                <span>{a.description}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <button
          onClick={onCancel}
          className="mt-4 w-full cursor-pointer rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          Cancelar Selección
        </button>
      )}
    </aside>
  )
}
