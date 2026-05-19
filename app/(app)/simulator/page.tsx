import { BudgetSimulator } from "@/components/BudgetSimulator";

export default function SimulatorPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          What-If Budget Simulator
        </h2>
        <p className="text-sm sm:text-base text-base-content/70 mt-1 max-w-2xl">
          Plan and compare event budgets before you commit. Great for organizers
          and group trips.
        </p>
      </div>
      <BudgetSimulator />
    </div>
  );
}
