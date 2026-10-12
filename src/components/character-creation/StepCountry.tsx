import { COUNTRIES } from './data'
import type { StepProps } from './types'

export default function StepCountry({ draft, update }: StepProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {COUNTRIES.map((c) => {
        const active = draft.countryId === c.id
        return (
          <button
            key={c.id}
            id={`country-${c.id}`}
            onClick={() => update({ countryId: c.id })}
            className={`cursor-pointer rounded-2xl border p-4 text-left transition ${
              active
                ? 'border-red-500/70 bg-red-600/15 shadow-lg shadow-red-900/30'
                : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'
            }`}
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="text-4xl leading-none">{c.flag}</span>
              <div>
                <p className="font-bold text-white">{c.name}</p>
                <p className="text-xs text-slate-400">{c.tagline}</p>
              </div>
            </div>
            <ul className="flex flex-wrap gap-1.5">
              {c.bonuses.map((b) => (
                <li
                  key={b.label}
                  className="rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-300"
                >
                  +{b.value} {b.label}
                </li>
              ))}
            </ul>
          </button>
        )
      })}
    </div>
  )
}
