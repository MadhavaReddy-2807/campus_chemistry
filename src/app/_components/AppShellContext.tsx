"use client";

import React, { createContext, useContext, useState } from "react";
import type { UserSummary } from "./AppSidebar";

export type AppShellContextType = {
  inShell: boolean;
  user: UserSummary | null;
  setUser: React.Dispatch<React.SetStateAction<UserSummary | null>>;
  headerTitle: string | null;
  setHeaderTitle: (title: string | null) => void;
  activeTab: string | null;
  setActiveTab: (tab: string | null) => void;
};

export const AppShellContext = createContext<AppShellContextType>({
  inShell: false,
  user: null,
  setUser: () => {},
  headerTitle: null,
  setHeaderTitle: () => {},
  activeTab: null,
  setActiveTab: () => {},
});

export function useAppShell() {
  return useContext(AppShellContext);
}

export function AppShellProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: UserSummary | null;
}) {
  const [user, setUser] = useState<UserSummary | null>(initialUser);
  const [headerTitle, setHeaderTitle] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);

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
      {children}
    </AppShellContext.Provider>
  );
}
