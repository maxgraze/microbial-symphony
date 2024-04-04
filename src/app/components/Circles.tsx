import React, { useContext, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { PlayerContext, IPlayable } from "../lib/utils";
import { Player, NoisePlayer } from "./Sonification";
import * as Tone from "tone";

interface CircleProps {
  data: any; // Assume this is an array of objects with x, y, radius, and type properties
  i?: number;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
}

const Circles: React.FC<CircleProps> = ({ data, i, isPlaying }) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const players = useContext(PlayerContext)?.players;
  const [playersLoaded, setPlayersLoaded] = useState(false);
  const playingSynths = useRef<any[]>([]);

  useEffect(() => {
    if (players && Object.keys(players).length > 0) {
      setPlayersLoaded(true);
    }
  }, [players]);

  const stopAllSynths = () => {
    playingSynths.current.forEach((player) => {
      if (player instanceof Player || player instanceof NoisePlayer) {
        player.stop();
      }
    });
    playingSynths.current = [];
  };

  const onStartClick = async (organism: string) => {
    if (!playersLoaded || typeof window === "undefined") {
      return;
    }

    if (Tone.context.state !== "running") {
      try {
        await Tone.start();
        console.log("Audio is ready");
      } catch (error) {
        console.error("Error starting Tone.js", error);
        return;
      }
    }

    stopAllSynths();

    const player = players[organism];
    if (player) {
      playingSynths.current.push(player);
      player.play();
    } else {
      console.warn(`Player for organism ${organism} not found.`);
    }
  };

  useEffect(() => {
    if (ref.current) {
      const svg = d3.select(ref.current);
      svg.selectAll("*").remove(); // Clear SVG
      const fixedY = 100; // Fixed y position for all circles
      const startX = 50; // Starting x position for the first circle
      const gap = 10; // Gap between circles

      svg
        .selectAll("circle")
        .data(data.children)
        .join("circle")
        .attr("cx", 25) // Calculate x based on index
        .attr("cy", 25)
        .attr("r", 15)
        .attr("fill", "black")
        .on("mouseover", (event, d) => {
          if (isPlaying) {
            console.log(d[0].type);
            onStartClick(d[0].type); // Assume each data point has a type property
          }
        })
        .on("mouseleave", stopAllSynths);
    }
  }, [data]);

  return <svg ref={ref} width="50" height="50" />;
};

export default Circles;
