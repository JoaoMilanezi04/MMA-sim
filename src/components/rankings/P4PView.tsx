import { Crown, Trophy } from 'lucide-react'
import type { FighterRank } from '../../types/career'
import { computeP4P, effectiveOvr } from '../../engine/world'
import { ageStage } from '../../engine/aging'

interface Props {
  fighters: FighterRank[]
  onSelect: (fighter: FighterRank) => void
}

export default function P4PView({ fighters, onSelect }: Props) {
  const p4p = computeP4P(fighters, 10)

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-amber-950/30 via-[#0f172a] to-slate-900 p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Ranking Libra por Libra (Pound-for-Pound)</h2>
            <p className="text-xs text-slate-400">
              Los 10 peleadores más dominantes del mundo en UFC sin importar la división de peso.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#0f172a]/70 shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.03] text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="py-3.5 pl-6 pr-2">P4P</th>
              <th className="px-4 py-3.5">Peleador</th>
              <th className="px-4 py-3.5">División</th>
              <th className="px-4 py-3.5">País</th>
              <th className="px-4 py-3.5">Edad</th>
              <th className="px-4 py-3.5">Récord</th>
              <th className="px-4 py-3.5">Racha</th>
              <th className="px-4 py-3.5 text-center">OVR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {p4p.map((f, idx) => {
              const [flag, ...rest] = f.country.split(' ')
              const effOvr = effectiveOvr(f)
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
                        idx === 0
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                          : idx < 3
                          ? 'bg-slate-200 text-slate-950'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-extrabold text-white group-hover:text-amber-300 transition">
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

                  <td className="px-4 py-4 text-xs font-semibold text-slate-300">
                    <div className="flex items-center gap-1.5">
                      {f.rank === 0 && <Crown className="h-3.5 w-3.5 text-amber-400" />}
                      <span>{f.division}</span>
                      {f.rank === 0 && (
                        <span className="rounded bg-amber-400/20 px-1.5 py-0.2 text-[10px] font-black text-amber-300">
                          (C)
                        </span>
                      )}
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
                        isWin ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {f.streak.type}{f.streak.count}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span className="text-base font-black text-white">{effOvr}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
