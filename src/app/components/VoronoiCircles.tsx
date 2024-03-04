"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { fills } from "../lib/styles/fills";
import { voronoiTreemap } from "d3-voronoi-treemap";
import { PlayerContext, IPlayable } from "../lib/utils";
import { Player, NoisePlayer } from "./Sonification";
import * as Tone from "tone";

interface VoronoiProps {
  data: any;
  circlePolygon: any;
  legend?: boolean;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
}

interface VoronoiNode extends d3.HierarchyNode<any> {
  polygon: [number, number][];
}

const Voronoi: React.FC<VoronoiProps> = ({
  data,
  circlePolygon,
  legend,
  isPlaying,
}) => {
  const ref = useRef<SVGSVGElement | null>(null);

  const players = useContext(PlayerContext)?.players;

  const [organisms, setOrganisms] = useState([]);

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
    setOrganisms(newOrganisms);

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

  useEffect(() => {
    if (players && Object.keys(players).length > 0 && ref.current) {
      d3.select(ref.current).selectAll("*").remove();
      const svg = d3.select(ref.current);
      let margin = legend ? 4 : 10;

      const voronoi = svg
        .append("g")
        .attr(
          "transform",
          `translate(${legend ? margin : margin + 30},${margin})`
        );

      const imageSize = 50;
      const defs = svg.append("defs");

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
  }, [players, isPlaying]);

  return (
    <>
      <svg ref={ref} />
      {!legend && (
        <div
          style={{
            position: "absolute",
            top: "110px",
            width: "100%",
            textAlign: "center",
          }}
        >
          {data.ferment}
        </div>
      )}
    </>
  );
};

export default Voronoi;
