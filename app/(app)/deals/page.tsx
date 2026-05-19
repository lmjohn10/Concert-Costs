import { DealAlertsApp } from "@/components/DealAlertsApp";

export default function DealsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Deal alerts
        </h2>
        <p className="text-sm sm:text-base text-base-content/70 mt-1">
          Watch ticket prices and get notified when deals appear.
        </p>
      </div>
      <DealAlertsApp />
    </div>
  );
}
