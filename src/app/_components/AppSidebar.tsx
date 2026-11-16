"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  SquarePlus,
  MessageSquare,
  Users,
  Calendar,
  Bell,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { signOutAction } from "@/app/(auth)/auth-actions";

export type UserSummary = {
  id?: string;
  display_name?: string;
  name?: string;
  username?: string;
  institute_id?: string;
  campus_short?: string;
  campus?: string;
  avatar_url?: string | null;
  unread_notifications?: number;
  unread_messages?: number;
};

export function AppSidebar({ user }: { user?: UserSummary | null }) {
  const pathname = usePathname();

  const isCurrent = (href: string) => {
    if (href === "/") return pathname === "/" || pathname === "/feed";
    return pathname.startsWith(href);
  };

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "Create Post", href: "/create", icon: SquarePlus },
    { label: "Messages", href: "/messages", icon: MessageSquare, badge: user?.unread_messages },
    { label: "Communities", href: "/communities", icon: Users },
    { label: "Events", href: "/meetups", icon: Calendar },
    { label: "Notifications", href: "/notifications", icon: Bell, badge: user?.unread_notifications },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <Link href="/" className="brand-lockup" style={{ textDecoration: "none", color: "inherit", marginBottom: 28 }}>
        <div className="brand-mark" aria-hidden="true">
          cc
        </div>
        <div>
          <div className="brand-name">campus chemistry</div>
          <div className="brand-note">IIT &amp; NIT NETWORK</div>
        </div>
      </Link>

      <nav className="nav-list" aria-label="Desktop primary navigation">
        {navLinks.map((item) => {
          const active = isCurrent(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`nav-item ${active ? "is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className="nav-symbol" aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
                <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              </span>
              <span>{item.label}</span>
              {Boolean(item.badge) && <span className="nav-count">{item.badge}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-bottom" style={{ marginTop: "auto", paddingTop: 16 }}>
        {user ? (
          <div
            style={{
              padding: "12px",
              borderRadius: "12px",
              background: "#f4f0eb",
              border: "1px solid var(--line)",
            }}
          >
            <Link
              href="/profile"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--plum)",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  (user.display_name || user.name || "CC").slice(0, 2).toUpperCase()
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <strong style={{ display: "block", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.display_name || user.name || "Student"}
                </strong>
                <span style={{ fontSize: 11, color: "var(--muted)", display: "block" }}>
                  {user.campus_short || user.campus || "Campus Student"}
                </span>
              </div>
            </Link>
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Link href="/settings" style={{ fontSize: 11, color: "var(--muted)", textDecoration: "none" }}>
                Account
              </Link>
              <form action={signOutAction} style={{ margin: 0 }}>
                <button
                  type="submit"
                  style={{
                    background: "none",
                    border: 0,
                    padding: 0,
                    color: "var(--rose)",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <LogOut size={13} strokeWidth={2} />
                  <span>Sign out</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div style={{ padding: "12px", textAlign: "center" }}>
            <Link href="/login" className="primary-button" style={{ width: "100%", padding: "10px", display: "inline-block", textDecoration: "none" }}>
              Log in to CC
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
