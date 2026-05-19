import type { Concert } from "@/lib/types";
import {
  buildDashboardSummary,
  formatMoney,
  formatNumber,
  getFunPointsPer100,
  getTotalCost,
} from "@/lib/concertMetrics";
import { cn } from "@/lib/cn";
import {
  DollarSign,
  Music,
  Sparkles,
  Star,
  Ticket,
  TrendingUp,
} from "lucide-react";

const accentStyles = [
  "border-primary/30 bg-linear-to-br from-primary/15 to-primary/5",
  "border-secondary/30 bg-linear-to-br from-secondary/15 to-secondary/5",
  "border-accent/30 bg-linear-to-br from-accent/15 to-accent/5",
  "border-info/30 bg-linear-to-br from-info/15 to-info/5",
  "border-success/30 bg-linear-to-br from-success/15 to-success/5",
  "border-warning/30 bg-linear-to-br from-warning/15 to-warning/5",
  "border-error/30 bg-linear-to-br from-error/15 to-error/5",
  "border-primary/30 bg-linear-to-br from-secondary/15 to-primary/5",
] as const;

export function DashboardStats({ concerts }: { concerts: Concert[] }) {
  const summary = buildDashboardSummary(concerts);

  const stats = [
    {
      title: "Total concerts",
      value: String(summary.totalConcerts),
      desc: "Shows you've logged",
      icon: Music,
    },
    {
      title: "Total spent",
      value: formatMoney(summary.totalSpent),
      desc: "All concerts combined",
      icon: DollarSign,
    },
    {
      title: "Avg cost per concert",
      value:
        summary.totalConcerts > 0
          ? formatMoney(summary.avgCostPerConcert)
          : "—",
      desc: "Typical night out",
      icon: Ticket,
    },
    {
      title: "Avg fun rating",
      value:
        summary.totalConcerts > 0
          ? formatNumber(summary.avgFunRating, 1)
          : "—",
      desc: "Out of 10",
      icon: Star,
    },
    {
      title: "Avg cost per hour",
      value:
        summary.avgCostPerHour !== null
          ? formatMoney(summary.avgCostPerHour)
          : "—",
      desc: "Across all shows",
      icon: TrendingUp,
    },
    {
      title: "Best value concert",
      value: summary.bestValue?.concert_name ?? "—",
      desc: summary.bestValue
        ? `Fun Points per $100: ${formatNumber(
            getFunPointsPer100(
              summary.bestValue.fun_rating,
              getTotalCost(summary.bestValue)
            ) ?? 0
          )}`
        : "Highest fun per dollar",
      icon: Sparkles,
    },
    {
      title: "Most expensive",
      value: summary.mostExpensive?.concert_name ?? "—",
      desc: summary.mostExpensive
        ? formatMoney(getTotalCost(summary.mostExpensive))
        : "Biggest splurge",
      icon: DollarSign,
    },
    {
      title: "Highest fun",
      value: summary.highestFun?.concert_name ?? "—",
      desc: summary.highestFun
        ? `${summary.highestFun.fun_rating}/10`
        : "Best time ever",
      icon: Star,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isHero = index < 3;
        return (
          <div
            key={stat.title}
            className={cn(
              "rounded-2xl border p-4 transition-all duration-300",
              "hover:-translate-y-1 hover:shadow-lg",
              "animate-in fade-in zoom-in-95 duration-500 fill-mode-both",
              accentStyles[index % accentStyles.length],
              isHero && "sm:col-span-1 ring-1 ring-primary/20"
            )}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-base-content/70">
                {stat.title}
              </p>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-base-100/60 text-primary shadow-sm">
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p
              className={cn(
                "mt-2 font-bold tabular-nums text-base-content wrap-break-word",
                isHero ? "text-2xl" : "text-xl"
              )}
            >
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-base-content/60">{stat.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
