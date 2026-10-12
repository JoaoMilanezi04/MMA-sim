import { ShieldAlert, Sparkles, Swords, X } from 'lucide-react'
import type { FighterRank } from '../../types/career'
import { effectiveOvr } from '../../engine/world'
import { ageStage } from '../../engine/aging'
import { usePlayer } from '../../context/GameContext'

interface Props {
  fighter: FighterRank | null
  onClose: () => void
}

export default function ScoutingModal({ fighter, onClose }: Props) {
  const player = usePlayer()
  if (!fighter) return null

  const [flag, ...rest] = fighter.country.split(' ')
  const effOvr = effectiveOvr(fighter)
  const isDebuffed = effOvr < fighter.ovr
  const stage = ageStage(fighter.age)
  const ovrDiff = fighter.ovr - player.overall

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0f17] p-6 shadow-2xl xl:p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 cursor-pointer rounded-xl bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 text-3xl">
            {flag}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-red-600/20 px-2 py-0.5 text-xs font-black text-red-400">
                {fighter.organization} · {fighter.rank === 0 ? 'CAMPEÓN' : `#${fighter.rank}`}
              </span>
              <span className="text-xs text-slate-400">{fighter.division}</span>
            </div>
            <h3 className="mt-1 text-2xl font-black text-white">
              {fighter.name}
              {fighter.nickname && (
                <span className="ml-2 font-semibold text-amber-400 text-lg">“{fighter.nickname}”</span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              {rest.join(' ')} · Estilo: <span className="font-semibold text-slate-200">{fighter.style}</span>
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400">OVR Efectivo</p>
            <p className="text-3xl font-black text-white">{effOvr}</p>
            {isDebuffed && (
              <p className="text-[10px] text-red-400">Base {fighter.ovr} (−{fighter.ovr - effOvr})</p>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Récord Pro</p>
            <p className="text-xl font-black text-white">
              {fighter.record.wins}-{fighter.record.losses}
              {fighter.record.draws > 0 ? `-${fighter.record.draws}` : ''}
            </p>
            <p className="text-[11px] text-slate-400">Racha: {fighter.streak.type}{fighter.streak.count}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Edad</p>
            <p className="text-xl font-black text-white">{fighter.age} años</p>
            <p className="text-[11px] text-amber-400 font-semibold">{stage.label}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Vs. Tu OVR</p>
            <p className={`text-xl font-black ${ovrDiff > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {ovrDiff > 0 ? `+${ovrDiff}` : ovrDiff}
            </p>
            <p className="text-[11px] text-slate-400">Tú: {player.overall} OVR</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
            Curva de Longevidad ({stage.label})
          </h4>
          <p className="text-sm text-slate-300">{stage.description}</p>
        </div>

        {(fighter.temporaryNerfs?.chinDamageDurationWeeks || fighter.temporaryNerfs?.slumpDebuff) && (
          <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-red-500/30 bg-red-600/10 p-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-red-300">
              Reporte Médico y Vulnerabilidades Activas
            </h4>
            {fighter.temporaryNerfs?.chinDamageDurationWeeks && (
              <p className="flex items-center gap-2 text-xs text-red-200">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                <span>
                  <strong>Daño por KO reciente:</strong> Su barbilla/resistencia a golpes está disminuida (−3 OVR efectivo) por {fighter.temporaryNerfs.chinDamageDurationWeeks} semanas más.
                </span>
              </p>
            )}
            {fighter.temporaryNerfs?.slumpDebuff && (
              <p className="flex items-center gap-2 text-xs text-orange-200">
                <Sparkles className="h-4 w-4 shrink-0 text-orange-400" />
                <span>
                  <strong>Bache anímico (Slump):</strong> Tras encadenar múltiples derrotas, pelea con menor compostura y agresividad (−2 OVR efectivo).
                </span>
              </p>
            )}
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2 flex items-center gap-1.5">
            <Swords className="h-4 w-4" /> Análisis de Scouting vs. Tu Estilo
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {fighter.style === 'BJJ Specialist'
              ? 'Peligroso cazador de sumisiones en el suelo. Mantener la pelea de pie y trabajar sprawl y defensa de derribos es clave.'
              : fighter.style === 'Pressure Wrestler'
              ? 'Luchador incansable con derribos repetidos. Necesitarás alto cardio y clinch defensivo para no quedar atrapado contra la jaula.'
              : fighter.style === 'Counter Striker'
              ? 'Peleador técnico que espera tus fallos para contragolpear. Se recomienda presión controlada y mezclar golpes con derribos sorpresa.'
              : fighter.style === 'Muay Thai' || fighter.style === 'Kickboxer'
              ? 'Castigo destructivo a la distancia media y clinch con rodillazos. Cerrar la distancia o llevarlo a la lona reduce su efectividad.'
              : 'Peleador agresivo y versátil. Preparar un plan de pelea equilibrado según el ritmo de los asaltos.'}
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full cursor-pointer rounded-xl bg-gradient-to-r from-red-600 to-orange-500 py-3 font-bold text-white transition hover:brightness-110"
        >
          Cerrar Ficha
        </button>
      </div>
    </div>
  )
}
