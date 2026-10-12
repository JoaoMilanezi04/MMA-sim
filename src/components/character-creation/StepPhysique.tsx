import { HEIGHT_RANGES, REACH_OPTIONS, reachAdvantage, reachCm } from './data'
import type { StepProps } from './types'

export default function StepPhysique({ draft, update }: StepProps) {
  const division = draft.division ?? 'Featherweight'
  const [min, max] = HEIGHT_RANGES[division]
  const adv = reachAdvantage(draft.reach)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="mb-3 flex items-end justify-between">
          <p className="text-sm font-semibold text-slate-300">
            Altura <span className="text-slate-500">({division}: {min}–{max} cm)</span>
          </p>
          <p className="text-3xl font-black text-white">{draft.height} cm</p>
        </div>
        <input
          id="height-slider"
          type="range"
          min={min}
          max={max}
          value={draft.height}
          onChange={(e) => update({ height: Number(e.target.value) })}
          className="h-2 w-full cursor-pointer accent-red-500"
        />
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          <span>{min} cm</span>
          <span>{max} cm</span>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-slate-300">Alcance (Reach)</p>
        <div className="grid gap-4 md:grid-cols-3">
          {REACH_OPTIONS.map((r) => {
            const active = draft.reach === r.id
            return (
              <button
                key={r.id}
                id={`reach-${r.id}`}
                onClick={() => update({ reach: r.id })}
                className={`cursor-pointer rounded-2xl border p-4 text-left transition ${
                  active
                    ? 'border-red-500/70 bg-red-600/15 shadow-lg shadow-red-900/30'
                    : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'
                }`}
              >
                <p className="text-lg font-bold text-white">{r.title}</p>
                <p className="mb-3 text-xs text-slate-400">{r.subtitle}</p>
                <ul className="flex flex-col gap-1 text-xs font-semibold">
                  {r.positives.map((t) => (
                    <li key={t} className="text-emerald-400">{t}</li>
                  ))}
                  {r.negatives.map((t) => (
                    <li key={t} className="text-red-400">{t}</li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        Alcance resultante:{' '}
        <span className="font-bold text-white">{reachCm(draft.height, draft.reach)} cm</span>{' '}
        <span className={adv > 0 ? 'text-emerald-400' : adv < 0 ? 'text-red-400' : 'text-slate-500'}>
          ({adv > 0 ? '+' : ''}{adv} cm vs. promedio)
        </span>
      </div>
    </div>
  )
}
