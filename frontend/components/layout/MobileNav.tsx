"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, Calendar, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  const items = [
    { label: "Home", href: "/", icon: Home },
    { label: "Meetings", href: "/#upcoming", icon: Clock },
    { label: "Calendar", href: "/#calendar", icon: Calendar },
    { label: "Settings", href: "/#settings", icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-dark-surface/95 backdrop-blur-md border-t border-dark-border z-40 px-6 flex items-center justify-around">
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href === "/" && pathname === "/");
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors",
              isActive
                ? "text-brand-hover"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
