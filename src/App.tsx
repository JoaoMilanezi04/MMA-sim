import { GameProvider, useGame } from './context/GameContext'
import HomeDashboard from './components/HomeDashboard'
import CharacterCreator from './components/character-creation/CharacterCreator'

function Root() {
  const { state } = useGame()
  return state.player ? <HomeDashboard /> : <CharacterCreator />
}

export default function App() {
  return (
    <GameProvider>
      <Root />
    </GameProvider>
  )
}
