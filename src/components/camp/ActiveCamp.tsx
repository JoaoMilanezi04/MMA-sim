import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  HeartPulse,
  Megaphone,
  Mic,
  Scale,
  ShieldAlert,
  Sparkles,
  Swords,
  Tv,
} from 'lucide-react'
import { useGame, usePlayer } from '../../context/GameContext'
import type { CampIntensity, GamePlan, PressStance } from '../../types/camp'
import DietSelector from '../common/DietSelector'
import FightSimulationView from '../fight/FightSimulationView'

const GAME_PLANS: {
  id: GamePlan
  label: string
  sublabel: string
  bonus: string
  description: string
}[] = [
  {
    id: 'anti-wrestling',
    label: 'Anti-Wrestling (Sprawl & Brawl)',
    sublabel: 'Frenar la lucha y mantener la pelea en pie',
    bonus: '+15% Defensa Derribos y Sprawl',
    description: 'Enfoca los entrenamientos en defender entradas bajas, castigar con rodillazos de intercepción y forzar al rival a intercambiar de pie.',
  },
  {
    id: 'striking',
    label: 'Muay Thai / Striking Agresivo',
    sublabel: 'Presión en pie y daño destructivo',
    bonus: '+15% Potencia de Golpeo y Patadas',
    description: 'Destruye la base del oponente con patadas bajas, combinaciones al cuerpo y volumen constante de combinaciones.',
  },
  {
    id: 'grappling',
    label: 'Grappling Control (Suelo & BJJ)',
    sublabel: 'Llevar a la lona y someter',
    bonus: '+15% Control Superior y Ofensiva de Sumisión',
    description: 'Buscar derribos con timing oportuno, avanzar posiciones en el suelo y finalizar con estrangulaciones o llaves articulares.',
  },
  {
    id: 'counter-boxing',
    label: 'Boxeo de Contragolpe',
    sublabel: 'Timing, cabeza y velocidad de puños',
    bonus: '+15% Precisión, Velocidad y Esquivas',
    description: 'Hacer fallar al rival con cabeceo elusivo para responder con manos rápidas en los ángulos ciegos.',
  },
]

const INTENSITIES: {
  id: CampIntensity
  label: string
  bonus: string
  risk: string
  badgeColor: string
  description: string
}[] = [
  {
    id: 'light',
    label: 'Ligero (Light)',
    bonus: '+5% Preparación',
    risk: '0% Riesgo de Lesión',
    badgeColor: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300',
    description: 'Prioriza el descanso y la frescura neuromuscular. Ideal si llegas con desgaste acumulado.',
  },
  {
    id: 'normal',
    label: 'Estándar (Normal)',
    bonus: '+15% Preparación',
    risk: '5% Fatiga Leve',
    badgeColor: 'border-amber-500/30 bg-amber-500/15 text-amber-300',
    description: 'El balance ideal entre volumen de sparring y recuperación física sin comprometer la salud.',
  },
  {
    id: 'brutal',
    label: 'Brutal (Iron Camp)',
    bonus: '+25% Preparación Máxima',
    risk: '15-20% Riesgo de Fatiga / Lesión',
    badgeColor: 'border-rose-500/30 bg-rose-500/15 text-rose-300',
    description: 'Sparrings a máxima potencia y acondicionamiento extremo. Otorga bonificaciones colosales a costa de desgaste severo.',
  },
]

