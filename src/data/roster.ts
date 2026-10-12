import type { Division } from '../types/game'
import type { FighterRank, Organization, WorldState } from '../types/career'
import { RIZIN_DIVISIONS, UNRANKED } from '../types/career'
import { makeRng } from '../engine/rng'
import type { Rng } from '../engine/rng'

/**
 * Preloaded elite roster. Names, ages and styles are approximate to the real scene;
 * records, streaks and OVR are fictional values for gameplay purposes.
 */

const COUNTRY: Record<string, string> = {
  BR: '🇧🇷 Brasil', US: '🇺🇸 Estados Unidos', RU: '🇷🇺 Rusia', ES: '🇪🇸 España', AU: '🇦🇺 Australia',
  MX: '🇲🇽 México', GB: '🇬🇧 Reino Unido', NZ: '🇳🇿 Nueva Zelanda', AM: '🇦🇲 Armenia', PL: '🇵🇱 Polonia',
  CA: '🇨🇦 Canadá', FR: '🇫🇷 Francia', IE: '🇮🇪 Irlanda', KZ: '🇰🇿 Kazajistán', NG: '🇳🇬 Nigeria',
  ZA: '🇿🇦 Sudáfrica', CZ: '🇨🇿 Chequia', GE: '🇬🇪 Georgia', CN: '🇨🇳 China', EC: '🇪🇨 Ecuador',
  PT: '🇵🇹 Portugal', JP: '🇯🇵 Japón', MM: '🇲🇲 Myanmar', AZ: '🇦🇿 Azerbaiyán', CL: '🇨🇱 Chile',
  SE: '🇸🇪 Suecia', NL: '🇳🇱 Países Bajos', IT: '🇮🇹 Italia', AT: '🇦🇹 Austria', UA: '🇺🇦 Ucrania',
  UZ: '🇺🇿 Uzbekistán', CH: '🇨🇭 Suiza', DO: '🇩🇴 Rep. Dominicana', MD: '🇲🇩 Moldavia',
  AR: '🇦🇷 Argentina', MA: '🇲🇦 Marruecos', RS: '🇷🇸 Serbia', DE: '🇩🇪 Alemania', LT: '🇱🇹 Lituania', HR: '🇭🇷 Croacia',
}

const STYLE: Record<string, string> = {
  PW: 'Pressure Wrestler',
  CS: 'Counter Striker',
  BJ: 'BJJ Specialist',
  MT: 'Muay Thai',
  WB: 'Wild Brawler',
  BX: 'Boxer',
  KB: 'Kickboxer',
  WR: 'Well-Rounded',
}

/** [name, nickname, country code, age, wins, losses, style code]. Index 0 is the champion. */
type Row = [string, string, string, number, number, number, string]

