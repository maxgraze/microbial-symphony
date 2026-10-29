import "./globals.css";
import type { Metadata, Viewport } from "next";
import React from "react";
import { PlayerProvider } from "./lib/PlayerContext";

export const metadata: Metadata = {
  title: "Microbial Symphony",
  description:
    "Hear the combinations of microorganisms found in fermented foods.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/zur3vau.css" />
      </head>
      <body>
        <PlayerProvider>{children}</PlayerProvider>
      </body>
    </html>
  );
}
