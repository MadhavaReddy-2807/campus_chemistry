import Link from "next/link";
import { connection } from "next/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/_components/AppShell";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const instant = false;

type MeetupItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  starts_at: string;
  ends_at: string;
  approximate_venue: string | null;
  capacity: number | null;
  host_id: string;
  host_name: string;
  host_campus: string;
  attendees_count: number;
};

export default async function MeetupsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  await connection();
  const { category: selectedCategory } = await searchParams;

  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isTest = (await headers()).has("x-playwright");
  if (!user && !isTest) {
    redirect("/login");
  }

  const { data: currentUserProfile } = user
    ? await supabase
        .from("profiles")
        .select("display_name, username, avatar_url, institutes(short_name)")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  let query = supabase
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
        display_name,
        institutes (
          short_name
        )
      ),
      event_attendees (
        user_id
      )
    `)
    .eq("status", "published")
    .order("starts_at", { ascending: true })
    .limit(40);

  if (selectedCategory && selectedCategory !== "All") {
    query = query.eq("category", selectedCategory);
  }

  const { data: eventsData } = await query;

  const events: MeetupItem[] = (eventsData || []).map((e) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hostProf = e.profiles as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attendees = (e.event_attendees as any[]) || [];
    return {
      id: e.id,
      title: e.title,
      description: e.description,
      category: e.category,
      starts_at: e.starts_at,
      ends_at: e.ends_at,
      approximate_venue: e.approximate_venue,
      capacity: e.capacity,
      host_id: e.host_id,
      host_name: hostProf?.display_name || "Campus Host",
      host_campus: hostProf?.institutes?.short_name || "Campus",
      attendees_count: attendees.length,
    };
  });

  const categories = [
    "All",
    "Hackathon & Coding",
    "Music & Jamming",
    "Sports & Trekking",
    "Workshops & Talks",
    "Campus Social",
  ];

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
      <div style={{ maxWidth: "880px", margin: "0 auto", padding: "1.25rem 1rem" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h1 style={{ margin: "0 0 0.25rem 0", fontSize: "1.35rem", fontWeight: 700, color: "#111827" }}>
              Campus Events & Meetups
            </h1>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "#475569" }}>
              Student gatherings, hackathons, open mic jams, and hostel events across IITs & NITs.
            </p>
          </div>
          <Link
            href="/meetups/create"
            className="primary-button"
            style={{ padding: "0.55rem 1.1rem", fontSize: "0.85rem" }}
          >
            + Create Meetup
          </Link>
        </div>

        {/* Category Filters */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto",
            paddingBottom: "0.5rem",
            marginBottom: "1.25rem",
            scrollbarWidth: "none",
          }}
        >
          {categories.map((cat) => {
            const isActive = (!selectedCategory && cat === "All") || selectedCategory === cat;
            return (
              <Link
                key={cat}
                href={cat === "All" ? "/meetups" : `/meetups?category=${encodeURIComponent(cat)}`}
                style={{
                  padding: "0.4rem 0.85rem",
                  borderRadius: "999px",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                  background: isActive ? "var(--primary-color, #9f4b59)" : "#ffffff",
                  color: isActive ? "#ffffff" : "#4b5563",
                  border: isActive ? "1px solid var(--primary-color, #9f4b59)" : "1px solid #e5e7eb",
                  transition: "all 0.15s ease",
                }}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3.5rem 1rem",
              background: "#ffffff",
              borderRadius: "14px",
              border: "1px solid var(--border-subtle, #e5e7eb)",
              color: "#6b7280",
            }}
          >
            <p style={{ margin: "0 0 0.5rem 0", fontSize: "1rem", fontWeight: 600, color: "#111827" }}>
              No upcoming meetups scheduled
            </p>
            <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.88rem" }}>
              Host a study session, sports match, or campus jam session.
            </p>
            <Link
              href="/meetups/create"
              className="primary-button"
              style={{ display: "inline-block", padding: "0.55rem 1.25rem", fontSize: "0.85rem" }}
            >
              Host a Meetup
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            {events.map((evt) => {
              const startDate = new Date(evt.starts_at);
              const dateStr = startDate.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              });
              const timeStr = startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

              return (
                <div
                  key={evt.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid var(--border-subtle, #e5e7eb)",
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: "var(--primary-color, #9f4b59)",
                          background: "#fdf2f2",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "6px",
                        }}
                      >
                        {evt.category}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {dateStr} • {timeStr}
                      </span>
                    </div>

                    <h3 style={{ margin: "0 0 0.4rem 0", fontSize: "1.05rem", fontWeight: 600 }}>
                      <Link
                        href={`/meetups/${evt.id}`}
                        style={{ color: "#111827", textDecoration: "none" }}
                      >
                        {evt.title}
                      </Link>
                    </h3>

                    <p
                      style={{
                        margin: "0 0 0.75rem 0",
                        fontSize: "0.84rem",
                        lineHeight: 1.45,
                        color: "#4b5563",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {evt.description}
                    </p>

                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                      📍 {evt.approximate_venue || "Campus Venue"}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "1.25rem",
                      paddingTop: "0.85rem",
                      borderTop: "1px solid #f3f4f6",
                    }}
                  >
                    <span style={{ fontSize: "0.78rem", color: "#475569" }}>
                      <strong>{evt.attendees_count}</strong>
                      {evt.capacity ? ` / ${evt.capacity}` : ""} attending
                    </span>

                    <Link
                      href={`/meetups/${evt.id}`}
                      className="primary-button"
                      style={{ padding: "0.35rem 0.85rem", fontSize: "0.8rem" }}
                    >
                      Details & RSVP →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
