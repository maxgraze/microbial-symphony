"use client";
import React, { memo, useContext, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { fills } from "../lib/styles/fills";
import { voronoiTreemap } from "d3-voronoi-treemap";
import { PlayerContext } from "../lib/PlayerContext";
import { Player, NoisePlayer } from "../lib/Classes";
import * as Tone from "tone";
import { motion } from "framer-motion";
import { IPlayable } from "../lib/types";
interface VoronoiProps {
  data: any;
  circlePolygon: any;
  legend?: boolean;
  isPlaying: boolean;
  wh: [string, string];
  key?: string;
  isMobile: boolean;
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
  isMobile,
}) => {
  const [activeNode, setActiveNode] = useState<VoronoiNode | null>(null);
  const ref = useRef<SVGSVGElement | null>(null);
  const { state, dispatch } = useContext(PlayerContext); // Access state and dispatch from context
  const { players } = state;

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
    // if (!playersLoaded || typeof window === "undefined") {
    if (!state.isPlaying || !playersLoaded || typeof window === "undefined") {
      return;
    }
    if (!d.data || !Array.isArray(d.data.children)) {
      console.error("Node data is missing or children are not iterable", d);
      return;
    }

    // Only start Tone.js if not already started
    if (Tone.context.state !== "running") {
      try {
        await Tone.start();
      } catch (error) {
        console.error("Error starting Tone.js", error);
        alert("Please ensure your device is not in silent mode to play audio.");

        return;
      }
    }

    const startTime = Tone.now() + 0.1;

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
      player.play(startTime);
    });
  };
  const handleNodeClick = (
    event: React.MouseEvent<HTMLElement>,
    d: VoronoiNode
  ) => {
    if (isMobile) {
      if (activeNode && activeNode.id === d.id) {
        setActiveNode(null);
      } else {
        setActiveNode(d);
      }
    }
  };

  useEffect(() => {
    stopAllSynths(); // Stop all synths when active node changes
    if (activeNode && state.isPlaying) {
      onStartClick(activeNode); // Start synths only if there is an active node
    }
  }, [activeNode]);

  // Create VoronoiCreate Voronoi
  function determineFill(d: { data: { type: string }; depth: number }) {
    if (d.data.type && d.depth > 0) {
      return d.data.type == "other"
        ? "#b9b9b9"
        : "url(#" + d.data.type.replace(/\s+/g, "_") + ")";
    } else if (d.data.type && d.data.type == "other") {
      return "grey";
    } else {
      return "yellow";
    }
  }
  useEffect(() => {
    if (players && Object.keys(players).length > 0 && ref.current) {
      renderVoronoiDiagram(ref.current, data, players, isPlaying);
    }
  }, [players, data, isPlaying, setActiveNode]);

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
        .map((d, i) => Object.assign({}, d, { id: d.data.ferment }));

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
        .attr("id", (d) => `node-${d.data.ferment}`)
        .attr("stroke", (d) => "ivory")
        .style("fill-opacity", (d) => (d.depth === 1 ? 1 : 0))
        .attr("fill", (d) => determineFill(d))
        .attr("stroke-width", (d) => 5 - d.depth * 2);

      nodes
        .on("mouseover", (event, d) => {
          if (isPlaying) {
            onStartClick(d);
          }
        })
        .on("mouseleave", () => stopAllSynths())
        .on("click", handleNodeClick)
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
        whileTap={
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
        ref={ref}
      />
    </>
  );
};

export default memo(Voronoi);
