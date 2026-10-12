import { useState } from 'react'
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Flame,
  Globe,
  Lock,
  ShieldAlert,
  Sparkles,
  Trophy,
  Users,
  X,
  Zap,
} from 'lucide-react'
import type { Fighter, FighterContract } from '../../types/game'
import { useGame } from '../../context/GameContext'

interface Props {
  player: Fighter
  onClose: () => void
}

interface ContractOffer {
  id: string
  organization: 'LFA' | 'CAGE_WARRIORS' | 'RIZIN' | 'DWCS'
  organizationName: string
  tagline: string
  description: string
  totalFights: number
  showPurse: number
  winPurse: number
  opponentOvrRange: string
  riskLevel: 'Controlado' | 'Moderado' | 'Alto' | 'Extremo'
  suggestedOvr?: string
  pros: string[]
  cons: string[]
  isDwcs?: boolean
  isLfa?: boolean
  isCageWarriors?: boolean
  isRizin?: boolean
  isElite?: boolean
  isLocked?: boolean
  lockReason?: string
  accentColor: string
}

export default function ContractsModal({ player, onClose }: Props) {
  const { signContract } = useGame()
  const [signedOffer, setSignedOffer] = useState<ContractOffer | null>(null)

  const isUndefeated = player.record.losses === 0
  const isDwcsLocked = (player.ufcLockoutWeeks ?? 0) > 0

  const offers: ContractOffer[] = [
    {
      id: 'lfa',
      organization: 'LFA',
      organizationName: 'LFA (Legacy Fighting Alliance)',
      tagline: 'El trampolín de desarrollo seguro a la UFC',
      description:
        'La liga de formación #1 de América. Peleas transmitidas en UFC Fight Pass bajo la lupa constante de ojeadores oficiales.',
      totalFights: 3,
      showPurse: 1500,
      winPurse: 1500,
      opponentOvrRange: 'OVR 42 - 55',
      riskLevel: 'Controlado',
      suggestedOvr: 'OVR 40+',
      isLfa: true,
      pros: [
        'Desarrollo equilibrado: Rivales accesibles (OVR 42-55) para sumar victorias y stats sin riesgo de daño prematuro.',
        'Incentivo Campeón LFA: Completar las 3 peleas como campeón regional otorga llamada DIRECTA de UFC con contrato élite ($20,000 / $20,000) y debut en Cartelera Principal.',
      ],
      cons: [
        'Bolsa inicial modesta ($1,500 show / $1,500 win).',
        'Ruta progresiva de 3 combates antes de ingresar a UFC.',
      ],
      accentColor: 'border-blue-500/40 bg-gradient-to-br from-blue-950/40 via-[#0b101f] to-[#070a12]',
    },
    {
      id: 'cage-warriors',
      organization: 'CAGE_WARRIORS',
      organizationName: 'Cage Warriors Fighting Championship',
      tagline: 'Fama Europea y Seguridad Contractual',
      description:
        'La mayor promotora de Europa y cuna de leyendas históricas. Combates con atmósfera ensordecedora en arenas británicas e internacionales.',
      totalFights: 4,
      showPurse: 2000,
      winPurse: 2000,
      opponentOvrRange: 'OVR 50 - 62',
      riskLevel: 'Moderado',
      suggestedOvr: 'OVR 48+',
      isCageWarriors: true,
      pros: [
        'Fama Europea (+200% Fans): Ganancia del triple de seguidores por victoria gracias a las enormes audiencias europeas.',
        'Bono de Finalización: +$1,000 extra garantizados por cada victoria por KO o Sumisión.',
        'Estabilidad laboral: 4 peleas aseguradas en el calendario oficial.',
      ],
      cons: [
        'Compromiso a 4 peleas antes de poder negociar libremente con UFC.',
        'Nivel europeo exigente con peleadores agresivos y completos.',
      ],
      accentColor: 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-[#0b101f] to-[#070a12]',
    },
  ]

  if (isUndefeated) {
    offers.unshift({
      id: 'rizin',
      organization: 'RIZIN',
      organizationName: 'RIZIN Fighting Federation',
      tagline: 'El Dinero y el Mercado Asiático',
      description:
        'El mayor espectáculo de artes marciales en Japón en el Saitama Super Arena ante más de 30,000 espectadores fanáticos.',
      totalFights: 3,
      showPurse: 6000,
      winPurse: 6000,
      opponentOvrRange: 'OVR 52 - 65',
      riskLevel: 'Alto',
      suggestedOvr: 'OVR 50+',
      isRizin: true,
      isElite: true,
      pros: [
        'Mayor bolsa inmediata ($6,000 show / $6,000 win): Financia desde el día uno entrenadores de élite y nutrición de vanguardia.',
        'Reglas Abiertas PRIDE/RIZIN: Bonificación letal en patadas, rodillas y combinaciones de pie libre.',
      ],
      cons: [
        'Competencia en el mercado asiático, fuera de la órbita directa inmediata de UFC.',
      ],
      accentColor: 'border-purple-500/50 bg-gradient-to-br from-purple-950/40 via-[#0b101f] to-[#070a12]',
    })

    offers.unshift({
      id: 'dwcs',
      organization: 'DWCS',
      organizationName: "Dana White's Contender Series (DWCS)",
      tagline: 'El boleto dorado directo a la UFC',
      description:
        'Una sola noche en el UFC APEX de Las Vegas bajo la mirada directa de Dana White. Sal y acaba a tu rival de forma violenta.',
      totalFights: 1,
      showPurse: 5000,
      winPurse: 5000,
      opponentOvrRange: 'OVR 64 - 72',
      riskLevel: 'Extremo',
      suggestedOvr: 'OVR 60+',
      isDwcs: true,
      isElite: true,
      isLocked: isDwcsLocked,
      lockReason: isDwcsLocked
        ? `Veto de Dana White activo: Faltan ${player.ufcLockoutWeeks} semanas tras tu derrota anterior.`
        : undefined,
      pros: [
        'Acceso Inmediato a UFC: Firma de contrato oficial de UFC garantizada si ganas por KO o Sumisión.',
        'Bolsa premium de $5,000 / $5,000 por una sola noche en el UFC Apex.',
      ],
      cons: [
        'Rivales de Élite (OVR 64-72): Peligro crítico de KO o daño severo si tu nivel es menor a 60.',
        'Regla Dana White: Si ganas por decisión aburrida/conservadora, hay 50% de probabilidad de que NO te otorguen el contrato.',
        'Penalización por Derrota: Perder cancela el interés de UFC durante 1 año completo (52 semanas) y destruye tu hype.',
      ],
      accentColor: 'border-red-500/70 bg-gradient-to-br from-red-950/50 via-[#0b101f] to-[#070a12] ring-1 ring-red-500/40',
    })
  }

  const handleSign = (offer: ContractOffer) => {
    if (offer.isLocked) return

    const contract: FighterContract = {
      id: `contract-${offer.id}-${Date.now()}`,
      organization: offer.organization,
      organizationName: offer.organizationName,
      totalFights: offer.totalFights,
      fightsRemaining: offer.totalFights,
      showPurse: offer.showPurse,
      winPurse: offer.winPurse,
      isDwcs: offer.isDwcs,
      isLfa: offer.isLfa,
      isCageWarriors: offer.isCageWarriors,
      isRizin: offer.isRizin,
      description: offer.description,
      tierTitle: offer.tagline,
    }
    signContract(contract)
    setSignedOffer(offer)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-y-auto rounded-3xl border border-white/10 bg-[#070a12] p-5 shadow-2xl xl:p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-20 cursor-pointer rounded-xl bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {signedOffer ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 duration-300">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-lime-500 text-slate-950 shadow-xl shadow-emerald-500/30 mb-6">
              <CheckCircle2 className="h-12 w-12" strokeWidth={2.5} />
            </div>
            <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-4 py-1 text-xs font-black tracking-widest text-emerald-300 mb-3 uppercase">
              ¡CONTRATO PROFESIONAL FIRMADO!
            </span>
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              Bienvenido a {signedOffer.organizationName}
            </h2>
            <p className="mt-2 text-sm text-slate-300 max-w-lg">
              Tu estatus oficial ha cambiado a <strong>PRO</strong>. A partir de ahora peleas
              por bolsas oficiales, patrocinios reales y cada resultado define tu futuro en las grandes ligas.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-300">
              <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2">
                Duración: {signedOffer.totalFights} {signedOffer.totalFights === 1 ? 'pelea' : 'peleas'}
              </span>
              <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-emerald-400">
                Bolsa: ${signedOffer.showPurse.toLocaleString()} / ${signedOffer.winPurse.toLocaleString()}
              </span>
              <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-amber-300">
                Rivales: {signedOffer.opponentOvrRange}
              </span>
            </div>
            <button
              onClick={onClose}
              className="mt-8 cursor-pointer rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-8 py-3.5 text-base font-black text-white shadow-lg shadow-red-900/40 transition hover:brightness-110 active:scale-95"
            >
              Comenzar Carrera Profesional ➔
            </button>
          </div>
        ) : (
          <>
            {/* Header del Modal */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pr-10">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 text-white shadow-lg shadow-red-900/40 shrink-0">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-2.5 py-0.5 text-[11px] font-black tracking-wider text-amber-300">
                      OFERTAS PROFESIONALES DISPONIBLES
                    </span>
                    {isUndefeated && (
                      <span className="flex items-center gap-1 rounded-full bg-red-600/20 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold text-red-400">
                        <Sparkles className="h-3 w-3" /> Invicto ({player.record.wins}-0)
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                    Elige Tu Destino Profesional
                  </h2>
                  <p className="text-xs text-slate-400">
                    Tu récord amateur te abrió las puertas. Analiza el nivel de los rivales, las bolsas y las cláusulas especiales.
                  </p>
                </div>
              </div>
            </div>

            {/* Grid de Ofertas */}
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {offers.map((offer) => {
                const isDwcs = offer.isDwcs

                return (
                  <div
                    key={offer.id}
                    className={`relative flex flex-col justify-between rounded-3xl border p-5 sm:p-6 shadow-xl transition duration-200 ${
                      offer.isLocked
                        ? 'opacity-60 border-slate-700 bg-slate-900/40'
                        : `${offer.accentColor} hover:border-white/30`
                    }`}
                  >
                    {/* Badges superiores */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {isDwcs && (
                          <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-red-600 to-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md shadow-red-900/50">
                            <Flame className="h-3 w-3" fill="currentColor" /> DWCS Especial
                          </span>
                        )}
                        {offer.isElite && !isDwcs && (
                          <span className="flex items-center gap-1 rounded-full bg-purple-600/40 border border-purple-500/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-purple-300">
                            <Globe className="h-3 w-3" /> Internacional
                          </span>
                        )}
                        {offer.isCageWarriors && (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                            <Users className="h-3 w-3" /> Público Masivo
                          </span>
                        )}
                        {offer.isLfa && (
                          <span className="flex items-center gap-1 rounded-full bg-blue-500/20 border border-blue-500/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-300">
                            <Award className="h-3 w-3" /> Desarrollo Seguro
                          </span>
                        )}
                      </div>

                      {/* Nivel estimado del oponente */}
                      <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-mono font-bold text-slate-300">
                        Rivales: <span className="text-white font-black">{offer.opponentOvrRange}</span>
                      </span>
                    </div>

                    {/* Título y Tagline */}
                    <div>
                      <h3 className="text-xl font-black text-white">{offer.organizationName}</h3>
                      <p className="text-xs font-semibold text-amber-400 mt-0.5 mb-2.5">{offer.tagline}</p>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">
                        {offer.description}
                      </p>

                      {/* ADVERTENCIA ROJA EN DWCS */}
                      {isDwcs && (
                        <div className="mb-4 rounded-2xl border border-red-500/50 bg-red-950/40 p-3.5 shadow-inner">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-black tracking-wider text-white uppercase">
                              <ShieldAlert className="h-3 w-3" /> {offer.suggestedOvr}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-black text-amber-300 uppercase">
                              <AlertTriangle className="h-3 w-3" /> Riesgo Extremo de KO
                            </span>
                          </div>
                          <p className="text-xs font-bold text-red-200 leading-snug">
                            ⚠️ Advertencia: Rivales de élite (OVR 64-72). Si tu OVR es bajo corres alto riesgo de derrota contundente.
                          </p>
                        </div>
                      )}

                      {/* Bloque de Pros y Contras */}
                      <div className="mb-4 space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
                        {/* Pros */}
                        <div>
                          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400 mb-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Ventajas Clave (PROS)
                          </p>
                          <ul className="space-y-1">
                            {offer.pros.map((pro, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-300 leading-tight">
                                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Contras / Riesgos */}
                        <div className="border-t border-white/5 pt-2.5">
                          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-400 mb-1.5">
                            <AlertTriangle className="h-3.5 w-3.5" /> Riesgos y Exigencias (CONTRAS)
                          </p>
                          <ul className="space-y-1">
                            {offer.cons.map((con, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-300 leading-tight">
                                <span className="text-rose-400 font-bold shrink-0">✕</span>
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Datos Financieros y Duración */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400">Duración</p>
                          <p className="text-sm font-black text-white">
                            {offer.totalFights} {offer.totalFights === 1 ? 'Pelea' : 'Peleas'}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400">Bolsa (Show / Win)</p>
                          <p className="text-sm font-black text-emerald-400">
                            ${offer.showPurse.toLocaleString()} / ${offer.winPurse.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botón de Firma */}
                    {offer.isLocked ? (
                      <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-950/20 py-3 text-xs font-bold text-red-300">
                        <Lock className="h-4 w-4 text-red-400" />
                        <span>{offer.lockReason}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSign(offer)}
                        className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black tracking-wide text-white transition active:scale-[0.98] ${
                          isDwcs
                            ? 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 shadow-lg shadow-red-900/40 hover:brightness-110'
                            : offer.isRizin
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 shadow-lg shadow-purple-950/50'
                            : offer.isCageWarriors
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 shadow-lg shadow-emerald-950/50'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:brightness-110 shadow-lg shadow-blue-950/50'
                        }`}
                      >
                        <Zap className="h-4 w-4" />
                        <span>FIRMAR CON {offer.organization}</span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
