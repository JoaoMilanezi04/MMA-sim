export type JobId = 'full_time_athlete' | 'gym_instructor' | 'night_security'

export interface JobDef {
  id: JobId
  title: string
  company: string
  salaryWeekly: number
  energyCost: number
  description: string
  perk: string
}

export const JOBS: JobDef[] = [
  {
    id: 'full_time_athlete',
    title: 'Atleta a Tiempo Completo',
    company: 'Dedicación Exclusiva',
    salaryWeekly: 0,
    energyCost: 0,
    description: '100% de enfoque mental y físico en el entrenamiento sin desgaste laboral.',
    perk: '100 pts de energía total para el gimnasio.',
  },
  {
    id: 'gym_instructor',
    title: 'Instructor de Acondicionamiento',
    company: 'Gimnasio Local',
    salaryWeekly: 200,
    energyCost: 10,
    description: 'Imparte clases de preparación física y técnica básica en horarios matutinos.',
    perk: '+$200/semana garantizados · Consume 10 pts de energía.',
  },
  {
    id: 'night_security',
    title: 'Seguridad Nocturna (Bouncer)',
    company: 'Club Nocturno / Eventos',
    salaryWeekly: 350,
    energyCost: 20,
    description: 'Turnos nocturnos de alta exigencia física y alteración del ciclo de sueño.',
    perk: '+$350/semana garantizados · Consume 20 pts de energía.',
  },
]

export interface SponsorDeal {
  id: string
  name: string
  category: string
  payoutPerFight: number
  minFans: number
  minStreak?: number
  requiresUfc?: boolean
  description: string
  logoText: string
}

export const SPONSORS: SponsorDeal[] = [
  {
    id: 'supplements',
    name: 'Titan Core Nutrition',
    category: 'Suplementación Deportiva',
    payoutPerFight: 300,
    minFans: 200,
    description: 'Proteínas y electrolitos oficiales para atletas en ascenso.',
    logoText: 'TITAN CORE',
  },
  {
    id: 'apparel',
    name: 'Venum Strike Gear',
    category: 'Indumentaria Técnica',
    payoutPerFight: 1200,
    minFans: 1000,
    minStreak: 2,
    description: 'Shorts de combate personalizados y equipamiento de sparring oficial.',
    logoText: 'VENUM',
  },
  {
    id: 'energy_drink',
    name: 'Apex Reign Energy',
    category: 'Bebidas Energéticas Globales',
    payoutPerFight: 4000,
    minFans: 5000,
    requiresUfc: true,
    description: 'Patrocinador masivo de peleadores en carteleras de pago por evento de UFC.',
    logoText: 'APEX REIGN',
  },
  {
    id: 'crypto_betting',
    name: 'Stake & Prime Global',
    category: 'Cripto / Casa de Apuestas',
    payoutPerFight: 10000,
    minFans: 15000,
    requiresUfc: true,
    description: 'Contrato élite para peleadores dentro del Top 15 o contendientes al título.',
    logoText: 'STAKE / PRIME',
  },
]

export interface StaffMember {
  id: 'nutritionist' | 'physio'
  name: string
  role: string
  monthlyFee: number
  benefit: string
  description: string
}

export const SUPPORT_STAFF: StaffMember[] = [
  {
    id: 'nutritionist',
    name: 'Dr. Marcus Vance',
    role: 'Nutricionista Profesional',
    monthlyFee: 200,
    benefit: 'Corte de peso perfecto sin penalizaciones de estamina',
    description: 'Diseña dietas científicas personalizadas para optimizar la masa muscular y evitar deshidratación extrema.',
  },
  {
    id: 'physio',
    name: 'Elena Rostova, PT',
    role: 'Fisioterapeuta Privado',
    monthlyFee: 250,
    benefit: 'Reduce al 50% el riesgo de sobrecarga y lesiones en sparring',
    description: 'Sesiones semanales de descarga miofascial, movilidad articular y prevención de desgaste articular.',
  },
]