const UFC_ROSTER: Record<Division, Row[]> = {
  Flyweight: [
    ['Joshua Van', 'The Fearless', 'MM', 24, 16, 2, 'BX'],
    ['Manel Kape', 'Starboy', 'PT', 32, 20, 7, 'KB'],
    ['Alexandre Pantoja', 'The Cannibal', 'BR', 35, 29, 5, 'WR'],
    ['Brandon Royval', 'Raw Dog', 'US', 33, 17, 8, 'WB'],
    ['Tatsuro Taira', '', 'JP', 25, 17, 0, 'BJ'],
    ['Asu Almabayev', 'Zulfikar', 'KZ', 32, 21, 2, 'PW'],
    ["Lone'er Kavanagh", '', 'GB', 26, 8, 0, 'BX'],
    ['Ramazan Temirov', 'Temir', 'UZ', 28, 18, 2, 'WB'],
    ['Kyoji Horiguchi', 'The Typhoon', 'JP', 34, 33, 5, 'KB'],
    ['Amir Albazi', 'The Prince', 'GB', 32, 18, 2, 'WR'],
    ['Brandon Moreno', 'The Assassin Baby', 'MX', 32, 23, 8, 'BJ'],
    ['Sumudaerji', 'The Tibetan Eagle', 'CN', 29, 17, 6, 'CS'],
    ['Mitch Raposo', '', 'US', 26, 9, 2, 'WR'],
    ['Imanol Rodriguez', '', 'MX', 25, 8, 1, 'KB'],
    ['Rei Tsuruya', '', 'JP', 23, 10, 0, 'BJ'],
    ['Charles Johnson', 'InnerG', 'US', 34, 16, 6, 'CS'],
  ],
  Bantamweight: [
    ['Petr Yan', 'No Mercy', 'RU', 32, 18, 5, 'BX'],
    ['Merab Dvalishvili', 'The Machine', 'GE', 34, 19, 4, 'PW'],
    ['Song Yadong', 'Kung Fu Monkey', 'CN', 27, 22, 8, 'BX'],
    ["Sean O'Malley", 'Sugar', 'US', 30, 18, 2, 'CS'],
    ['Mario Bautista', '', 'US', 32, 15, 2, 'WR'],
    ['Umar Nurmagomedov', 'Young Eagle', 'RU', 29, 19, 0, 'PW'],
    ['Cory Sandhagen', 'Sandman', 'US', 33, 18, 5, 'CS'],
    ['David Martinez', 'The Black Spartan', 'MX', 27, 12, 1, 'KB'],
    ['Raul Rosas Jr.', 'El Niño Problema', 'MX', 20, 10, 1, 'BJ'],
    ['Farid Basharat', 'Ferocious', 'GB', 27, 13, 0, 'WR'],
    ['Marcus McGhee', 'The Maniac', 'US', 34, 10, 1, 'WB'],
    ['Payton Talbott', '', 'US', 27, 9, 1, 'BX'],
    ['Montel Jackson', 'Quik', 'US', 33, 14, 2, 'CS'],
    ['Aiemann Zahabi', '', 'CA', 37, 14, 3, 'WR'],
    ['Marlon Vera', 'Chito', 'EC', 33, 23, 10, 'KB'],
    ['Bryce Mitchell', 'Thug Nasty', 'US', 31, 16, 3, 'BJ'],
  ],
  Featherweight: [
    ['Alexander Volkanovski', 'The Great', 'AU', 36, 27, 4, 'WR'],
    ['Movsar Evloev', '', 'RU', 31, 19, 0, 'PW'],
    ['Diego Lopes', '', 'MX', 30, 27, 7, 'BJ'],
    ['Lerone Murphy', 'The Miracle', 'GB', 34, 17, 0, 'WR'],
    ['Aljamain Sterling', 'Funkmaster', 'US', 36, 24, 5, 'PW'],
    ['Jean Silva', 'Lord', 'BR', 29, 16, 2, 'WB'],
    ['Arnold Allen', 'Almighty', 'GB', 31, 19, 3, 'CS'],
    ['Pat Sabatini', '', 'US', 34, 18, 5, 'BJ'],
    ['Pavel Andrusca', '', 'MD', 28, 12, 1, 'PW'],
    ['Youssef Zalal', 'The Moroccan Devil', 'MA', 29, 16, 5, 'BJ'],
    ['Kevin Vallejos', 'El Chino', 'AR', 24, 14, 1, 'BX'],
    ['Joanderson Brito', 'Tubarão', 'BR', 30, 17, 4, 'WB'],
    ['Melquizael Costa', 'Melk', 'BR', 28, 22, 7, 'BJ'],
    ['Steve Garcia', 'Mean Machine', 'US', 33, 17, 5, 'WB'],
    ['Aaron Pico', '', 'US', 29, 13, 4, 'WB'],
    ['Jamall Emmers', 'Pretty Boy', 'US', 36, 20, 8, 'WR'],
  ],
  Lightweight: [
    ['Justin Gaethje', 'The Highlight', 'US', 36, 26, 5, 'WB'],
    ['Ilia Topuria', 'El Matador', 'ES', 28, 17, 0, 'BX'],
    ['Arman Tsarukyan', 'Ahalkalakets', 'AM', 28, 23, 3, 'PW'],
    ['Charles Oliveira', 'do Bronx', 'BR', 35, 35, 10, 'BJ'],
    ['Max Holloway', 'Blessed', 'US', 33, 26, 8, 'BX'],
    ['Paddy Pimblett', 'The Baddy', 'GB', 30, 23, 3, 'BJ'],
    ['Quillan Salkilld', '', 'AU', 26, 8, 1, 'WR'],
    ['Benoit Saint Denis', 'God of War', 'FR', 29, 17, 3, 'WR'],
    ['Renato Moicano', 'Money', 'BR', 36, 20, 6, 'BJ'],
    ['Mateusz Gamrot', 'Gamer', 'PL', 34, 25, 3, 'PW'],
    ['Mauricio Ruffy', '', 'BR', 29, 12, 1, 'KB'],
    ['Tom Nolan', 'Big Train', 'AU', 25, 9, 1, 'KB'],
    ['Rafael Fiziev', 'Ataman', 'AZ', 32, 13, 4, 'KB'],
    ['Tofiq Musayev', '', 'AZ', 35, 22, 5, 'WB'],
    ['Grant Dawson', 'KGD', 'US', 31, 22, 2, 'PW'],
    ['Esteban Ribovics', 'El Gringo', 'AR', 29, 14, 2, 'WB'],
  ],
  Welterweight: [
    ['Islam Makhachev', '', 'RU', 33, 28, 1, 'PW'],
    ['Carlos Prates', 'The Nightmare', 'BR', 32, 22, 6, 'KB'],
    ['Ian Machado Garry', 'The Future', 'IE', 28, 17, 1, 'BX'],
    ['Michael Morales', '', 'EC', 26, 19, 0, 'BX'],
    ['Jack Della Maddalena', 'JDM', 'AU', 29, 18, 2, 'BX'],
    ['Sean Brady', '', 'US', 32, 18, 1, 'BJ'],
    ['Gabriel Bonfim', 'Marretinha', 'BR', 29, 17, 1, 'BJ'],
    ['Belal Muhammad', 'Remember the Name', 'US', 37, 24, 3, 'PW'],
    ['Joaquin Buckley', 'New Mansa', 'US', 31, 20, 7, 'WB'],
    ['Uros Medic', 'The Doctor', 'RS', 32, 11, 2, 'KB'],
    ['Leon Edwards', 'Rocky', 'GB', 34, 22, 4, 'WR'],
    ['Mike Malott', 'Proper', 'CA', 33, 11, 2, 'BJ'],
    ['Kamaru Usman', 'The Nigerian Nightmare', 'NG', 38, 21, 4, 'PW'],
    ['Yaroslav Amosov', 'Dynamo', 'UA', 32, 27, 1, 'PW'],
    ['Kevin Holland', 'Trailblazer', 'US', 33, 26, 12, 'KB'],
    ['Colby Covington', 'Chaos', 'US', 37, 17, 4, 'PW'],
  ],
  Middleweight: [
    ['Sean Strickland', 'Tarzan', 'US', 34, 29, 7, 'BX'],
    ['Khamzat Chimaev', 'Borz', 'SE', 31, 15, 0, 'PW'],
    ['Dricus Du Plessis', 'Stillknocks', 'ZA', 31, 23, 2, 'WB'],
    ['Nassourdine Imavov', 'The Sniper', 'FR', 29, 17, 4, 'WR'],
    ['Joe Pyfer', 'Bodybagz', 'US', 29, 14, 3, 'WB'],
    ['Brendan Allen', 'All In', 'US', 29, 25, 6, 'BJ'],
    ['Caio Borralho', 'The Natural', 'BR', 32, 17, 1, 'WR'],
    ['Gregory Rodrigues', 'Robocop', 'BR', 33, 16, 5, 'WB'],
    ['Anthony Hernandez', 'Fluffy', 'US', 32, 15, 2, 'PW'],
    ['Israel Adesanya', 'The Last Stylebender', 'NZ', 36, 24, 5, 'CS'],
    ['Christian Leroy Duncan', 'CLD', 'GB', 29, 11, 2, 'KB'],
    ['Ikram Aliskerov', '', 'RU', 32, 15, 2, 'PW'],
    ['Bo Nickal', 'The Allen Assassin', 'US', 29, 7, 0, 'PW'],
    ['Abus Magomedov', 'Abus', 'DE', 34, 27, 6, 'KB'],
    ['Roman Kopylov', '', 'RU', 34, 13, 3, 'KB'],
    ['Jack Hermansson', 'The Joker', 'SE', 37, 24, 8, 'BJ'],
  ],
  'Light Heavyweight': [
    ['Carlos Ulberg', 'Black Juggernaut', 'NZ', 34, 13, 1, 'KB'],
    ['Alex Pereira', 'Poatan', 'BR', 38, 12, 3, 'KB'],
    ['Magomed Ankalaev', '', 'RU', 33, 21, 1, 'WR'],
    ['Jiří Procházka', 'BJP', 'CZ', 33, 31, 5, 'WB'],
    ['Paulo Costa', 'The Eraser', 'BR', 34, 15, 4, 'WB'],
    ['Khalil Rountree Jr.', 'The War Horse', 'US', 35, 14, 6, 'WB'],
    ['Navajo Stirling', '', 'NZ', 27, 6, 0, 'KB'],
    ['Dominick Reyes', 'The Devastator', 'US', 35, 14, 5, 'BX'],
    ['Reinier De Ridder', 'The Dutch Knight', 'NL', 35, 20, 2, 'BJ'],
    ['Azamat Murzakanov', 'The Professional', 'RU', 35, 15, 0, 'BX'],
    ['Alonzo Menifield', 'Atomic', 'US', 37, 15, 5, 'WB'],
    ['Bogdan Guskov', 'Czarevitch', 'UZ', 33, 17, 3, 'BX'],
    ['Robert Whittaker', 'The Reaper', 'AU', 35, 27, 8, 'BX'],
    ['Muhammad Saidov', '', 'RU', 29, 11, 1, 'PW'],
    ['Modestas Bukauskas', 'The Baltic Gladiator', 'LT', 31, 17, 6, 'KB'],
    ['Jamahal Hill', 'Sweet Dreams', 'US', 34, 13, 3, 'BX'],
  ],
  Heavyweight: [
    ['Ciryl Gane', 'Bon Gamin', 'FR', 35, 13, 2, 'KB'],
    ['Tom Aspinall', '', 'GB', 32, 15, 3, 'WR'],
    ['Sergei Pavlovich', '', 'RU', 33, 19, 2, 'BX'],
    ['Alex Pereira', 'Poatan', 'BR', 38, 12, 3, 'KB'],
    ['Alexander Volkov', 'Drago', 'RU', 37, 38, 11, 'KB'],
    ['Rizvan Kuniev', '', 'RU', 33, 14, 2, 'PW'],
    ['Josh Hokit', 'The Machine Gun', 'US', 27, 5, 0, 'PW'],
    ['Curtis Blaydes', 'Razor', 'US', 34, 18, 5, 'PW'],
    ['Waldo Cortes Acosta', 'Salsa Boy', 'DO', 33, 13, 2, 'WB'],
    ['Vitor Petrino', 'Icão', 'BR', 28, 12, 1, 'WB'],
    ['Mario Pinto', '', 'PT', 27, 9, 0, 'WB'],
    ['Valter Walker', 'The Clean Monster', 'BR', 27, 12, 1, 'PW'],
    ['Johnny Walker', '', 'BR', 33, 21, 9, 'WB'],
    ['Brando Peričić', '', 'HR', 27, 8, 0, 'KB'],
    ['Serghei Spivac', 'Polar Bear', 'MD', 30, 17, 5, 'PW'],
    ['Derrick Lewis', 'The Black Beast', 'US', 40, 29, 12, 'WB'],
  ],
}

