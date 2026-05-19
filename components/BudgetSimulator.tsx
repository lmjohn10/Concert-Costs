"use client";

import { useMemo, useState } from "react";
import { CHART_COLORS } from "@/lib/chartColors";
import { cn } from "@/lib/cn";
import {
  calculateScenario,
  compareScenarios,
  createDefaultScenario,
  formatMoney,
  type SimulatorInputs,
  type TicketTier,
  VENUE_OPTIONS,
} from "@/lib/budgetSimulator";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Calculator,
  GitCompare,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="form-control w-full">
      <span className="label-text font-medium">{label}</span>
      {children}
      {hint && <span className="label-text-alt mt-1">{hint}</span>}
    </label>
  );
}

function ScenarioPanel({
  scenarioKey,
  inputs,
  onChange,
}: {
  scenarioKey: "a" | "b";
  inputs: SimulatorInputs;
  onChange: (next: SimulatorInputs) => void;
}) {
  const accent = scenarioKey === "a" ? "primary" : "secondary";

  const update = <K extends keyof SimulatorInputs>(
    key: K,
    value: SimulatorInputs[K]
  ) => onChange({ ...inputs, [key]: value });

  const updateTier = (id: string, patch: Partial<TicketTier>) => {
    onChange({
      ...inputs,
      ticketTiers: inputs.ticketTiers.map((t) =>
        t.id === id ? { ...t, ...patch } : t
      ),
    });
  };

  const addTier = () => {
    onChange({
      ...inputs,
      ticketTiers: [
        ...inputs.ticketTiers,
        {
          id: `tier-${Date.now()}`,
          name: "New tier",
          price: 50,
          quantity: 50,
        },
      ],
    });
  };

  const removeTier = (id: string) => {
    if (inputs.ticketTiers.length <= 1) return;
    onChange({
      ...inputs,
      ticketTiers: inputs.ticketTiers.filter((t) => t.id !== id),
    });
  };

  return (
    <div
      className={cn(
        "card overflow-hidden rounded-2xl border bg-base-100 concert-card-glow",
        scenarioKey === "a" ? "border-primary/25" : "border-secondary/25"
      )}
    >
      <div
        className={cn(
          "h-1.5 w-full bg-linear-to-r",
          scenarioKey === "a"
            ? "from-primary via-secondary to-accent"
            : "from-secondary via-accent to-primary"
        )}
      />
      <div className="card-body gap-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3
            className={cn(
              "text-lg font-bold",
              scenarioKey === "a" ? "text-primary" : "text-secondary"
            )}
          >
            Scenario {scenarioKey.toUpperCase()}
          </h3>
          <input
            type="text"
            className="input input-bordered input-sm max-w-[10rem]"
            value={inputs.label}
            onChange={(e) => update("label", e.target.value)}
            aria-label={`Scenario ${scenarioKey} name`}
          />
        </div>

        <section className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Tickets & attendance
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Expected attendees" hint="Overall crowd size">
              <input
                type="number"
                min={1}
                className="input input-bordered w-full"
                value={inputs.attendees}
                onChange={(e) =>
                  update("attendees", Math.max(1, Number(e.target.value) || 1))
                }
              />
            </Field>
            <Field
              label="Dynamic pricing"
              hint="% change on tier prices (e.g. 15 = +15%)"
            >
              <input
                type="number"
                step={1}
                className="input input-bordered w-full"
                value={inputs.dynamicPricingPercent}
                onChange={(e) =>
                  update("dynamicPricingPercent", Number(e.target.value) || 0)
                }
              />
            </Field>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Ticket price tiers</span>
              <button
                type="button"
                className="btn btn-ghost btn-xs gap-1"
                onClick={addTier}
              >
                <Plus className="h-3 w-3" />
                Add tier
              </button>
            </div>
            {inputs.ticketTiers.map((tier) => (
              <div
                key={tier.id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_6rem_6rem_auto] gap-2 items-end rounded-xl border border-base-300/80 p-3 bg-base-200/40"
              >
                <Field label="Tier name">
                  <input
                    type="text"
                    className="input input-bordered input-sm w-full"
                    value={tier.name}
                    onChange={(e) =>
                      updateTier(tier.id, { name: e.target.value })
                    }
                  />
                </Field>
                <Field label="Price ($)">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className="input input-bordered input-sm w-full"
                    value={tier.price}
                    onChange={(e) =>
                      updateTier(tier.id, {
                        price: Number(e.target.value) || 0,
                      })
                    }
                  />
                </Field>
                <Field label="Qty">
                  <input
                    type="number"
                    min={0}
                    className="input input-bordered input-sm w-full"
                    value={tier.quantity}
                    onChange={(e) =>
                      updateTier(tier.id, {
                        quantity: Number(e.target.value) || 0,
                      })
                    }
                  />
                </Field>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm text-error"
                  onClick={() => removeTier(tier.id)}
                  disabled={inputs.ticketTiers.length <= 1}
                  aria-label="Remove tier"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="VIP upgrade %" hint="% of crowd buying an add-on">
              <input
                type="number"
                min={0}
                max={100}
                className="input input-bordered w-full"
                value={inputs.vipUpgradePercent}
                onChange={(e) =>
                  update("vipUpgradePercent", Number(e.target.value) || 0)
                }
              />
            </Field>
            <Field label="VIP upgrade price ($)" hint="Per upgrade sold">
              <input
                type="number"
                min={0}
                step={0.01}
                className="input input-bordered w-full"
                value={inputs.vipUpgradePrice}
                onChange={(e) =>
                  update("vipUpgradePrice", Number(e.target.value) || 0)
                }
              />
            </Field>
          </div>
        </section>

        <section className="space-y-3">
          <h4 className="font-semibold text-sm">Venue & operations</h4>
          <Field label="Venue size" hint="Sets base rental cost">
            <select
              className="select select-bordered w-full"
              value={inputs.venueSize}
              onChange={(e) =>
                update(
                  "venueSize",
                  e.target.value as SimulatorInputs["venueSize"]
                )
              }
            >
              {VENUE_OPTIONS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label} ({formatMoney(v.cost)} · {v.capacity})
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Merch spend ($)" hint="Inventory / production cost">
              <input
                type="number"
                min={0}
                step={0.01}
                className="input input-bordered w-full"
                value={inputs.merchSpend}
                onChange={(e) =>
                  update("merchSpend", Number(e.target.value) || 0)
                }
              />
            </Field>
            <Field
              label="Merch revenue / person ($)"
              hint="Expected sales per attendee"
            >
              <input
                type="number"
                min={0}
                step={0.01}
                className="input input-bordered w-full"
                value={inputs.merchRevenuePerAttendee}
                onChange={(e) =>
                  update("merchRevenuePerAttendee", Number(e.target.value) || 0)
                }
              />
            </Field>
            <Field label="Travel & hotel ($)">
              <input
                type="number"
                min={0}
                step={0.01}
                className="input input-bordered w-full"
                value={inputs.travelHotelCost}
                onChange={(e) =>
                  update("travelHotelCost", Number(e.target.value) || 0)
                }
              />
            </Field>
            <Field label="Food & drink budget ($)">
              <input
                type="number"
                min={0}
                step={0.01}
                className="input input-bordered w-full"
                value={inputs.foodDrinkBudget}
                onChange={(e) =>
                  update("foodDrinkBudget", Number(e.target.value) || 0)
                }
              />
            </Field>
            <Field label="Ticket platform fee %" hint="Taken from revenue">
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                className="input input-bordered w-full"
                value={inputs.ticketFeePercent}
                onChange={(e) =>
                  update("ticketFeePercent", Number(e.target.value) || 0)
                }
              />
            </Field>
            <Field label="Other fixed costs ($)" hint="Production, staff, etc.">
              <input
                type="number"
                min={0}
                step={0.01}
                className="input input-bordered w-full"
                value={inputs.otherFixedCosts}
                onChange={(e) =>
                  update("otherFixedCosts", Number(e.target.value) || 0)
                }
              />
            </Field>
          </div>
        </section>
      </div>
    </div>
  );
}

function ResultCard({
  title,
  value,
  desc,
  variant = "default",
}: {
  title: string;
  value: string;
  desc?: string;
  variant?: "default" | "success" | "error" | "accent";
}) {
  const styles = {
    default: "border-primary/20 from-primary/10 to-primary/5",
    success: "border-success/30 from-success/15 to-success/5",
    error: "border-error/30 from-error/15 to-error/5",
    accent: "border-accent/30 from-accent/15 to-accent/5",
  };
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 bg-linear-to-br transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        styles[variant]
      )}
    >
      <p className="text-sm font-medium text-base-content/70">{title}</p>
      <p className="text-2xl font-bold tabular-nums mt-1">{value}</p>
      {desc && <p className="text-xs text-base-content/55 mt-1">{desc}</p>}
    </div>
  );
}

