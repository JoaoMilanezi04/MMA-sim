import { Crown, ShieldAlert, Sparkles, Trophy } from 'lucide-react'
import type { FighterRank } from '../../types/career'
import { effectiveOvr } from '../../engine/world'
import { ageStage } from '../../engine/aging'

interface Props {
  champion: FighterRank | undefined
  division: string
  organization: string
  onSelect: (fighter: FighterRank) => void
}

export default function ChampionCard({ champion, division, organization, onSelect }: Props) {
  if (!champion) {
    return (
      <div className="rounded-3xl border border-dashed border-amber-500/30 bg-amber-500/5 p-6 text-center text-amber-300">
        <Trophy className="mx-auto mb-2 h-8 w-8 opacity-60" />
        <p className="font-bold">Título Vacante ({division})</p>
        <p className="text-xs text-slate-400">El próximo PPV coronará a un nuevo campeón.</p>
      </div>
    )
  }

  const [flag, ...rest] = champion.country.split(' ')
  const effOvr = effectiveOvr(champion)
  const isDebuffed = effOvr < champion.ovr
  const stage = ageStage(champion.age)

  return (
    <section
      onClick={() => onSelect(champion)}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-[#0f172a] to-slate-950 p-6 shadow-2xl transition hover:border-amber-400 hover:shadow-amber-500/10"
    >
      <div className="pointer-events-none absolute -top-16 -right-16 h-52 w-52 rounded-full bg-amber-500/15 blur-3xl" />
      
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg shadow-amber-500/30">
            <Crown className="h-7 w-7 text-slate-950" strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[11px] font-black tracking-wider text-amber-300">
                {organization === 'UFC' ? 'CAMPEÓN MUNDIAL UFC' : `CAMPEÓN OFICIAL ${organization}`}
              </span>
              <span className="text-xs font-semibold text-slate-400">{division}</span>
            </div>
            <h2 className="mt-1 text-2xl font-black text-white group-hover:text-amber-300 transition">
              {champion.name}{' '}
              {champion.nickname && (
                <span className="text-amber-400 font-semibold text-lg">“{champion.nickname}”</span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              {flag} {rest.join(' ')} · {champion.style}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Récord / Racha</p>
            <p className="text-lg font-black text-white">
              {champion.record.wins}-{champion.record.losses}
              {champion.record.draws > 0 ? `-${champion.record.draws}` : ''}
              <span className="ml-2 rounded px-1.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300">
                {champion.streak.type}{champion.streak.count}
              </span>
            </p>
            <p className="text-xs text-slate-400">
              {champion.age} años ({stage.label})
            </p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-400/40 bg-gradient-to-b from-amber-500/20 to-black/40 px-5 py-3">
            <span className="text-[10px] font-black tracking-widest text-amber-300">OVR</span>
            <span className="text-4xl font-black text-white">{effOvr}</span>
            {isDebuffed && (
              <span className="text-[10px] text-red-400 line-through">Base {champion.ovr}</span>
            )}
          </div>
        </div>
      </div>

      {(champion.temporaryNerfs?.chinDamageDurationWeeks || champion.temporaryNerfs?.slumpDebuff) && (
        <div className="relative mt-4 flex flex-wrap gap-2 border-t border-amber-500/20 pt-3 text-xs">
          {champion.temporaryNerfs?.chinDamageDurationWeeks && (
            <span className="flex items-center gap-1 rounded-md bg-red-500/20 px-2 py-0.5 font-semibold text-red-300">
              <ShieldAlert className="h-3.5 w-3.5" />
              Daño cerebral por KO ({champion.temporaryNerfs.chinDamageDurationWeeks} sem restantes)
            </span>
          )}
          {champion.temporaryNerfs?.slumpDebuff && (
            <span className="flex items-center gap-1 rounded-md bg-orange-500/20 px-2 py-0.5 font-semibold text-orange-300">
              <Sparkles className="h-3.5 w-3.5" />
              En racha negativa (Slump de confianza)
            </span>
          )}
        </div>
      )}
    </section>
  )
}
