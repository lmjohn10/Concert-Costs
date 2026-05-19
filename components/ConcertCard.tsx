import type { Concert } from "@/lib/types";
import {
  COST_FIELDS,
  formatMoney,
  formatNumber,
  getCostPerHour,
  getFunPointsPer100,
  getTotalCost,
} from "@/lib/concertMetrics";
import { cn } from "@/lib/cn";
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Music2,
  Sparkles,
  Star,
} from "lucide-react";

const statStyles = [
  "from-primary/20 to-primary/5 border-primary/25 text-primary",
  "from-secondary/20 to-secondary/5 border-secondary/25 text-secondary",
  "from-accent/20 to-accent/5 border-accent/25 text-accent",
  "from-info/20 to-info/5 border-info/25 text-info",
] as const;

type ConcertCardProps = {
  concert: Concert;
  index?: number;
};

export function ConcertCard({ concert, index = 0 }: ConcertCardProps) {
  const total = getTotalCost(concert);
  const costPerHour = getCostPerHour(total, Number(concert.hours_at_event));
  const funPoints = getFunPointsPer100(concert.fun_rating, total);

  const categories = COST_FIELDS.filter(
    ({ key }) => Number(concert[key]) > 0
  ).map(({ key, label }) => ({
    label,
    amount: Number(concert[key]),
  }));

  const date = new Date(concert.concert_date + "T12:00:00").toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

  const funBadgeClass =
    concert.fun_rating >= 8
      ? "badge-success"
      : concert.fun_rating >= 4
        ? "badge-warning"
        : "badge-error";

  const miniStats = [
    { label: "Total cost", value: formatMoney(total), icon: DollarSign },
    {
      label: "Cost / hour",
      value: costPerHour !== null ? formatMoney(costPerHour) : "—",
      icon: Clock,
    },
    {
      label: "Fun / $100",
      value: funPoints !== null ? formatNumber(funPoints) : "—",
      icon: Sparkles,
    },
    {
      label: "Distance",
      value: `${formatNumber(Number(concert.distance_from_home), 1)} mi`,
      icon: MapPin,
    },
  ];

  return (
    <article
      className={cn(
        "card overflow-hidden rounded-2xl border border-primary/20 bg-base-100",
        "bg-linear-to-br from-primary/10 via-base-100 to-secondary/10",
        "concert-card-glow transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-xl hover:border-primary/40",
        "animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both"
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="h-1.5 w-full bg-linear-to-r from-primary via-secondary to-accent" />

      <div className="card-body gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex gap-3 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Music2 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold tracking-tight text-base-content truncate">
                {concert.concert_name}
              </h3>
              <p className="text-secondary font-medium">{concert.artist}</p>
            </div>
          </div>
          <div className={cn("badge badge-lg gap-1 shadow-sm", funBadgeClass)}>
            <Star className="h-3.5 w-3.5 fill-current" />
            {concert.fun_rating}/10
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-base-200/80 px-3 py-1.5 border border-base-300/80">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">
              {concert.venue}, {concert.city}, {concert.state}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-base-200/80 px-3 py-1.5 border border-base-300/80">
            <Calendar className="h-4 w-4 text-secondary shrink-0" />
            {date}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {miniStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={cn(
                  "rounded-xl border p-3 bg-linear-to-br",
                  statStyles[i % statStyles.length]
                )}
              >
                <div className="flex items-center gap-1.5 text-xs font-medium opacity-80 mb-1">
                  <Icon className="h-3.5 w-3.5" />
                  {stat.label}
                </div>
                <p className="text-lg font-bold tabular-nums text-base-content">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {categories.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2 text-base-content/80">
              Main cost categories
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c, i) => (
                <span
                  key={c.label}
                  className={cn(
                    "badge badge-sm border-0 text-white font-medium",
                    i % 4 === 0 && "bg-primary",
                    i % 4 === 1 && "bg-secondary",
                    i % 4 === 2 && "bg-accent",
                    i % 4 === 3 && "bg-info"
                  )}
                >
                  {c.label}: {formatMoney(c.amount)}
                </span>
              ))}
            </div>
          </div>
        )}

        {concert.notes && (
          <p className="text-sm rounded-xl border border-base-300/60 bg-base-200/50 p-3">
            <span className="font-semibold text-primary">Notes: </span>
            {concert.notes}
          </p>
        )}
      </div>
    </article>
  );
}
