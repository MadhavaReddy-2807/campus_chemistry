"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type MobileNavProps = {
  activeTab?: string;
};

export function MobileNav({ activeTab }: MobileNavProps) {
  const pathname = usePathname();

  const isCurrent = (label: string, href: string) => {
    if (activeTab) return activeTab.toLowerCase() === label.toLowerCase();
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const items = [
    { label: "Home", href: "/", icon: "⌂" },
    { label: "Discover", href: "/discover", icon: "✦" },
    { label: "Messages", href: "/messages", icon: "◌", badge: 2 },
    { label: "Meetups", href: "/meetups", icon: "◷" },
  ];

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {items.map((item) => {
        const active = isCurrent(item.label, item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={active ? "is-active" : ""}
            aria-current={active ? "page" : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            <small>{item.label === "Messages" ? "Inbox" : item.label}</small>
            {item.badge && <i aria-label={`${item.badge} unread messages`}>{item.badge}</i>}
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
    </nav>
  );
}
