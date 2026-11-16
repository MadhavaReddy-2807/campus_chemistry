"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, User } from "lucide-react";
import { AppSidebar, type UserSummary } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import { AppShellContext } from "./AppShellContext";

function getTitleFromPathname(pathname: string): string {
  if (pathname === "/" || pathname === "/feed") return "campus chemistry";
  if (pathname === "/explore") return "explore";
  if (pathname === "/create") return "create post";
  if (pathname === "/messages" || pathname.startsWith("/messages/")) return "messages";
  if (pathname === "/communities" || pathname.startsWith("/communities/")) return "communities";
  if (pathname === "/meetups" || pathname.startsWith("/meetups/")) return "campus events";
  if (pathname === "/notifications") return "notifications";
  if (pathname === "/profile" || pathname.startsWith("/profile/")) return "profile";
  if (pathname === "/edit-profile") return "edit profile";
  if (pathname === "/settings" || pathname.startsWith("/settings/")) return "settings";
  if (pathname === "/discover") return "discover";
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin";
  return "campus chemistry";
}

export function PersistentAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserSummary | null>(null);
  const [headerTitle, setHeaderTitle] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const isAuthRoute = useMemo(() => {
    return (
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/forgot-password" ||
      pathname === "/reset-password" ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/onboarding") ||
      pathname === "/suspended" ||
      pathname.startsWith("/admin")
    );
  }, [pathname]);

  // Fetch user summary once and keep it synced
  useEffect(() => {
    if (isAuthRoute) return;

    let mounted = true;
    async function loadUser() {
      try {
        const res = await fetch("/api/user-summary");
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data?.user) {
          setUser((prev) => ({ ...prev, ...data.user }));
        }
      } catch {
        // Silently handle offline/guest
      }
    }

    loadUser();

    // Re-check periodically when tab is active (every 60s)
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadUser();
      }
    }, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isAuthRoute]);

  // If this is an auth or onboarding route, don't wrap in persistent shell
  if (isAuthRoute) {
    return <>{children}</>;
  }

  const computedTitle = headerTitle || getTitleFromPathname(pathname);

  return (
    <AppShellContext.Provider
      value={{
        inShell: true,
        user,
        setUser,
        headerTitle,
        setHeaderTitle,
        activeTab,
        setActiveTab,
      }}
    >
      <div className="app-shell">
        <AppSidebar user={user} />

        <div className="main-column">
          {/* Mobile and desktop topbar */}
          <header className="topbar">
            {/* Mobile-only bar: ONLY "Campus Chemistry" */}
            <div className="mobile-only-brand">
              <span className="mobile-only-brand-title">Campus Chemistry</span>
            </div>

            {/* Desktop-only title */}
            <div className="desktop-topbar-left">
              <div className="topbar-title">
                <span style={{ fontSize: 20, fontWeight: 600, margin: 0, display: "block" }}>{computedTitle}</span>
              </div>
            </div>

            {/* Desktop-only action controls */}
            <div className="topbar-actions desktop-only">
              <Link
                href="/notifications"
                className="round-action notification-action"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {Boolean(user?.unread_notifications) && <i />}
              </Link>
              <Link href="/profile" className="round-action" aria-label="Profile">
                <User size={18} />
              </Link>
            </div>
          </header>

          <main className="content-container">{children}</main>
        </div>

        <MobileNav activeTab={activeTab || undefined} unreadMessages={user?.unread_messages} />
      </div>
    </AppShellContext.Provider>
  );
}
