import { DashboardCharts } from "@/components/DashboardCharts";
import { DashboardStats } from "@/components/DashboardStats";
import { EmptyState } from "@/components/EmptyState";
import { fetchUserConcerts } from "@/lib/fetchConcerts";

export default async function DashboardPage() {
  const concerts = await fetchUserConcerts();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="opacity-70 text-sm mt-1">
          Your concert spending and fun at a glance.
        </p>
      </div>

      {concerts.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <DashboardStats concerts={concerts} />
          <DashboardCharts concerts={concerts} />
        </>
      )}
    </div>
  );
}
