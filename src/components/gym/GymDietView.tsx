import DietSelector from '../common/DietSelector'

export default function GymDietView() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-extrabold text-white">Gestión de Peso y Nutrición Deportiva</h3>
        <p className="text-xs text-slate-400">
          Supervisa tu peso en tiempo real y define el déficit o superávit calórico semanal para dar el límite de la división sin comprometer tu rendimiento en la jaula.
        </p>
      </div>

      <DietSelector />
    </div>
  )
}
