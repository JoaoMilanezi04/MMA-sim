import { useState } from 'react'
import {
  CheckCircle2,
  Flame,
  Mail,
  Sparkles,
  Swords,
  Trophy,
  Zap,
} from 'lucide-react'
import { useGame, usePlayer } from '../../context/GameContext'
import ContractsModal from './ContractsModal'

export default function AmateurCircuit() {
  const { simulateAmateurFight, devInsertRanking } = useGame()
  const player = usePlayer()
  const [showContractsModal, setShowContractsModal] = useState(false)

  const targetWins = 4
  const currentWins = player.record.wins
  const progressPct = Math.min(100, (currentWins / targetWins) * 100)
  const isEligible = currentWins >= targetWins
  const isPro = player.status === 'Pro'

  return (
    <div className="flex flex-col gap-6">
      {/* Banner de estatus */}
      {isPro ? (
        <section className="relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-[#0f172a] to-black p-6 shadow-xl">
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-black tracking-widest text-emerald-300">
                  ESTATUS: PROFESIONAL (PRO)
                </span>
                <span className="text-xs text-slate-400">División {player.division}</span>
              </div>
              <h2 className="mt-2 text-2xl font-black text-white">
                Contrato Activo: {player.contract?.organizationName ?? player.organization ?? 'Promotora Pro'}
              </h2>
              <p className="mt-1 text-sm text-slate-300 max-w-xl">
                Ya no perteneces al circuito amateur. Tienes un contrato profesional vigente y estás en el radar de las grandes organizaciones del deporte.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center min-w-[140px]">
                <p className="text-[10px] uppercase tracking-widest text-slate-400">Peleas del Contrato</p>
                <p className="text-2xl font-black text-white">
                  {player.contract?.fightsRemaining ?? player.contract?.totalFights ?? '—'}
                </p>
                <p className="text-xs text-slate-400">restantes</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center min-w-[140px]">
                <p className="text-[10px] uppercase tracking-widest text-slate-400">Bolsa por Pelea</p>
                <p className="text-2xl font-black text-emerald-400">
                  ${player.contract?.showPurse.toLocaleString() ?? '—'}
                </p>
                <p className="text-xs text-slate-400">
                  +${player.contract?.winPurse.toLocaleString() ?? '—'} victoria
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-[#0f172a] to-black p-6 shadow-xl">
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-red-600/15 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-500/20 border border-amber-400/30 px-3 py-1 text-xs font-black tracking-widest text-amber-300">
                  ESTATUS: {player.status.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400">División {player.division}</span>
              </div>
              <h2 className="mt-2 text-2xl font-black text-white">Camino al Circuito Profesional</h2>
              <p className="mt-1 text-sm text-slate-400 max-w-xl">
                Los cazatalentos de promociones regionales (LFA, Cage Warriors) requieren un récord amateur sólido de al menos 4 victorias antes de ofrecerte un contrato profesional remunerado.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center min-w-[140px]">
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Récord Amateur</p>
              <p className="text-3xl font-black text-white">
                {player.record.wins}-{player.record.losses}
              </p>
              <p className="text-xs text-slate-400">{player.fans} seguidores</p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="relative mt-6">
            <div className="mb-2 flex justify-between text-xs font-bold">
              <span className="text-slate-300">
                Progreso hacia Contrato Pro: {currentWins} / {targetWins} victorias
              </span>
              <span className={isEligible ? 'text-emerald-400' : 'text-orange-400'}>
                {isEligible ? '¡Objetivo alcanzado! Ofertas disponibles' : `${targetWins - currentWins} victorias restantes`}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isEligible
                    ? 'bg-gradient-to-r from-emerald-500 to-lime-400'
                    : 'bg-gradient-to-r from-red-600 to-orange-500'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Botón pulsante si es elegible */}
          {isEligible && (
            <div className="relative mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-amber-500/50 bg-gradient-to-r from-amber-500/20 via-red-600/20 to-orange-500/20 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-bold animate-bounce">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">
                    ¡Tienes ofertas de contrato esperando tu firma!
                  </p>
                  <p className="text-xs text-slate-300">
                    {player.record.losses === 0
                      ? 'Tu récord invicto ha captado el interés de RIZIN y Dana White (DWCS).'
                      : 'Promotoras regionales han presentado ofertas formales por tus servicios.'}
                  </p>
                </div>
              </div>

              <button
                id="review-contracts-button"
                onClick={() => setShowContractsModal(true)}
                className="group relative cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 px-6 py-3 text-sm font-black text-white shadow-xl shadow-red-950 transition hover:brightness-110 active:scale-95 shrink-0"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> REVISAR OFERTAS DE CONTRATO
                </span>
                <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform group-hover:translate-x-full duration-700" />
              </button>
            </div>
          )}
        </section>
      )}

      {/* Grid de fases y beneficios */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/70 p-5 shadow-lg">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <Zap className="h-5 w-5" />
            <h3 className="font-bold text-white">Fase 1: Torneos Locales</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Combates amateur sin bolsa garantizada ($100 simbólicos para viáticos). Ideal para construir tu OVR en el gimnasio y ganar experiencia sin desgaste de rankings.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/70 p-5 shadow-lg">
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <Flame className="h-5 w-5" />
            <h3 className="font-bold text-white">Fase 2: Promociones Pro</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Con 4 victorias amateur firmas tu primer contrato profesional en ligas como LFA, Cage Warriors o RIZIN con bolsas remuneradas de presentación y victoria.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/70 p-5 shadow-lg">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <Trophy className="h-5 w-5" />
            <h3 className="font-bold text-white">Fase 3: DWCS y UFC</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Si te mantienes invicto o dominas en el circuito profesional, recibes la invitación a Dana White's Contender Series (DWCS) o el salto directo al Top 15 mundial.
          </p>
        </div>
      </div>

      {/* Panel de prueba / desarrollo */}
      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
          <Swords className="h-5 w-5" />
          Herramientas de Simulación y Desarrollo (Testing)
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Usa estos controles para simular peleas amateur instantáneas, acumular victorias o forzar la entrada en los rankings para probar el flujo completo.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={simulateAmateurFight}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-900/40 transition hover:brightness-110 active:scale-95"
          >
            <Swords className="h-4 w-4" />
            Simular Pelea Amateur (Win/Loss)
          </button>

          {!isEligible && (
            <button
              onClick={() => {
                // Quick test: simulate until 4 wins
                simulateAmateurFight()
              }}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
            >
              +1 Combate Rápido
            </button>
          )}

          <button
            onClick={devInsertRanking}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/20 px-5 py-3 text-sm font-bold text-amber-300 transition hover:bg-amber-500/30 active:scale-95"
          >
            <CheckCircle2 className="h-4 w-4" />
            Forzar Entrada al Ranking UFC #15
          </button>

          {isEligible && (
            <button
              onClick={() => setShowContractsModal(true)}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-5 py-3 text-sm font-bold text-emerald-300 transition hover:bg-emerald-500/30 active:scale-95"
            >
              <Mail className="h-4 w-4" /> Abrir Modal de Contratos
            </button>
          )}
        </div>
      </section>

      {/* Modal de ofertas */}
      {showContractsModal && (
        <ContractsModal player={player} onClose={() => setShowContractsModal(false)} />
      )}
    </div>
  )
}
