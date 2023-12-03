"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Sonification from "./components/Sonification";
import VoronoiWrapper from "./components/VoronoiWrapper";
import { createContext, useState } from "react";

export const PlayerContext = createContext({});
export default function Home() {
  const [players, setPlayers] = useState({});
  const value = { players, setPlayers };
  return (
    <main>
      <div>
        <h1>The Microorganisms in your favorite foods</h1>
        <PlayerContext.Provider value={value}>
          <Sonification />
          <VoronoiWrapper />
        </PlayerContext.Provider>
      </div>
    </main>
  );
}