export function BudgetSimulator() {
  const [scenarioA, setScenarioA] = useState(() =>
    createDefaultScenario("Baseline")
  );
  const [scenarioB, setScenarioB] = useState(() => {
    const base = createDefaultScenario("Upside");
    return {
      ...base,
      dynamicPricingPercent: 12,
      attendees: 650,
      ticketTiers: base.ticketTiers.map((t) =>
        t.name.includes("General")
          ? { ...t, quantity: 480, price: 52 }
          : { ...t, quantity: 170, price: 140 }
      ),
    };
  });

  const resultsA = useMemo(
    () => calculateScenario(scenarioA),
    [scenarioA]
  );
  const resultsB = useMemo(
    () => calculateScenario(scenarioB),
    [scenarioB]
  );
  const comparison = useMemo(
    () => compareScenarios(resultsA, resultsB, scenarioA.label, scenarioB.label),
    [resultsA, resultsB, scenarioA.label, scenarioB.label]
  );

  const chartData = [
    {
      name: "Cost",
      [scenarioA.label]: resultsA.totalProjectedCost,
      [scenarioB.label]: resultsB.totalProjectedCost,
    },
    {
      name: "Revenue",
      [scenarioA.label]: resultsA.totalRevenue,
      [scenarioB.label]: resultsB.totalRevenue,
    },
    {
      name: "Profit",
      [scenarioA.label]: resultsA.profitLoss,
      [scenarioB.label]: resultsB.profitLoss,
    },
  ];

  function ResultsStrip({
    label,
    results,
  }: {
    label: string;
    results: ReturnType<typeof calculateScenario>;
  }) {
    const plVariant =
      results.profitLoss > 0
        ? "success"
        : results.profitLoss < 0
          ? "error"
          : "default";

    return (
      <div className="space-y-3">
        <h4 className="font-bold text-base">{label} — live results</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ResultCard
            title="Total projected cost"
            value={formatMoney(results.totalProjectedCost)}
            desc="All expenses incl. fees"
          />
          <ResultCard
            title="Total revenue"
            value={formatMoney(results.totalRevenue)}
            desc={`${results.effectiveAttendance} effective attendees`}
            variant="accent"
          />
          <ResultCard
            title="Profit / loss"
            value={formatMoney(results.profitLoss)}
            desc={
              results.profitLoss >= 0 ? "Organizer surplus" : "Organizer deficit"
            }
            variant={plVariant}
          />
          <ResultCard
            title="Per-person split"
            value={formatMoney(results.perPersonSplit)}
            desc="If total cost is split evenly"
          />
          <ResultCard
            title="Break-even attendance"
            value={
              results.breakEvenAttendance !== null
                ? String(results.breakEvenAttendance)
                : "—"
            }
            desc="Tickets needed to cover fixed costs"
          />
          <ResultCard
            title="Avg ticket (after dynamic pricing)"
            value={formatMoney(results.avgTicketPrice)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="rounded-2xl border border-primary/20 bg-linear-to-r from-primary/10 via-base-100 to-secondary/10 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Calculator className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-xl font-bold">What-If Budget Simulator</h2>
            <p className="text-sm text-base-content/70 mt-1 max-w-2xl">
              Adjust ticket tiers, crowd size, venue, merch, travel, VIP
              upgrades, and dynamic pricing — then compare two scenarios
              side-by-side. Numbers update instantly.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ScenarioPanel
          scenarioKey="a"
          inputs={scenarioA}
          onChange={setScenarioA}
        />
        <ScenarioPanel
          scenarioKey="b"
          inputs={scenarioB}
          onChange={setScenarioB}
        />
      </div>

      <ResultsStrip label={scenarioA.label} results={resultsA} />
      <ResultsStrip label={scenarioB.label} results={resultsB} />

      <section className="card overflow-hidden rounded-2xl border border-primary/15 bg-base-100 concert-card-glow">
        <div className="h-1 chart-card-accent" />
        <div className="card-body gap-4">
          <h3 className="font-bold flex items-center gap-2 text-lg">
            <GitCompare className="h-5 w-5 text-secondary" />
            Scenario comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>{scenarioA.label}</th>
                  <th>{scenarioB.label}</th>
                  <th>Change (B vs A)</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.metric}>
                    <td className="font-medium">{row.metric}</td>
                    <td>{row.scenarioA}</td>
                    <td>{row.scenarioB}</td>
                    <td>
                      <span
                        className={cn(
                          "badge badge-sm gap-1",
                          row.better === "b" && "badge-success",
                          row.better === "a" && "badge-warning",
                          row.better === "tie" && "badge-ghost"
                        )}
                      >
                        {row.better === "b" ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : row.better === "a" ? (
                          <TrendingDown className="h-3 w-3" />
                        ) : null}
                        {row.delta}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v) => formatMoney(Number(v ?? 0))}
                  contentStyle={{ borderRadius: 12 }}
                />
                <Legend />
                <Bar
                  dataKey={scenarioA.label}
                  fill={CHART_COLORS[0]}
                  radius={[6, 6, 0, 0]}
                  animationDuration={700}
                />
                <Bar
                  dataKey={scenarioB.label}
                  fill={CHART_COLORS[1]}
                  radius={[6, 6, 0, 0]}
                  animationDuration={700}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
