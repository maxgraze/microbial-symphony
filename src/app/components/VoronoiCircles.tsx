"use client";
import React, { memo, useContext, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { fills } from "../lib/styles/fills";
import { voronoiTreemap } from "d3-voronoi-treemap";
import { PlayerContext } from "../lib/utils";
import { Player, NoisePlayer } from "../lib/Classes";
import * as Tone from "tone";
import { motion } from "framer-motion";
import { IPlayable } from "../lib/types";

interface VoronoiProps {
  data: any;
  circlePolygon: any;
  legend?: boolean;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  wh: [string, string];
  key?: string;
}

interface VoronoiNode extends d3.HierarchyNode<any> {
  polygon: [number, number][];
}

const Voronoi: React.FC<VoronoiProps> = ({
  data,
  circlePolygon,
  legend,
  isPlaying,
  wh,
}) => {
  const ref = useRef<SVGSVGElement | null>(null);

  const players = useContext(PlayerContext)?.players;

  const playingSynths = useRef<any[]>([]);

  const [playersLoaded, setPlayersLoaded] = useState(false);
  useEffect(() => {
    if (players && Object.keys(players).length > 0) {
      setPlayersLoaded(true);
    }
  }, [players]);

  const stopAllSynths = () => {
    playingSynths.current.forEach((player) => {
      if (player instanceof Player) {
        player.stop();
      } else if (player instanceof NoisePlayer) {
        player.stop();
      }
    });
    playingSynths.current.length = 0;
  };

  const onStartClick = async (d: VoronoiNode) => {
    if (!playersLoaded || typeof window === "undefined") {
      return;
    }

    // Only start Tone.js if not already started
    if (Tone.context.state !== "running") {
      try {
        await Tone.start();
        console.log("Audio is ready");
      } catch (error) {
        console.error("Error starting Tone.js", error);
        return;
      }
    }

    const newOrganisms = d.data.children.map((child: { type: string }) =>
      child.type.replace(/ /g, "_")
    );

    // Stop any currently playing synths before starting new ones
    stopAllSynths();

    let organismSynths = newOrganisms
      .map((organism: string | number) => {
        const player = players[organism];
        if (!player) {
          console.warn(`Player for organism ${organism} not found.`);
          return null;
        }
        return player;
      })
      .filter(Boolean);

    organismSynths.forEach((player: IPlayable) => {
      playingSynths.current.push(player);
      player.play();
    });
  };

  // Create VoronoiCreate Voronoi

  useEffect(() => {
    if (players && Object.keys(players).length > 0 && ref.current) {
      renderVoronoiDiagram(ref.current, data, players, isPlaying);
    }
  }, [players, data, isPlaying]);

  // Cleanup synths on component unmount
  useEffect(() => {
    return () => {
      stopAllSynths();
    };
  }, []);

  const renderVoronoiDiagram = (
    container: SVGSVGElement,
    data: any,
    players: any,
    isPlaying: boolean
  ) => {
    if (players && Object.keys(players).length > 0 && ref.current) {
      d3.select(ref.current).selectAll("*").remove();
      const svg = d3.select(ref.current);
      let margin = legend ? 4 : 10;

      const voronoi = svg
        .append("g")
        .attr("transform", `translate(${margin},${margin})`);

      const imageSize = 50;
      const defs = svg.append("defs");

      svg.attr("height", wh[0]).attr("width", wh[1]); // Adjust margin or add padding as needed

      for (let key in fills) {
        let id = key.replace(/\s+/g, "_");
        defs
          .append("pattern")
          .attr("id", id)
          .attr("patternUnits", "userSpaceOnUse")
          .attr("width", imageSize)
          .attr("height", imageSize)
          .append("image")
          .attr("href", fills[key as keyof typeof fills])
          .attr("width", imageSize)
          .attr("height", imageSize);
      }

      const voronoiCircles = voronoiTreemap().clip(circlePolygon);

      const hierarchy = d3.hierarchy(data).sum((d) => d.percentage);
      voronoiCircles(hierarchy);

      let allNodes = hierarchy
        .descendants()
        .sort((a, b) => b.depth - a.depth)
        .map((d, i) => Object.assign({}, d, { id: i }));

      voronoi
        .selectAll(".background-path")
        .data(allNodes)
        .join("path")
        .attr("class", "background-path")
        .attr("d", (d: any) => "M" + (d as VoronoiNode).polygon.join("L") + "Z")
        .attr("fill", "ivory");

      const nodes = voronoi
        .selectAll(".foreground-path")
        .data(allNodes as unknown as VoronoiNode[])
        .join("path")
        .attr("class", "foreground-path")
        .attr("d", (d) => "M" + d.polygon.join("L") + "Z")
        .attr("stroke", (d) => "ivory")
        .style("fill-opacity", (d) => (d.depth === 1 ? 1 : 0))
        .attr("fill", (d) => {
          if (d.data.type && d.depth > 0) {
            return d.data.type == "other"
              ? "#b9b9b9"
              : "url(#" + d.data.type.replace(/\s+/g, "_") + ")";
          } else if (d.data.type && d.data.type == "other") return "grey";
          else return "yellow";
        })
        .attr("stroke-width", (d) => 5 - d.depth * 2);

      nodes
        .on("mouseover", (event, d) => {
          if (isPlaying) {
            onStartClick(d);
          }
        })
        .on("mouseleave", () => stopAllSynths())
        .transition()
        .duration(1000);

      !legend &&
        voronoi
          .selectAll(".node-text")
          .data(allNodes as unknown as VoronoiNode[])
          .join("text")
          .attr("class", "node-text")
          .attr("text-anchor", "middle")
          .attr("font-family", "Figtree");
    }
  };

  return (
    <>
      <motion.svg
        initial={{
          scale: 1, // Initial scale
          rotate: 0, // Initial rotation
          filter: "drop-shadow(0 0 5px rgba(255, 255, 224, 0.5))", // Initial drop-shadow
        }}
        whileHover={
          legend
            ? {
                scale: [1, 1.2, 1],
                transition: {
                  type: "tween",
                  repeat: Infinity,
                  ease: "linear",

                  repeatType: "reverse",
                  duration: 1.5,
                  stiffnes: 100,
                  dampness: 40,
                },
              }
            : {
                scale: [1, 1.2, 1],
                rotate: [45, 90, 135, 180, 225, 270, 315, 360],
                filter: [
                  "drop-shadow(0 0 5px rgba(255, 255, 224, 0.5))",
                  "drop-shadow(0 0 20px rgba(255, 255, 224, 0.7))",
                  "drop-shadow(0 0 5px rgba(255, 255, 224, 1)",
                ],
                transition: {
                  type: "tween",
                  repeat: Infinity,
                  ease: "linear",

                  repeatType: "reverse",
                  duration: 2,
                  stiffnes: 100,
                  dampness: 40,
                },
              }
        }
        // onHoverStart={() => {
        //   if (!isAnimationPlaying) {
        //     setIsAnimationPlaying(true);
        //     controls.start({
        //       scale: 1.2,
        //       transition: {
        //         type: "tween",
        //         repeat: Infinity,
        //         repeatType: "reverse",
        //         duration: 0.5,
        //       },
        //     });
        //   }
        // }}
        // onHoverEnd={() => {
        //   // setIsAnimationPlaying(false);
        //   controls.start({
        //     // y: 0,
        //     // rotate: 0,
        //     scale: 1,
        //     opacity: 1,
        //     filter: "revert",
        //   });
        // }}
        ref={ref}
      />
    </>
  );
};

export default memo(Voronoi);