const FIRST_NAMES = ['Lucas', 'Mateo', 'Daniel', 'Kenji', 'Ivan', 'Tomas', 'Rafael', 'Andre', 'Jorge', 'Samuel', 'Hiro', 'Dmitri', 'Connor', 'Luis', 'Marco', 'Viktor', 'Aaron', 'Felipe', 'Takumi', 'Yuto']
const LAST_NAMES = ['Santos', 'Ferreira', 'Kowalski', 'Tanaka', 'Petrov', 'Murphy', 'Alvarez', 'Silva', 'Novak', 'Costa', 'Sato', 'Ivanov', 'Walsh', 'Moreira', 'Rossi', 'Kovac', 'Brooks', 'Oliveira', 'Nakamura', 'Hayashi']
const WORLD_POOL = ['BR', 'US', 'RU', 'MX', 'GB', 'AU', 'FR', 'PL', 'GE', 'NZ', 'IE', 'CA']
const RIZIN_POOL = ['JP', 'JP', 'JP', 'BR', 'RU', 'US', 'KZ']
const LFA_POOL = ['US', 'BR', 'MX', 'CA', 'AR']
const CW_POOL = ['GB', 'IE', 'FR', 'PL', 'SE', 'IT', 'NL']

export const REGIONAL_EVENTS = ['Cage Warriors', 'LFA', 'Cage Fury FC', 'Invicta Regional', 'BRAVE CF', 'Fight Nation', 'Titan FC', 'Combate Américas']

