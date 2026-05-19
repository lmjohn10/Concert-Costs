"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { COST_FIELDS, formatMoney, getTotalCost } from "@/lib/concertMetrics";

const emptyForm = {
  concert_name: "",
  artist: "",
  venue: "",
  city: "",
  state: "",
  concert_date: "",
  distance_from_home: "0",
  hours_at_event: "3",
  ticket_cost: "0",
  ticket_fees: "0",
  parking_cost: "0",
  food_drink_cost: "0",
  merchandise_cost: "0",
  lodging_cost: "0",
  travel_cost: "0",
  other_cost: "0",
  fun_rating: 7,
  notes: "",
};

type FormState = typeof emptyForm;

const costLabels: Record<string, string> = {
  ticket_cost: "Ticket cost",
  ticket_fees: "Ticket fees",
  parking_cost: "Parking cost",
  food_drink_cost: "Food and drink cost",
  merchandise_cost: "Merchandise cost",
  lodging_cost: "Hotel or lodging cost",
  travel_cost: "Travel or gas cost",
  other_cost: "Other cost",
};

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <label className="text-sm font-medium text-right self-center">{label}</label>
      {children}
    </>
  );
}

export function ConcertForm() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const totalCost = useMemo(() => {
    const costs = COST_FIELDS.reduce(
      (acc, { key }) => {
        acc[key] = Number(form[key as keyof FormState] ?? 0);
        return acc;
      },
      {} as Record<(typeof COST_FIELDS)[number]["key"], number>
    );
    return getTotalCost(costs);
  }, [form]);

  const update = (key: keyof FormState, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You need to be logged in to save a concert.");
      setLoading(false);
      return;
    }

    const payload = {
      user_id: user.id,
      concert_name: form.concert_name.trim(),
      artist: form.artist.trim(),
      venue: form.venue.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      concert_date: form.concert_date,
      distance_from_home: Number(form.distance_from_home) || 0,
      hours_at_event: Number(form.hours_at_event) || 1,
      ticket_cost: Number(form.ticket_cost) || 0,
      ticket_fees: Number(form.ticket_fees) || 0,
      parking_cost: Number(form.parking_cost) || 0,
      food_drink_cost: Number(form.food_drink_cost) || 0,
      merchandise_cost: Number(form.merchandise_cost) || 0,
      lodging_cost: Number(form.lodging_cost) || 0,
      travel_cost: Number(form.travel_cost) || 0,
      other_cost: Number(form.other_cost) || 0,
      fun_rating: form.fun_rating,
      notes: form.notes.trim() || null,
    };

    const { error: insertError } = await supabase.from("concerts").insert(payload);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setForm(emptyForm);
    setSuccess(true);
    setLoading(false);
  };

  const gridClass =
    "grid grid-cols-1 md:grid-cols-[10rem_1fr] gap-x-4 gap-y-3 items-center";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="alert alert-success animate-in fade-in slide-in-from-top-2 duration-300">
          <span>Concert saved! Add another or check My Concerts and Dashboard.</span>
        </div>
      )}
      {error && (
        <div className="alert alert-error animate-in fade-in slide-in-from-top-2 duration-300">
          <span>{error}</span>
        </div>
      )}

      <section className="card bg-base-100 shadow-md rounded-2xl transition-shadow duration-200 hover:shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-lg">Concert details</h2>
          <p className="text-sm opacity-70">Tell us where and when you went.</p>
          <div className={`${gridClass} mt-4`}>
            <FieldRow label="Concert name">
              <input
                className="input input-bordered w-full"
                value={form.concert_name}
                onChange={(e) => update("concert_name", e.target.value)}
                required
                placeholder="Summer Nights Tour"
              />
            </FieldRow>
            <FieldRow label="Artist or band">
              <input
                className="input input-bordered w-full"
                value={form.artist}
                onChange={(e) => update("artist", e.target.value)}
                required
              />
            </FieldRow>
            <FieldRow label="Venue">
              <input
                className="input input-bordered w-full"
                value={form.venue}
                onChange={(e) => update("venue", e.target.value)}
                required
              />
            </FieldRow>
            <FieldRow label="City">
              <input
                className="input input-bordered w-full"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                required
              />
            </FieldRow>
            <FieldRow label="State">
              <input
                className="input input-bordered w-full"
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
                required
                maxLength={2}
                placeholder="CA"
              />
            </FieldRow>
            <FieldRow label="Concert date">
              <input
                type="date"
                className="input input-bordered w-full"
                value={form.concert_date}
                onChange={(e) => update("concert_date", e.target.value)}
                required
              />
            </FieldRow>
            <FieldRow label="Distance (mi)">
              <input
                type="number"
                min="0"
                step="0.1"
                className="input input-bordered w-full"
                value={form.distance_from_home}
                onChange={(e) => update("distance_from_home", e.target.value)}
              />
            </FieldRow>
            <FieldRow label="Hours at event">
              <input
                type="number"
                min="0.5"
                step="0.5"
                className="input input-bordered w-full"
                value={form.hours_at_event}
                onChange={(e) => update("hours_at_event", e.target.value)}
                required
              />
            </FieldRow>
          </div>
        </div>
      </section>

      <section className="card bg-base-100 shadow-md rounded-2xl transition-shadow duration-200 hover:shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-lg">Costs</h2>
          <p className="text-sm opacity-70">
            Enter what you spent. Total updates automatically.
          </p>
          <div className={`${gridClass} mt-4`}>
            {COST_FIELDS.map(({ key }) => (
              <FieldRow key={key} label={costLabels[key]}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input input-bordered w-full"
                  value={form[key as keyof FormState] as string}
                  onChange={(e) =>
                    update(key as keyof FormState, e.target.value)
                  }
                />
              </FieldRow>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-2xl bg-primary/10 text-center transition-all duration-300">
            <p className="text-sm opacity-80">Total concert cost</p>
            <p className="text-3xl font-bold text-primary tabular-nums">
              {formatMoney(totalCost)}
            </p>
          </div>
        </div>
      </section>

      <section className="card bg-base-100 shadow-md rounded-2xl transition-shadow duration-200 hover:shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-lg">How fun was it?</h2>
          <p className="text-sm opacity-70">Rate from 1 (Terrible Time) to 10 (Best Time Ever).</p>
          <div className="mt-6 px-2">
            <input
              type="range"
              min={1}
              max={10}
              value={form.fun_rating}
              onChange={(e) => update("fun_rating", Number(e.target.value))}
              className="range range-primary w-full"
            />
            <div className="flex justify-between text-xs px-1 mt-1 opacity-70">
              <span>Terrible Time</span>
              <span>Best Time Ever</span>
            </div>
            <p className="text-center text-2xl font-bold mt-4">{form.fun_rating} / 10</p>
          </div>
        </div>
      </section>

      <section className="card bg-base-100 shadow-md rounded-2xl transition-shadow duration-200 hover:shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-lg">Notes</h2>
          <p className="text-sm opacity-70">Optional memories or details.</p>
          <textarea
            className="textarea textarea-bordered w-full mt-3"
            rows={4}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Opened with my favorite song..."
          />
        </div>
      </section>

      <button
        type="submit"
        className="btn btn-primary btn-lg w-full transition-transform active:scale-[0.98]"
        disabled={loading}
      >
        {loading && <span className="loading loading-spinner loading-sm" />}
        {loading ? "Saving..." : "Save concert"}
      </button>
    </form>
  );
}
