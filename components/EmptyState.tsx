import Link from "next/link";
import { Music2 } from "lucide-react";

export function EmptyState() {
  return (
    <div className="card bg-base-100 shadow-md border border-base-300 rounded-2xl animate-fade-in-up">
      <div className="card-body items-center text-center py-14">
        <div className="rounded-full bg-primary/10 p-5 animate-pulse [animation-duration:3s]">
          <Music2 className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mt-4">No concerts logged yet</h3>
        <p className="text-base-content/70 max-w-md mt-2">
          No concerts logged yet. Add your first concert to start seeing your
          dashboard.
        </p>
        <p className="text-sm text-base-content/50 mt-1">
          Your stats and charts will appear here.
        </p>
        <Link
          href="/add"
          className="btn btn-primary mt-6 transition-transform active:scale-[0.98] animate-in fade-in zoom-in-95 duration-500 [animation-delay:200ms] fill-mode-both"
        >
          Add your first concert
        </Link>
      </div>
    </div>
  );
}
