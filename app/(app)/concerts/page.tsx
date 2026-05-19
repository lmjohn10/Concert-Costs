import { ConcertCard } from "@/components/ConcertCard";
import { EmptyState } from "@/components/EmptyState";
import { fetchUserConcerts } from "@/lib/fetchConcerts";

export default async function MyConcertsPage() {
  const concerts = await fetchUserConcerts();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Concerts</h2>
        <p className="opacity-70 text-sm mt-1">
          Every show you have logged, with costs and fun scores.
        </p>
      </div>

      {concerts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {concerts.map((concert, index) => (
            <ConcertCard key={concert.id} concert={concert} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
