import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Megadungeon",
  description: "Self-hosted VTT — maps, tokens, walls, fog.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
