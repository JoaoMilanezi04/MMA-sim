import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  DollarSign,
  Dumbbell,
  Scale,
  Sparkles,
  Swords,
  TrendingUp,
} from 'lucide-react'
import type { WeeklyProgressReport } from '../../types/game'
import { useGame } from '../../context/GameContext'

interface Props {
  report: WeeklyProgressReport
  onClose: () => void
}

export default function WeeklyReportModal({ report, onClose }: Props) {
  const { state } = useGame()
  const { player, activeBout, currentWeek, currentYear } = state

  if (!player) return null

  const weightDelta = report.weightChange.delta
  const hasWeightChange = Math.abs(weightDelta) > 0.01

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto rounded-3xl border border-white/10 bg-[#080c16] p-6 shadow-2xl ring-1 ring-white/10 sm:p-8">
        {/* Glow deportivo superior */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-44 w-80 rounded-full bg-gradient-to-b from-red-600/20 via-orange-600/10 to-transparent blur-3xl" />

        {/* Encabezado del Reporte Semanal */}
        <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 text-white shadow-lg shadow-red-950/60">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <span className="rounded-full bg-red-600/20 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-black tracking-widest text-red-300 uppercase">
                REPORTE DE EVOLUCIÓN
              </span>
              <h2 className="mt-0.5 text-2xl font-black text-white">
                Balance de la Semana {currentWeek}
              </h2>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400 font-semibold">
            <p className="text-slate-200 font-bold">Temporada {currentYear}</p>
            <p>{player.name}</p>
          </div>
        </div>

        {/* Contenido del Reporte */}
        <div className="relative mt-5 space-y-4">
          {/* 1. RESULTADOS DEL ENTRENAMIENTO */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Ganancias de Atributos ({report.sessionsCount} sesiones)
                </h3>
              </div>
              {report.overtrained && (
                <span className="flex items-center gap-1 rounded-md bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-black text-amber-300">
                  <AlertTriangle className="h-3 w-3" /> Sobreentrenado
                </span>
              )}
            </div>

            {report.statGains.length === 0 ? (
              <p className="text-xs italic text-slate-400">
                Semana de descanso o recuperación pasiva. Sin aumentos de atributos registrados.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {report.statGains.map((g) => (
                  <div
                    key={g.stat}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 shadow-sm"
                  >
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{g.label}</span>
                    <span className="font-mono font-black text-emerald-200">+{g.gain}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. CONTROL DE BÁSCULA Y PESO */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                Control de Peso y Báscula
              </h3>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Peso Inicial:</span>
                <span className="font-mono font-bold text-slate-300">{report.weightChange.before} lbs</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-slate-400">Peso Actual:</span>
                <span className="font-mono font-black text-white text-sm">{report.weightChange.after} lbs</span>
              </div>

              {hasWeightChange ? (
                <div
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-black ${
                    weightDelta < 0
                      ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border border-amber-500/30 bg-amber-500/10 text-amber-300'
                  }`}
                >
                  {weightDelta < 0 ? (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  )}
                  <span>{weightDelta > 0 ? `+${weightDelta}` : weightDelta} lbs</span>
                </div>
              ) : (
                <span className="text-[11px] font-bold text-slate-400">Peso estable</span>
              )}
            </div>
          </div>

          {/* 3. FINANZAS Y GASTOS */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                Movimientos Financieros
              </h3>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {report.financialChange.gymFee > 0
                  ? `Cuota mensual del gimnasio: -$${report.financialChange.gymFee}`
                  : 'Sin cobros de mensualidad esta semana.'}
              </span>
              <span className="font-mono font-bold text-emerald-400">
                Saldo: ${player.money.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 4. CAMPAMENTO EN CURSO (SI APLICA) */}
          {activeBout && (
            <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-xs">
              <Swords className="h-5 w-5 text-red-400 shrink-0" />
              <div>
                <p className="font-black text-white">
                  Combate vs {activeBout.opponent.name} ({activeBout.organization})
                </p>
                <p className="text-slate-300 mt-0.5">
                  {activeBout.weeksRemaining === 0
                    ? '¡El campamento ha finalizado! Todo listo para la noche de pelea.'
                    : `Quedan ${activeBout.weeksRemaining} ${activeBout.weeksRemaining === 1 ? 'semana' : 'semanas'} de preparación intensiva.`}
                </p>
              </div>
            </div>
          )}

          {/* NOTICIA DESTACADA DE LA SEMANA */}
          {state.world.news.length > 0 && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/5 bg-white/[0.01] p-3 text-xs text-slate-400">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              <p className="truncate">
                <strong className="text-slate-200">Titular de la Semana:</strong> {state.world.news[0].headline}
              </p>
            </div>
          )}
        </div>

        {/* Botón de Confirmación */}
        <button
          id="confirm-weekly-report"
          onClick={onClose}
          className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 py-4 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-red-950/50 transition hover:brightness-110 active:scale-[0.98]"
        >
          <CheckCircle2 className="h-5 w-5" />
          CONTINUAR AL DASHBOARD
        </button>
      </div>
    </div>
  )
}
