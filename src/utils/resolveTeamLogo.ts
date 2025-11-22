// src/utils/resolveTeamLogo.ts

// Map NFL team names to logo file names
const logoMap: Record<string, string> = {
  'Kansas City Chiefs': 'Chiefs.avif',
  'Las Vegas Raiders': 'Raiders.avif',
  'Los Angeles Chargers': 'Chargers.webp', // special case
  'Denver Broncos': 'Broncos.avif',

  'Buffalo Bills': 'Bills.avif',
  'Miami Dolphins': 'Dolphins.avif',
  'New England Patriots': 'Patriots.avif',
  'New York Jets': 'Jets.avif',

  'Cincinnati Bengals': 'Bengals.avif',
  'Cleveland Browns': 'Browns.avif',
  'Pittsburgh Steelers': 'Steelers.avif',
  'Baltimore Ravens': 'Ravens.avif',

  'Jacksonville Jaguars': 'Jaguars.avif',
  'Houston Texans': 'Texans.avif',
  'Indianapolis Colts': 'Colts.avif',
  'Tennessee Titans': 'Titans.avif',

  // NFC
  'Dallas Cowboys': 'Cowboys.avif',
  'Philadelphia Eagles': 'Eagles.avif',
  'New York Giants': 'Giants.avif',
  'Washington Commanders': 'Commanders.avif',

  'Green Bay Packers': 'Packers.avif',
  'Chicago Bears': 'Bears.avif',
  'Detroit Lions': 'Lions.avif',
  'Minnesota Vikings': 'Vikings.avif',

  'Tampa Bay Buccaneers': 'Buccaneers.avif',
  'Carolina Panthers': 'Panthers.avif',
  'New Orleans Saints': 'Saints.avif',
  'Atlanta Falcons': 'Falcons.avif',

  'San Francisco 49ers': '49ers.avif',
  'Seattle Seahawks': 'Seahawks.avif',
  'Los Angeles Rams': 'Rams.avif',
  'Arizona Cardinals': 'Cardinals.avif',
}

export function resolveTeamLogo(teamName: string): string {
  const file = logoMap[teamName]
  if (!file) return ''

  const isAFC = [
    'Chiefs','Raiders','Chargers','Broncos','Bills','Dolphins','Patriots','Jets',
    'Bengals','Browns','Steelers','Ravens',
    'Jaguars','Texans','Colts','Titans'
  ].some(t => file.includes(t))

  return isAFC
    ? `/src/assets/images/afc/${file}`
    : `/src/assets/images/nfc/${file}`
}
