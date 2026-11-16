import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/_components/AppShell";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EventChat } from "./EventChat";
import { rsvpEvent, withdrawRsvp } from "../create/actions";

export const instant = false;

export default async function MeetupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;

  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div style={{ maxWidth: 500, margin: "4rem auto", padding: "2rem", textAlign: "center", background: "#fff", borderRadius: 12, border: "1px solid var(--border-subtle, #e5e7eb)" }}>
        <h2 style={{ margin: "0 0 0.5rem 0" }}>Sign in to view meetup details</h2>
        <p style={{ color: "#64748b", margin: "0 0 1.25rem 0", fontSize: "0.88rem" }}>
          Campus events, attendees, and venue details are protected by student authentication.
        </p>
        <Link href="/login" className="primary-button" style={{ display: "inline-block", padding: "0.55rem 1.25rem", fontSize: "0.88rem" }}>
          Sign In
        </Link>
      </div>
    );
  }

  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("display_name, username, avatar_url, institutes(short_name)")
    .eq("id", user.id)
    .maybeSingle();

  // Fetch event
  const { data: evt } = await supabase
    .from("events")
    .select(`
      id,
      title,
      description,
      category,
      starts_at,
      ends_at,
      approximate_venue,
      capacity,
      host_id,
      profiles!events_host_id_fkey (
        id,
        display_name,
        username,
        avatar_url,
        institutes (
          name,
          short_name
        )
      ),
      event_attendees (
        user_id,
        status
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (!evt) {
    return (
      <AppShell
        activeTab="events"
        user={
          currentUserProfile
            ? {
                name: currentUserProfile.display_name,
                username: currentUserProfile.username,
                avatar_url: currentUserProfile.avatar_url,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                campus: (currentUserProfile.institutes as any)?.short_name,
              }
            : undefined
        }
      >
        <div style={{ maxWidth: 560, margin: "3rem auto", padding: "2rem", textAlign: "center", background: "#fff", borderRadius: 12, border: "1px solid var(--border-subtle, #e5e7eb)" }}>
          <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem" }}>Meetup Not Found</h2>
          <p style={{ color: "#64748b", margin: "0 0 1.25rem 0", fontSize: "0.88rem" }}>
            This campus meetup is no longer available or has concluded.
          </p>
          <Link href="/meetups" className="primary-button" style={{ display: "inline-block", padding: "0.55rem 1.25rem", fontSize: "0.85rem" }}>
            Explore Other Meetups
          </Link>
        </div>
      </AppShell>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const host = evt.profiles as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attendees = (evt.event_attendees as any[]) || [];
  const attendeeCount = attendees.filter((a) => a.status === "confirmed").length;
  const isAttending = attendees.some((a) => a.user_id === user.id && a.status === "confirmed");
  const isHost = evt.host_id === user.id;
  const isFull = evt.capacity ? attendeeCount >= evt.capacity : false;

  const startDate = new Date(evt.starts_at);
  const endDate = new Date(evt.ends_at);

  return (
    <AppShell
      activeTab="events"
      user={
        currentUserProfile
          ? {
              name: currentUserProfile.display_name,
              username: currentUserProfile.username,
              avatar_url: currentUserProfile.avatar_url,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              campus: (currentUserProfile.institutes as any)?.short_name,
            }
          : undefined
      }
    >
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "1.25rem 1rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <Link
            href="/meetups"
            style={{ fontSize: "0.85rem", color: "#64748b", textDecoration: "none" }}
          >
            ← Back to all meetups
          </Link>
        </div>

        {/* Event Header Card */}
        <section
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid var(--border-subtle, #e5e7eb)",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--primary-color, #9f4b59)",
                    background: "#fdf2f2",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "6px",
                  }}
                >
                  {evt.category}
                </span>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  • {attendeeCount} {evt.capacity ? `/ ${evt.capacity}` : ""} attending
                </span>
              </div>
              <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "1.45rem", fontWeight: 700, color: "#111827" }}>
                {evt.title}
              </h1>
            </div>

            <div>
              {isHost ? (
                <span style={{ fontSize: "0.82rem", background: "#f1f5f9", padding: "0.4rem 0.8rem", borderRadius: "6px", color: "#475569", fontWeight: 500 }}>
                  You are the Host
                </span>
              ) : isAttending ? (
                <form action={withdrawRsvp}>
                  <input type="hidden" name="eventId" value={evt.id} />
                  <button
                    type="submit"
                    className="secondary-button"
                    style={{ padding: "0.55rem 1.1rem", fontSize: "0.85rem", color: "#dc2626" }}
                  >
                    Cancel RSVP ✕
                  </button>
                </form>
              ) : isFull ? (
                <button
                  type="button"
                  disabled
                  className="secondary-button"
                  style={{ padding: "0.55rem 1.1rem", fontSize: "0.85rem", opacity: 0.6 }}
                >
                  Capacity Full
                </button>
              ) : (
                <form action={rsvpEvent}>
                  <input type="hidden" name="eventId" value={evt.id} />
                  <button
                    type="submit"
                    className="primary-button"
                    style={{ padding: "0.55rem 1.35rem", fontSize: "0.88rem" }}
                  >
                    RSVP to Attend
                  </button>
                </form>
              )}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1rem",
              margin: "1.25rem 0",
              padding: "1rem",
              background: "#fafafa",
              borderRadius: "10px",
              border: "1px solid #f1f5f9",
            }}
          >
            <div>
              <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" }}>
                WHEN
              </span>
              <span style={{ fontSize: "0.88rem", fontWeight: 500, color: "#1f2937" }}>
                {startDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                <br />
                {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <div>
              <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" }}>
                VENUE
              </span>
              <span style={{ fontSize: "0.88rem", fontWeight: 500, color: "#1f2937" }}>
                {evt.approximate_venue || "Campus Venue"}
              </span>
            </div>

            <div>
              <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" }}>
                ORGANIZER
              </span>
              <Link
                href={`/profile?user=${host?.id}`}
                style={{ fontSize: "0.88rem", fontWeight: 500, color: "var(--primary-color, #9f4b59)", textDecoration: "none" }}
              >
                {host?.display_name || "Campus Host"} ({host?.institutes?.short_name || "Campus"})
              </Link>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: "0.92rem", lineHeight: 1.55, color: "#374151", whiteSpace: "pre-line" }}>
            {evt.description}
          </p>
        </section>

        {/* Event Discussion / Chat */}
        <section
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid var(--border-subtle, #e5e7eb)",
            padding: "1.5rem",
          }}
        >
          <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: 600, color: "#111827" }}>
            Meetup Discussion
          </h2>
          <p style={{ margin: "0 0 1rem 0", fontSize: "0.84rem", color: "#64748b" }}>
            Chat with the host and other attendees.
          </p>
          <EventChat eventId={evt.id} />
        </section>
      </div>
    </AppShell>
  );
}
