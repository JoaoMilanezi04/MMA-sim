import { useMemo } from 'react'
import type { FighterAppearance } from '../../types/appearance'
import {
  DEFAULT_APPEARANCE,
  HAIR_COLORS,
  SKIN_TONES,
  generateFighterAppearance,
} from '../../types/appearance'

interface Props {
  appearance?: FighterAppearance
  seed?: string | number
  country?: string
  className?: string
  size?: number | string
}

export default function FighterAvatar({
  appearance: propAppearance,
  seed,
  country,
  className = '',
  size = '100%',
}: Props) {
  const app: FighterAppearance = useMemo(() => {
    if (propAppearance) return propAppearance
    if (seed !== undefined) return generateFighterAppearance(seed, country)
    return DEFAULT_APPEARANCE
  }, [propAppearance, seed, country])

  const skin = SKIN_TONES[app.skin ?? 1] || SKIN_TONES[1]
  const hair = HAIR_COLORS[app.hairColor ?? 0] || HAIR_COLORS[0]
  const hairStyle = app.hairStyle ?? 1
  const facialHair = app.facialHair ?? 0
  const expression = app.expression ?? 0

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#111728] via-[#090d18] to-[#04060c] ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Foco de luz de Octágono */}
          <radialGradient id="ringSpotlight" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#0f172a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#030712" stopOpacity="0.9" />
          </radialGradient>
        </defs>

        {/* 1. Fondo de Arena / Octágono */}
        <rect width="100" height="100" fill="url(#ringSpotlight)" />

        {/* 2. TRAPECIOS Y HOMBROS DE PELEADOR */}
        <path
          d="M 10 100 C 14 80 28 73 38 70 L 62 70 C 72 73 86 80 90 100 Z"
          fill={skin.shadow}
        />
        <path
          d="M 16 100 C 19 82 30 75 39 71 L 61 71 C 70 75 81 82 84 100 Z"
          fill={skin.base}
        />
        {/* Clavículas atléticas */}
        <path
          d="M 38 78 Q 50 83 62 78"
          stroke={skin.shadow}
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />

        {/* 3. CUELLO ROBUSTO DE COMBATE */}
        <rect x="38" y="54" width="24" height="20" rx="3" fill={skin.shadow} />
        <rect x="42" y="54" width="16" height="19" rx="3" fill={skin.base} />
        {/* Sombra bajo el mentón */}
        <path d="M 38 54 C 44 62 56 62 62 54 Z" fill={skin.shadow} />

        {/* 4. OREJAS DE ATLETA (ANCLADAS A LA CABEZA) */}
        {/* Oreja Izquierda */}
        <path d="M 31 39 C 26 39 26 50 31 52 Z" fill={skin.base} />
        <path d="M 30 42 C 28 44 28 48 30 49" stroke={skin.shadow} strokeWidth="1" strokeLinecap="round" fill="none" />
        {/* Oreja Derecha */}
        <path d="M 69 39 C 74 39 74 50 69 52 Z" fill={skin.shadow} />
        <path d="M 70 42 C 72 44 72 48 70 49" stroke={skin.shadow} strokeWidth="1" strokeLinecap="round" fill="none" />

        {/* 5. CABEZA Y MANDÍBULA ANATÓMICA */}
        <path
          d="M 50 20 C 32 20 31 34 31 44 C 31 54 34 58 37 64 C 41 70 45 71 50 71 C 55 71 59 70 63 64 C 66 58 69 54 69 44 C 69 34 68 20 50 20 Z"
          fill={skin.base}
        />
        {/* Cel-shading lateral suave (volumen) */}
        <path
          d="M 50 20 C 66 20 69 34 69 44 C 69 54 66 58 63 64 C 59 70 55 71 50 71 C 54 67 56 58 56 46 C 56 34 54 25 50 20 Z"
          fill={skin.shadow}
          opacity="0.35"
        />
        {/* Hoyuelo / Marcación del mentón */}
        <path d="M 47 66 Q 50 68 53 66" stroke={skin.shadow} strokeWidth="1.4" strokeLinecap="round" fill="none" />

        {/* 6. NARIZ ATLETICA LIMPIA (SIN PUNTOS NEGROS) */}
        <line x1="49" y1="42" x2="49" y2="50" stroke={skin.shadow} strokeWidth="1.2" opacity="0.4" strokeLinecap="round" />
        <path d="M 45.5 52.5 C 47.5 54.5 52.5 54.5 54.5 52.5" stroke={skin.shadow} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <path d="M 46.5 52 Q 47.5 51.5 48.5 52" stroke="#261a14" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M 51.5 52 Q 52.5 51.5 53.5 52" stroke="#261a14" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.7" />

        {/* 7. OJOS DE COMBATE (ENFOCADOS Y DEFINIDOS) */}
        {/* Ojo Izquierdo */}
        <path d="M 36.5 44 C 38.5 41.5 43.5 41.5 45.5 44 C 43.5 46 38.5 46 36.5 44 Z" fill="#f8fafc" />
        <circle cx="41.2" cy="43.8" r="2.2" fill="#18181b" />
        <circle cx="40.6" cy="43.2" r="0.7" fill="#ffffff" />
        <path d="M 36 43.5 C 38.5 41 43.5 41 46 43.5" stroke="#090d16" strokeWidth="1.3" strokeLinecap="round" fill="none" />

        {/* Ojo Derecho */}
        <path d="M 54.5 44 C 56.5 41.5 61.5 41.5 63.5 44 C 61.5 46 56.5 46 54.5 44 Z" fill="#f8fafc" />
        <circle cx="58.8" cy="43.8" r="2.2" fill="#18181b" />
        <circle cx="58.2" cy="43.2" r="0.7" fill="#ffffff" />
        <path d="M 54 43.5 C 56.5 41 61.5 41 64 43.5" stroke="#090d16" strokeWidth="1.3" strokeLinecap="round" fill="none" />

        {/* 8. CEJAS Y EXPRESIÓN DE GUERRERO */}
        {expression === 0 && (
          /* Seria / Concentrado */
          <g>
            <path d="M 35 40 L 46 39.5 L 45.5 37 L 35 38 Z" fill={hair.base} />
            <path d="M 54 39.5 L 65 40 L 65 38 L 54.5 37 Z" fill={hair.base} />
            <line x1="50" y1="38" x2="50" y2="41" stroke={skin.shadow} strokeWidth="1.2" strokeLinecap="round" />
          </g>
        )}

        {expression === 1 && (
          /* Feroz / Modo Guerra */
          <g>
            <path d="M 35 37.5 L 46.5 41 L 46 38.5 L 35 35.5 Z" fill={hair.base} />
            <path d="M 53.5 41 L 65 37.5 L 65 35.5 L 54 38.5 Z" fill={hair.base} />
            {/* Cicatriz en ceja izquierda */}
            <line x1="38.5" y1="34" x2="40.5" y2="42" stroke="#f43f5e" strokeWidth="1.3" strokeLinecap="round" />
          </g>
        )}

        {expression === 2 && (
          /* Confiada / Sonrisa Fría */
          <g>
            <path d="M 35 40 L 46 39.5 L 45.5 37 L 35 38 Z" fill={hair.base} />
            <path d="M 54 38 L 65 35 L 64.5 33 L 53.5 36 Z" fill={hair.base} />
          </g>
        )}

        {/* 9. BOCA SEGÚN EXPRESIÓN */}
        {expression === 0 && (
          <g>
            <line x1="43" y1="60" x2="57" y2="60" stroke="#261a14" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 46 62.5 Q 50 64 54 62.5" stroke={skin.shadow} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>
        )}

        {expression === 1 && (
          <g>
            <path d="M 43 59 Q 50 57.5 57 59 Q 50 62 43 59 Z" fill="#261a14" />
            <path d="M 44.5 59.2 Q 50 58.2 55.5 59.2" stroke="#f8fafc" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 46 63 Q 50 64.5 54 63" stroke={skin.shadow} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>
        )}

        {expression === 2 && (
          <g>
            <path d="M 43 60.5 Q 50 60.5 57 58.5" stroke="#261a14" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M 46 62.5 Q 50 63.5 55 61.5" stroke={skin.shadow} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* 10. VELLO FACIAL / BARBA (ANCLADO A LA MANDÍBULA) */}
        {facialHair === 1 && (
          /* Sombra de 3 días */
          <g opacity="0.32">
            <path
              d="M 31 46 C 32 55 36 66 50 71 C 64 66 68 55 69 46 C 66 48 63 56 59 61 C 55 66 45 66 41 61 C 37 56 34 48 31 46 Z"
              fill={hair.base}
            />
            <path d="M 43 56.5 C 47 55 53 55 57 56.5 C 54 58.5 46 58.5 43 56.5 Z" fill={hair.base} />
          </g>
        )}

        {facialHair === 2 && (
          /* Barba Completa de Guerrero */
          <g>
            <path
              d="M 31 42 C 32 54 36 67 50 72 C 64 67 68 54 69 42 C 67 44 65 52 61 58 C 56 65 44 65 39 58 C 35 52 33 44 31 42 Z"
              fill={hair.base}
            />
            <path d="M 42 56 C 46 54.5 54 54.5 58 56 C 56 58.5 44 58.5 42 56 Z" fill={hair.base} />
            <path d="M 47 66 Q 50 69 53 66" stroke={hair.highlight} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
        )}

        {facialHair === 3 && (
          /* Bigote & Chivo */
          <g>
            <path d="M 42 56 C 46 54.5 54 54.5 58 56 C 56 58.5 44 58.5 42 56 Z" fill={hair.base} />
            <path d="M 46 62 C 46 68 54 68 54 62 C 52 63.5 48 63.5 46 62 Z" fill={hair.base} />
          </g>
        )}

        {/* 11. ESTILOS DE PEINADO (ENVOLVIENDO EL CRÁNEO SIN FLOTAR) */}
        {hairStyle === 0 && (
          /* Rapado Militar (Buzzcut) */
          <path
            d="M 31 34 C 31 19 69 19 69 34 C 64 30 58 28 50 28 C 42 28 36 30 31 34 Z"
            fill={hair.base}
            opacity="0.85"
          />
        )}

        {hairStyle === 1 && (
          /* Fade Deportivo (Undercut) */
          <g>
            <path
              d="M 30 34 C 30 16 41 14 52 14 C 66 14 70 20 69 34 C 65 27 57 26 49 26 C 41 26 35 28 30 34 Z"
              fill={hair.base}
            />
            <path
              d="M 36 21 C 45 17 56 16 64 19 C 57 17 46 17 36 21 Z"
              fill={hair.highlight}
            />
            {/* Patillas alineadas */}
            <rect x="30" y="34" width="2" height="7" fill={hair.base} opacity="0.6" />
            <rect x="68" y="34" width="2" height="7" fill={hair.base} opacity="0.6" />
          </g>
        )}

        {hairStyle === 2 && (
          /* Moño Samurai (Topknot) */
          <g>
            <path
              d="M 31 34 C 32 19 68 19 69 34 C 64 27 58 26 50 26 C 42 26 36 27 31 34 Z"
              fill={hair.base}
            />
            <circle cx="50" cy="12" r="5.5" fill={hair.base} />
            <circle cx="49" cy="11.5" r="3.5" fill={hair.highlight} />
            <rect x="47" y="16" width="6" height="2.5" rx="1" fill="#ef4444" />
          </g>
        )}

        {hairStyle === 3 && (
          /* Afro Shape-Up */
          <g>
            <path
              d="M 28 36 C 26 13 40 10 50 10 C 60 10 74 13 72 36 C 68 28 62 26 50 26 C 38 26 32 28 28 36 Z"
              fill={hair.base}
            />
            <ellipse cx="50" cy="14" rx="10" ry="2.5" fill={hair.highlight} opacity="0.35" />
          </g>
        )}

        {hairStyle === 4 && (
          /* Trenzas de Combate (Cornrows) */
          <g>
            <path
              d="M 31 34 C 31 19 69 19 69 34 C 64 28 58 26 50 26 C 42 26 36 28 31 34 Z"
              fill={hair.base}
            />
            <path d="M 38 31 C 40 23 43 20 43 19" stroke={hair.highlight} strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 44 29 C 46 22 47 18 47 17" stroke={hair.highlight} strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 56 29 C 54 22 53 18 53 17" stroke={hair.highlight} strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 62 31 C 60 23 57 20 57 19" stroke={hair.highlight} strokeWidth="2.2" strokeLinecap="round" />
          </g>
        )}

        {hairStyle === 5 && (
          /* Calvo Total */
          <path d="M 38 25 Q 48 21 58 23" stroke="#ffffff" strokeWidth="1.5" opacity="0.25" strokeLinecap="round" fill="none" />
        )}
      </svg>
    </div>
  )
}
