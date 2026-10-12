import { useState } from 'react'
import {
  Award,
  Crown,
  Flame,
  Globe,
  Newspaper,
  Trophy,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useGame, usePlayer } from '../../context/GameContext'
import type { Division } from '../../types/game'
import { DIVISION_ABBR } from '../../types/game'
import type { FighterRank, Organization } from '../../types/career'
import { ALL_DIVISIONS, MAX_RANK, RIZIN_DIVISIONS } from '../../types/career'
import ChampionCard from './ChampionCard'
import RankingsTable from './RankingsTable'
import ScoutingModal from './ScoutingModal'
import NewsFeed from './NewsFeed'
import AmateurCircuit from './AmateurCircuit'
import P4PView from './P4PView'

type Tab = 'UFC' | 'LFA' | 'CAGE_WARRIORS' | 'RIZIN' | 'AMATEUR' | 'P4P' | 'NEWS'

const TABS: { id: Tab; label: string; icon: LucideIcon; badge?: string }[] = [
  { id: 'UFC', label: 'UFC (Top 15)', icon: Trophy },
  { id: 'LFA', label: 'LFA Regional (Top 5)', icon: Award },
  { id: 'CAGE_WARRIORS', label: 'Cage Warriors (Top 5)', icon: Globe },
  { id: 'RIZIN', label: 'RIZIN (Top 6)', icon: Globe },
  { id: 'AMATEUR', label: 'Circuito Amateur', icon: Flame, badge: 'Tu Ruta' },
  { id: 'P4P', label: 'P4P Top 10 Mundial', icon: Award },
  { id: 'NEWS', label: 'Noticias y Eventos', icon: Newspaper },
]

export default function RankingsView() {
  const { state } = useGame()
  const player = usePlayer()

  const defaultTab: Tab =
    player.organization === 'LFA'
      ? 'LFA'
      : player.organization === 'CAGE_WARRIORS'
      ? 'CAGE_WARRIORS'
      : player.organization === 'RIZIN'
      ? 'RIZIN'
      : player.status === 'Amateur'
      ? 'AMATEUR'
      : 'UFC'

  const [tab, setTab] = useState<Tab>(defaultTab)
  const [selectedDivision, setSelectedDivision] = useState<Division>(player.division)
  const [scoutedFighter, setScoutedFighter] = useState<FighterRank | null>(null)

  const isOrgTab = ['UFC', 'LFA', 'CAGE_WARRIORS', 'RIZIN'].includes(tab)
  const org = (isOrgTab ? tab : 'UFC') as Organization
  const maxRank = MAX_RANK[org] ?? 15
  const availableDivisions = tab === 'RIZIN' ? RIZIN_DIVISIONS : ALL_DIVISIONS

  // Ensure current division is valid for tab
  const activeDiv = availableDivisions.includes(selectedDivision)
    ? selectedDivision
    : availableDivisions[0]

  const fightersInDiv = state.world.fighters.filter(
    (f) => f.organization === org && f.division === activeDiv && !f.retired,
  )

  const champion = fightersInDiv.find((f) => f.rank === 0)
  const rankedFighters = fightersInDiv
    .filter((f) => f.rank >= 1 && f.rank <= maxRank)
    .sort((a, b) => a.rank - b.rank)

  const playerRanked = state.world.fighters.find(
    (f) => f.isPlayer && f.organization === org && f.division === activeDiv,
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-extrabold text-white">Rankings Oficiales y Escalafón</h2>
        <p className="text-sm text-slate-400">
          Sigue el panorama competitivo oficial de cada organización mundial y regional.
        </p>
      </div>

      {/* Pestañas de primer nivel */}
      <nav className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {TABS.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            id={`rankings-tab-${id.toLowerCase()}`}
            onClick={() => setTab(id)}
            className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              tab === id
                ? 'bg-gradient-to-r from-red-600/30 to-orange-500/10 text-white ring-1 ring-red-500/40'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon className={`h-4 w-4 ${tab === id ? 'text-red-400' : ''}`} />
            <span>{label}</span>
            {badge && (
              <span className="rounded bg-amber-400/20 px-1.5 py-0.2 text-[10px] font-black text-amber-300">
                {badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Contenido según pestaña */}
      {tab === 'NEWS' && <NewsFeed news={state.world.news} />}

      {tab === 'AMATEUR' && <AmateurCircuit />}

      {tab === 'P4P' && (
        <P4PView fighters={state.world.fighters} onSelect={setScoutedFighter} />
      )}

      {isOrgTab && (
        <div className="flex flex-col gap-6">
          {/* Selector de divisiones de peso */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {availableDivisions.map((div) => {
                const active = div === activeDiv
                const isPlayerDiv = div === player.division
                return (
                  <button
                    key={div}
                    onClick={() => setSelectedDivision(div)}
                    className={`cursor-pointer rounded-xl px-3 py-2 text-xs font-bold transition ${
                      active
                        ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md shadow-red-950'
                        : 'border border-white/5 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span>{div}</span>
                    <span className="ml-1 opacity-70">({DIVISION_ABBR[div]})</span>
                    {isPlayerDiv && (
                      <span className="ml-1.5 rounded-full bg-black/40 px-1 py-0.2 text-[9px] text-amber-300">
                        Tu cat.
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {playerRanked && (
              <span className="flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-600/20 px-3 py-1 text-xs font-bold text-red-300">
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                {playerRanked.rank === 0
                  ? `¡Eres el CAMPEÓN de ${activeDiv}!`
                  : `Estás clasificado #${playerRanked.rank} en ${activeDiv}`}
              </span>
            )}
          </div>

          {/* Tarjeta del Campeón */}
          <ChampionCard
            champion={champion}
            division={activeDiv}
            organization={org}
            onSelect={setScoutedFighter}
          />

          {/* Tabla de los Top Contendientes */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">
                Contendientes al Título ({org} Top {maxRank})
              </h3>
              <p className="text-xs text-slate-400">
                Haz clic en cualquier peleador para abrir su ficha técnica de scouting.
              </p>
            </div>
            <RankingsTable
              fighters={rankedFighters}
              onSelect={setScoutedFighter}
            />
          </section>
        </div>
      )}

      {/* Modal de scouting */}
      <ScoutingModal
        fighter={scoutedFighter}
        onClose={() => setScoutedFighter(null)}
      />
    </div>
  )
}
