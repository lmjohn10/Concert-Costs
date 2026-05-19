import { formatMoney } from "./concertMetrics";
import type { DealAlert, DealNotification, PriceSnapshot } from "./types";

export type ScamRisk = "low" | "medium" | "high";

export type BestTimeToBuy = {
  recommendation: "buy_now" | "wait" | "neutral";
  summary: string;
  confidence: "low" | "medium" | "high";
};

export function assessScamRisk(
  snapshot: Pick<
    PriceSnapshot,
    "price" | "is_resale" | "seller_rating"
  >,
  faceValue: number
): { risk: ScamRisk; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  if (faceValue > 0 && snapshot.price < faceValue * 0.35) {
    score += 2;
    reasons.push("Price is far below face value — could be a scam or mistake.");
  } else if (faceValue > 0 && snapshot.price < faceValue * 0.55) {
    score += 1;
    reasons.push("Price is suspiciously low compared to face value.");
  }

  if (snapshot.is_resale && snapshot.seller_rating !== null && snapshot.seller_rating < 3) {
    score += 2;
    reasons.push("Low seller rating on a resale listing.");
  } else if (snapshot.is_resale && snapshot.seller_rating === null) {
    score += 1;
    reasons.push("Resale listing with no seller rating.");
  }

  if (snapshot.is_resale && faceValue > 0 && snapshot.price < faceValue * 0.5) {
    score += 1;
    if (!reasons.some((r) => r.includes("face value"))) {
      reasons.push("Resale ticket priced well under face value.");
    }
  }

  const risk: ScamRisk = score >= 3 ? "high" : score >= 1 ? "medium" : "low";
  if (reasons.length === 0) reasons.push("No major red flags detected.");
  return { risk, reasons };
}

export function predictBestTimeToBuy(
  snapshots: PriceSnapshot[]
): BestTimeToBuy {
  const sorted = [...snapshots].sort(
    (a, b) =>
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  if (sorted.length < 2) {
    return {
      recommendation: "neutral",
      summary: "Log more price checks to unlock a buy timing prediction.",
      confidence: "low",
    };
  }

  const recent = sorted.slice(-5);
  const prices = recent.map((s) => s.price);
  const first = prices[0];
  const last = prices[prices.length - 1];
  const avg =
    prices.reduce((s, p) => s + p, 0) / prices.length;
  const dropPct = first > 0 ? ((first - last) / first) * 100 : 0;

  if (dropPct >= 8 && last <= avg * 0.95) {
    return {
      recommendation: "buy_now",
      summary: `Prices have fallen about ${dropPct.toFixed(0)}% recently — this may be a good window to buy.`,
      confidence: prices.length >= 4 ? "high" : "medium",
    };
  }

  if (dropPct <= -10) {
    return {
      recommendation: "wait",
      summary: "Prices have been climbing — waiting might still pay off if more inventory opens.",
      confidence: "medium",
    };
  }

  return {
    recommendation: "neutral",
    summary: "Prices are fairly stable — set a target price alert and watch for dips.",
    confidence: "medium",
  };
}

export type AlertCheckInput = {
  alert: DealAlert;
  snapshot: PriceSnapshot;
  daysUntilEvent: number | null;
};

export function buildNotificationsFromCheck(
  input: AlertCheckInput
): Omit<DealNotification, "id" | "user_id" | "created_at" | "is_read">[] {
  const { alert, snapshot, daysUntilEvent } = input;
  const out: Omit<
    DealNotification,
    "id" | "user_id" | "created_at" | "is_read"
  >[] = [];

  const scam = assessScamRisk(snapshot, alert.face_value);
  if (scam.risk !== "low") {
    out.push({
      alert_id: alert.id,
      notification_type: "scam_warning",
      title: `Scam risk: ${alert.concert_name}`,
      message: scam.reasons.join(" "),
    });
  }

  if (
    alert.notify_price_drop &&
    snapshot.price <= alert.target_price
  ) {
    out.push({
      alert_id: alert.id,
      notification_type: "price_drop",
      title: `Price drop — ${alert.concert_name}`,
      message: `${snapshot.platform}: ${formatMoney(snapshot.price)} is at or below your target of ${formatMoney(alert.target_price)}.`,
    });
  }

  if (
    alert.notify_resale_below_face &&
    snapshot.is_resale &&
    alert.face_value > 0 &&
    snapshot.price < alert.face_value
  ) {
    out.push({
      alert_id: alert.id,
      notification_type: "resale_deal",
      title: `Resale under face value — ${alert.concert_name}`,
      message: `Resale on ${snapshot.platform} at ${formatMoney(snapshot.price)} (face value ${formatMoney(alert.face_value)}).`,
    });
  }

  if (
    alert.notify_nearby_seats &&
    snapshot.seat_section &&
    /floor|pit|front|lower|100|200/i.test(snapshot.seat_section)
  ) {
    out.push({
      alert_id: alert.id,
      notification_type: "nearby_seats",
      title: `Seats opened up — ${alert.concert_name}`,
      message: `New listing in ${snapshot.seat_section} on ${snapshot.platform} for ${formatMoney(snapshot.price)}.`,
    });
  }

  if (
    alert.notify_last_minute &&
    daysUntilEvent !== null &&
    daysUntilEvent <= 7 &&
    daysUntilEvent >= 0
  ) {
    out.push({
      alert_id: alert.id,
      notification_type: "last_minute",
      title: `Last-minute deal — ${alert.concert_name}`,
      message: `Show in ${daysUntilEvent} day(s): ${formatMoney(snapshot.price)} on ${snapshot.platform}.`,
    });
  }

  if (snapshot.price <= alert.target_price * 1.05 && alert.face_value > 0) {
    out.push({
      alert_id: alert.id,
      notification_type: "best_time_to_buy",
      title: `Best time to buy? — ${alert.concert_name}`,
      message:
        "Price is near your target — check the price history chart before you buy.",
    });
  }

  return out;
}

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const event = new Date(dateStr + "T12:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((event.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export const PLATFORMS = [
  "Any platform",
  "Ticketmaster",
  "StubHub",
  "SeatGeek",
  "Vivid Seats",
  "AXS",
  "Venue box office",
] as const;
