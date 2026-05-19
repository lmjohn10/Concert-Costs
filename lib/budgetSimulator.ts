import { formatMoney } from "./concertMetrics";

export type VenueSize = "small" | "medium" | "large";

export type TicketTier = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type SimulatorInputs = {
  label: string;
  attendees: number;
  ticketTiers: TicketTier[];
  dynamicPricingPercent: number;
  vipUpgradePercent: number;
  vipUpgradePrice: number;
  venueSize: VenueSize;
  merchSpend: number;
  merchRevenuePerAttendee: number;
  travelHotelCost: number;
  foodDrinkBudget: number;
  ticketFeePercent: number;
  otherFixedCosts: number;
};

export type SimulatorResults = {
  totalProjectedCost: number;
  totalRevenue: number;
  ticketRevenue: number;
  vipRevenue: number;
  merchRevenue: number;
  platformFees: number;
  profitLoss: number;
  perPersonSplit: number;
  breakEvenAttendance: number | null;
  effectiveAttendance: number;
  avgTicketPrice: number;
  costBreakdown: { label: string; amount: number }[];
  revenueBreakdown: { label: string; amount: number }[];
};

export const VENUE_OPTIONS: {
  value: VenueSize;
  label: string;
  cost: number;
  capacity: string;
}[] = [
  { value: "small", label: "Small club", cost: 3_500, capacity: "~200" },
  { value: "medium", label: "Theater / hall", cost: 12_000, capacity: "~1,500" },
  { value: "large", label: "Arena / stadium", cost: 45_000, capacity: "~10,000+" },
];

export function createDefaultScenario(label: string): SimulatorInputs {
  return {
    label,
    attendees: 500,
    ticketTiers: [
      { id: "ga", name: "General admission", price: 45, quantity: 400 },
      { id: "vip", name: "VIP", price: 125, quantity: 100 },
    ],
    dynamicPricingPercent: 0,
    vipUpgradePercent: 8,
    vipUpgradePrice: 75,
    venueSize: "medium",
    merchSpend: 4_500,
    merchRevenuePerAttendee: 18,
    travelHotelCost: 6_200,
    foodDrinkBudget: 3_800,
    ticketFeePercent: 10,
    otherFixedCosts: 8_500,
  };
}

function venueCost(size: VenueSize) {
  return VENUE_OPTIONS.find((v) => v.value === size)?.cost ?? 0;
}

function pricingMultiplier(dynamicPricingPercent: number) {
  return 1 + dynamicPricingPercent / 100;
}

