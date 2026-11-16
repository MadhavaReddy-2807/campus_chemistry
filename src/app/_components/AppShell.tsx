import Link from "next/link";
import { AppSidebar, type UserSummary } from "./AppSidebar";
import { MobileNav } from "./MobileNav";

type AppShellProps = {
  children: React.ReactNode;
  user?: UserSummary | null;
  activeTab?: string;
  headerTitle?: string;
};


export function AppShell({ children, user, activeTab, headerTitle }: AppShellProps) {
  return (
    <div className="app-shell">
      <AppSidebar user={user} />

      <div className="main-column">
        {/* Mobile topbar */}
        <header className="topbar">
          <Link href="/" className="mobile-brand" style={{ textDecoration: "none", color: "inherit" }}>
            <span className="brand-mark">cc</span>
            <div className="mobile-brand-meta">
              <h1 className="mobile-brand-title" style={{ margin: 0, fontSize: "inherit", fontWeight: "inherit" }}>campus chemistry</h1>
              {user?.campus_short && <span className="mobile-campus-pill">{user.campus_short}</span>}
            </div>
          </Link>

          <div className="topbar-title">
            {headerTitle ? (
              <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{headerTitle}</h1>
            ) : (
              <h2 className="brand-name" style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>campus chemistry</h2>
            )}
          </div>

          <div className="topbar-actions">
            <Link
              href="/notifications"
              className="round-action notification-action"
              aria-label="Notifications"
            >
              <span>🔔</span>
              {Boolean(user?.unread_notifications) && <i />}
            </Link>
            <Link href="/profile" className="round-action" aria-label="Profile">
              <span>👤</span>
            </Link>
          </div>
        </header>

        <main className="content-container">{children}</main>
      </div>

      <MobileNav activeTab={activeTab} unreadMessages={user?.unread_messages} />
    </div>
  );
}
