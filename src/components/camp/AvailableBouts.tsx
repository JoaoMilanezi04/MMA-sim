import { useMemo, useState } from 'react'
import {
  AlertCircle,
  Briefcase,
  Crown,
  Flame,
  RefreshCw,
  Swords,
  Trophy,
} from 'lucide-react'
import { useGame, usePlayer } from '../../context/GameContext'
import { generateMatchmakingBouts } from '../../engine/matchmaking'
import FighterAvatar from '../common/FighterAvatar'

export default function AvailableBouts() {
  const player = usePlayer()
  const { state, acceptBout } = useGame()
  const [seed, setSeed] = useState(() => Date.now())

  const organization = player.organization || (player.status === 'Pro' ? 'LFA' : 'Amateur Circuit')
  const contract = player.contract

  const opponents = useMemo(
    () => generateMatchmakingBouts(state.world, player, seed),
    [state.world, player, seed],
  )

  const showPurse = contract ? contract.showPurse : (player.status === 'Pro' ? 2000 : 150)
  const winPurse = contract ? contract.winPurse : (player.status === 'Pro' ? 2000 : 150)

  return (
    <div className="flex flex-col gap-6">
      {/* Tarjeta de Contrato y Promotora Actual */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] border-t-white/[0.16] bg-[#111622]/90 p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/30 bg-gradient-to-br from-red-600/20 to-rose-600/10 text-red-400 shadow-inner">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-red-500/40 bg-red-600/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-300">
                  {organization}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">· {player.division}</span>
              </div>
              <h3 className="mt-1 text-xl font-black tracking-tight text-white">
                {contract ? contract.organizationName : (player.status === 'Pro' ? 'Circuito Regional Pro' : 'Circuito Amateur')}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-white/[0.08] border-t-white/[0.12] bg-white/[0.03] px-4 py-2 text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bolsa Base</p>
              <p className="font-mono text-base font-black text-emerald-400">${showPurse.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] border-t-white/[0.12] bg-white/[0.03] px-4 py-2 text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bono por Victoria</p>
              <p className="font-mono text-base font-black text-emerald-300">+${winPurse.toLocaleString()}</p>
            </div>
            {contract && (
              <div className="rounded-xl border border-white/[0.08] border-t-white/[0.12] bg-white/[0.03] px-4 py-2 text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Peleas en Contrato</p>
                <p className="font-mono text-base font-black text-amber-300">
                  {contract.fightsRemaining} / {contract.totalFights}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Nota informativa */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <p className="flex items-center gap-1.5 font-medium">
            <Flame className="h-4 w-4 text-rose-500" />
            Rivales verificados extraídos del róster oficial de <strong className="text-slate-200">{organization}</strong>.
          </p>
          <button
            onClick={() => setSeed(Date.now())}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Barajar ofertas disponibles
          </button>
        </div>
      </div>

      {/* Cartelera de Rivales Disponibles */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black uppercase tracking-wider text-white">Cartelera de Contratos Disponibles</h3>
            <p className="text-xs text-slate-400">
              Selecciona a tu próximo rival según plazo de campamento, ranking divisional y bolsa económica.
            </p>
          </div>
          <span className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs font-bold text-slate-300">
            {opponents.length} combates disponibles
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {opponents.map((opp) => {
            const isFavorable = opp.difficulty === 'favorable'
            const isDangerous = opp.difficulty === 'dangerous'
            const duration = opp.durationWeeks ?? 4
            const purseMult = opp.purseMultiplier ?? 1.0
            const calculatedPurse = Math.round(showPurse * purseMult)

            const noticeBadge = opp.noticeType === 'short_notice' ? (
              <span className="rounded-lg border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 shadow-sm">
                ⚡ AVISO CORTO · 2 SEMANAS (+35% BOLSA)
              </span>
            ) : opp.noticeType === 'championship' ? (
              <span className="flex items-center gap-1.5 rounded-lg border border-yellow-500/50 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 shadow-md shadow-amber-500/20">
                <Crown className="h-3.5 w-3.5 text-amber-400" /> TÍTULO OFICIAL · 8 SEMANAS (+50% BOLSA)
              </span>
            ) : (
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-300">
                📅 ESTÁNDAR · {duration} SEMANAS
              </span>
            )

            const diffBadge = isFavorable ? (
              <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                Favorable
              </span>
            ) : isDangerous ? (
              <span className="rounded-lg border border-rose-500/30 bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-300">
                Peligroso
              </span>
            ) : (
              <span className="rounded-lg border border-slate-500/30 bg-slate-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-300">
                Parejo
              </span>
            )

            const rankBadge = opp.rank === 0 ? (
              <span className="flex items-center gap-1 rounded-md border border-amber-400/50 bg-amber-500/20 px-2 py-0.5 text-[10px] font-black tracking-wider text-amber-300">
                <Trophy className="h-3 w-3 text-amber-400" /> CAMPEÓN
              </span>
            ) : opp.rank !== undefined && opp.rank <= 15 ? (
              <span className="rounded-md border border-red-500/40 bg-red-600/20 px-2 py-0.5 text-[10px] font-black tracking-wider text-red-300">
                RANK #{opp.rank}
              </span>
            ) : (
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                NO CLASIFICADO
              </span>
            )

            return (
              <div
                key={opp.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] border-t-white/[0.16] bg-[#111622]/90 p-5 shadow-xl backdrop-blur-md transition-all duration-200 hover:border-red-500/40 hover:bg-[#141b2a]"
              >
                <div>
                  {/* Etiqueta de aviso / plazo */}
                  <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
                    {noticeBadge}
                    <div className="flex items-center gap-2">
                      {rankBadge}
                      {diffBadge}
                    </div>
                  </div>

                  {/* Cabecera del rival */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#0a0d14] p-0.5 shadow-inner">
                        <FighterAvatar seed={opp.name} country={opp.country} className="h-full w-full rounded-lg" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-extrabold text-white transition-colors group-hover:text-red-300">
                            {opp.name}
                          </h4>
                          {opp.nickname && (
                            <span className="text-xs font-semibold text-amber-400">
                              "{opp.nickname}"
                            </span>
                          )}
                          <span className="text-sm">{opp.country.split(' ')[0]}</span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {opp.country.split(' ').slice(1).join(' ')} · {opp.style}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Estadísticas clave del rival */}
                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-white/[0.06] bg-[#0a0d14]/70 p-3 text-center">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Récord</p>
                      <p className="font-mono text-sm font-black text-white">
                        {opp.record.wins}-{opp.record.losses}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">OVR</p>
                      <p className="font-mono text-sm font-black text-amber-400">{opp.ovr}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Bolsa Base</p>
                      <p className="font-mono text-sm font-black text-emerald-400">${calculatedPurse.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Scout Report del entrenador */}
                  <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-xs text-slate-400">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                    <p className="leading-relaxed">
                      <strong className="text-slate-200">Scout:</strong> {opp.scoutReport}
                    </p>
                  </div>
                </div>

                {/* Botón de acción */}
                <div className="mt-5 border-t border-white/[0.06] pt-4">
                  <button
                    onClick={() => acceptBout(opp, duration)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/20 border-t-white/40 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_8px_30px_rgba(225,29,72,0.4)] transition hover:shadow-[0_0_35px_rgba(225,29,72,0.65)] hover:brightness-110 active:scale-[0.98]"
                  >
                    <Swords className="h-4 w-4 text-white" />
                    {opp.noticeType === 'championship'
                      ? `DISPUTAR EL TÍTULO (${duration} SEMANAS)`
                      : `FIRMAR CONTRATO (${duration} SEMANAS)`}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
