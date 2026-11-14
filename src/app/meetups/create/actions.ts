"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const eventSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(4000),
  category: z.string().trim().min(1).max(60),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  venue: z.string().trim().max(160).optional(),
  capacity: z.coerce.number().int().min(1).max(10000).optional(),
});

export async function createEvent(formData: FormData) {
  const parsed = eventSchema.safeParse({ title: formData.get("title"), description: formData.get("description"), category: formData.get("category"), startsAt: formData.get("startsAt"), endsAt: formData.get("endsAt"), venue: formData.get("venue"), capacity: formData.get("capacity") || undefined });
  if (!parsed.success || Number.isNaN(Date.parse(parsed.data.startsAt)) || Number.isNaN(Date.parse(parsed.data.endsAt)) || Date.parse(parsed.data.endsAt) <= Date.parse(parsed.data.startsAt)) throw new Error("Check the event details and make sure the end is after the start.");
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before creating an event.");
  const { data: profile } = await supabase.from("profiles").select("institute_id").eq("id", user.id).maybeSingle();
  if (!profile?.institute_id) throw new Error("Complete institute onboarding before creating a campus meetup.");
  const { data, error } = await supabase.from("events").insert({ host_id: user.id, institute_id: profile.institute_id, title: parsed.data.title, description: parsed.data.description, category: parsed.data.category, starts_at: new Date(parsed.data.startsAt).toISOString(), ends_at: new Date(parsed.data.endsAt).toISOString(), approximate_venue: parsed.data.venue || null, capacity: parsed.data.capacity ?? null, visibility: "campus", status: "published" }).select("id").single();
  if (error || !data) throw new Error("We could not publish the meetup yet.");
  redirect(`/meetups/${data.id}`);
}

export async function rsvpEvent(formData: FormData) {
  const eventId = z.string().uuid().parse(formData.get("eventId"));
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before RSVPing.");
  const { error } = await supabase.rpc("rsvp_event", { requested_event_id: eventId });
  if (error) throw new Error("We could not save your RSVP yet.");
  redirect(`/meetups/${eventId}`);
}

export async function withdrawRsvp(formData: FormData) {
  const eventId = z.string().uuid().parse(formData.get("eventId"));
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before changing your RSVP.");
  const { error } = await supabase.rpc("withdraw_event_rsvp", { requested_event_id: eventId });
  if (error) throw new Error("We could not withdraw your RSVP yet.");
  redirect(`/meetups/${eventId}`);
}
