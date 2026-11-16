import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/_components/AppShell";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateNotificationSettings } from "./actions";

export const instant = false;

export default async function NotificationSettingsPage() {
  await connection();
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("display_name, username, avatar_url, institutes(short_name)")
    .eq("id", user.id)
    .maybeSingle();

  const { data: settings } = await supabase
    .from("user_settings")
    .select("in_app_notifications, email_notifications, web_push_notifications, read_receipts, activity_status")
    .eq("user_id", user.id)
    .maybeSingle();

  const value = {
    inApp: settings?.in_app_notifications ?? true,
    email: settings?.email_notifications ?? false,
    push: settings?.web_push_notifications ?? false,
    receipts: settings?.read_receipts ?? true,
    activity: settings?.activity_status ?? false,
  };

  return (
    <AppShell
      activeTab="settings"
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
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1.5rem 1rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <Link href="/settings" style={{ fontSize: "0.85rem", color: "#64748b", textDecoration: "none" }}>
            ← Back to Settings
          </Link>
        </div>

        <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid var(--border-subtle, #e5e7eb)", padding: "1.75rem" }}>
          <h1 style={{ margin: "0 0 0.3rem 0", fontSize: "1.35rem", fontWeight: 700, color: "#111827" }}>
            Notification Preferences
          </h1>
          <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.88rem", color: "#64748b" }}>
            Choose what activity reaches you across campus feeds and direct messages.
          </p>

          <form action={updateNotificationSettings} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "0.5rem 0", borderBottom: "1px solid #f3f4f6" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>In-App Notifications</div>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Alerts for likes, comments, mentions, and new followers</div>
              </div>
              <input
                type="checkbox"
                name="inAppNotifications"
                defaultChecked={value.inApp}
                style={{ width: "18px", height: "18px", accentColor: "var(--primary-color, #9f4b59)" }}
              />
            </label>

            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "0.5rem 0", borderBottom: "1px solid #f3f4f6" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>Email Notifications</div>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Weekly campus digests and important security updates</div>
              </div>
              <input
                type="checkbox"
                name="emailNotifications"
                defaultChecked={value.email}
                style={{ width: "18px", height: "18px", accentColor: "var(--primary-color, #9f4b59)" }}
              />
            </label>

            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "0.5rem 0", borderBottom: "1px solid #f3f4f6" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>Web Push Notifications</div>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Instant notifications on this device for direct messages</div>
              </div>
              <input
                type="checkbox"
                name="webPushNotifications"
                defaultChecked={value.push}
                style={{ width: "18px", height: "18px", accentColor: "var(--primary-color, #9f4b59)" }}
              />
            </label>

            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "0.5rem 0" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>Read Receipts</div>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Let students know when you have read their direct messages</div>
              </div>
              <input
                type="checkbox"
                name="readReceipts"
                defaultChecked={value.receipts}
                style={{ width: "18px", height: "18px", accentColor: "var(--primary-color, #9f4b59)" }}
              />
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
              <Link
                href="/settings"
                className="secondary-button"
                style={{ padding: "0.6rem 1.25rem", fontSize: "0.88rem" }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="primary-button"
                style={{ padding: "0.6rem 1.5rem", fontSize: "0.88rem" }}
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
