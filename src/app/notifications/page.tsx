import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/_components/AppShell";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { markNotificationsRead } from "./actions";

export const instant = false;

function getNotificationIcon(type: string): string {
  switch (type) {
    case "like":
      return "❤️";
    case "comment":
    case "reply":
      return "💬";
    case "follow":
      return "👤";
    case "message":
      return "✉️";
    case "event":
      return "📅";
    default:
      return "🔔";
  }
}

export default async function NotificationsPage() {
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

  // Fetch notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, title, body, href, read_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const unreadCount = (notifications || []).filter((n) => !n.read_at).length;

  return (
    <AppShell
      activeTab="notifications"
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
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "1.25rem 1rem" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h1 style={{ margin: "0 0 0.25rem 0", fontSize: "1.35rem", fontWeight: 700, color: "#111827" }}>
              Notifications
            </h1>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "#64748b" }}>
              Activity from your followers, campus posts, and conversations.
            </p>
          </div>

          {unreadCount > 0 && (
            <form action={markNotificationsRead}>
              <button
                type="submit"
                className="secondary-button"
                style={{ padding: "0.45rem 0.95rem", fontSize: "0.82rem" }}
              >
                Mark all as read
              </button>
            </form>
          )}
        </div>

        {/* Notifications List */}
        {!notifications || notifications.length === 0 ? (
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
              You&apos;re all caught up
            </p>
            <p style={{ margin: 0, fontSize: "0.88rem" }}>
              New likes, comments, followers, and messages will appear here.
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              border: "1px solid var(--border-subtle, #e5e7eb)",
              overflow: "hidden",
            }}
          >
            {notifications.map((n) => {
              const isUnread = !n.read_at;
              const timeStr = new Date(n.created_at).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <Link
                  key={n.id}
                  href={n.href || "/"}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.9rem",
                    padding: "0.95rem 1.25rem",
                    borderBottom: "1px solid #f1f5f9",
                    textDecoration: "none",
                    color: "inherit",
                    background: isUnread ? "#fdf8f8" : "#ffffff",
                    transition: "background 0.15s ease",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.2rem",
                      padding: "0.3rem",
                      borderRadius: "50%",
                      background: isUnread ? "#fee2e2" : "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "36px",
                      height: "36px",
                      flexShrink: 0,
                    }}
                  >
                    {getNotificationIcon(n.type)}
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.2rem" }}>
                      <span style={{ fontWeight: isUnread ? 700 : 600, fontSize: "0.9rem", color: "#111827" }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#9ca3af", flexShrink: 0, marginLeft: "0.5rem" }}>
                        {timeStr}
                      </span>
                    </div>
                    {n.body && (
                      <p style={{ margin: 0, fontSize: "0.84rem", color: isUnread ? "#1f2937" : "#64748b", lineHeight: 1.4 }}>
                        {n.body}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
