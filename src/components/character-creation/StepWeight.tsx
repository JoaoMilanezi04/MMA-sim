import { DIVISIONS, defaultHeight } from './data'
import { DIVISION_LIMITS } from '../../types/game'
import type { StepProps } from './types'

export default function StepWeight({ draft, update }: StepProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {DIVISIONS.map((d) => {
        const active = draft.division === d
        return (
          <button
            key={d}
            id={`division-${d.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => {
              if (!active) update({ division: d, height: defaultHeight(d) })
            }}
            className={`flex cursor-pointer items-center justify-between rounded-2xl border px-5 py-5 text-left transition ${
              active
                ? 'border-red-500/70 bg-red-600/15 shadow-lg shadow-red-900/30'
                : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'
            }`}
          >
            <span className="font-bold text-white">{d}</span>
            <span className="text-lg font-black text-orange-400">{DIVISION_LIMITS[d]} lbs</span>
          </button>
        )
      })}
    </div>
  )
}
