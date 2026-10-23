import type { Metadata } from "next";
import { TgChrome } from "@/components/tg/TgChrome";
import { TgProvider } from "@/components/tg/TgProvider";

export const metadata: Metadata = {
  title: "Techno Market · Telegram",
  description: "Mini App Techno Market",
};

export default function TgLayout({ children }: { children: React.ReactNode }) {
  return (
    <TgProvider>
      <TgChrome>{children}</TgChrome>
    </TgProvider>
  );
}
