import { buildFighter, getArchetype, getCountry, reachAdvantage } from './data'
import { FinishBars } from './StepArchetype'
import type { CharacterDraft } from '../../types/game'
import { DIVISION_LIMITS } from '../../types/game'
import FighterAvatar from '../common/FighterAvatar'

const GROUPS = [
  { label: 'Striking', keys: ['punching', 'kicking', 'headMovement', 'defense'], color: 'from-red-600 to-orange-500' },
  { label: 'Wrestling', keys: ['takedowns', 'takedownDefense', 'clinch'], color: 'from-amber-500 to-yellow-400' },
  { label: 'Grappling', keys: ['submissions', 'groundControl', 'submissionDefense'], color: 'from-sky-500 to-cyan-400' },
  { label: 'Físico', keys: ['cardio', 'power', 'speed', 'chin', 'recovery'], color: 'from-emerald-500 to-lime-400' },
] as const

export default function LiveFighterCard({ draft }: { draft: CharacterDraft }) {
  const f = buildFighter(draft)
  const country = getCountry(draft.countryId)
  const archetype = getArchetype(draft.archetype)
  const adv = reachAdvantage(draft.reach)
  const [flag, ...rest] = f.country.split(' ')

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-6 xl:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-400">Ficha en vivo</p>

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950">
        <FighterAvatar appearance={f.appearance} className="aspect-[4/3] w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h2 className="text-2xl font-extrabold text-white">{f.name || 'Tu peleador'}</h2>
          {f.nickname && <p className="font-semibold text-amber-400">“{f.nickname}”</p>}
        </div>
        <div className="absolute right-4 top-4 rounded-2xl border border-red-500/40 bg-black/60 px-4 py-2 text-center backdrop-blur">
          <p className="text-[10px] font-bold tracking-widest text-slate-300">OVR</p>
          <p className="text-4xl font-black leading-none text-white">{f.overall}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Info label="País" value={country ? `${flag} ${rest.join(' ')}` : '—'} />
        <Info label="Edad" value={`${f.age} años`} />
        <Info
          label="División"
          value={draft.division ? `${draft.division} (${DIVISION_LIMITS[draft.division]} lbs)` : '—'}
        />
        <Info label="Estado" value="AMATEUR" />
        <Info label="Altura" value={draft.division ? `${f.height} cm` : '—'} />
        <Info
          label="Alcance"
          value={draft.division ? `${f.reach} cm (${adv > 0 ? '+' : ''}${adv})` : '—'}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Arquetipo</p>
        {archetype ? (
          <>
            <p className="mb-3 font-bold text-white">{archetype.id}</p>
            <FinishBars {...archetype.finish} />
          </>
        ) : (
          <p className="text-sm text-slate-500">Aún sin elegir</p>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Atributos</p>
        <div className="flex flex-col gap-3">
          {GROUPS.map((g) => {
            const avg = Math.round(g.keys.reduce((s, k) => s + f.stats[k], 0) / g.keys.length)
            return (
              <div key={g.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-slate-300">{g.label}</span>
                  <span className="font-bold text-white">{avg}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${g.color} transition-all duration-500`}
                    style={{ width: `${avg}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {country && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            Bonos de {country.name}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {country.bonuses.map((b) => (
              <li
                key={b.label}
                className="rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-300"
              >
                +{b.value} {b.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="font-bold text-white">{value}</p>
    </div>
  )
}
