import { useState } from 'react'
import { CalendarDays, Salad, Swords } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import ScheduleTab from './ScheduleTab'
import GymTeamView from './GymTeamView'
import GymDietView from './GymDietView'

type Tab = 'schedule' | 'team' | 'diet'

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'schedule', label: 'Calendario Semanal', icon: CalendarDays },
  { id: 'team', label: 'Gimnasio y Compañeros', icon: Swords },
  { id: 'diet', label: 'Dieta y Peso', icon: Salad },
]

export default function GymView() {
  const [tab, setTab] = useState<Tab>('schedule')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Gimnasio y Entrenamiento</h2>
        <p className="text-sm text-slate-400">Planifica tu semana, tu equipo y tu dieta.</p>
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`gym-tab-${id}`}
            onClick={() => setTab(id)}
            className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              tab === id
                ? 'bg-gradient-to-r from-red-600/30 to-orange-500/10 text-white ring-1 ring-red-500/40'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon className={`h-5 w-5 ${tab === id ? 'text-red-400' : ''}`} />
            {label}
          </button>
        ))}
      </nav>

      {tab === 'schedule' && <ScheduleTab />}
      {tab === 'team' && <GymTeamView />}
      {tab === 'diet' && <GymDietView />}
    </div>
  )
}