export function randomName(r: Rng): string {
  return `${r.pick(FIRST_NAMES)} ${r.pick(LAST_NAMES)}`
}

interface GenOpts {
  ovr: [number, number]
  age: [number, number]
  rank: number
  pool?: string[]
}

export function generateFighter(
  r: Rng,
  division: Division,
  organization: Organization,
  opts: GenOpts,
  customId?: string,
): FighterRank {
  const wins = r.int(6, 14)
  return {
    id: customId ?? `g${r.int(0, 999999999)}`,
    name: randomName(r),
    nickname: '',
    country: COUNTRY[r.pick(opts.pool ?? WORLD_POOL)],
    age: r.int(opts.age[0], opts.age[1]),
    record: { wins, losses: r.int(0, 4), draws: 0 },
    ovr: r.int(opts.ovr[0], opts.ovr[1]),
    rank: opts.rank,
    streak: { count: r.int(1, 3), type: 'W' },
    style: r.pick(Object.values(STYLE)),
    organization,
    division,
  }
}

export function prospectOpts(org: Organization): GenOpts {
  if (org === 'RIZIN') {
    return { ovr: [68, 76], age: [21, 28], rank: UNRANKED, pool: RIZIN_POOL }
  }
  if (org === 'LFA') {
    return { ovr: [65, 72], age: [20, 26], rank: UNRANKED, pool: LFA_POOL }
  }
  if (org === 'CAGE_WARRIORS') {
    return { ovr: [66, 73], age: [20, 27], rank: UNRANKED, pool: CW_POOL }
  }
  return { ovr: [72, 80], age: [21, 28], rank: UNRANKED, pool: WORLD_POOL }
}

