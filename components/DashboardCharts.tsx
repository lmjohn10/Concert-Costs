"use client";

import type { Concert } from "@/lib/types";
import { CHART_COLORS, CHART_GRADIENTS } from "@/lib/chartColors";
import {
  getCategoryTotals,
  getFunPointsPer100,
  getTotalCost,
} from "@/lib/concertMetrics";
import { BarChart3, PieChart as PieChartIcon, Sparkles, Star } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function truncate(name: string, max = 12) {
  return name.length > max ? `${name.slice(0, max)}…` : name;
}

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid oklch(80% 0.1 300 / 0.3)",
  boxShadow: "0 8px 24px oklch(40% 0.2 320 / 0.15)",
};

export function DashboardCharts({ concerts }: { concerts: Concert[] }) {
  const categoryData = getCategoryTotals(concerts);

  const byConcert = concerts.map((c) => {
    const total = getTotalCost(c);
    const funPoints = getFunPointsPer100(c.fun_rating, total);
    return {
      name: truncate(c.concert_name),
      fullName: c.concert_name,
      totalCost: total,
      funRating: c.fun_rating,
      funPoints: funPoints ?? 0,
    };
  });

  if (concerts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8 animate-fade-in-up">
      <ChartCard title="Spending by cost category" icon={PieChartIcon}>
        {categoryData.length === 0 ? (
          <p className="text-sm text-base-content/60 p-4">No cost data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <defs>
                {categoryData.map((_, i) => (
                  <linearGradient
                    key={`pie-${i}`}
                    id={`pieGrad${i}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                    <stop
                      offset="100%"
                      stopColor={CHART_COLORS[(i + 1) % CHART_COLORS.length]}
                    />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={3}
                animationDuration={900}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={`url(#pieGrad${i})`} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [`$${Number(v ?? 0).toFixed(2)}`, "Spent"]}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Total cost by concert" icon={BarChart3}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={byConcert} barCategoryGap="20%">
            <defs>
              <linearGradient id="costBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_GRADIENTS.cost.from} />
                <stop offset="100%" stopColor={CHART_GRADIENTS.cost.to} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "currentColor" }} />
            <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v) => [`$${Number(v ?? 0).toFixed(2)}`, "Total cost"]}
              labelFormatter={(_, payload) =>
                (payload?.[0]?.payload as { fullName?: string })?.fullName ?? ""
              }
            />
            <Bar
              dataKey="totalCost"
              fill="url(#costBarGrad)"
              radius={[8, 8, 0, 0]}
              animationDuration={900}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Fun rating by concert" icon={Star}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={byConcert} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v) => [`${Number(v ?? 0)}/10`, "Fun rating"]}
              labelFormatter={(_, payload) =>
                (payload?.[0]?.payload as { fullName?: string })?.fullName ?? ""
              }
            />
            <Bar dataKey="funRating" radius={[8, 8, 0, 0]} animationDuration={900}>
              {byConcert.map((_, i) => (
                <Cell
                  key={i}
                  fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Fun Points per $100 by concert" icon={Sparkles}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={byConcert} barCategoryGap="20%">
            <defs>
              <linearGradient id="valueBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_GRADIENTS.value.from} />
                <stop offset="100%" stopColor={CHART_GRADIENTS.value.to} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v) => [Number(v ?? 0).toFixed(2), "Fun Points per $100"]}
              labelFormatter={(_, payload) =>
                (payload?.[0]?.payload as { fullName?: string })?.fullName ?? ""
              }
            />
            <Bar
              dataKey="funPoints"
              fill="url(#valueBarGrad)"
              radius={[8, 8, 0, 0]}
              animationDuration={900}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="card overflow-hidden rounded-2xl border border-primary/15 bg-base-100 shadow-lg concert-card-glow animate-in fade-in zoom-in-95 duration-500 fill-mode-both">
      <div className="h-1 chart-card-accent" />
      <div className="card-body gap-2">
        <h3 className="flex items-center gap-2 text-base font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}
