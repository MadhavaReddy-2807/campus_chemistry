"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type MobileNavProps = {
  activeTab?: string;
  unreadMessages?: number;
};

export function MobileNav({ activeTab, unreadMessages }: MobileNavProps) {
  const pathname = usePathname();

  const isCurrent = (label: string, href: string) => {
    if (activeTab) return activeTab.toLowerCase() === label.toLowerCase();
    if (href === "/") return pathname === "/" || pathname === "/feed";
    return pathname.startsWith(href);
  };

  const navItems = [
    { label: "Home", href: "/", icon: "⌂" },
    { label: "Explore", href: "/explore", icon: "⌕" },
    { label: "Messages", href: "/messages", icon: "✉", badge: unreadMessages },
    { label: "Profile", href: "/profile", icon: "👤" },
  ];

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {navItems.slice(0, 2).map((item) => {
        const active = isCurrent(item.label, item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={active ? "is-active" : ""}
            aria-current={active ? "page" : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            <small>{item.label}</small>
          </Link>
        );
      })}

      <Link
        href="/create"
        aria-label="Create a post"
        className={isCurrent("Create", "/create") ? "is-active" : ""}
      >
        <span className="mobile-create" aria-hidden="true">+</span>
        <small>Create</small>
      </Link>

      {navItems.slice(2).map((item) => {
        const active = isCurrent(item.label, item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={active ? "is-active" : ""}
            aria-current={active ? "page" : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            <small>{item.label}</small>
            {Boolean(item.badge) && <i aria-label={`${item.badge} unread`}>{item.badge}</i>}
          </Link>
        );
      })}
    </nav>
  );
}
