"use client";

import React, { useContext, useEffect } from "react";
import { AppShellContext } from "./AppShellContext";
import type { UserSummary } from "./AppSidebar";

type AppShellProps = {
  children: React.ReactNode;
  user?: UserSummary | null;
  activeTab?: string;
  headerTitle?: string;
};

export function AppShell({ children, user, activeTab, headerTitle }: AppShellProps) {
  const ctx = useContext(AppShellContext);

  useEffect(() => {
    if (headerTitle && ctx?.setHeaderTitle) {
      ctx.setHeaderTitle(headerTitle);
    }
    if (activeTab && ctx?.setActiveTab) {
      ctx.setActiveTab(activeTab);
    }
    if (user && ctx?.setUser && !ctx.user) {
      ctx.setUser(user);
    }
  }, [headerTitle, activeTab, user, ctx]);

  // If already inside the persistent root shell, DO NOT create another shell
  if (ctx?.inShell) {
    return <>{children}</>;
  }

  // Fallback if rendered outside persistent shell
  return <div className="content-container">{children}</div>;
}
