"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Flame, Plus, MessageSquare, User } from "lucide-react";

type MobileNavProps = {
  activeTab?: string;
  unreadMessages?: number;
};

export function MobileNav({ activeTab, unreadMessages }: MobileNavProps) {
  const pathname = usePathname();

  const isCurrent = (label: string, href: string) => {
    if (activeTab) return activeTab.toLowerCase() === label.toLowerCase();
    if (href === "/") return pathname === "/" || pathname === "/feed";
    if (href === "/discover") return pathname === "/discover" || pathname === "/matches";
    if (href === "/create") return pathname === "/create";
    if (href === "/messages") return pathname === "/messages" || pathname.startsWith("/messages/");
    if (href === "/profile") return pathname === "/profile" || pathname.startsWith("/profile/") || pathname.startsWith("/u/");
    return pathname.startsWith(href);
  };

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Date", href: "/discover", icon: Flame },
    { label: "Create", href: "/create", icon: Plus, isAction: true },
    { label: "Messages", href: "/messages", icon: MessageSquare, badge: unreadMessages },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {navItems.map((item) => {
        const active = isCurrent(item.label, item.href);
        const Icon = item.icon;

        if (item.isAction) {
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-label="Create post"
              className={active ? "is-active" : ""}
            >
              <span className="mobile-create" aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
                <Icon size={20} strokeWidth={2.5} />
              </span>
              <small>{item.label}</small>
            </Link>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            className={active ? "is-active" : ""}
            aria-current={active ? "page" : undefined}
          >
            <span aria-hidden="true" style={{ display: "grid", placeItems: "center", position: "relative" }}>
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {Boolean(item.badge && item.badge > 0) && (
                <span
                  className="mobile-nav-badge"
                  aria-label={`${item.badge} unread`}
                >
                  {item.badge && item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </span>
            <small>{item.label}</small>
          </Link>
        );
      })}
    </nav>
  );
}
