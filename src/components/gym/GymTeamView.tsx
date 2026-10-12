import { Star } from 'lucide-react'
import { usePlayer, useGame } from '../../context/GameContext'
import { GYMS, PARTNERS, getGym } from './data'
import type { PartnerDef } from './data'

function Stars({ n }: { n: number }) {
  return (
    <span className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= n ? 'text-amber-400' : 'text-slate-700'}`}
          fill="currentColor"
        />
      ))}
    </span>
  )
}

function PartnerSlot({ kind, title }: { kind: 'striking' | 'grappling'; title: string }) {
  const { state, setPartner } = useGame()
  const player = usePlayer()
  const currentId = kind === 'striking' ? state.strikingPartnerId : state.grapplingPartnerId
  const list: PartnerDef[] = PARTNERS.filter((p) => p.type === kind)
  const current = list.find((p) => p.id === currentId)

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0f172a]/70 p-5 shadow-xl">
      <h3 className="font-extrabold text-white">{title}</h3>
      <p
        className={`mb-4 mt-1 text-sm font-semibold ${
          !current ? 'text-amber-400' : current.ovr > player.overall ? 'text-emerald-400' : 'text-slate-400'
        }`}
      >
        {!current
          ? 'Sparring a eficiencia reducida (50%)'
          : current.ovr > player.overall
            ? 'Compañero de mayor nivel: +25% de progresión'
            : 'Compañero asignado: eficiencia normal'}
      </p>
      <ul className="flex flex-col gap-2">
        {list.map((p) => {
          const active = p.id === currentId
          return (
            <li key={p.id}>
              <button
                id={`partner-${p.id}`}
                onClick={() => setPartner(kind, active ? null : p.id)}
                className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                  active
                    ? 'border-red-500/70 bg-red-600/15'
                    : 'border-white/10 bg-white/5 hover:border-white/25'
                }`}
              >
                <div>
                  <p className="font-bold text-white">{p.name}</p>
                  <p className="text-xs text-slate-400">
                    {p.age} años · {p.division}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">OVR</p>
                  <p className="text-xl font-black text-white">{p.ovr}</p>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default function GymTeamView() {
  const { state, switchGym } = useGame()
  const player = usePlayer()
  const current = getGym(state.gymId)

  return (
    <div className="grid items-start gap-6 xl:grid-cols-3">
      <div className="flex flex-col gap-6">
        <section className="rounded-3xl border border-orange-500/30 bg-gradient-to-b from-orange-600/10 to-[#0f172a] p-5 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-400">Gimnasio actual</p>
          <h2 className="mt-1 text-xl font-extrabold text-white">{current.name}</h2>
          <p className="mb-3 text-sm text-slate-400">{current.description}</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">
              Mensualidad: <span className="font-bold text-white">${current.fee}/mes</span>
            </span>
            <Stars n={current.quality} />
          </div>
          <p className="mt-2 text-sm text-emerald-400">
            Bonificación de progreso: +{Math.round(current.bonus * 100)}%
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#0f172a]/70 p-5 shadow-xl">
          <h3 className="mb-1 font-extrabold text-white">Otros gimnasios</h3>
          <p className="mb-4 text-xs text-slate-500">
            Al unirte pagas la primera mensualidad. Luego se cobra cada 4 semanas.
          </p>
          <ul className="flex flex-col gap-2">
            {GYMS.filter((g) => g.id !== state.gymId).map((g) => {
              const canAfford = player.money >= g.fee
              return (
                <li key={g.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-white">{g.name}</p>
                    <Stars n={g.quality} />
                  </div>
                  <p className="text-xs text-slate-400">{g.description}</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-300">
                      ${g.fee}/mes · <span className="text-emerald-400">+{Math.round(g.bonus * 100)}% progreso</span>
                    </span>
                    <button
                      id={`gym-${g.id}`}
                      disabled={!canAfford}
                      onClick={() => switchGym(g.id)}
                      className="cursor-pointer rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-3 py-1.5 font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      {canAfford ? 'Unirme' : 'Sin fondos'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <PartnerSlot kind="striking" title="Compañero de Striking" />
      <PartnerSlot kind="grappling" title="Compañero de Wrestling/Grappling" />
    </div>
  )
}