export default function ActiveCamp() {
  const { state, setGamePlan, setCampIntensity, performPromo } = useGame()
  const player = usePlayer()
  const bout = state.activeBout
  const [showFightNight, setShowFightNight] = useState(false)

  // Modales de Promoción
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [showPressModal, setShowPressModal] = useState(false)

  if (!bout) return null

  const isFightWeek = bout.weeksRemaining <= 0
  const hype = bout.hype || 20
  const promoEnergySpent = bout.promoEnergySpent || 0
  const maxWeeklyEnergy = player.maxEnergy ?? 100
  const energyRemainingForPromo = Math.max(0, maxWeeklyEnergy - promoEnergySpent)

  // Nivel de Hype
  const hypeTier =
    hype >= 86
      ? { label: 'MAIN EVENT / SUPERPELEA', color: 'text-amber-300 border-amber-400/60 bg-amber-500/20 shadow-[0_0_20px_rgba(251,191,36,0.35)]', mult: 'x2.5', desc: 'Expectación mundial. Taquilla y PPV históricos.' }
      : hype >= 56
      ? { label: 'ALTO VOLTAJE', color: 'text-orange-300 border-orange-500/50 bg-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.25)]', mult: 'x1.5', desc: 'Pelea estelar de gran interés en medios.' }
      : hype >= 26
      ? { label: 'INTERÉS MODERADO', color: 'text-sky-300 border-sky-500/40 bg-sky-500/20', mult: 'x1.2', desc: 'Atención sólida entre fanáticos habituales.' }
      : { label: 'BAJO INTERÉS', color: 'text-slate-400 border-slate-600/40 bg-slate-800/40', mult: 'x1.0', desc: 'Combate preliminar con cobertura básica.' }

  const injuries = player.injuries || []

  return (
    <div className="flex flex-col gap-6 font-chakra">
      {/* ========================================================= */}
      {/* 1. BANNER PRINCIPAL DE COMBATE (DARK ARENA BEVEL)         */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] border-t-white/[0.18] bg-[#10131a] p-6 shadow-2xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-red-600/10 blur-3xl" />

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 border-t-white/40 bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg shadow-red-950/60">
              <Swords className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-red-500/40 bg-red-600/20 px-2.5 py-0.5 text-xs font-black tracking-wider text-red-300 uppercase">
                  {bout.organization}
                </span>
                <span className="text-xs font-semibold text-slate-400">· División {player.division}</span>
              </div>
              <h2 className="mt-1 font-teko text-3xl sm:text-4xl font-black uppercase text-white leading-tight">
                {player.name} <span className="text-red-500">vs</span> {bout.opponent.name}
              </h2>
            </div>
          </div>

          {/* Contador de semanas */}
          <div className="flex items-center gap-4">
            <div className={`rounded-2xl border px-5 py-3 text-right shadow-xl ${
              isFightWeek
                ? 'border-red-500/80 bg-red-600/25 ring-2 ring-red-500/40 animate-pulse'
                : 'border-white/[0.08] border-t-white/[0.15] bg-[#141924]'
            }`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cuenta Regresiva</p>
              <p className={`font-teko text-3xl font-black leading-none mt-0.5 ${isFightWeek ? 'text-red-400' : 'text-white'}`}>
                {isFightWeek ? '¡SEMANA DE PELEA!' : `${bout.weeksRemaining} ${bout.weeksRemaining === 1 ? 'SEMANA' : 'SEMANAS'}`}
              </p>
            </div>
          </div>
        </div>

        {/* Ficha del Rival y Scout Report */}
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-white/[0.06] border-t-white/[0.12] bg-[#141924] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Oponente Oficial</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-lg font-black text-white">
                {bout.opponent.name.charAt(0)}
              </div>
              <div>
                <p className="text-base font-extrabold text-white">{bout.opponent.name}</p>
                <p className="text-xs text-slate-400">
                  {bout.opponent.country} · {bout.opponent.style}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-xs">
              <span className="text-slate-400">Récord: <strong className="text-white font-mono">{bout.opponent.record.wins}-{bout.opponent.record.losses}</strong></span>
              <span className="text-slate-400">OVR: <strong className="text-amber-400 font-mono">{bout.opponent.ovr}</strong></span>
              <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300 capitalize">
                {bout.opponent.difficulty}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 border-t-amber-500/40 bg-amber-500/[0.04] p-4 lg:col-span-2">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
              <ShieldAlert className="h-4 w-4" /> Scout Report del Head Coach
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300 italic">
              "{bout.opponent.scoutReport}"
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Ajusta tu <strong>Game Plan</strong> abajo para contrarrestar sus tendencias y capitalizar sus debilidades.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. PANEL DE HYPE DE PELEA Y PROMOCIÓN (ESTILO UFC 5)      */}
      {/* ========================================================= */}
      <section className="rounded-2xl border border-white/[0.08] border-t-white/[0.15] bg-[#10131a] p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
                UFC Broadcast Engine
              </span>
              <span className="text-xs text-slate-400">· Promoción y Medios de Prensa</span>
            </div>
            <h3 className="font-teko text-2xl sm:text-3xl font-black uppercase text-white mt-1">
              HYPE DEL COMBATE Y COBERTURA DE MEDIOS
            </h3>
            <p className="text-xs text-slate-400">
              Gasta parte de tu energía semanal en ruedas de prensa, entrevistas y streaming para disparar el interés del público y maximizar tu bolsa.
            </p>
          </div>

          {/* Badge del Nivel de Hype */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 font-chakra text-xs font-black uppercase tracking-wider ${hypeTier.color}`}>
              <Flame className="h-4 w-4" />
              <span>{hypeTier.label}</span>
              <span className="ml-1 font-mono text-sm">({hypeTier.mult} FANS)</span>
            </div>
          </div>
        </div>

        {/* Barra de Progreso de Hype */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Medidor de Interés Público: {hype}%
            </span>
            <span className="text-slate-400 text-xs">
              Energía disponible para medios esta semana: <strong className="text-amber-400 font-mono">{energyRemainingForPromo} pts</strong>
            </span>
          </div>

          <div className="relative h-3 w-full overflow-hidden rounded-full bg-black/60 p-0.5 border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-orange-500 to-amber-400 transition-all duration-500 shadow-md"
              style={{ width: `${Math.max(5, hype)}%` }}
            />
          </div>

          {/* Chips de Efectos Psicológicos Activos */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {bout.trashTalkActive && (
              <span className="rounded-lg border border-red-500/50 bg-red-600/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-red-300 flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3 text-red-400" /> Trash Talk Activo: Doble daño si pierdes
              </span>
            )}
            {bout.composureModifier !== undefined && bout.composureModifier > 0 && (
              <span className="rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> +{bout.composureModifier}% Compostura en Jaula
              </span>
            )}
            {bout.opponentComposureModifier !== undefined && bout.opponentComposureModifier < 0 && (
              <span className="rounded-lg border border-amber-500/40 bg-amber-600/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Flame className="h-3 w-3 text-amber-400" /> Rival Intimidado ({bout.opponentComposureModifier}% compostura)
              </span>
            )}
          </div>
        </div>

        {/* 3 Acciones de Promoción Disponibles */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Acción 1: Stream en Vivo */}
          <div className="rounded-xl border border-white/[0.06] border-t-white/[0.12] bg-[#141924] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600/20 text-sky-400 border border-sky-500/30">
                  <Tv className="h-4.5 w-4.5" />
                </div>
                <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-sky-300">
                  -10 Energía
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">Stream en Redes / Vlog</h4>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Transmite tu sesión de sparring y responde preguntas a tus seguidores en directo.
              </p>
              <div className="mt-3 text-[11px] font-bold text-emerald-400">
                +10% Hype · +150 Seguidores
              </div>
            </div>

            <button
              disabled={energyRemainingForPromo < 10}
              onClick={() => performPromo('stream')}
              className={`mt-4 w-full rounded-lg py-2.5 text-xs font-black uppercase tracking-wider transition ${
                energyRemainingForPromo >= 10
                  ? 'border border-sky-500/40 bg-sky-600/20 text-sky-300 hover:bg-sky-600/30 active:scale-95'
                  : 'border border-white/5 bg-white/[0.02] text-slate-600 cursor-not-allowed'
              }`}
            >
              Emitir Stream
            </button>
          </div>

          {/* Acción 2: Entrevista con Prensa */}
          <div className="rounded-xl border border-white/[0.06] border-t-white/[0.12] bg-[#141924] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600/20 text-orange-400 border border-orange-500/30">
                  <Mic className="h-4.5 w-4.5" />
                </div>
                <span className="rounded bg-orange-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-orange-300">
                  -15 Energía
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">Entrevista Exclusiva (ESPN)</h4>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Siéntate con Ariel Helwani o comentaristas de ESPN para fijar tu postura previa a la jaula.
              </p>
              <div className="mt-3 text-[11px] font-bold text-orange-400">
                +15% a 25% Hype · Diálogo Interactivo
              </div>
            </div>

            <button
              disabled={energyRemainingForPromo < 15}
              onClick={() => setShowInterviewModal(true)}
              className={`mt-4 w-full rounded-lg py-2.5 text-xs font-black uppercase tracking-wider transition ${
                energyRemainingForPromo >= 15
                  ? 'border border-orange-500/40 bg-orange-600/20 text-orange-300 hover:bg-orange-600/30 active:scale-95'
                  : 'border border-white/5 bg-white/[0.02] text-slate-600 cursor-not-allowed'
              }`}
            >
              Responder Entrevista
            </button>
          </div>

          {/* Acción 3: Conferencia de Prensa & Cara a Cara */}
          <div className="rounded-xl border border-white/[0.06] border-t-white/[0.12] bg-[#141924] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
                  <Megaphone className="h-4.5 w-4.5" />
                </div>
                <span className="rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-red-300">
                  -25 Energía
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">Conferencia & Face-off</h4>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Micro abierto ante periodistas y cara a cara tenso con tu oponente frente a los fotógrafos.
              </p>
              <div className="mt-3 text-[11px] font-bold text-red-400">
                +25% a 40% Hype · +500 Seguidores
              </div>
            </div>

            <button
              disabled={energyRemainingForPromo < 25}
              onClick={() => setShowPressModal(true)}
              className={`mt-4 w-full rounded-lg py-2.5 text-xs font-black uppercase tracking-wider transition ${
                energyRemainingForPromo >= 25
                  ? 'border border-red-500/40 bg-gradient-to-r from-red-600 to-rose-600 text-white shadow hover:brightness-110 active:scale-95'
                  : 'border border-white/5 bg-white/[0.02] text-slate-600 cursor-not-allowed'
              }`}
            >
              Subir al Escenario
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. ESTADO FÍSICO Y LESIONES DE CAMPAMENTO                 */}
      {/* ========================================================= */}
      <section className="rounded-2xl border border-white/[0.08] border-t-white/[0.15] bg-[#10131a] p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-500/40 bg-sky-500/10 text-sky-400">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-chakra text-lg font-bold text-white">
                Salud del Atleta & Reporte Médico
              </h3>
              <p className="text-xs text-slate-400">
                El sobreentrenamiento y los sparrings de alta fatiga pueden causar lesiones que afectan tu rendimiento en el octágono.
              </p>
            </div>
          </div>

          {injuries.length === 0 ? (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 100% Óptimo (Sin Lesiones)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full border border-red-500/50 bg-red-600/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-red-300 animate-pulse">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" /> {injuries.length} {injuries.length === 1 ? 'Lesión Activa' : 'Lesiones Activas'}
            </span>
          )}
        </div>

        {injuries.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs text-slate-400">
            ✅ No hay lesiones registradas. Para prevenir contratiempos, programa sesiones de <strong>Recuperación Activa / Fisioterapia</strong> en tu agenda semanal.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {injuries.map((inj) => (
              <div key={inj.id} className="rounded-xl border border-red-500/40 bg-red-950/20 p-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-300">{inj.name}</span>
                  <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-red-300">
                    {inj.weeksRemaining} {inj.weeksRemaining === 1 ? 'semana restante' : 'semanas restantes'}
                  </span>
                </div>
                <p className="mt-2 text-slate-300">
                  <strong className="text-amber-300">Impacto en Combate:</strong> {inj.penaltyDescription}
                </p>
                <p className="mt-2 text-[10px] text-slate-400">
                  Tip: Programa <em>Fisioterapia</em> en tu calendario para acelerar la curación antes de la noche de pelea.
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* 4. CONTROL DE PESO Y ESTRATEGIA NUTRICIONAL              */}
      {/* ========================================================= */}
      <div className="rounded-2xl border border-white/[0.08] border-t-white/[0.15] bg-[#10131a] p-6 shadow-xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-sky-400" />
            <h3 className="font-teko text-2xl font-black uppercase text-white">
              BÁSCULA OFICIAL Y ESTRATEGIA DE PESO
            </h3>
          </div>
        </div>

        <DietSelector />
      </div>

      {/* ========================================================= */}
      {/* 5. GAME PLAN TÁCTICO                                     */}
      {/* ========================================================= */}
      <div className="rounded-2xl border border-white/[0.08] border-t-white/[0.15] bg-[#10131a] p-6 shadow-xl">
        <div className="mb-4 border-b border-white/[0.08] pb-4">
          <h3 className="font-teko text-2xl font-black uppercase text-white">
            GAME PLAN TÁCTICO DEL CAMPAMENTO
          </h3>
          <p className="text-xs text-slate-400">
            Determina en qué situaciones centrar los sparrings y simulaciones técnicas.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {GAME_PLANS.map((gp) => {
            const active = bout.gamePlan === gp.id
            return (
              <button
                key={gp.id}
                onClick={() => setGamePlan(gp.id)}
                className={`flex cursor-pointer flex-col justify-between rounded-xl border p-4 text-left transition ${
                  active
                    ? 'border-red-500/80 bg-red-600/15 ring-2 ring-red-500/40 shadow-lg'
                    : 'border-white/[0.06] border-t-white/[0.12] bg-[#141924] hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-chakra text-sm font-bold text-white">{gp.label}</p>
                    <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-300">
                      {gp.bonus}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400 font-medium">{gp.sublabel}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{gp.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. INTENSIDAD DEL CAMPAMENTO                             */}
      {/* ========================================================= */}
      <div className="rounded-2xl border border-white/[0.08] border-t-white/[0.15] bg-[#10131a] p-6 shadow-xl">
        <div className="mb-4 border-b border-white/[0.08] pb-4">
          <h3 className="font-teko text-2xl font-black uppercase text-white">
            INTENSIDAD DEL CAMPAMENTO
          </h3>
          <p className="text-xs text-slate-400">
            Elige el nivel de exigencia física en sparrings. Una intensidad más alta otorga mayor preparación a costa de fatiga y riesgo de lesiones.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {INTENSITIES.map((lvl) => {
            const active = bout.intensity === lvl.id
            return (
              <button
                key={lvl.id}
                onClick={() => setCampIntensity(lvl.id)}
                className={`flex cursor-pointer flex-col justify-between rounded-xl border p-4 text-left transition ${
                  active
                    ? 'border-amber-500/80 bg-amber-600/15 ring-2 ring-amber-500/40 shadow-lg'
                    : 'border-white/[0.06] border-t-white/[0.12] bg-[#141924] hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-chakra text-sm font-bold text-white">{lvl.label}</p>
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${lvl.badgeColor}`}>
                      {lvl.bonus}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-rose-300">Riesgo: {lvl.risk}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{lvl.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 7. BOTÓN DE ACCIÓN DE NOCHE DE PELEA                     */}
      {/* ========================================================= */}
      <div className="rounded-2xl border border-white/[0.08] border-t-white/[0.15] bg-[#10131a] p-6 shadow-2xl">
        {isFightWeek ? (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/30 text-red-400 ring-2 ring-red-500/50 animate-bounce">
              <Swords className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-teko text-2xl font-black uppercase text-white">¡EL CAMPAMENTO HA TERMINADO!</h3>
              <p className="text-xs text-slate-400">
                La arena está llena y las luces del octágono están encendidas. Todo está listo para subir a pelear.
              </p>
            </div>
            <button
              onClick={() => setShowFightNight(true)}
              className="mt-2 flex w-full max-w-md cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/20 border-t-white/40 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 py-4 text-base font-black tracking-wider text-white shadow-xl shadow-red-900/50 transition hover:brightness-110 active:scale-[0.98] animate-pulse"
            >
              🔴 IR AL PESAJE Y NOCHE DE PELEA ➔
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              Campamento en progreso ({bout.weeksRemaining} {bout.weeksRemaining === 1 ? 'semana restante' : 'semanas restantes'}).
              Haz clic en <strong>NEXT WEEK</strong> en la barra lateral para avanzar el entrenamiento semanal.
            </p>
            <button
              onClick={() => setShowFightNight(true)}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              Simular Noche de Pelea Ahora (Dev Test)
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: ENTREVISTA EXCLUSIVA                             */}
      {/* ========================================================= */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-white/20 border-t-white/40 bg-[#141a29] p-6 shadow-2xl font-chakra">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600/20 text-orange-400">
                <Mic className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Entrevista con ESPN & Ariel Helwani</h4>
                <p className="text-xs text-slate-400">Pregunta rápida de los medios</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-200 leading-relaxed italic">
              "Tu rival asegura que sus habilidades de striking son superiores a las tuyas y que te finalizará antes del tercer asalto. ¿Cuál es tu respuesta?"
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => {
                  performPromo('interview', undefined, 'humble')
                  setShowInterviewModal(false)
                }}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-emerald-500/50 hover:bg-emerald-600/10"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Opción A: Respuesta Profesional y Disciplinada</span>
                  <span className="text-[10px] font-bold text-emerald-400">+15% Hype · +2% Compostura</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  "Respeto a mi oponente y su campamento. He trabajado duro en el gimnasio y dejaremos que las manos hablen dentro de la jaula."
                </p>
              </button>

              <button
                onClick={() => {
                  performPromo('interview', undefined, 'provocative')
                  setShowInterviewModal(false)
                }}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-red-500/50 hover:bg-red-600/10"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Opción B: Declaración Provocadora (Trash Talk)</span>
                  <span className="text-[10px] font-bold text-rose-400">+25% Hype · +350 Fans</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  "Está soñando despierto. No tiene el nivel para competir conmigo y en cuanto sienta mi pegada buscará la salida fácil."
                </p>
              </button>
            </div>

            <button
              onClick={() => setShowInterviewModal(false)}
              className="mt-4 w-full text-center text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CONFERENCIA DE PRENSA & CARA A CARA              */}
      {/* ========================================================= */}
      {showPressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-white/20 border-t-white/40 bg-[#141a29] p-6 shadow-2xl font-chakra">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/20 text-red-400">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Conferencia Oficial de Prensa</h4>
                <p className="text-xs text-slate-400">Elige tu postura en el cara a cara ante los medios</p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {[
                {
                  stance: 'trash_talk' as PressStance,
                  title: 'Trash Talk Agresivo',
                  bonus: '+40% Hype · +500 Fans',
                  desc: 'Insulta a tu rival y genera tensión máxima en el cara a cara. Advertencia: si pierdes, el daño a tu imagen será doble.',
                  color: 'hover:border-red-500/50 hover:bg-red-600/10 text-rose-300',
                },
                {
                  stance: 'respect' as PressStance,
                  title: 'Enfoque Marcial & Respeto',
                  bonus: '+25% Hype · +5% Compostura en Combate',
                  desc: 'Mantén la calma y estrecha la mano con serenidad zen, ganándote el respeto del público y de los jueces.',
                  color: 'hover:border-emerald-500/50 hover:bg-emerald-600/10 text-emerald-300',
                },
                {
                  stance: 'mind_games' as PressStance,
                  title: 'Guerra Psicológica',
                  bonus: '+30% Hype · 75% chance de intimidar',
                  desc: 'Míralo fijamente sin parpadear en el face-off. Si tienes éxito, el rival sufrirá un debuff de compostura en el inicio.',
                  color: 'hover:border-amber-500/50 hover:bg-amber-600/10 text-amber-300',
                },
              ].map((opt) => (
                <button
                  key={opt.stance}
                  onClick={() => {
                    performPromo('press_conference', opt.stance)
                    setShowPressModal(false)
                  }}
                  className={`rounded-xl border border-white/10 bg-white/5 p-4 text-left transition ${opt.color}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{opt.title}</span>
                    <span className="text-[10px] font-bold">{opt.bonus}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{opt.desc}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowPressModal(false)}
              className="mt-4 w-full text-center text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Noche de Pelea en Vivo */}
      {showFightNight && (
        <FightSimulationView bout={bout} onClose={() => setShowFightNight(false)} />
      )}
    </div>
  )
}
