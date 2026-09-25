"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";
import { ToastProvider } from "@/components/ui/Toast";

export interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  onSearch?: (query: string) => void;
}

export function AppShell({ children, title, onSearch }: AppShellProps) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col md:flex-row antialiased selection:bg-brand selection:text-white">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-16 md:pb-0">
          <TopBar title={title} onSearch={onSearch} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </ToastProvider>
  );
}
