import { ConcertForm } from "@/components/ConcertForm";

export default function AddConcertPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Add Concert</h2>
        <p className="opacity-70 text-sm mt-1">
          Log a show you attended — costs and fun rating included.
        </p>
      </div>
      <ConcertForm />
    </div>
  );
}