export const MIN_PROSPECTS: Partial<Record<Organization, number>> = {
  UFC: 6,
  LFA: 4,
  CAGE_WARRIORS: 4,
  RIZIN: 4,
}

export function createWorld(seed: number): WorldState {
  const r = makeRng(seed)
  const fighters: FighterRank[] = []

  // 1. UFC: Campeón + Top 15 Oficial + Unranked Contenders
  for (const division of Object.keys(UFC_ROSTER) as Division[]) {
    UFC_ROSTER[division].forEach((row, i) => {
      const [name, nickname, cc, age, wins, losses, st] = row
      const k = i * 7 + 3
      fighters.push({
        id: `ufc-${division}-${i}`,
        name,
        nickname,
        country: COUNTRY[cc],
        age,
        record: { wins, losses, draws: 0 },
        ovr: Math.round(i === 0 ? 94 : 91 - i * 0.7) + ((i * 5) % 4) - 1,
        rank: i,
        streak: { count: 1 + (k % 4), type: i > 0 && k % 5 === 0 ? 'L' : 'W' },
        style: STYLE[st],
        organization: 'UFC',
        division,
      })
    })
    for (let p = 0; p < MIN_PROSPECTS.UFC!; p++) {
      fighters.push(
        generateFighter(
          r,
          division,
          'UFC',
          prospectOpts('UFC'),
          `ufc-${division}-unranked-${p}`,
        ),
      )
    }
  }

  // 2. LFA: Campeón Regional + Top 5 Contendientes + Unranked Contenders
  for (const division of Object.keys(UFC_ROSTER) as Division[]) {
    // Campeón LFA (rank 0)
    fighters.push(
      generateFighter(
        r,
        division,
        'LFA',
        { ovr: [77, 80], age: [24, 30], rank: 0, pool: LFA_POOL },
        `lfa-${division}-0`,
      ),
    )
    // Top 5 Contendientes
    for (let i = 1; i <= 5; i++) {
      fighters.push(
        generateFighter(
          r,
          division,
          'LFA',
          { ovr: [71, 76], age: [22, 32], rank: i, pool: LFA_POOL },
          `lfa-${division}-${i}`,
        ),
      )
    }
    // Unranked Contenders
    for (let p = 0; p < MIN_PROSPECTS.LFA!; p++) {
      fighters.push(
        generateFighter(
          r,
          division,
          'LFA',
          prospectOpts('LFA'),
          `lfa-${division}-unranked-${p}`,
        ),
      )
    }
  }

  // 3. Cage Warriors: Campeón Europeo + Top 5 Contendientes + Unranked Contenders
  for (const division of Object.keys(UFC_ROSTER) as Division[]) {
    // Campeón Cage Warriors (rank 0)
    fighters.push(
      generateFighter(
        r,
        division,
        'CAGE_WARRIORS',
        { ovr: [78, 81], age: [24, 31], rank: 0, pool: CW_POOL },
        `cw-${division}-0`,
      ),
    )
    // Top 5 Contendientes
    for (let i = 1; i <= 5; i++) {
      fighters.push(
        generateFighter(
          r,
          division,
          'CAGE_WARRIORS',
          { ovr: [72, 77], age: [22, 33], rank: i, pool: CW_POOL },
          `cw-${division}-${i}`,
        ),
      )
    }
    // Unranked Contenders
    for (let p = 0; p < MIN_PROSPECTS.CAGE_WARRIORS!; p++) {
      fighters.push(
        generateFighter(
          r,
          division,
          'CAGE_WARRIORS',
          prospectOpts('CAGE_WARRIORS'),
          `cw-${division}-unranked-${p}`,
        ),
      )
    }
  }

  // 4. RIZIN: Campeón + Top 6 Contendientes + Unranked Contenders
  for (const division of RIZIN_DIVISIONS) {
    // Campeón (rank 0)
    fighters.push(
      generateFighter(
        r,
        division,
        'RIZIN',
        { ovr: [84, 87], age: [26, 35], rank: 0, pool: RIZIN_POOL },
        `rizin-${division}-0`,
      ),
    )
    // Top 6
    for (let i = 1; i <= 6; i++) {
      fighters.push(
        generateFighter(
          r,
          division,
          'RIZIN',
          {
            ovr: [Math.round(83 - i * 1.3), Math.round(85 - i * 1.3)],
            age: [23, 35],
            rank: i,
            pool: RIZIN_POOL,
          },
          `rizin-${division}-${i}`,
        ),
      )
    }
    // Unranked
    for (let p = 0; p < MIN_PROSPECTS.RIZIN!; p++) {
      fighters.push(
        generateFighter(
          r,
          division,
          'RIZIN',
          prospectOpts('RIZIN'),
          `rizin-${division}-unranked-${p}`,
        ),
      )
    }
  }

  return { fighters, news: [], ufcNumber: 315, seed: r.state() }
}

/**
 * Asegura que el estado mundial tenga cargadas las ligas regionales (LFA, Cage Warriors)
 * y unranked fighters, preservando partidas previas guardadas en localStorage.
 */
export function ensureWorldRosters(world: WorldState): WorldState {
  if (!world || !world.fighters) return world
  const hasLfa = world.fighters.some((f) => f.organization === 'LFA')
  const hasCw = world.fighters.some((f) => f.organization === 'CAGE_WARRIORS')

  if (hasLfa && hasCw) {
    return world
  }

  const fresh = createWorld(world.seed || 12345)
  const existingFighterIds = new Set(world.fighters.map((f) => f.id))
  const missingFighters = fresh.fighters.filter((f) => !existingFighterIds.has(f.id))

  return {
    ...world,
    fighters: [...world.fighters, ...missingFighters],
  }
}
