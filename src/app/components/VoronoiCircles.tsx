"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { fills } from "../lib/styles/fills";
import { voronoiTreemap } from "d3-voronoi-treemap";
import { PlayerContext } from "../lib/utils";
import * as Tone from "tone";

interface VoronoiProps {
  data: any;
  circlePolygon: any;
  legend?: boolean;
}

interface VoronoiNode extends d3.HierarchyNode<any> {
  polygon: [number, number][];
}

type child = { type: string };
const Voronoi: React.FC<VoronoiProps> = ({ data, circlePolygon, legend }) => {
  const ref = useRef<SVGSVGElement | null>(null);

  const players = useContext(PlayerContext)?.players;
  const setPlayers = useContext(PlayerContext)?.setPlayers;

  const [organisms, setOrganisms] = useState([]);

  const playingSynths = useRef<any[]>([]);

  const [playersLoaded, setPlayersLoaded] = useState(false); // New state for checking if players is loaded

  useEffect(() => {
    if (players && Object.keys(players).length > 0) {
      setPlayersLoaded(true); // Set playersLoaded to true when players is populated
    }
  }, [players]); // This effect runs every time `players` changes

  const stopAllSynths = (d: VoronoiNode) => {
    playingSynths.current.forEach((player) => {
      player.stopNoteSequence();
    });
    playingSynths.current.length = 0;
  };

  const onStartClick = (d: VoronoiNode) => {
    if (!playersLoaded) {
      return;
    }
    if (typeof window !== "undefined") {
      Tone.start();
      if (organisms.length === 0) {
        const newOrganisms = d.data.children
          .filter((child: child) => child.type !== "other")
          .map((child: child) => child.type.replace(/ /g, "_"));

        setOrganisms(newOrganisms);
        let organismSynths = newOrganisms
          .map((organism: string) => {
            const player = players[organism.replace(/ /g, "_")];
            if (!player) {
              console.warn(`Player for organism ${organism} not found.`);
              return null;
            }
            return player;
          })
          .filter(Boolean);

        organismSynths.forEach((synth: { playNoteSequence: () => void }) => {
          playingSynths.current.push(synth);
          synth.playNoteSequence();
        });
      } else {
        setOrganisms([]);
        stopAllSynths(d);
      }
    }
  };

  useEffect(() => {
    if (players && Object.keys(players).length > 0 && ref.current) {
      d3.select(ref.current).selectAll("*").remove();
      const svg = d3.select(ref.current);
      let margin = legend ? 35 : 10;

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
        .on("mouseover", (event, d) => onStartClick(d))
        .on("mouseleave", (event, d) => stopAllSynths(d))
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
  }, [data, players]);

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
