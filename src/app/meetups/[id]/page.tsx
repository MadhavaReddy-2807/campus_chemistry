import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { DataState } from "@/app/_components/DataState";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rsvpEvent, withdrawRsvp } from "../create/actions";

export const instant = false;
type Event = { id: string; title: string; description: string; category: string; starts_at: string; ends_at: string; approximate_venue: string | null; capacity: number | null };

async function getEvent(id: string) {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("events").select("id, title, description, category, starts_at, ends_at, approximate_venue, capacity").eq("id", id).maybeSingle();
  if (!data) return null;
  const { data: attendee } = await supabase.from("event_attendees").select("status").eq("event_id", id).eq("user_id", user.id).maybeSingle();
  return { event: data as Event, attendeeStatus: attendee?.status ?? null };
}

export default async function MeetupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  if (!hasSupabaseEnv()) return <main className="module-page"><DataState title="Meetup details need Supabase." body="Connect the application backend to load event details and protected RSVP actions." action={{ label: "Back to meetups", href: "/meetups" }} /></main>;
  const result = await getEvent(id);
  if (!result) notFound();
  const { event, attendeeStatus } = result;
  return <main className="module-page"><div className="module-topbar"><Link href="/" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><Link href="/meetups" className="text-button">Back to meetups <span>←</span></Link></div><article className="event-detail-card"><span className="eyebrow">{event.category}</span><h1>{event.title}</h1><p className="event-detail-copy">{event.description}</p><div className="event-detail-facts"><span><strong>WHEN</strong>{new Date(event.starts_at).toLocaleString()} – {new Date(event.ends_at).toLocaleTimeString()}</span><span><strong>WHERE</strong>{event.approximate_venue ?? "Shared with confirmed attendees"}</span><span><strong>CAPACITY</strong>{event.capacity ? `${event.capacity} people` : "Open capacity"}</span></div>{attendeeStatus === "going" || attendeeStatus === "waitlisted" ? <form action={withdrawRsvp}><input type="hidden" name="eventId" value={event.id} /><button className="secondary-button">{attendeeStatus === "waitlisted" ? "Leave waitlist" : "Withdraw RSVP"}</button></form> : <form action={rsvpEvent}><input type="hidden" name="eventId" value={event.id} /><button className="primary-button">RSVP for this meetup <span>→</span></button></form>}<p className="form-footnote">RSVP status and private attendee details are enforced server-side.</p></article></main>;
}
