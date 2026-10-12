import { Crown, Flame, Scale, Shield } from 'lucide-react'
import { useGame, usePlayer } from '../../context/GameContext'
import { DIVISION_ABBR, DIVISION_LIMITS } from '../../types/game'
import FighterAvatar from '../common/FighterAvatar'

export default function HeroAthleteStrip() {
  const { state } = useGame()
  const p = usePlayer()

  const [flag] = p.country.split(' ')
  const limit = DIVISION_LIMITS[p.division]
  const currentWeight = p.currentWeight ?? p.weight
  const weightDiff = Number((currentWeight - limit).toFixed(1))
  const isOnWeight = currentWeight >= limit - 1.5 && currentWeight <= limit
  const isOverweight = currentWeight > limit
  const isPro = p.status === 'Pro'

  const playerInWorld = state.world.fighters.find(
    (f) => f.isPlayer && (!p.organization || f.organization === p.organization) && f.division === p.division,
  )

  // Estatus de Campeón
  const isChampion =
    p.rank === 0 ||
    playerInWorld?.rank === 0 ||
    state.world.fighters.some((f) => f.isPlayer && f.rank === 0) ||
    Boolean(p.isRegionalChampion && p.organization === 'UFC')

  // OVR Gauge
  const ovr = p.overall
  const ovrColor = isChampion
    ? 'text-amber-300 drop-shadow-[0_0_18px_rgba(251,191,36,0.5)]'
    : isPro
    ? 'text-red-400 drop-shadow-[0_0_18px_rgba(248,113,113,0.4)]'
    : 'text-slate-200 drop-shadow-[0_0_15px_rgba(226,232,240,0.35)]'

  const nicknameDisplay = p.nickname ? `"${p.nickname.toUpperCase()}"` : '"THE CONTENDER"'

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] border-t-white/[0.18] bg-gradient-to-r from-[#0c101a]/95 via-[#080c14]/95 to-[#05070a]/95 p-4 shadow-[0_16px_45px_rgba(0,0,0,0.85)] backdrop-blur-md sm:p-6 transition-all duration-300">
      {/* Resplandores ambientales de estadio de combate */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-56 w-96 rounded-full bg-red-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 h-56 w-96 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* ========================================================= */}
        {/* LADO IZQUIERDO: AVATAR + BANDERA + MARQUESINA DE NOMBRE  */}
        {/* ========================================================= */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Avatar con marco deportivo angulado */}
          <div className="relative shrink-0">
            <div className="relative h-22 w-22 overflow-hidden rounded-2xl border border-white/[0.15] border-t-white/30 bg-black/90 p-1 shadow-2xl ring-2 ring-black/70 sm:h-26 sm:w-26">
              <FighterAvatar
                appearance={p.appearance}
                seed={p.name}
                country={p.country}
                className="h-full w-full rounded-xl"
              />
            </div>
            {/* Bandera flotante */}
            <span
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-[#090d19]/90 text-sm shadow-md backdrop-blur"
              title={p.country}
            >
              {flag}
            </span>
          </div>

          {/* Marquesina del Peleador - Estilo Evento Estelar (PPV) */}
          <div className="min-w-0">
            <p className="font-chakra text-xs font-black tracking-[0.3em] text-amber-400 uppercase sm:text-sm drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]">
              {nicknameDisplay}
            </p>
            <h1 className="mt-0.5 truncate font-teko text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-wide leading-none text-white drop-shadow-md">
              {p.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-md border border-white/10 bg-white/[0.05] px-2.5 py-0.5 font-chakra text-[11px] font-bold text-slate-200">
                {DIVISION_ABBR[p.division]} · {limit} LBS
              </span>
              <span className="text-slate-400 font-medium">· {p.archetype || 'Balanced Fighter'}</span>
              <span className="text-slate-500 font-mono">· {p.age} años</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTRO: ESCUDO PROTAGONISTA DE OVR + RÉCORD + ESTATUS    */}
        {/* ========================================================= */}
        <div className="flex items-center justify-center gap-6 border-y border-white/[0.08] py-4 lg:border-x lg:border-y-0 lg:px-8 lg:py-0">
          {/* Gran Escudo de OVR de Campeonato */}
          <div className="relative flex flex-col items-center">
            <div className={`relative flex min-h-[96px] w-24 sm:min-h-[104px] sm:w-28 flex-col items-center justify-center p-3 rounded-2xl border-2 bg-gradient-to-b from-black/90 to-[#0a0d16] shadow-2xl ring-4 ring-black/70 ${
              isChampion
                ? 'border-amber-400/70 border-t-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.4)]'
                : isPro
                ? 'border-red-500/70 border-t-red-400 shadow-[0_0_30px_rgba(244,63,94,0.35)]'
                : 'border-slate-600/70 border-t-slate-400 shadow-[0_0_20px_rgba(148,163,184,0.15)]'
            }`}>
              <span className={`font-teko text-5xl sm:text-6xl font-black leading-none tracking-tight ${ovrColor}`}>
                {ovr}
              </span>
              <span className="mt-1 text-center font-chakra text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
                OVR
              </span>
            </div>
          </div>

          {/* Récord y Estatus Oficial */}
          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex items-baseline gap-2">
              <span className="font-teko text-3xl sm:text-4xl font-black tracking-wider text-white leading-none">
                {p.record.wins}-{p.record.losses}
              </span>
              <span className="font-chakra text-xs font-semibold text-slate-500">
                ({p.record.draws} emp)
              </span>
            </div>

            {/* Estatus Badge */}
            {isChampion ? (
              <span className="flex items-center gap-1.5 rounded-lg border border-amber-400/50 bg-amber-500/20 px-2.5 py-1 font-chakra text-[10px] font-black uppercase tracking-wider text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                <Crown className="h-3.5 w-3.5 text-amber-400" /> CAMPEÓN {p.organization || 'MUNDIAL'}
              </span>
            ) : isPro ? (
              <span className="flex items-center gap-1.5 rounded-lg border border-rose-500/50 bg-rose-600/20 px-2.5 py-1 font-chakra text-[10px] font-black uppercase tracking-wider text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.25)]">
                <Flame className="h-3.5 w-3.5 text-rose-400" />
                {playerInWorld && playerInWorld.rank < 99
                  ? `RANK #${playerInWorld.rank} · ${p.organization || 'UFC'}`
                  : `PRO · ${p.organization || 'REGIONAL'}`}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-lg border border-slate-500/30 bg-slate-800/40 px-2.5 py-1 font-chakra text-[10px] font-black uppercase tracking-wider text-slate-300 shadow-inner">
                <Shield className="h-3.5 w-3.5 text-slate-400" /> CIRCUITO AMATEUR
              </span>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* LADO DERECHO: PANTALLA DIGITAL DE BÁSCULA + METRICAS HUD */}
        {/* ========================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 lg:justify-end">
          {/* Pantalla Digital de Báscula (Marcador Oficial LCD) */}
          <div className={`rounded-xl border bg-black/90 px-4 py-2.5 shadow-[inset_0_0_18px_rgba(0,0,0,0.5)] ${
            isOnWeight
              ? 'border-emerald-500/30 border-t-emerald-400/50 shadow-[inset_0_0_18px_rgba(16,185,129,0.12)]'
              : isOverweight
              ? 'border-amber-500/40 border-t-amber-400/60 shadow-[inset_0_0_18px_rgba(245,158,11,0.12)]'
              : 'border-rose-500/40 border-t-rose-400/60 shadow-[inset_0_0_18px_rgba(244,63,94,0.12)]'
          }`}>
            <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-wider font-chakra">
              <span className="flex items-center gap-1 text-slate-300">
                <Scale className={`h-3.5 w-3.5 ${isOnWeight ? 'text-emerald-400' : isOverweight ? 'text-amber-400' : 'text-rose-400'}`} /> BÁSCULA OFICIAL
              </span>
              <span className={`font-mono font-bold ${
                isOnWeight ? 'text-emerald-400' : isOverweight ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {isOnWeight
                  ? 'EN PESO'
                  : isOverweight
                  ? `+${weightDiff} LBS · CORTE PENDIENTE`
                  : `${Math.abs(weightDiff)} LBS · BAJO PESO`}
              </span>
            </div>
            <p className={`mt-1 font-mono text-base font-black tracking-tight ${
              isOnWeight ? 'text-emerald-400' : isOverweight ? 'text-amber-300' : 'text-rose-400'
            }`}>
              {currentWeight.toFixed(1)} <span className="text-xs text-slate-500">/ {limit} LBS</span>
            </p>
          </div>

          {/* Racha Competitiva */}
          <div className="rounded-xl border border-white/[0.08] border-t-white/[0.15] bg-black/80 px-3.5 py-2.5 shadow-inner text-center">
            <p className="font-chakra text-[10px] font-black uppercase tracking-wider text-slate-400">RACHA</p>
            <p className="mt-0.5 flex items-center justify-center gap-1 font-teko text-2xl font-black text-amber-400 leading-none">
              <Flame className="h-4 w-4 text-orange-500" />
              {p.record.wins > 0 ? `W${p.record.wins}` : '0'}
            </p>
          </div>

          {/* Fans / Seguidores */}
          <div className="rounded-xl border border-white/[0.08] border-t-white/[0.15] bg-black/80 px-3.5 py-2.5 shadow-inner text-right">
            <p className="font-chakra text-[10px] font-black uppercase tracking-wider text-slate-400">FANS</p>
            <p className="mt-0.5 font-teko text-2xl font-black text-purple-300 leading-none">
              {p.fans.toLocaleString()}
            </p>
          </div>

          {/* Saldo Económico */}
          <div className="rounded-xl border border-white/[0.08] border-t-white/[0.15] bg-black/80 px-4 py-2.5 shadow-inner text-right">
            <p className="font-chakra text-[10px] font-black uppercase tracking-wider text-slate-400">FONDOS</p>
            <p className="mt-0.5 font-mono text-sm font-black text-emerald-400">
              ${p.money.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
