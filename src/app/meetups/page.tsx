import Link from "next/link";
import { connection } from "next/server";
import { DataState, ModuleHeader } from "@/app/_components/DataState";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const instant = false;

type Event = { id: string; title: string; description: string; category: string; starts_at: string; approximate_venue: string | null; capacity: number | null };
async function getEvents(): Promise<Event[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("events").select("id, title, description, category, starts_at, approximate_venue, capacity").eq("status", "published").gte("starts_at", new Date().toISOString()).order("starts_at").limit(30);
  return data ?? [];
}

export default async function MeetupsPage() {
  await connection();
  const events = await getEvents();
  return <main className="module-page"><div className="module-topbar"><Link href="/" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><div><Link href="/meetups/create" className="primary-button">Create meetup <span>+</span></Link><Link href="/" className="text-button module-back">Back home <span>←</span></Link></div></div><ModuleHeader eyebrow="MEETUPS, SAFELY" title="Plans are better when they have a little shape." body="Discover campus events, see capacity clearly, and share only the location detail people are authorized to see." />{!hasSupabaseEnv() || events.length === 0 ? <DataState title="No published meetups yet." body="Connect Supabase and create the first campus event. Private venue details remain protected by server-side access checks." action={{ label: "Create an event", href: "/meetups/create" }} /> : <div className="event-module-grid">{events.map((event) => <article className="event-module-card" key={event.id}><span className="event-module-date">{new Date(event.starts_at).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}</span><span className="eyebrow">{event.category}</span><h2>{event.title}</h2><p>{event.description}</p><small>{event.approximate_venue ?? "Venue shared with attendees"} · {event.capacity ? `${event.capacity} spots` : "Open capacity"}</small><Link className="text-button" href={`/meetups/${event.id}`}>View details <span>→</span></Link></article>)}</div>}</main>;
}
