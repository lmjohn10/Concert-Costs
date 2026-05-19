import { TourMemoryApp } from "@/components/TourMemoryApp";
import { fetchUserConcerts } from "@/lib/fetchConcerts";

export default async function MemoriesPage() {
  const concerts = await fetchUserConcerts();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Tour memories
        </h2>
        <p className="text-sm sm:text-base text-base-content/70 mt-1">
          Your timeline of shows, spending, and moments that mattered.
        </p>
      </div>
      <TourMemoryApp concerts={concerts} />
    </div>
  );
}
