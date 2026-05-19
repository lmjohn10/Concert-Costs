import { createClient } from "@/lib/supabase/server";
import type { Concert } from "@/lib/types";

export async function fetchUserConcerts(): Promise<Concert[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("concerts")
    .select("*")
    .order("concert_date", { ascending: false });

  if (error) {
    console.error("fetch concerts error", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...row,
    distance_from_home: Number(row.distance_from_home),
    hours_at_event: Number(row.hours_at_event),
    ticket_cost: Number(row.ticket_cost),
    ticket_fees: Number(row.ticket_fees),
    parking_cost: Number(row.parking_cost),
    food_drink_cost: Number(row.food_drink_cost),
    merchandise_cost: Number(row.merchandise_cost),
    lodging_cost: Number(row.lodging_cost),
    travel_cost: Number(row.travel_cost),
    other_cost: Number(row.other_cost),
    fun_rating: Number(row.fun_rating),
  })) as Concert[];
}
