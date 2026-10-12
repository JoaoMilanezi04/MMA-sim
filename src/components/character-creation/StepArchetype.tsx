import { Star } from 'lucide-react'
import { ARCHETYPES } from './data'
import type { StepProps } from './types'

export function FinishBars({ ko, sub, dec }: { ko: number; sub: number; dec: number }) {
  const rows = [
    { label: 'KO/TKO', value: ko, color: 'bg-red-500' },
    { label: 'SUB', value: sub, color: 'bg-sky-500' },
    { label: 'DEC', value: dec, color: 'bg-amber-400' },
  ]
  return (
    <div className="flex flex-col gap-1.5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
          <span className="w-12 text-slate-400">{r.label}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.value}%` }} />
          </div>
          <span className="w-9 text-right">{r.value}%</span>
        </div>
      ))}
    </div>
  )
}

export default function StepArchetype({ draft, update }: StepProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {ARCHETYPES.map((a) => {
        const active = draft.archetype === a.id
        return (
          <button
            key={a.id}
            id={`archetype-${a.id.toLowerCase().replace(/[^a-z]+/g, '-')}`}
            onClick={() => update({ archetype: a.id })}
            className={`cursor-pointer rounded-2xl border p-4 text-left transition ${
              active
                ? 'border-red-500/70 bg-red-600/15 shadow-lg shadow-red-900/30'
                : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'
            }`}
          >
            <p className="text-lg font-bold text-white">{a.id}</p>
            <p className="text-xs font-semibold text-orange-400">{a.reference}</p>
            <p className="mt-2 mb-3 text-sm text-slate-400">{a.description}</p>
            <div className="mb-3 flex items-center gap-1 text-xs text-slate-400">
              Longevidad
              <span className="ml-1 flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`h-4 w-4 ${n <= a.longevity ? 'text-amber-400' : 'text-slate-700'}`}
                    fill="currentColor"
                  />
                ))}
              </span>
            </div>
            <FinishBars {...a.finish} />
          </button>
        )
      })}
    </div>
  )
}
