import {
  ChevronRight,
  Dumbbell,
  Newspaper,
  Radio,
  Swords,
  Trophy,
} from 'lucide-react'
import { useGame } from '../../context/GameContext'

export default function WorldNewsFeed() {
  const { state, setSection } = useGame()
  const news = state.world.news

  return (
    <div className="flex flex-col gap-6">
      {/* ========================================================= */}
      {/* 1. TICKER MUNDIAL DEPORTIVO (ESTILO ESPN / UFC TV)         */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#111728]/95 via-[#0b101d]/95 to-[#050811] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <div className="relative mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-red-500 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              MMA TICKER · NOTICIAS GLOBALES
            </h3>
          </div>
          <button
            onClick={() => setSection('rankings')}
            className="flex items-center gap-1 text-[11px] font-bold text-red-400 transition hover:text-red-300"
          >
            <span>Ver Rankings</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {news.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-slate-500">
            <Newspaper className="mb-2 h-8 w-8 text-slate-600" />
            <p className="font-semibold">Sin noticias registradas aún en esta temporada.</p>
            <p className="mt-1 text-[11px] text-slate-600">Avanza semanas para simular combates y movimientos del ranking.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {news.slice(0, 5).map((item) => {
              const badgeTag =
                item.eventType === 'UFC_PPV'
                  ? 'UFC PPV'
                  : item.eventType === 'REGIONAL'
                    ? 'REGIONAL'
                    : item.eventType === 'UFC_FIGHT_NIGHT'
                      ? 'FIGHT NIGHT'
                      : 'NOTICIA'

              const badgeColor =
                item.eventType === 'UFC_PPV'
                  ? 'bg-amber-500/20 text-amber-300 ring-amber-500/40'
                  : item.eventType === 'REGIONAL'
                    ? 'bg-sky-500/20 text-sky-300 ring-sky-500/40'
                    : 'bg-red-600/20 text-red-400 ring-red-500/30'

              return (
                <div
                  key={item.id}
                  onClick={() => setSection('rankings')}
                  className="group relative flex cursor-pointer flex-col gap-1 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 transition-all duration-200 hover:border-red-500/40 hover:bg-white/[0.05]"
                >
                  <div className="flex items-center justify-between gap-2 text-[10px]">
                    <span className={`rounded px-1.5 py-0.5 font-black ring-1 ${badgeColor}`}>
                      [{badgeTag}]
                    </span>
                    <span className="font-semibold text-slate-500 font-mono">
                      Sem {item.week} · {item.year}
                    </span>
                  </div>

                  <p className="text-xs font-bold leading-snug text-white group-hover:text-red-300 transition-colors">
                    {item.headline}
                  </p>

                  {item.impact && (
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {item.impact}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* 2. BARRA DE ACCESOS RÁPIDOS INTEGRADOS                    */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#111728]/95 via-[#0b101d]/95 to-[#050811] p-5 shadow-2xl backdrop-blur-xl">
        <h4 className="mb-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
          CENTRO DE ACCESO RÁPIDO
        </h4>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => setSection('gym')}
            className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 text-center transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-white active:scale-95"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="text-xs font-black text-slate-300 group-hover:text-white">Gimnasio</span>
          </button>

          <button
            onClick={() => setSection('fights')}
            className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 text-center transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-white active:scale-95"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400 group-hover:bg-red-500/20">
              <Swords className="h-5 w-5" />
            </div>
            <span className="text-xs font-black text-slate-300 group-hover:text-white">Peleas</span>
          </button>

          <button
            onClick={() => setSection('rankings')}
            className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 text-center transition hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-white active:scale-95"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
              <Trophy className="h-5 w-5" />
            </div>
            <span className="text-xs font-black text-slate-300 group-hover:text-white">Rankings</span>
          </button>
        </div>
      </section>
    </div>
  )
}
