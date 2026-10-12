import { useState } from 'react'
import { Calendar, Flame, Globe, Newspaper, Search, Sparkles, Trophy } from 'lucide-react'
import type { FightNewsEvent } from '../../types/career'

interface Props {
  news: FightNewsEvent[]
}

type Filter = 'ALL' | 'UFC_PPV' | 'UFC_FIGHT_NIGHT' | 'REGIONAL'

export default function NewsFeed({ news }: Props) {
  const [filter, setFilter] = useState<Filter>('ALL')
  const [query, setQuery] = useState('')

  const filtered = news.filter((n) => {
    if (filter !== 'ALL' && n.eventType !== filter) return false
    if (query && !n.headline.toLowerCase().includes(query.toLowerCase()) && !n.details.toLowerCase().includes(query.toLowerCase())) {
      return false
    }
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'Todas las noticias' },
            { id: 'UFC_PPV', label: 'UFC PPV' },
            { id: 'UFC_FIGHT_NIGHT', label: 'Fight Nights' },
            { id: 'REGIONAL', label: 'Regional / Amateur' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as Filter)}
              className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition ${
                filter === tab.id
                  ? 'bg-gradient-to-r from-red-600/30 to-orange-500/20 text-white ring-1 ring-red-500/50'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar noticias..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-red-500/50"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 p-12 text-center text-slate-500">
          <Newspaper className="h-10 w-10 mb-2 opacity-50" />
          <p className="font-bold text-slate-300">No hay noticias en este registro</p>
          <p className="text-xs">Avanza semanas con "NEXT WEEK" para ver eventos y carteleras simuladas.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((item) => {
            const isPpv = item.eventType === 'UFC_PPV'
            const isFn = item.eventType === 'UFC_FIGHT_NIGHT'
            const isReg = item.eventType === 'REGIONAL'

            return (
              <article
                key={item.id}
                className={`overflow-hidden rounded-2xl border p-5 transition ${
                  isPpv
                    ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-[#0f172a] to-slate-950'
                    : isFn
                    ? 'border-white/10 bg-[#0f172a]/80'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black tracking-wider ${
                        isPpv
                          ? 'bg-amber-400 text-slate-950'
                          : isFn
                          ? 'bg-red-600/30 text-red-300 border border-red-500/30'
                          : isReg
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {isPpv ? <Trophy className="h-3 w-3" /> : isFn ? <Flame className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                      {isPpv ? 'UFC PPV' : isFn ? 'FIGHT NIGHT' : isReg ? 'REGIONAL' : 'GENERAL'}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Calendar className="h-3 w-3" />
                      Semana {item.week} · {item.year}
                    </span>
                  </div>

                  {item.impact && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-orange-400">
                      <Sparkles className="h-3 w-3" />
                      {item.impact}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-white">{item.headline}</h3>

                {item.details && (
                  <div className="mt-2 text-xs text-slate-300 leading-relaxed whitespace-pre-line font-mono bg-black/20 p-2.5 rounded-xl border border-white/5">
                    {item.details}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
