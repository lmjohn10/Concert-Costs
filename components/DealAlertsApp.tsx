"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CHART_COLORS } from "@/lib/chartColors";
import { formatMoney } from "@/lib/concertMetrics";
import { cn } from "@/lib/cn";
import {
  assessScamRisk,
  buildNotificationsFromCheck,
  daysUntil,
  PLATFORMS,
  predictBestTimeToBuy,
} from "@/lib/dealAlerts";
import type { DealAlert, DealNotification, PriceSnapshot } from "@/lib/types";
import {
  AlertTriangle,
  Bell,
  LineChart,
  Plus,
  ShieldAlert,
  TrendingDown,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function mapAlert(row: Record<string, unknown>): DealAlert {
  return {
    ...row,
    target_price: Number(row.target_price),
    face_value: Number(row.face_value),
  } as DealAlert;
}

function mapSnapshot(row: Record<string, unknown>): PriceSnapshot {
  return {
    ...row,
    price: Number(row.price),
    seller_rating:
      row.seller_rating !== null ? Number(row.seller_rating) : null,
  } as PriceSnapshot;
}

const NOTIF_LABELS: Record<DealNotification["notification_type"], string> = {
  price_drop: "Price drop",
  resale_deal: "Resale deal",
  nearby_seats: "Nearby seats",
  last_minute: "Last-minute",
  scam_warning: "Scam warning",
  best_time_to_buy: "Best time to buy",
};

export function DealAlertsApp() {
  const supabase = createClient();
  const [alerts, setAlerts] = useState<DealAlert[]>([]);
  const [snapshots, setSnapshots] = useState<PriceSnapshot[]>([]);
  const [notifications, setNotifications] = useState<DealNotification[]>([]);
  const [selectedAlertId, setSelectedAlertId] = useState<string | "">("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [newAlert, setNewAlert] = useState({
    concert_name: "",
    artist: "",
    venue: "",
    event_date: "",
    platform: "Ticketmaster",
    target_price: "75",
    face_value: "95",
    notify_price_drop: true,
    notify_resale_below_face: true,
    notify_nearby_seats: true,
    notify_last_minute: true,
  });

  const [newSnapshot, setNewSnapshot] = useState({
    platform: "StubHub",
    price: "",
    is_resale: false,
    seat_section: "",
    listing_url: "",
    seller_rating: "4.5",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const [a, s, n] = await Promise.all([
      supabase.from("deal_alerts").select("*").order("created_at", { ascending: false }),
      supabase.from("price_snapshots").select("*").order("recorded_at", { ascending: true }),
      supabase
        .from("deal_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    if (a.data) setAlerts(a.data.map(mapAlert));
    if (s.data) setSnapshots(s.data.map(mapSnapshot));
    if (n.data) setNotifications(n.data as DealNotification[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedAlert = alerts.find((a) => a.id === selectedAlertId);

  const chartData = useMemo(() => {
    const filtered = selectedAlertId
      ? snapshots.filter((s) => s.alert_id === selectedAlertId)
      : snapshots;
    return filtered.map((s) => ({
      date: new Date(s.recorded_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      price: s.price,
      platform: s.platform,
    }));
  }, [snapshots, selectedAlertId]);

  const bestTime = useMemo(() => {
    const filtered = selectedAlertId
      ? snapshots.filter((s) => s.alert_id === selectedAlertId)
      : snapshots;
    return predictBestTimeToBuy(filtered);
  }, [snapshots, selectedAlertId]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("deal_alerts").insert({
      user_id: user.id,
      concert_name: newAlert.concert_name.trim(),
      artist: newAlert.artist.trim(),
      venue: newAlert.venue.trim() || null,
      event_date: newAlert.event_date || null,
      platform: newAlert.platform,
      target_price: Number(newAlert.target_price) || 0,
      face_value: Number(newAlert.face_value) || 0,
      notify_price_drop: newAlert.notify_price_drop,
      notify_resale_below_face: newAlert.notify_resale_below_face,
      notify_nearby_seats: newAlert.notify_nearby_seats,
      notify_last_minute: newAlert.notify_last_minute,
    });

    if (error) {
      setMessage(error.message);
      return;
    }
    setNewAlert({
      concert_name: "",
      artist: "",
      venue: "",
      event_date: "",
      platform: "Ticketmaster",
      target_price: "75",
      face_value: "95",
      notify_price_drop: true,
      notify_resale_below_face: true,
      notify_nearby_seats: true,
      notify_last_minute: true,
    });
    setMessage("Alert created! Log prices to track deals.");
    load();
  };

  const handleLogPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlertId) {
      setMessage("Select an alert first, then log a price.");
      return;
    }
    const alert = alerts.find((a) => a.id === selectedAlertId);
    if (!alert) return;

    setMessage(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const price = Number(newSnapshot.price);
    if (!price) {
      setMessage("Enter a valid price.");
      return;
    }

    const snapshotRow = {
      user_id: user.id,
      alert_id: selectedAlertId,
      platform: newSnapshot.platform,
      price,
      is_resale: newSnapshot.is_resale,
      seat_section: newSnapshot.seat_section.trim() || null,
      listing_url: newSnapshot.listing_url.trim() || null,
      seller_rating: newSnapshot.seller_rating
        ? Number(newSnapshot.seller_rating)
        : null,
    };

    const { data: inserted, error } = await supabase
      .from("price_snapshots")
      .insert(snapshotRow)
      .select()
      .single();

    if (error || !inserted) {
      setMessage(error?.message ?? "Could not save price.");
      return;
    }

    const snapshot = mapSnapshot(inserted);
    const notifs = buildNotificationsFromCheck({
      alert,
      snapshot,
      daysUntilEvent: daysUntil(alert.event_date),
    });

    if (notifs.length > 0) {
      await supabase.from("deal_notifications").insert(
        notifs.map((n) => ({ ...n, user_id: user.id }))
      );
    }

    setNewSnapshot({
      platform: "StubHub",
      price: "",
      is_resale: false,
      seat_section: "",
      listing_url: "",
      seller_rating: "4.5",
    });
    setMessage(
      notifs.length > 0
        ? `Price logged — ${notifs.length} alert(s) triggered!`
        : "Price logged. No new triggers this time."
    );
    load();
  };

  const markRead = async (id: string) => {
    await supabase
      .from("deal_notifications")
      .update({ is_read: true })
      .eq("id", id);
    load();
  };

  const latestScam = selectedAlert && snapshots.length > 0
    ? assessScamRisk(
        snapshots.filter((s) => s.alert_id === selectedAlertId).slice(-1)[0] ??
          snapshots[snapshots.length - 1],
        selectedAlert.face_value
      )
    : null;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="rounded-2xl border border-primary/20 bg-linear-to-r from-primary/10 via-base-100 to-accent/10 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Bell className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-xl font-bold">Price drop & deal alerts</h2>
            <p className="text-sm text-base-content/70 max-w-2xl">
              Track prices across platforms (log what you see), get notified on
              drops, resale deals, nearby seats, and last-minute sales. Includes
              price history, buy-timing tips, and scam-risk checks.
            </p>
          </div>
          {unreadCount > 0 && (
            <span className="badge badge-primary badge-lg">
              {unreadCount} new
            </span>
          )}
        </div>
      </div>

      {message && (
        <div className="alert alert-info animate-in fade-in duration-300">
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <form
          onSubmit={handleCreateAlert}
          className="card rounded-2xl border border-primary/15 bg-base-100 concert-card-glow"
        >
          <div className="card-body gap-4">
            <h3 className="font-bold flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New watchlist alert
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                className="input input-bordered"
                placeholder="Concert name"
                required
                value={newAlert.concert_name}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, concert_name: e.target.value })
                }
              />
              <input
                className="input input-bordered"
                placeholder="Artist"
                required
                value={newAlert.artist}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, artist: e.target.value })
                }
              />
              <input
                className="input input-bordered"
                placeholder="Venue (optional)"
                value={newAlert.venue}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, venue: e.target.value })
                }
              />
              <input
                type="date"
                className="input input-bordered"
                value={newAlert.event_date}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, event_date: e.target.value })
                }
              />
              <select
                className="select select-bordered"
                value={newAlert.platform}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, platform: e.target.value })
                }
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                step={0.01}
                className="input input-bordered"
                placeholder="Target price $"
                value={newAlert.target_price}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, target_price: e.target.value })
                }
              />
              <input
                type="number"
                min={0}
                step={0.01}
                className="input input-bordered sm:col-span-2"
                placeholder="Face value $"
                value={newAlert.face_value}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, face_value: e.target.value })
                }
              />
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              {(
                [
                  ["notify_price_drop", "Price below target"],
                  ["notify_resale_below_face", "Resale under face"],
                  ["notify_nearby_seats", "Nearby seats"],
                  ["notify_last_minute", "Last-minute (7 days)"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="label cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    checked={newAlert[key]}
                    onChange={(e) =>
                      setNewAlert({ ...newAlert, [key]: e.target.checked })
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
            <button type="submit" className="btn btn-primary">
              Create alert
            </button>
          </div>
        </form>

        <form
          onSubmit={handleLogPrice}
          className="card rounded-2xl border border-secondary/15 bg-base-100 concert-card-glow"
        >
          <div className="card-body gap-4">
            <h3 className="font-bold flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Log a price check
            </h3>
            <label className="form-control">
              <span className="label-text">Watchlist alert</span>
              <select
                className="select select-bordered"
                value={selectedAlertId}
                onChange={(e) => setSelectedAlertId(e.target.value)}
                required
              >
                <option value="">Select alert…</option>
                {alerts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.concert_name} — target {formatMoney(a.target_price)}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                className="select select-bordered"
                value={newSnapshot.platform}
                onChange={(e) =>
                  setNewSnapshot({ ...newSnapshot, platform: e.target.value })
                }
              >
                {PLATFORMS.filter((p) => p !== "Any platform").map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                step={0.01}
                required
                className="input input-bordered"
                placeholder="Price $"
                value={newSnapshot.price}
                onChange={(e) =>
                  setNewSnapshot({ ...newSnapshot, price: e.target.value })
                }
              />
              <input
                className="input input-bordered col-span-2"
                placeholder="Seat section (e.g. Lower 120)"
                value={newSnapshot.seat_section}
                onChange={(e) =>
                  setNewSnapshot({
                    ...newSnapshot,
                    seat_section: e.target.value,
                  })
                }
              />
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                className="input input-bordered"
                placeholder="Seller rating"
                value={newSnapshot.seller_rating}
                onChange={(e) =>
                  setNewSnapshot({
                    ...newSnapshot,
                    seller_rating: e.target.value,
                  })
                }
              />
              <label className="label cursor-pointer gap-2 justify-start">
                <input
                  type="checkbox"
                  className="checkbox checkbox-secondary"
                  checked={newSnapshot.is_resale}
                  onChange={(e) =>
                    setNewSnapshot({
                      ...newSnapshot,
                      is_resale: e.target.checked,
                    })
                  }
                />
                Resale listing
              </label>
            </div>
            <button type="submit" className="btn btn-secondary">
              Log price & check alerts
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          className={cn(
            "rounded-2xl border p-4 lg:col-span-1",
            bestTime.recommendation === "buy_now" && "border-success/40 bg-success/10",
            bestTime.recommendation === "wait" && "border-warning/40 bg-warning/10",
            bestTime.recommendation === "neutral" && "border-base-300 bg-base-100"
          )}
        >
          <p className="text-sm font-semibold flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Best time to buy
          </p>
          <p className="mt-2 text-sm">{bestTime.summary}</p>
          <p className="text-xs mt-2 opacity-60 capitalize">
            Signal: {bestTime.recommendation.replace("_", " ")} ·{" "}
            {bestTime.confidence} confidence
          </p>
        </div>

        {latestScam && (
          <div
            className={cn(
              "rounded-2xl border p-4 lg:col-span-2",
              latestScam.risk === "high" && "border-error/50 bg-error/10",
              latestScam.risk === "medium" && "border-warning/40 bg-warning/10",
              latestScam.risk === "low" && "border-success/30 bg-success/5"
            )}
          >
            <p className="text-sm font-semibold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Scam-risk check (latest listing)
              <span className="badge badge-sm capitalize">{latestScam.risk}</span>
            </p>
            <ul className="mt-2 text-sm list-disc list-inside space-y-1">
              {latestScam.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="card rounded-2xl border border-base-300 bg-base-100 overflow-hidden concert-card-glow">
        <div className="h-1 chart-card-accent" />
        <div className="card-body">
          <h3 className="font-bold mb-4">Price history</h3>
          {chartData.length < 2 ? (
            <p className="text-sm opacity-70 py-8 text-center">
              Log at least 2 prices on an alert to see the history graph.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <RechartsLine data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => formatMoney(Number(v ?? 0))} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={CHART_COLORS[0]}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  animationDuration={800}
                />
              </RechartsLine>
            </ResponsiveContainer>
          )}
          {selectedAlert && (
            <p className="text-xs text-center mt-2 opacity-60">
              Target: {formatMoney(selectedAlert.target_price)} · Face:{" "}
              {formatMoney(selectedAlert.face_value)}
            </p>
          )}
        </div>
      </div>

      <div className="card rounded-2xl border border-base-300 bg-base-100">
        <div className="card-body">
          <h3 className="font-bold flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Notifications
          </h3>
          {notifications.length === 0 ? (
            <p className="text-sm opacity-70">
              No notifications yet. Create an alert and log prices to trigger
              deal alerts.
            </p>
          ) : (
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "rounded-xl border p-4 transition-colors",
                    n.is_read
                      ? "border-base-300/60 bg-base-200/30"
                      : "border-primary/30 bg-primary/5"
                  )}
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="badge badge-outline badge-sm">
                      {NOTIF_LABELS[n.notification_type]}
                    </span>
                    {!n.is_read && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => markRead(n.id)}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <p className="font-semibold mt-2">{n.title}</p>
                  <p className="text-sm opacity-80">{n.message}</p>
                  <p className="text-xs opacity-50 mt-2">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
