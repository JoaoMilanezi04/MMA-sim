import { ShieldAlert, Sparkles } from 'lucide-react'
import type { FighterRank } from '../../types/career'
import { effectiveOvr } from '../../engine/world'
import { ageStage } from '../../engine/aging'

interface Props {
  fighters: FighterRank[]
  onSelect: (fighter: FighterRank) => void
}

export default function RankingsTable({ fighters, onSelect }: Props) {
  if (fighters.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-500">
        No hay contendientes clasificados en esta división.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#0f172a]/70 shadow-xl">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/10 bg-white/[0.03] text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <tr>
            <th className="py-3.5 pl-6 pr-2">Rank</th>
            <th className="px-4 py-3.5">Peleador</th>
            <th className="px-4 py-3.5">País</th>
            <th className="px-4 py-3.5">Edad</th>
            <th className="px-4 py-3.5">Récord</th>
            <th className="px-4 py-3.5">Racha</th>
            <th className="px-4 py-3.5">Estilo</th>
            <th className="px-4 py-3.5 text-center">OVR</th>
            <th className="py-3.5 pl-4 pr-6">Estado / Debuffs</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {fighters.map((f) => {
            const [flag, ...rest] = f.country.split(' ')
            const effOvr = effectiveOvr(f)
            const isDebuffed = effOvr < f.ovr
            const stage = ageStage(f.age)
            const isWin = f.streak.type === 'W'

            return (
              <tr
                key={f.id}
                onClick={() => onSelect(f)}
                className={`group cursor-pointer transition hover:bg-white/[0.06] ${
                  f.isPlayer
                    ? 'bg-gradient-to-r from-red-600/20 via-orange-500/10 to-transparent font-bold ring-1 ring-inset ring-red-500/50'
                    : ''
                }`}
              >
                <td className="py-4 pl-6 pr-2">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${
                      f.rank === 1
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                        : f.rank <= 3
                        ? 'bg-slate-200 text-slate-950'
                        : f.rank <= 5
                        ? 'bg-amber-700/30 text-amber-300 border border-amber-600/40'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    #{f.rank}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-extrabold text-white group-hover:text-red-400 transition">
                        {f.name}
                        {f.isPlayer && (
                          <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                            TÚ
                          </span>
                        )}
                      </p>
                      {f.nickname && (
                        <p className="text-xs text-amber-400 font-medium">“{f.nickname}”</p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 text-xs text-slate-300">
                  <span className="mr-1.5 text-base">{flag}</span>
                  <span className="hidden sm:inline">{rest.join(' ')}</span>
                </td>

                <td className="px-4 py-4 text-xs">
                  <span className="font-bold text-white">{f.age}</span>
                  <span className="ml-1 text-[11px] text-slate-400">({stage.label})</span>
                </td>

                <td className="px-4 py-4 text-xs font-bold text-slate-200">
                  {f.record.wins}-{f.record.losses}
                  {f.record.draws > 0 ? `-${f.record.draws}` : ''}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-xs font-black ${
                      isWin
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {f.streak.type}{f.streak.count}
                  </span>
                </td>

                <td className="px-4 py-4 text-xs text-slate-400">{f.style}</td>

                <td className="px-4 py-4 text-center">
                  <div className="inline-flex flex-col items-center">
                    <span className="text-base font-black text-white">{effOvr}</span>
                    {isDebuffed && (
                      <span className="text-[10px] text-red-400 line-through">
                        {f.ovr}
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-4 pl-4 pr-6">
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {f.temporaryNerfs?.chinDamageDurationWeeks && (
                      <span className="flex items-center gap-1 rounded bg-red-500/20 px-2 py-0.5 font-semibold text-red-300">
                        <ShieldAlert className="h-3 w-3" />
                        Chin {f.temporaryNerfs.chinDamageDurationWeeks}s
                      </span>
                    )}
                    {f.temporaryNerfs?.slumpDebuff && (
                      <span className="flex items-center gap-1 rounded bg-orange-500/20 px-2 py-0.5 font-semibold text-orange-300">
                        <Sparkles className="h-3 w-3" />
                        Slump
                      </span>
                    )}
                    {!f.temporaryNerfs?.chinDamageDurationWeeks &&
                      !f.temporaryNerfs?.slumpDebuff && (
                        <span className="text-slate-500 text-xs">Saludable</span>
                      )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
