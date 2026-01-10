// draftproanalytics-server/src/infrastructure/espn/EspnClient.ts
import { createLogger } from '@/utils/Logger';

const logger = createLogger('EspnClient');
type JsonRecord = Record<string, unknown>;

function collectRefs(node: unknown, out: Set<string>): void {
  if (Array.isArray(node)) {
    for (const item of node) collectRefs(item, out);
    return;
  }
  const r = asRecord(node);
  if (!r) return;

  const ref = r.$ref;
  if (typeof ref === 'string' && ref.length > 0) out.add(ref);

  for (const v of Object.values(r)) collectRefs(v, out);
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function asRecord(v: unknown): JsonRecord | null {
  return v && typeof v === 'object' ? (v as JsonRecord) : null;
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function extractRef(v: unknown): string | null {
  const r = asRecord(v);
  const ref = r && typeof r.$ref === 'string' ? r.$ref : null;
  return ref;
}

function toHttps(url: string): string {
  return url.startsWith('http://') ? `https://${url.slice('http://'.length)}` : url;
}

function readLowerText(r: JsonRecord, key: string): string {
  const v = r[key];
  return typeof v === 'string' ? v.toLowerCase() : '';
}

function readNumberLike(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function statMetaText(r: JsonRecord): string {
  // ESPN sometimes uses { stat: {...}, value, displayValue }
  const inner = asRecord(r.stat);
  const parts: string[] = [];

  parts.push(readLowerText(r, 'name'));
  parts.push(readLowerText(r, 'abbreviation'));
  parts.push(readLowerText(r, 'description'));
  parts.push(readLowerText(r, 'displayName'));
  parts.push(readLowerText(r, 'shortDisplayName'));

  if (inner) {
    parts.push(readLowerText(inner, 'name'));
    parts.push(readLowerText(inner, 'abbreviation'));
    parts.push(readLowerText(inner, 'description'));
    parts.push(readLowerText(inner, 'displayName'));
    parts.push(readLowerText(inner, 'shortDisplayName'));
  }

  return parts.filter(Boolean).join(' ');
}

function statValueNumber(r: JsonRecord): number | null {
  // try value first, then displayValue
  const direct = readNumberLike(r.value);
  if (direct !== null) return direct;
  return readNumberLike(r.displayValue);
}

function normalizeCoreRef(ref: string): string {
  // 1) force https
  const https = ref.replace(/^http:\/\//, 'https://')

  // 2) ESPN sometimes returns `lang=en®ion=us` (bad). Ignore any querystring.
  const base = https.split('?')[0] ?? https

  // 3) add a clean querystring (or omit entirely; this is fine too)
  return `${base}?lang=en&region=us`
}
function pickSeedFromStats(stats: unknown): number | null {
  const arr = asArray(stats);
  for (const item of arr) {
    const r = asRecord(item);
    if (!r) continue;

    const name = typeof r.name === 'string' ? r.name.toLowerCase() : '';
    const abbr = typeof r.abbreviation === 'string' ? r.abbreviation.toLowerCase() : '';
    const desc = typeof r.description === 'string' ? r.description.toLowerCase() : '';

    // broaden matching a bit; ESPN varies naming
    const looksLikeSeed =
      name.includes('playoffseed') ||
      name === 'seed' ||
      abbr === 'seed' ||
      abbr.includes('seed') ||
      desc.includes('playoff seed') ||
      desc.includes('seed');

    if (!looksLikeSeed) continue;

    const value = r.value;
    const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;

    if (Number.isFinite(n)) {
      const seed = Math.trunc(n);
      if (seed >= 1 && seed <= 7) return seed;
    }
  }
  return null;
}

function extractTeamId(teamObj: unknown): number | null {
  const r = asRecord(teamObj);
  if (!r) return null;

  // common: { id: "2", ... }
  const idVal = r.id;
  if (typeof idVal === 'number' && Number.isFinite(idVal)) return Math.trunc(idVal);
  if (typeof idVal === 'string') {
    const n = Number(idVal);
    if (Number.isFinite(n)) return Math.trunc(n);
  }

  // common: { "$ref": ".../teams/2?..." }
  const refVal = r.$ref;
  if (typeof refVal === 'string') {
    const m = refVal.match(/\/teams\/(\d+)(\?|$)/);
    if (m?.[1]) return Number(m[1]);
  }

  return null;
}
export class EspnClient {
  private async getJson(url: string): Promise<unknown> {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`ESPN request failed: ${res.status} ${res.statusText}`);
    return (await res.json()) as unknown;
  }

  /**
   * Official playoff seeds keyed by ESPN TEAM ID (Bills=2, Bears=3, etc).
   *
   * FIX: the /standings endpoint is an index returning $ref links, not entries.
   * We must follow a standings view $ref (e.g. /standings/1) to reach entries/stats.
   */
  // EspnClient.ts (add these helpers near your other helpers)

  // ---- replace ONLY this method ----
  async getPlayoffSeedsByEspnTeamId(
    year: number,
    seasonType: 1 | 2 | 3 = 2
  ): Promise<Record<number, number>> {
    logger.debug('getPlayoffSeedsByEspnTeamId - entrypoint');

    const out: Record<number, number> = {};
    const groups: ReadonlyArray<{ groupId: number }> = [
      { groupId: 8 }, // AFC
      { groupId: 7 }, // NFC
    ];

    for (const g of groups) {
      const indexUrl =
        `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/` +
        `seasons/${year}/types/${seasonType}/groups/${g.groupId}/standings?lang=en&region=us`;

      const indexData = await this.getJson(indexUrl);
      const indexRoot = asRecord(indexData);
      if (!indexRoot) continue;

      // ✅ FIX: refs are under `items`, not `standings`
      const standingsRefs = asArray(indexRoot.items)
        .map(extractRef)
        .filter((s): s is string => typeof s === 'string' && s.length > 0)
        .map(normalizeCoreRef);

      logger.debug('getPlayoffSeedsByEspnTeamId - standingsRefs count=' + standingsRefs.length);

      for (const standingsUrl of standingsRefs) {
        const viewData = await this.getJson(standingsUrl);
        const viewRoot = asRecord(viewData);
        if (!viewRoot) continue;

        const entriesRaw = asArray(viewRoot.entries);
        if (entriesRaw.length === 0) continue;

        for (const entry of entriesRaw) {
          // entries can be inline objects OR {$ref: "..."}
          const entryRef = extractRef(entry);
          const entryObj = entryRef ? await this.getJson(normalizeCoreRef(entryRef)) : entry;
          const er = asRecord(entryObj);
          if (!er) continue;

          const teamId = extractTeamId(er.team);
          if (!teamId) continue;

          // 1) try inline stats objects/refs
          const inlineSeed = pickSeedFromStats(er.stats);
          if (inlineSeed) {
            out[teamId] = inlineSeed;
            continue;
          }

          // 2) resolve stat refs if present
          const statRefs = asArray(er.stats)
            .map(extractRef)
            .filter((s): s is string => typeof s === 'string' && s.length > 0)
            .map(normalizeCoreRef);

          for (const statUrl of statRefs) {
            const statData = await this.getJson(statUrl);
            const seed = pickSeedFromStats([statData]);
            if (seed) {
              out[teamId] = seed;
              break;
            }
          }
        }

        // if we’ve already got a healthy number of seeds, stop trying other standings views
        if (Object.keys(out).length >= 10) break;
      }
    }

    logger.debug('getPlayoffSeedsByEspnTeamId - seedCount=' + Object.keys(out).length);
    return out;
  }
}

