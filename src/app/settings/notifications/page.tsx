import Link from "next/link";
import { connection } from "next/server";
import { DataState } from "@/app/_components/DataState";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateNotificationSettings } from "./actions";

export const instant = false;

export default async function NotificationSettingsPage() {
  await connection();
  if (!hasSupabaseEnv()) return <main className="module-page"><DataState title="Notification settings need Supabase." body="Connect the backend to save private notification preferences." action={{ label: "Back to settings", href: "/settings" }} /></main>;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="module-page"><DataState title="Sign in to manage notifications." body="Notification preferences are private to your account." action={{ label: "Sign in", href: "/login" }} /></main>;
  const { data: settings } = await supabase.from("user_settings").select("in_app_notifications, email_notifications, web_push_notifications, read_receipts, activity_status").eq("user_id", user.id).maybeSingle();
  const value = { inApp: settings?.in_app_notifications ?? true, email: settings?.email_notifications ?? false, push: settings?.web_push_notifications ?? false, receipts: settings?.read_receipts ?? true, activity: settings?.activity_status ?? false };
  return <main className="module-page"><div className="module-topbar"><Link href="/settings" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><Link href="/settings" className="text-button">Settings <span>←</span></Link></div><section className="module-header"><span className="eyebrow">YOUR CONTROL CENTRE</span><h1>Choose what reaches you.</h1><p>Notifications should be useful, not demanding. Message content is never used for analytics or copied into notification text.</p></section><form action={updateNotificationSettings} className="settings-list preference-form"><label><span><strong>In-app notifications</strong><small>Matches, messages, follows, event updates, and safety notices.</small></span><input type="checkbox" name="inAppNotifications" defaultChecked={value.inApp} /></label><label><span><strong>Email notifications</strong><small>Optional account and event updates by email.</small></span><input type="checkbox" name="emailNotifications" defaultChecked={value.email} /></label><label><span><strong>Web push notifications</strong><small>Only after you grant browser permission.</small></span><input type="checkbox" name="webPushNotifications" defaultChecked={value.push} /></label><label><span><strong>Read receipts</strong><small>Let conversation members know when you have read a message.</small></span><input type="checkbox" name="readReceipts" defaultChecked={value.receipts} /></label><label><span><strong>Activity status</strong><small>Allow opted-in discovery surfaces to show recent activity.</small></span><input type="checkbox" name="activityStatus" defaultChecked={value.activity} /></label><button className="primary-button" type="submit">Save preferences <span>→</span></button></form></main>;
}
