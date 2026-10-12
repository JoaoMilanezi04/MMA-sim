import { Construction, RotateCcw, Settings } from 'lucide-react'
import { useGame } from '../context/GameContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import HeroAthleteStrip from './dashboard/HeroAthleteStrip'
import NextBoutOperations from './dashboard/NextBoutOperations'
import SkillsOverview from './dashboard/SkillsOverview'
import WorldNewsFeed from './dashboard/WorldNewsFeed'
import GymView from './gym/GymView'
import RankingsView from './rankings/RankingsView'
import CampView from './camp/CampView'
import LifestyleView from './lifestyle/LifestyleView'
import WeeklyReportModal from './common/WeeklyReportModal'

const TITLES: Record<string, string> = {
  gym: 'Gimnasio y Entrenamiento',
  fights: 'Campamento y Peleas',
  rankings: 'Rankings y Carrera',
  life: 'Vida y Negocios',
  settings: 'Ajustes',
}

export default function HomeDashboard() {
  const { state, activeSection, resetGame, dismissWeeklyReport } = useGame()

  return (
    <div className="flex min-h-screen w-full bg-[#05070a] bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(20,28,45,0.5),rgba(5,7,10,1))] font-chakra text-slate-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 xl:p-8">
          {activeSection === 'gym' ? (
            <GymView />
          ) : activeSection === 'rankings' ? (
            <RankingsView />
          ) : activeSection === 'fights' ? (
            <CampView />
          ) : activeSection === 'life' ? (
            <LifestyleView />
          ) : activeSection === 'home' ? (
            <div className="flex flex-col gap-6 xl:gap-8">
              {/* 1. BANNER SUPERIOR PANORÁMICO (HERO ATHLETE STRIP - ANCHO COMPLETO) */}
              <HeroAthleteStrip />

              {/* 2. CUERPO PRINCIPAL (2 SECCIONES ASIMÉTRICAS: 70% CENTRO DE MANDO / 30% MUNDO VIVO) */}
              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 xl:gap-8">
                {/* BLOQUE CENTRAL (70% DEL ANCHO) */}
                <div className="flex flex-col gap-6 lg:col-span-8 xl:gap-8">
                  {/* Panel Superior: Operaciones del Próximo Combate (Matchmaking / Face-Off) */}
                  <NextBoutOperations />

                  {/* Panel Inferior: Vista Sintética de Habilidades (4 Módulos) */}
                  <SkillsOverview />
                </div>

                {/* BLOQUE LATERAL DERECHO (30% DEL ANCHO): EL MUNDO VIVO */}
                <div className="lg:col-span-4">
                  <WorldNewsFeed />
                </div>
              </div>
            </div>
          ) : activeSection === 'settings' ? (
            <div className="max-w-xl rounded-3xl border border-white/10 bg-[#0f172a]/80 p-8 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-slate-200">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">Ajustes de Partida</h2>
                  <p className="text-xs text-slate-400">Gestión de datos locales y preferencias</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs text-slate-300">
                <p>
                  ✅ <strong>Guardado Automático Activo:</strong> Tu peleador, atributos, agenda, contratos y mundo se guardan continuamente en tu almacenamiento local.
                </p>
              </div>

              <div className="mt-6 border-t border-white/10 pt-6">
                <h3 className="text-sm font-bold text-red-300">Nueva Partida / Reiniciar Carrera</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Borra tu peleador actual y progreso guardado en este navegador para volver a la pantalla de creación de personaje.
                </p>
                <button
                  id="reset-career-button"
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que deseas reiniciar tu carrera y crear un nuevo peleador?')) {
                      resetGame()
                    }
                  }}
                  className="mt-4 flex cursor-pointer items-center gap-2 rounded-xl border border-red-500/40 bg-red-600/20 px-4 py-2.5 text-xs font-bold text-red-300 transition hover:bg-red-600/30 hover:text-white active:scale-95"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reiniciar Carrera
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/10 text-slate-500">
              <Construction className="h-10 w-10 text-orange-400/70" />
              <p className="text-lg font-semibold text-slate-300">{TITLES[activeSection]}</p>
              <p className="text-sm">Próximamente</p>
            </div>
          )}
        </main>
      </div>

      {state.lastWeeklyReport && (
        <WeeklyReportModal
          report={state.lastWeeklyReport}
          onClose={dismissWeeklyReport}
        />
      )}
    </div>
  )
}
