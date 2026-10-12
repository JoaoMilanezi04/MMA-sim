import { useState } from 'react'
import {
  Activity,
  Award,
  Briefcase,
  Check,
  CheckCircle2,
  DollarSign,
  HeartPulse,
  Lock,
  ShieldCheck,
  Sparkles,
  Utensils,
  Zap,
} from 'lucide-react'
import { useGame, usePlayer } from '../../context/GameContext'
import { JOBS, SPONSORS, SUPPORT_STAFF, type JobId } from '../../types/lifestyle'

export default function LifestyleView() {
  const { state, setJob, toggleSponsor, toggleStaff } = useGame()
  const player = usePlayer()

  const [notification, setNotification] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  const currentJobId: JobId = state.jobId || 'full_time_athlete'
  const activeSponsors = state.activeSponsors || []
  const hiredStaff = state.hiredStaff || []

  // Total sponsor earnings per fight
  const totalSponsorPerFight = activeSponsors.reduce((sum, id) => {
    const sp = SPONSORS.find((s) => s.id === id)
    return sum + (sp ? sp.payoutPerFight : 0)
  }, 0)

  // Total monthly staff expenses
  const totalStaffMonthly = hiredStaff.reduce((sum, id) => {
    const st = SUPPORT_STAFF.find((s) => s.id === id)
    return sum + (st ? st.monthlyFee : 0)
  }, 0)

  const currentJobDef = JOBS.find((j) => j.id === currentJobId) || JOBS[0]

  return (
    <div className="flex flex-col gap-8 pb-12 font-chakra">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-white/20 border-t-white/40 bg-[#141a29]/95 px-5 py-3 text-sm font-bold text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. CABECERA GENERAL DE VIDA Y NEGOCIOS                    */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] border-t-white/[0.18] bg-gradient-to-r from-[#0d121c]/95 via-[#080c14]/95 to-[#05070a]/95 p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 border-t-white/40 bg-gradient-to-br from-red-600 to-rose-700 shadow-lg shadow-red-950/60">
              <Briefcase className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-red-500/40 bg-red-600/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-red-400">
                  Economía & Carrera
                </span>
                <span className="text-xs text-slate-400">· División {player.division}</span>
              </div>
              <h1 className="font-teko text-3xl sm:text-4xl font-black uppercase tracking-wider text-white leading-tight">
                VIDA, FINANZAS Y NEGOCIOS
              </h1>
              <p className="text-xs text-slate-400 max-w-xl">
                Administra tus ocupaciones laborales de subsistencia, contratos comerciales de patrocinio y cuerpo técnico multidisciplinario.
              </p>
            </div>
          </div>

          {/* Tarjetas de Resumen Financiero Rápido */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/[0.08] border-t-white/[0.15] bg-[#10131a] p-3 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-emerald-400" /> Fondos Líquidos
              </span>
              <p className="mt-1 font-mono text-base font-black text-emerald-400">
                ${player.money.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] border-t-white/[0.15] bg-[#10131a] p-3 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-400" /> Energía Máx.
              </span>
              <p className="mt-1 font-teko text-xl font-black text-amber-300 leading-none">
                {player.maxEnergy} / 100 <span className="text-xs font-chakra font-normal text-slate-400">PTS</span>
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] border-t-white/[0.15] bg-[#10131a] p-3 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Award className="h-3 w-3 text-rose-400" /> Patrocinio / Pelea
              </span>
              <p className="mt-1 font-mono text-base font-black text-rose-300">
                +${totalSponsorPerFight.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] border-t-white/[0.15] bg-[#10131a] p-3 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <HeartPulse className="h-3 w-3 text-sky-400" /> Nómina Staff / Mes
              </span>
              <p className="mt-1 font-mono text-base font-black text-slate-300">
                -${totalStaffMonthly.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. SECCIÓN: TRABAJOS DE SUBSISTENCIA                      */}
      {/* ========================================================= */}
      <section className="rounded-2xl border border-white/[0.08] border-t-white/[0.15] bg-[#0c1017]/90 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-400">
                Fase Amateur / Regional
              </span>
              <span className="text-xs text-slate-400">· 1 Ocupación activa</span>
            </div>
            <h2 className="font-teko text-2xl font-black uppercase tracking-wider text-white mt-1">
              TRABAJOS DE SUBSISTENCIA
            </h2>
            <p className="text-xs text-slate-400">
              Genera ingresos constantes cada semana para costear el gimnasio a cambio de un límite en tu energía máxima disponible.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-slate-300">
            <span className="text-slate-500">Ocupación Actual:</span>
            <span className="font-bold text-amber-300">{currentJobDef.title}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {JOBS.map((job) => {
            const isSelected = job.id === currentJobId
            return (
              <div
                key={job.id}
                onClick={() => {
                  if (!isSelected) {
                    setJob(job.id)
                    showToast(`Ocupación cambiada a: ${job.title}`)
                  }
                }}
                className={`group relative flex flex-col justify-between rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-2 border-red-500/80 border-t-red-400 bg-gradient-to-b from-[#171b26] to-[#0e131d] shadow-[0_0_25px_rgba(239,68,68,0.2)]'
                    : 'border border-white/[0.06] border-t-white/[0.12] bg-[#10131a] hover:border-white/20 hover:bg-[#141924]'
                }`}
              >
                {/* Indicador de Activo */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {job.company}
                  </span>
                  {isSelected ? (
                    <span className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300 shadow-sm">
                      <Check className="h-3 w-3 text-emerald-400" /> ACTIVO
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-300">
                      DISPONIBLE
                    </span>
                  )}
                </div>

                {/* Título y Descripción */}
                <div>
                  <h3 className="font-chakra text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                    {job.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed min-h-[40px]">
                    {job.description}
                  </p>
                </div>

                {/* Métricas de Economía vs Energía */}
                <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-4">
                  <div className="rounded-lg bg-black/40 p-2.5 text-left border border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                      SALARIO SEMANAL
                    </span>
                    <p className="font-mono text-base font-black text-emerald-400 mt-0.5">
                      {job.salaryWeekly > 0 ? `+$${job.salaryWeekly}` : '$0'}
                      <span className="text-[10px] text-slate-500">/sem</span>
                    </p>
                  </div>

                  <div className="rounded-lg bg-black/40 p-2.5 text-left border border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                      ENERGÍA TOPE
                    </span>
                    <p className={`font-mono text-base font-black mt-0.5 ${
                      job.energyCost > 0 ? 'text-amber-400' : 'text-sky-300'
                    }`}>
                      {100 - job.energyCost}
                      <span className="text-[10px] text-slate-500"> / 100 pts</span>
                    </p>
                  </div>
                </div>

                {/* Botón de Selección */}
                <button
                  type="button"
                  className={`mt-4 w-full rounded-lg py-2.5 text-xs font-black uppercase tracking-wider transition ${
                    isSelected
                      ? 'border border-emerald-500/40 bg-emerald-600/20 text-emerald-300 cursor-default'
                      : 'border border-white/10 bg-white/5 text-slate-300 hover:border-red-500/40 hover:bg-red-600/20 hover:text-white'
                  }`}
                >
                  {isSelected ? 'Ocupación Seleccionada' : 'Elegir Ocupación'}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. SECCIÓN: CONTRATOS DE PATROCINIO COMERCIAL             */}
      {/* ========================================================= */}
      <section className="rounded-2xl border border-white/[0.08] border-t-white/[0.15] bg-[#0c1017]/90 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-400">
                Ingresos por Combate
              </span>
              <span className="text-xs text-slate-400">· {player.fans.toLocaleString()} Seguidores</span>
            </div>
            <h2 className="font-teko text-2xl font-black uppercase tracking-wider text-white mt-1">
              CONTRATOS DE PATROCINIO COMERCIAL
            </h2>
            <p className="text-xs text-slate-400">
              Acuerdos con marcas deportivas y patrocinadores globales que se cobran automáticamente tras cada pelea.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-slate-300">
            <span className="text-slate-500">Activos:</span>
            <span className="font-bold text-emerald-400">{activeSponsors.length} de {SPONSORS.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SPONSORS.map((sp) => {
            const isSigned = activeSponsors.includes(sp.id)
            const hasEnoughFans = player.fans >= sp.minFans
            const hasUfc = !sp.requiresUfc || player.organization === 'UFC'
            const hasStreak = !sp.minStreak || player.record.wins >= sp.minStreak
            const isEligible = hasEnoughFans && hasUfc && hasStreak

            return (
              <div
                key={sp.id}
                className={`relative flex flex-col justify-between rounded-xl p-5 transition-all duration-200 ${
                  isSigned
                    ? 'border-2 border-amber-500/80 border-t-amber-400 bg-gradient-to-b from-[#181a24] to-[#0f121a] shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : isEligible
                    ? 'border border-white/[0.08] border-t-white/[0.18] bg-[#10131a] hover:border-white/25'
                    : 'border border-white/[0.04] bg-[#0a0d13]/60 opacity-60'
                }`}
              >
                {/* Encabezado con Logo y Categoría */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-teko text-xl font-black tracking-widest text-slate-200">
                      {sp.logoText}
                    </span>
                    {isSigned ? (
                      <span className="flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-amber-300">
                        <CheckCircle2 className="h-3 w-3 text-amber-400" /> FIRMADO
                      </span>
                    ) : isEligible ? (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-300">
                        ELEGIBLE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[9px] font-black uppercase text-slate-500">
                        <Lock className="h-3 w-3 text-slate-500" /> BLOQUEADO
                      </span>
                    )}
                  </div>

                  <h3 className="font-chakra text-sm font-bold text-white">
                    {sp.name}
                  </h3>
                  <p className="text-[10px] text-amber-400/90 font-medium">
                    {sp.category}
                  </p>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed min-h-[44px]">
                    {sp.description}
                  </p>
                </div>

                {/* Bolsa del Patrocinio y Requisitos */}
                <div className="mt-4 border-t border-white/[0.06] pt-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-500">
                      PAGO / COMBATE:
                    </span>
                    <span className="font-mono font-black text-amber-300 text-sm">
                      +${sp.payoutPerFight.toLocaleString()}
                    </span>
                  </div>

                  {/* Requisitos de Desbloqueo */}
                  <div className="rounded-lg bg-black/40 p-2 text-[10px] space-y-1 border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Seguidores:</span>
                      <span className={player.fans >= sp.minFans ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        {player.fans} / {sp.minFans}
                      </span>
                    </div>
                    {sp.requiresUfc && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Organización:</span>
                        <span className={player.organization === 'UFC' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                          Solo UFC
                        </span>
                      </div>
                    )}
                    {sp.minStreak && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Victorias mínimas:</span>
                        <span className={player.record.wins >= sp.minStreak ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                          {player.record.wins} / {sp.minStreak}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Botón de Firma */}
                  <button
                    type="button"
                    disabled={!isEligible && !isSigned}
                    onClick={() => {
                      toggleSponsor(sp.id)
                      showToast(isSigned ? `Patrocinio con ${sp.name} cancelado` : `¡Contrato firmado con ${sp.name}!`)
                    }}
                    className={`mt-2 w-full rounded-lg py-2 text-xs font-black uppercase tracking-wider transition ${
                      isSigned
                        ? 'border border-red-500/30 bg-red-600/20 text-red-300 hover:bg-red-600/30'
                        : isEligible
                        ? 'border border-amber-500/40 bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md hover:brightness-110 active:scale-95'
                        : 'border border-white/5 bg-white/[0.02] text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {isSigned ? 'Rescindir Acuerdo' : isEligible ? 'Firmar Acuerdo' : 'Requisitos Incompletos'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. SECCIÓN: EQUIPO DE APOYO MULTIDISCIPLINARIO             */}
      {/* ========================================================= */}
      <section className="rounded-2xl border border-white/[0.08] border-t-white/[0.15] bg-[#0c1017]/90 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-sky-400">
                Alto Rendimiento & Salud
              </span>
              <span className="text-xs text-slate-400">· Contratación mensual</span>
            </div>
            <h2 className="font-teko text-2xl font-black uppercase tracking-wider text-white mt-1">
              STAFF PROFESIONAL E INVERSIONES PRIVADAS
            </h2>
            <p className="text-xs text-slate-400">
              Contrata especialistas privados para proteger la integridad física de tu peleador y optimizar la pérdida de peso.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-slate-300">
            <span className="text-slate-500">Personal en Nómina:</span>
            <span className="font-bold text-sky-400">{hiredStaff.length} especialistas</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SUPPORT_STAFF.map((staff) => {
            const isHired = hiredStaff.includes(staff.id)
            const canAfford = player.money >= staff.monthlyFee

            return (
              <div
                key={staff.id}
                className={`flex flex-col justify-between rounded-xl p-5 transition-all duration-200 ${
                  isHired
                    ? 'border-2 border-sky-500/80 border-t-sky-400 bg-gradient-to-b from-[#141b29] to-[#0e1420] shadow-[0_0_25px_rgba(56,189,248,0.2)]'
                    : 'border border-white/[0.08] border-t-white/[0.15] bg-[#10131a] hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
                        staff.id === 'nutritionist'
                          ? 'border-emerald-500/40 bg-emerald-600/20 text-emerald-300'
                          : 'border-sky-500/40 bg-sky-600/20 text-sky-300'
                      }`}>
                        {staff.id === 'nutritionist' ? (
                          <Utensils className="h-6 w-6" />
                        ) : (
                          <Activity className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-chakra text-base font-bold text-white">
                          {staff.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">
                          {staff.role}
                        </p>
                      </div>
                    </div>

                    {isHired ? (
                      <span className="flex items-center gap-1 rounded-full border border-sky-500/40 bg-sky-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-sky-300 shadow-sm">
                        <ShieldCheck className="h-3 w-3 text-sky-400" /> EN NÓMINA
                      </span>
                    ) : (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-400">
                        DISPONIBLE
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                    {staff.description}
                  </p>

                  {/* Beneficio Activo */}
                  <div className="mt-4 rounded-lg border border-white/5 bg-black/40 p-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-400" /> VENTAJA PERMANENTE:
                    </span>
                    <p className="mt-1 text-xs font-bold text-amber-300">
                      {staff.benefit}
                    </p>
                  </div>
                </div>

                {/* Tarifa Mensual y Acción */}
                <div className="mt-5 border-t border-white/[0.06] pt-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500">
                      HONORARIOS PROFESIONALES:
                    </span>
                    <p className="font-mono text-base font-black text-white">
                      ${staff.monthlyFee}
                      <span className="text-xs text-slate-400 font-normal"> / mes (cada 4 semanas)</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={!isHired && !canAfford}
                    onClick={() => {
                      toggleStaff(staff.id)
                      showToast(isHired ? `Contrato con ${staff.name} finalizado` : `¡${staff.name} se incorporó a tu equipo!`)
                    }}
                    className={`rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-wider transition ${
                      isHired
                        ? 'border border-red-500/30 bg-red-600/20 text-red-300 hover:bg-red-600/30'
                        : canAfford
                        ? 'border border-sky-500/40 bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md hover:brightness-110 active:scale-95'
                        : 'border border-white/5 bg-white/[0.02] text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {isHired ? 'Despedir Especialista' : canAfford ? 'Contratar Especialista' : 'Fondos Insuficientes'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