export function calculateScenario(inputs: SimulatorInputs): SimulatorResults {
  const mult = pricingMultiplier(inputs.dynamicPricingPercent);
  const tierQty = inputs.ticketTiers.reduce((s, t) => s + t.quantity, 0);
  const effectiveAttendance = Math.max(inputs.attendees, tierQty, 1);

  const ticketRevenue = inputs.ticketTiers.reduce(
    (sum, tier) => sum + tier.price * mult * tier.quantity,
    0
  );

  const vipCount = Math.round(
    (effectiveAttendance * inputs.vipUpgradePercent) / 100
  );
  const vipRevenue = vipCount * inputs.vipUpgradePrice;

  const merchRevenue =
    effectiveAttendance * inputs.merchRevenuePerAttendee;

  const totalRevenue = ticketRevenue + vipRevenue + merchRevenue;
  const platformFees = totalRevenue * (inputs.ticketFeePercent / 100);

  const venue = venueCost(inputs.venueSize);
  const totalProjectedCost =
    venue +
    inputs.merchSpend +
    inputs.travelHotelCost +
    inputs.foodDrinkBudget +
    inputs.otherFixedCosts +
    platformFees;

  const profitLoss = totalRevenue - totalProjectedCost;
  const perPersonSplit = totalProjectedCost / effectiveAttendance;

  const avgTicketPrice =
    tierQty > 0 ? ticketRevenue / tierQty : 0;

  const fixedCosts =
    venue +
    inputs.merchSpend +
    inputs.travelHotelCost +
    inputs.foodDrinkBudget +
    inputs.otherFixedCosts;

  const revenuePerAttendee =
    ticketRevenue / effectiveAttendance +
    vipRevenue / effectiveAttendance +
    inputs.merchRevenuePerAttendee;

  const feePerAttendee = totalRevenue / effectiveAttendance * (inputs.ticketFeePercent / 100);
  const contributionPerAttendee = revenuePerAttendee - feePerAttendee;

  const breakEvenAttendance =
    contributionPerAttendee > 0
      ? Math.ceil(fixedCosts / contributionPerAttendee)
      : null;

  return {
    totalProjectedCost,
    totalRevenue,
    ticketRevenue,
    vipRevenue,
    merchRevenue,
    platformFees,
    profitLoss,
    perPersonSplit,
    breakEvenAttendance,
    effectiveAttendance,
    avgTicketPrice,
    costBreakdown: [
      { label: "Venue", amount: venue },
      { label: "Merch (inventory)", amount: inputs.merchSpend },
      { label: "Travel & hotel", amount: inputs.travelHotelCost },
      { label: "Food & drink", amount: inputs.foodDrinkBudget },
      { label: "Production & other", amount: inputs.otherFixedCosts },
      { label: "Ticket platform fees", amount: platformFees },
    ],
    revenueBreakdown: [
      { label: "Ticket tiers", amount: ticketRevenue },
      { label: "VIP upgrades", amount: vipRevenue },
      { label: "Merch sales", amount: merchRevenue },
    ],
  };
}

export type ScenarioComparison = {
  metric: string;
  scenarioA: string;
  scenarioB: string;
  delta: string;
  better: "a" | "b" | "tie";
};

export function compareScenarios(
  a: SimulatorResults,
  b: SimulatorResults,
  labelA: string,
  labelB: string
): ScenarioComparison[] {
  const rows: {
    metric: string;
    valA: number;
    valB: number;
    format: (n: number) => string;
    higherIsBetter: boolean;
  }[] = [
    {
      metric: "Total projected cost",
      valA: a.totalProjectedCost,
      valB: b.totalProjectedCost,
      format: formatMoney,
      higherIsBetter: false,
    },
    {
      metric: "Total revenue",
      valA: a.totalRevenue,
      valB: b.totalRevenue,
      format: formatMoney,
      higherIsBetter: true,
    },
    {
      metric: "Profit / loss",
      valA: a.profitLoss,
      valB: b.profitLoss,
      format: formatMoney,
      higherIsBetter: true,
    },
    {
      metric: "Per-person split",
      valA: a.perPersonSplit,
      valB: b.perPersonSplit,
      format: formatMoney,
      higherIsBetter: false,
    },
    {
      metric: "Break-even attendance",
      valA: a.breakEvenAttendance ?? 0,
      valB: b.breakEvenAttendance ?? 0,
      format: (n) => (n > 0 ? String(n) : "—"),
      higherIsBetter: false,
    },
  ];

  return rows.map((row) => {
    const diff = row.valB - row.valA;
    let better: "a" | "b" | "tie" = "tie";
    if (diff !== 0) {
      better =
        row.higherIsBetter
          ? diff > 0
            ? "b"
            : "a"
          : diff < 0
            ? "b"
            : "a";
    }
    const deltaStr =
      row.metric === "Break-even attendance"
        ? diff === 0
          ? "Same"
          : `${diff > 0 ? "+" : ""}${diff}`
        : `${diff >= 0 ? "+" : ""}${formatMoney(diff)}`;

    return {
      metric: row.metric,
      scenarioA: row.format(row.valA),
      scenarioB: row.format(row.valB),
      delta: deltaStr,
      better,
    };
  });
}

export { formatMoney };
