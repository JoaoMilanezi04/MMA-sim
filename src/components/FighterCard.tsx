import { Crown, Flame, Scale, Shield, Sparkles } from 'lucide-react'
import { useGame, usePlayer } from '../context/GameContext'
import { DIVISION_ABBR, DIVISION_LIMITS } from '../types/game'
import FighterAvatar from './common/FighterAvatar'

export default function FighterCard() {
  const { state } = useGame()
  const p = usePlayer()
  const [flag, ...restCountry] = p.country.split(' ')
  const limit = DIVISION_LIMITS[p.division]
  const isPro = p.status === 'Pro'

  // Determinar si el peleador es campeón
  const isChampion =
    state.world.fighters.some((f) => f.isPlayer && f.rank === 0) ||
    Boolean(p.isRegionalChampion && p.organization === 'UFC')

  const weightDiff = Number((p.weight - limit).toFixed(1))
  const isOverweight = weightDiff > 0

  // Anillo de progreso para el OVR (perímetro con radio 28 => 2 * PI * 28 ≈ 175.9)
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(100, p.overall) / 100) * circumference

  // Paletas y biseles según estatus
  const borderRing = isChampion
    ? 'border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/40'
    : isPro
      ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)] ring-1 ring-red-500/30'
      : 'border-sky-500/40 shadow-[0_0_30px_rgba(14,165,233,0.18)] ring-1 ring-sky-500/30'

  const crestBg = isChampion
    ? 'from-amber-500/30 via-yellow-600/20 to-black text-amber-200 border-amber-400/60'
    : isPro
      ? 'from-red-600/30 via-orange-600/20 to-black text-white border-red-500/60'
      : 'from-sky-500/30 via-blue-600/20 to-black text-sky-200 border-sky-400/60'

  const progressStroke = isChampion
    ? '#f59e0b'
    : isPro
      ? '#ef4444'
      : '#38bdf8'

  return (
    <section
      id="fighter-hero-card"
      className={`relative flex flex-col overflow-hidden rounded-3xl border bg-gradient-to-b from-[#111728] via-[#090d18] to-[#04060d] p-5 shadow-2xl backdrop-blur-2xl transition-all duration-300 sm:p-6 ${borderRing}`}
    >
      {/* Resplandor superior de foco deportivo */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-gradient-to-b from-white/10 via-red-500/5 to-transparent blur-3xl" />

      {/* 1. CABECERA INTEGRADA: Bandera, Categoría y Badge de Estatus */}
      <div className="relative mb-3 flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-slate-900/90 text-lg shadow-inner backdrop-blur"
            title={restCountry.join(' ')}
          >
            {flag}
          </span>
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              DIVISIÓN
            </span>
            <p className="text-xs font-black text-white tracking-wide">
              {DIVISION_ABBR[p.division]} · {limit} LBS
            </p>
          </div>
        </div>

        {/* Estatus Badge con bisel */}
        {isChampion ? (
          <span className="flex items-center gap-1 rounded-full border border-amber-400/60 bg-gradient-to-r from-amber-500/30 to-yellow-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300 shadow-lg shadow-amber-950/40">
            <Crown className="h-3 w-3 text-amber-400" /> CAMPEÓN DEL MUNDO
          </span>
        ) : isPro ? (
          <span className="flex items-center gap-1 rounded-full border border-red-500/50 bg-gradient-to-r from-red-600/25 to-orange-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300 shadow-sm">
            <Flame className="h-3 w-3 text-red-400" /> PRO · {p.organization || 'REGIONAL'}
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full border border-sky-500/50 bg-sky-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-300">
            <Shield className="h-3 w-3 text-sky-400" /> CIRCUITO AMATEUR
          </span>
        )}
      </div>

      {/* 2. CUERPO DEL ATLETA: Foco de Octágono + Avatar Profesional */}
      <div className="relative my-2 flex flex-col items-center">
        {/* Cono de luz cenital de Octágono */}
        <div className="relative flex h-48 w-48 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/15 via-red-500/10 to-transparent blur-xl" />
          <div className="relative h-44 w-44 overflow-hidden rounded-3xl border-2 border-white/20 bg-gradient-to-b from-slate-900 via-[#0a0f1d] to-[#050811] p-1 shadow-2xl ring-4 ring-black/60">
            <FighterAvatar
              appearance={p.appearance}
              seed={p.name}
              country={p.country}
              className="h-full w-full rounded-2xl"
            />
          </div>
        </div>

        {/* 3. TIPOGRAFÍA PPV DEPORTIVA: Apodo + Nombre */}
        <div className="mt-4 flex flex-col items-center text-center">
          <p className="text-xs font-black italic uppercase tracking-[0.25em] text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]">
            "{p.nickname || 'THE PHENOM'}"
          </p>
          <h2 className="mt-0.5 text-2xl font-black uppercase tracking-tight text-white drop-shadow lg:text-3xl">
            {p.name}
          </h2>
          <p className="mt-0.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {restCountry.join(' ')}
          </p>
        </div>
      </div>

      {/* 4. ESCUDO CENTRAL METÁLICO DE OVR CON ANILLO RADIAL */}
      <div className="relative my-4 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.03] p-3.5 shadow-inner">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                VALORACIÓN GENERAL
              </span>
            </div>
            <p className="mt-0.5 text-sm font-black uppercase tracking-wide text-amber-300">
              {p.archetype || 'Well-Rounded'}
            </p>
            <span className="text-[10px] font-semibold text-slate-400">
              Estilo Base de Combate
            </span>
          </div>

          {/* Medidor Radial y Escudo OVR */}
          <div className="relative flex h-20 w-20 items-center justify-center">
            {/* SVG Anillo Radial */}
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-white/10"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                stroke={progressStroke}
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Chasis Central con Número */}
            <div
              className={`absolute flex h-14 w-14 flex-col items-center justify-center rounded-xl border bg-gradient-to-b shadow-lg ${crestBg}`}
            >
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-300/90 leading-none">
                OVR
              </span>
              <span className="text-2xl font-black leading-tight tracking-tighter drop-shadow">
                {p.overall}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. TALE OF THE TAPE: Grid Integrado de Especificaciones */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
            TALE OF THE TAPE · ESPECIFICACIONES
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            REGISTRO OFICIAL
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Récord Oficial */}
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
              RÉCORD DEPORTIVO
            </span>
            <div className="mt-1 flex items-center gap-1.5 font-black text-white">
              <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-xs text-emerald-300 font-mono">
                {p.record.wins} W
              </span>
              <span className="rounded-md bg-rose-500/20 px-1.5 py-0.5 text-xs text-rose-300 font-mono">
                {p.record.losses} L
              </span>
              {p.record.draws > 0 && (
                <span className="rounded-md bg-slate-500/20 px-1.5 py-0.5 text-xs text-slate-300 font-mono">
                  {p.record.draws} D
                </span>
              )}
            </div>
          </div>

          {/* Altura y Alcance */}
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
              ESTATURA / ALCANCE
            </span>
            <p className="mt-1 font-black text-white">
              {p.height} cm · <span className="text-slate-300 font-medium">Reach {p.reach ?? p.height} cm</span>
            </p>
          </div>

          {/* Edad y Guardia */}
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
              EDAD & GUARDIA
            </span>
            <p className="mt-1 font-black text-white">
              {p.age} años · <span className="text-slate-300 font-medium">Ortodoxo</span>
            </p>
          </div>

          {/* Seguidores / Fans */}
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
              AUDIENCIA / FANS
            </span>
            <p className="mt-1 font-black text-white">
              {p.fans.toLocaleString()}{' '}
              <span className="text-[10px] font-normal text-slate-400">seguidores</span>
            </p>
          </div>
        </div>

        {/* Calibración de Báscula y Estado de Peso */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 shadow-inner">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Scale className="h-4 w-4 text-slate-400" />
              <span className="text-[11px] font-bold">
                Báscula Oficial (Límite: <strong className="text-white">{limit} lbs</strong>)
              </span>
            </div>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-black font-mono ${
                isOverweight
                  ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
              }`}
            >
              {p.weight.toFixed(1)} lbs {isOverweight ? `(+${weightDiff} lbs)` : '(En Peso)'}
            </span>
          </div>

          {/* Indicador visual de calibración */}
          <div className="mt-2.5 relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full transition-all duration-500 ${
                isOverweight
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{
                width: `${Math.min(100, (p.weight / (limit * 1.15)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
