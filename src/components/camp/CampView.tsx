import { Swords } from 'lucide-react'
import { useGame } from '../../context/GameContext'
import AvailableBouts from './AvailableBouts'
import ActiveCamp from './ActiveCamp'

export default function CampView() {
  const { state } = useGame()
  const activeBout = state.activeBout

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado General */}
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/20 text-red-400">
            <Swords className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-black text-white">Campamento y Peleas</h2>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Gestiona tus negociaciones de combate, estrategia de campamento y sube al octágono por la victoria.
        </p>
      </div>

      {/* Renderizado condicional según estado */}
      {activeBout ? <ActiveCamp /> : <AvailableBouts />}
    </div>
  )
}
