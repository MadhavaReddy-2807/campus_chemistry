import Link from "next/link";
import { DataState, ModuleHeader } from "@/app/_components/DataState";
import { markNotificationsRead } from "@/app/notifications/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const instant = false;

export default async function NotificationsPage() {
  if (!hasSupabaseEnv()) return <main className="module-page"><ModuleHeader eyebrow="NOTIFICATIONS" title="Useful signals, without the noise." body="You control which activity reaches you. Private messages and dating preferences are never used for analytics." /><DataState title="Notifications are waiting for your campus connection." body="Connect Supabase to load your private notification stream." action={{ label: "Open settings", href: "/settings" }} /></main>;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="module-page"><DataState title="Sign in to see notifications." body="Notifications are private to your account." action={{ label: "Sign in", href: "/login" }} /></main>;
  const { data } = await supabase.from("notifications").select("id, type, title, body, read_at, created_at, href").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
  return <main className="module-page"><div className="module-topbar"><Link href="/" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><Link href="/settings" className="text-button">Settings <span>→</span></Link></div><ModuleHeader eyebrow="NOTIFICATIONS" title="Useful signals, without the noise." body="You control which activity reaches you. Private messages and dating preferences are never used for analytics." />{data?.length ? <><form action={markNotificationsRead}><button className="secondary-button" type="submit">Mark all as read</button></form><div className="settings-list notification-list">{data.map((notification) => <Link href={notification.href ?? "/"} key={notification.id} className={notification.read_at ? "notification-read" : "notification-unread"}><span><strong>{notification.title}</strong><small>{notification.body ?? ""}</small></span><time dateTime={notification.created_at}>{new Date(notification.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</time></Link>)}</div></> : <DataState title="You’re all caught up." body="New matches, messages, event updates, and safety notices will appear here." action={{ label: "Open home", href: "/" }} />}</main>;
}
