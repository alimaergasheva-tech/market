"use client";

import { usePathname } from "next/navigation";
import { AccountSync } from "@/components/auth/AccountSync";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isTg = pathname.startsWith("/tg");

  if (isAdmin || isTg) {
    return <div className="min-h-full">{children}</div>;
  }

  return (
    <>
      <AccountSync />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
