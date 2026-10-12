import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Flame } from 'lucide-react'
import { TEST_FIGHTER, useGame } from '../../context/GameContext'
import type { CharacterDraft } from '../../types/game'
import { EMPTY_DRAFT, buildFighter } from './data'
import LiveFighterCard from './LiveFighterCard'
import StepPersonal from './StepPersonal'
import StepCountry from './StepCountry'
import StepWeight from './StepWeight'
import StepPhysique from './StepPhysique'
import StepArchetype from './StepArchetype'

const STEPS = [
  { title: 'Datos personales', subtitle: 'Quién eres' },
  { title: 'País de origen', subtitle: 'Bonificaciones regionales' },
  { title: 'Categoría de peso', subtitle: 'Tu división' },
  { title: 'Físico', subtitle: 'Altura y alcance' },
  { title: 'Arquetipo de combate', subtitle: 'Tu estilo de pelea' },
]

function isValid(step: number, d: CharacterDraft): boolean {
  switch (step) {
    case 0:
      return d.firstName.trim().length > 0 && d.lastName.trim().length > 0
    case 1:
      return d.countryId !== null
    case 2:
      return d.division !== null
    case 3:
      return true
    case 4:
      return d.archetype !== null
    default:
      return false
  }
}

export default function CharacterCreator() {
  const { createCharacter } = useGame()
  const [draft, setDraft] = useState<CharacterDraft>(EMPTY_DRAFT)
  const [step, setStep] = useState(0)

  const update = (patch: Partial<CharacterDraft>) => setDraft((d) => ({ ...d, ...patch }))
  const last = step === STEPS.length - 1
  const valid = isValid(step, draft)

  const stepProps = { draft, update }

  return (
    <div className="grid min-h-screen w-full bg-[#0b0f17] text-slate-100 lg:h-screen lg:grid-cols-[60fr_40fr]">
      <section className="flex min-h-0 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5 xl:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="font-black tracking-wide text-white">MMA CAREER MANAGER</p>
              <p className="text-xs text-slate-500">Creación de personaje</p>
            </div>
          </div>
          <button
            id="use-test-fighter"
            onClick={() => createCharacter(TEST_FIGHTER)}
            className="cursor-pointer rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-white/30 hover:text-white"
          >
            Usar peleador de prueba
          </button>
        </header>

        <div className="flex gap-2 px-6 pt-6 xl:px-10">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  i <= step ? 'bg-gradient-to-r from-red-600 to-orange-500' : 'bg-white/10'
                }`}
              />
            </div>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 xl:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-400">
            Paso {step + 1} de {STEPS.length}
          </p>
          <h1 className="text-3xl font-extrabold text-white">{STEPS[step].title}</h1>
          <p className="mb-6 text-slate-400">{STEPS[step].subtitle}</p>

          {step === 0 && <StepPersonal {...stepProps} />}
          {step === 1 && <StepCountry {...stepProps} />}
          {step === 2 && <StepWeight {...stepProps} />}
          {step === 3 && <StepPhysique {...stepProps} />}
          {step === 4 && <StepArchetype {...stepProps} />}
        </div>

        <footer className="flex items-center justify-between border-t border-white/10 px-6 py-5 xl:px-10">
          <button
            id="step-back"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-5 py-3 font-semibold text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowLeft className="h-5 w-5" /> Atrás
          </button>

          {last ? (
            <button
              id="start-career"
              disabled={!valid}
              onClick={() => createCharacter(buildFighter(draft))}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-6 py-3 font-black tracking-wide text-white shadow-lg shadow-red-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check className="h-5 w-5" /> Comenzar Carrera Amateur
            </button>
          ) : (
            <button
              id="step-next"
              disabled={!valid}
              onClick={() => setStep((s) => s + 1)}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-6 py-3 font-black tracking-wide text-white shadow-lg shadow-red-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente <ArrowRight className="h-5 w-5" />
            </button>
          )}
        </footer>
      </section>

      <aside className="min-h-0 border-t border-white/10 bg-[#080b12] lg:border-l lg:border-t-0">
        <LiveFighterCard draft={draft} />
      </aside>
    </div>
  )
}
