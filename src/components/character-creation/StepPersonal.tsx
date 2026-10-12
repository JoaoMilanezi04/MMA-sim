import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import type { StepProps } from './types'
import FighterAvatar from '../common/FighterAvatar'
import {
  DEFAULT_APPEARANCE,
  EXPRESSIONS,
  FACIAL_HAIRS,
  HAIR_COLORS,
  HAIR_STYLES,
  SKIN_TONES,
} from '../../types/appearance'

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-red-500/60 focus:bg-white/10'

export default function StepPersonal({ draft, update }: StepProps) {
  const appearance = draft.appearance ?? DEFAULT_APPEARANCE

  const cycleSkin = (dir: 1 | -1) => {
    const current = appearance.skin ?? 1
    const next = (current + dir + SKIN_TONES.length) % SKIN_TONES.length
    update({ appearance: { ...appearance, skin: next } })
  }

  const cycleHairStyle = (dir: 1 | -1) => {
    const current = appearance.hairStyle ?? 1
    const next = (current + dir + HAIR_STYLES.length) % HAIR_STYLES.length
    update({ appearance: { ...appearance, hairStyle: next } })
  }

  const cycleHairColor = (dir: 1 | -1) => {
    const current = appearance.hairColor ?? 0
    const next = (current + dir + HAIR_COLORS.length) % HAIR_COLORS.length
    update({ appearance: { ...appearance, hairColor: next } })
  }

  const cycleFacialHair = (dir: 1 | -1) => {
    const current = appearance.facialHair ?? 0
    const next = (current + dir + FACIAL_HAIRS.length) % FACIAL_HAIRS.length
    update({ appearance: { ...appearance, facialHair: next } })
  }

  const cycleExpression = (dir: 1 | -1) => {
    const current = appearance.expression ?? 0
    const next = (current + dir + EXPRESSIONS.length) % EXPRESSIONS.length
    update({ appearance: { ...appearance, expression: next } })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Datos Personales */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-300">
          Nombre *
          <input
            id="first-name"
            className={inputClass}
            value={draft.firstName}
            maxLength={20}
            placeholder="João"
            onChange={(e) => update({ firstName: e.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-300">
          Apellido *
          <input
            id="last-name"
            className={inputClass}
            value={draft.lastName}
            maxLength={20}
            placeholder="Milanezi"
            onChange={(e) => update({ lastName: e.target.value })}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-300">
        Apodo de Guerrero (opcional)
        <input
          id="nickname"
          className={inputClass}
          value={draft.nickname}
          maxLength={24}
          placeholder="The Ripper"
          onChange={(e) => update({ nickname: e.target.value })}
        />
      </label>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-300">Edad inicial de debut</p>
        <div className="flex gap-2">
          {[17, 18, 19, 20].map((age) => (
            <button
              key={age}
              id={`age-${age}`}
              onClick={() => update({ age })}
              className={`w-16 cursor-pointer rounded-xl border py-2.5 text-lg font-bold transition ${
                draft.age === age
                  ? 'border-red-500/60 bg-red-600/20 text-white shadow-md shadow-red-950/40'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {age}
            </button>
          ))}
        </div>
      </div>

      {/* Creador de Personaje / Rostro de Combate */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-black uppercase tracking-wider text-white">
            Personalización de Rostro y Estilo de Peleador
          </h3>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* Previsualización del Avatar */}
          <div className="relative mx-auto flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-2 border-white/20 bg-slate-950 p-1 shadow-2xl ring-4 ring-black/60 sm:mx-0">
            <FighterAvatar appearance={appearance} className="h-full w-full rounded-[22px]" />
          </div>

          {/* Selectores con flechas < > */}
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Tono de Piel */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tono de Piel
              </span>
              <div className="mt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => cycleSkin(-1)}
                  className="rounded-lg bg-white/10 p-1.5 text-slate-300 hover:bg-white/20 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-white/30"
                    style={{ backgroundColor: SKIN_TONES[appearance.skin ?? 1].preview }}
                  />
                  <span className="text-xs font-black text-white truncate max-w-[120px]">
                    {SKIN_TONES[appearance.skin ?? 1].label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => cycleSkin(1)}
                  className="rounded-lg bg-white/10 p-1.5 text-slate-300 hover:bg-white/20 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Peinado */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Estilo de Peinado
              </span>
              <div className="mt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => cycleHairStyle(-1)}
                  className="rounded-lg bg-white/10 p-1.5 text-slate-300 hover:bg-white/20 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-black text-white truncate px-1 max-w-[125px]">
                  {HAIR_STYLES[appearance.hairStyle ?? 1].label}
                </span>
                <button
                  type="button"
                  onClick={() => cycleHairStyle(1)}
                  className="rounded-lg bg-white/10 p-1.5 text-slate-300 hover:bg-white/20 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Color de Cabello */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Color de Cabello
              </span>
              <div className="mt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => cycleHairColor(-1)}
                  className="rounded-lg bg-white/10 p-1.5 text-slate-300 hover:bg-white/20 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-white/30"
                    style={{ backgroundColor: HAIR_COLORS[appearance.hairColor ?? 0].preview }}
                  />
                  <span className="text-xs font-black text-white truncate max-w-[120px]">
                    {HAIR_COLORS[appearance.hairColor ?? 0].label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => cycleHairColor(1)}
                  className="rounded-lg bg-white/10 p-1.5 text-slate-300 hover:bg-white/20 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Vello Facial */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Vello Facial
              </span>
              <div className="mt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => cycleFacialHair(-1)}
                  className="rounded-lg bg-white/10 p-1.5 text-slate-300 hover:bg-white/20 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-black text-white truncate px-1 max-w-[125px]">
                  {FACIAL_HAIRS[appearance.facialHair ?? 0].label}
                </span>
                <button
                  type="button"
                  onClick={() => cycleFacialHair(1)}
                  className="rounded-lg bg-white/10 p-1.5 text-slate-300 hover:bg-white/20 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Expresión / Actitud en Jaula */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Expresión / Actitud en Jaula
              </span>
              <div className="mt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => cycleExpression(-1)}
                  className="rounded-lg bg-white/10 p-1.5 text-slate-300 hover:bg-white/20 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-black text-amber-300 uppercase tracking-wide truncate px-2">
                  {EXPRESSIONS[appearance.expression ?? 0].label}
                </span>
                <button
                  type="button"
                  onClick={() => cycleExpression(1)}
                  className="rounded-lg bg-white/10 p-1.5 text-slate-300 hover:bg-white/20 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
