export interface FighterAppearance {
  skin: number // 0: Pálido, 1: Claro, 2: Bronceado, 3: Moreno, 4: Oscuro
  hairStyle: number // 0-5
  hairColor: number // 0-3
  facialHair: number // 0-3
  expression?: number // 0: Seria, 1: Feroz, 2: Confiada
  // retrocompatibilidad
  pose?: number
  aura?: number
  tone?: number
  eyebrows?: number
}

export interface SkinPalette {
  id: number
  label: string
  base: string
  shadow: string
  highlight: string
  preview: string
}

export const SKIN_TONES: SkinPalette[] = [
  { id: 0, label: 'Pálido / Nórdico', base: '#f6d1be', shadow: '#d69e88', highlight: '#ffede5', preview: '#f6d1be' },
  { id: 1, label: 'Claro / Latino', base: '#e8b896', shadow: '#c48965', highlight: '#f9d6be', preview: '#e8b896' },
  { id: 2, label: 'Bronceado / Mediterráneo', base: '#c98a59', shadow: '#9e6236', highlight: '#e1a677', preview: '#c98a59' },
  { id: 3, label: 'Moreno / Mestizo', base: '#995a34', shadow: '#723b1a', highlight: '#b8754b', preview: '#995a34' },
  { id: 4, label: 'Oscuro / Africano', base: '#59331d', shadow: '#3c1e0e', highlight: '#784729', preview: '#59331d' },
]

export const HAIR_STYLES = [
  { id: 0, label: 'Rapado Militar (Buzzcut)' },
  { id: 1, label: 'Fade Deportivo (Undercut)' },
  { id: 2, label: 'Moño Samurai (Topknot)' },
  { id: 3, label: 'Afro Shape-Up' },
  { id: 4, label: 'Trenzas de Combate (Cornrows)' },
  { id: 5, label: 'Calvo Total' },
]

export interface HairPalette {
  id: number
  label: string
  base: string
  highlight: string
  preview: string
}

export const HAIR_COLORS: HairPalette[] = [
  { id: 0, label: 'Negro Azabache', base: '#18181b', highlight: '#27272a', preview: '#18181b' },
  { id: 1, label: 'Castaño Oscuro', base: '#3e2417', highlight: '#5c3826', preview: '#3e2417' },
  { id: 2, label: 'Rubio Cenizo', base: '#bfa063', highlight: '#dbbe83', preview: '#bfa063' },
  { id: 3, label: 'Pelirrojo / Cobrizo', base: '#8c351e', highlight: '#b54b2d', preview: '#8c351e' },
]

export const FACIAL_HAIRS = [
  { id: 0, label: 'Afeitado Limpio' },
  { id: 1, label: 'Sombra de 3 Días (Stubble)' },
  { id: 2, label: 'Barba de Guerrero (Full)' },
  { id: 3, label: 'Bigote & Chivo (Goatee)' },
]

export const EXPRESSIONS = [
  { id: 0, label: 'Seria / Concentrado' },
  { id: 1, label: 'Feroz / Modo Guerra' },
  { id: 2, label: 'Confiada / Sonrisa Fría' },
]

export const DEFAULT_APPEARANCE: FighterAppearance = {
  skin: 1,
  hairStyle: 1,
  hairColor: 0,
  facialHair: 1,
  expression: 0,
}

/** Deterministic pseudo-random appearance generator for opponents and roster */
export function generateFighterAppearance(seedKey: string | number, country?: string): FighterAppearance {
  let hash = 0
  const str = String(seedKey)
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  const abs = Math.abs(hash)

  let skinBase = abs % SKIN_TONES.length
  if (country) {
    const c = country.toLowerCase()
    if (c.includes('brazil') || c.includes('mexico') || c.includes('cuba') || c.includes('colombia')) {
      skinBase = (abs % 3) + 1
    } else if (c.includes('nigeria') || c.includes('angola') || c.includes('cameroon') || c.includes('congo')) {
      skinBase = (abs % 2) + 3
    } else if (c.includes('sweden') || c.includes('ireland') || c.includes('russia') || c.includes('poland') || c.includes('uk')) {
      skinBase = abs % 2
    }
  }

  return {
    skin: Math.min(SKIN_TONES.length - 1, Math.max(0, skinBase)),
    hairStyle: abs % HAIR_STYLES.length,
    hairColor: (abs >> 2) % HAIR_COLORS.length,
    facialHair: (abs >> 3) % FACIAL_HAIRS.length,
    expression: (abs >> 4) % EXPRESSIONS.length,
  }
}
