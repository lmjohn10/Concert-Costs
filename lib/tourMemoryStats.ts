import { getTotalCost, formatMoney } from "./concertMetrics";
import type { Concert, ConcertMemory } from "./types";

export type TourMemoryStats = {
  spentThisYear: number;
  totalConcerts: number;
  mostSeenArtist: { name: string; count: number } | null;
  avgTicketPrice: number;
  citiesVisited: string[];
  totalSpentAllTime: number;
};

export function buildTourMemoryStats(
  concerts: Concert[],
  year = new Date().getFullYear()
): TourMemoryStats {
  const totalSpentAllTime = concerts.reduce(
    (s, c) => s + getTotalCost(c),
    0
  );

  const thisYear = concerts.filter((c) =>
    c.concert_date.startsWith(String(year))
  );

  const spentThisYear = thisYear.reduce((s, c) => s + getTotalCost(c), 0);

  const artistCounts = new Map<string, number>();
  for (const c of concerts) {
    const key = c.artist.trim();
    artistCounts.set(key, (artistCounts.get(key) ?? 0) + 1);
  }

  let mostSeenArtist: { name: string; count: number } | null = null;
  for (const [name, count] of artistCounts) {
    if (!mostSeenArtist || count > mostSeenArtist.count) {
      mostSeenArtist = { name, count };
    }
  }

  const ticketPrices = concerts.map((c) => Number(c.ticket_cost));
  const avgTicketPrice =
    ticketPrices.length > 0
      ? ticketPrices.reduce((s, p) => s + p, 0) / ticketPrices.length
      : 0;

  const citySet = new Set(
    concerts.map((c) => `${c.city}, ${c.state}`.trim())
  );

  return {
    spentThisYear,
    totalConcerts: concerts.length,
    mostSeenArtist,
    avgTicketPrice,
    citiesVisited: [...citySet].sort(),
    totalSpentAllTime,
  };
}

export function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v) => typeof v === "string" && v.trim()).map(String);
  }
  return [];
}

export function memoryFromRow(row: Record<string, unknown>): ConcertMemory {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    concert_id: row.concert_id as string,
    photo_urls: parseStringArray(row.photo_urls),
    video_urls: parseStringArray(row.video_urls),
    setlist: (row.setlist as string) ?? null,
    favorite_songs: parseStringArray(row.favorite_songs),
    friends_attended: parseStringArray(row.friends_attended),
    merch_bought: (row.merch_bought as string) ?? null,
    memory_notes: (row.memory_notes as string) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export function formatYearStat(amount: number, year: number) {
  return `You've spent ${formatMoney(amount)} on concerts this year (${year}).`;
}
