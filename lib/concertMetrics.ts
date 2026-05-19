import type { Concert } from "./types";

export const COST_FIELDS = [
  { key: "ticket_cost" as const, label: "Tickets" },
  { key: "ticket_fees" as const, label: "Ticket fees" },
  { key: "parking_cost" as const, label: "Parking" },
  { key: "food_drink_cost" as const, label: "Food & drink" },
  { key: "merchandise_cost" as const, label: "Merchandise" },
  { key: "lodging_cost" as const, label: "Hotel / lodging" },
  { key: "travel_cost" as const, label: "Travel / gas" },
  { key: "other_cost" as const, label: "Other" },
];

export function getTotalCost(concert: Pick<Concert, (typeof COST_FIELDS)[number]["key"]>) {
  return COST_FIELDS.reduce((sum, { key }) => sum + Number(concert[key] ?? 0), 0);
}

export function getCostPerHour(
  totalCost: number,
  hoursAtEvent: number
): number | null {
  if (!hoursAtEvent || hoursAtEvent <= 0) return null;
  return totalCost / hoursAtEvent;
}

export function getFunPointsPer100(
  funRating: number,
  totalCost: number
): number | null {
  if (!totalCost || totalCost <= 0) return null;
  return (funRating / totalCost) * 100;
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatNumber(value: number, digits = 2) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value);
}

export function funRatingLabel(rating: number) {
  if (rating <= 1) return "Terrible Time";
  if (rating >= 10) return "Best Time Ever";
  return `${rating} / 10`;
}

export type DashboardSummary = {
  totalConcerts: number;
  totalSpent: number;
  avgCostPerConcert: number;
  avgFunRating: number;
  avgCostPerHour: number | null;
  bestValue: Concert | null;
  mostExpensive: Concert | null;
  highestFun: Concert | null;
};

export function buildDashboardSummary(concerts: Concert[]): DashboardSummary {
  if (concerts.length === 0) {
    return {
      totalConcerts: 0,
      totalSpent: 0,
      avgCostPerConcert: 0,
      avgFunRating: 0,
      avgCostPerHour: null,
      bestValue: null,
      mostExpensive: null,
      highestFun: null,
    };
  }

  const enriched = concerts.map((c) => {
    const total = getTotalCost(c);
    return {
      concert: c,
      total,
      costPerHour: getCostPerHour(total, Number(c.hours_at_event)),
      funPoints: getFunPointsPer100(c.fun_rating, total),
    };
  });

  const totalSpent = enriched.reduce((s, e) => s + e.total, 0);
  const avgFun =
    enriched.reduce((s, e) => s + e.concert.fun_rating, 0) / concerts.length;

  const costPerHours = enriched
    .map((e) => e.costPerHour)
    .filter((v): v is number => v !== null);
  const avgCostPerHour =
    costPerHours.length > 0
      ? costPerHours.reduce((s, v) => s + v, 0) / costPerHours.length
      : null;

  const withFunPoints = enriched.filter((e) => e.funPoints !== null);
  const bestValue =
    withFunPoints.length > 0
      ? withFunPoints.reduce((best, curr) =>
          (curr.funPoints ?? 0) > (best.funPoints ?? 0) ? curr : best
        ).concert
      : null;

  const mostExpensive = enriched.reduce((best, curr) =>
    curr.total > best.total ? curr : best
  ).concert;

  const highestFun = enriched.reduce((best, curr) =>
    curr.concert.fun_rating > best.concert.fun_rating ? curr : best
  ).concert;

  return {
    totalConcerts: concerts.length,
    totalSpent,
    avgCostPerConcert: totalSpent / concerts.length,
    avgFunRating: avgFun,
    avgCostPerHour,
    bestValue,
    mostExpensive,
    highestFun,
  };
}

export function getCategoryTotals(concerts: Concert[]) {
  return COST_FIELDS.map(({ key, label }) => ({
    name: label,
    value: concerts.reduce((sum, c) => sum + Number(c[key] ?? 0), 0),
  })).filter((item) => item.value > 0);
}
