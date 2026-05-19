"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatMoney, getTotalCost } from "@/lib/concertMetrics";
import { cn } from "@/lib/cn";
import {
  buildTourMemoryStats,
  formatYearStat,
  memoryFromRow,
} from "@/lib/tourMemoryStats";
import type { Concert, ConcertMemory } from "@/lib/types";
import {
  Camera,
  Heart,
  MapPin,
  Music,
  Save,
  Users,
} from "lucide-react";

type Props = {
  concerts: Concert[];
};

function linesToList(text: string) {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function listToLines(arr: string[]) {
  return arr.join("\n");
}

export function TourMemoryApp({ concerts }: Props) {
  const supabase = createClient();
  const [memories, setMemories] = useState<Record<string, ConcertMemory>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [draft, setDraft] = useState({
    photo_urls: "",
    video_urls: "",
    setlist: "",
    favorite_songs: "",
    friends_attended: "",
    merch_bought: "",
    memory_notes: "",
  });

  const year = new Date().getFullYear();
  const stats = buildTourMemoryStats(concerts, year);

  const loadMemories = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("concert_memories").select("*");
    const map: Record<string, ConcertMemory> = {};
    (data ?? []).forEach((row) => {
      const m = memoryFromRow(row as Record<string, unknown>);
      map[m.concert_id] = m;
    });
    setMemories(map);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadMemories();
  }, [loadMemories]);

  const openEditor = (concert: Concert) => {
    setExpandedId(concert.id);
    const m = memories[concert.id];
    setDraft({
      photo_urls: listToLines(m?.photo_urls ?? []),
      video_urls: listToLines(m?.video_urls ?? []),
      setlist: m?.setlist ?? "",
      favorite_songs: listToLines(m?.favorite_songs ?? []),
      friends_attended: listToLines(m?.friends_attended ?? []),
      merch_bought: m?.merch_bought ?? "",
      memory_notes: m?.memory_notes ?? "",
    });
  };

  const saveMemory = async (concertId: string) => {
    setSaving(true);
    setMessage(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      concert_id: concertId,
      photo_urls: linesToList(draft.photo_urls),
      video_urls: linesToList(draft.video_urls),
      setlist: draft.setlist.trim() || null,
      favorite_songs: linesToList(draft.favorite_songs),
      friends_attended: linesToList(draft.friends_attended),
      merch_bought: draft.merch_bought.trim() || null,
      memory_notes: draft.memory_notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const existing = memories[concertId];
    const { error } = existing
      ? await supabase
          .from("concert_memories")
          .update(payload)
          .eq("id", existing.id)
      : await supabase.from("concert_memories").insert(payload);

    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Memory saved!");
    loadMemories();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="rounded-2xl border border-secondary/25 bg-linear-to-r from-secondary/10 via-base-100 to-primary/10 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/20 text-secondary">
            <Heart className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-xl font-bold">Tour memory timeline</h2>
            <p className="text-sm text-base-content/70 max-w-2xl">
              Your personal archive — concerts, spending, photos, setlists,
              friends, and merch in one timeline.
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div className="alert alert-success animate-in fade-in">
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatBox
          label="This year"
          value={formatYearStat(stats.spentThisYear, year)}
          highlight
        />
        <StatBox
          label="Most seen artist"
          value={
            stats.mostSeenArtist
              ? `${stats.mostSeenArtist.name} (${stats.mostSeenArtist.count} shows)`
              : "—"
          }
        />
        <StatBox
          label="Average ticket price"
          value={formatMoney(stats.avgTicketPrice)}
        />
        <StatBox
          label="Cities visited"
          value={
            stats.citiesVisited.length > 0
              ? stats.citiesVisited.join(" · ")
              : "—"
          }
          small
        />
      </div>

      {concerts.length === 0 ? (
        <div className="card bg-base-100 rounded-2xl p-10 text-center">
          <p className="opacity-70">
            Add concerts first, then come back to build your tour memories.
          </p>
        </div>
      ) : (
        <ol className="relative border-s-2 border-primary/30 ms-4 space-y-8">
          {concerts.map((concert, index) => {
            const memory = memories[concert.id];
            const total = getTotalCost(concert);
            const date = new Date(
              concert.concert_date + "T12:00:00"
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            const isOpen = expandedId === concert.id;

            return (
              <li key={concert.id} className="ms-6 animate-in fade-in slide-in-from-left-2 duration-500" style={{ animationDelay: `${index * 60}ms` }}>
                <span className="absolute flex items-center justify-center w-4 h-4 rounded-full bg-primary -start-[9px] ring-4 ring-base-200" />
                <article className="card rounded-2xl border border-primary/15 bg-base-100 concert-card-glow overflow-hidden">
                  <div className="h-1 bg-linear-to-r from-primary via-secondary to-accent" />
                  <div className="card-body gap-4">
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <time className="text-xs font-medium text-primary">
                          {date}
                        </time>
                        <h3 className="text-lg font-bold">{concert.concert_name}</h3>
                        <p className="text-secondary font-medium">{concert.artist}</p>
                        <p className="text-sm flex items-center gap-1 mt-1 opacity-70">
                          <MapPin className="h-3.5 w-3.5" />
                          {concert.venue}, {concert.city}, {concert.state}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {formatMoney(total)}
                        </p>
                        <p className="text-xs opacity-60">total spent</p>
                        <div className="badge badge-primary mt-1">
                          Fun {concert.fun_rating}/10
                        </div>
                      </div>
                    </div>

                    {memory && !isOpen && (
                      <div className="flex flex-wrap gap-2 text-xs">
                        {memory.photo_urls.length > 0 && (
                          <span className="badge badge-outline gap-1">
                            <Camera className="h-3 w-3" />
                            {memory.photo_urls.length} photos
                          </span>
                        )}
                        {memory.friends_attended.length > 0 && (
                          <span className="badge badge-outline gap-1">
                            <Users className="h-3 w-3" />
                            {memory.friends_attended.join(", ")}
                          </span>
                        )}
                        {memory.favorite_songs.length > 0 && (
                          <span className="badge badge-outline gap-1">
                            <Music className="h-3 w-3" />
                            {memory.favorite_songs.length} favorite songs
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      className="btn btn-sm btn-outline btn-primary"
                      onClick={() =>
                        isOpen ? setExpandedId(null) : openEditor(concert)
                      }
                    >
                      {isOpen ? "Close" : memory ? "Edit memory" : "Add memory"}
                    </button>

                    {isOpen && (
                      <div className="space-y-3 pt-2 border-t border-base-300 animate-in fade-in">
                        <label className="form-control">
                          <span className="label-text">Photo URLs (one per line)</span>
                          <textarea
                            className="textarea textarea-bordered"
                            rows={2}
                            value={draft.photo_urls}
                            onChange={(e) =>
                              setDraft({ ...draft, photo_urls: e.target.value })
                            }
                            placeholder="https://..."
                          />
                        </label>
                        <label className="form-control">
                          <span className="label-text">Video URLs (one per line)</span>
                          <textarea
                            className="textarea textarea-bordered"
                            rows={2}
                            value={draft.video_urls}
                            onChange={(e) =>
                              setDraft({ ...draft, video_urls: e.target.value })
                            }
                          />
                        </label>
                        <label className="form-control">
                          <span className="label-text">Setlist</span>
                          <textarea
                            className="textarea textarea-bordered"
                            rows={4}
                            value={draft.setlist}
                            onChange={(e) =>
                              setDraft({ ...draft, setlist: e.target.value })
                            }
                            placeholder="One song per line"
                          />
                        </label>
                        <label className="form-control">
                          <span className="label-text">Favorite songs performed</span>
                          <textarea
                            className="textarea textarea-bordered"
                            rows={2}
                            value={draft.favorite_songs}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                favorite_songs: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label className="form-control">
                          <span className="label-text">Friends who attended</span>
                          <textarea
                            className="textarea textarea-bordered"
                            rows={2}
                            value={draft.friends_attended}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                friends_attended: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label className="form-control">
                          <span className="label-text">Merch bought</span>
                          <input
                            className="input input-bordered"
                            value={draft.merch_bought}
                            onChange={(e) =>
                              setDraft({ ...draft, merch_bought: e.target.value })
                            }
                          />
                        </label>
                        <label className="form-control">
                          <span className="label-text">Memory notes</span>
                          <textarea
                            className="textarea textarea-bordered"
                            rows={2}
                            value={draft.memory_notes}
                            onChange={(e) =>
                              setDraft({ ...draft, memory_notes: e.target.value })
                            }
                          />
                        </label>
                        <button
                          type="button"
                          className="btn btn-primary gap-2"
                          disabled={saving}
                          onClick={() => saveMemory(concert.id)}
                        >
                          {saving ? (
                            <span className="loading loading-spinner loading-sm" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save memory
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  highlight,
  small,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 bg-linear-to-br transition-all hover:-translate-y-0.5 hover:shadow-md",
        highlight
          ? "border-primary/30 from-primary/15 to-secondary/5"
          : "border-base-300 from-base-100 to-base-200/50"
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide opacity-60">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-bold",
          small ? "text-sm" : "text-lg",
          highlight && "text-primary"
        )}
      >
        {value}
      </p>
    </div>
  );
}
