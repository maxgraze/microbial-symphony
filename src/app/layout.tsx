"use client";

import "./globals.css";
import React from "react";
import Head from "next/head";
import { PlayerProvider } from "./lib/PlayerContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://use.typekit.net/zur3vau.css" />
      </Head>
      <PlayerProvider>
        <body>{children}</body>
      </PlayerProvider>
    </html>
  );
}
