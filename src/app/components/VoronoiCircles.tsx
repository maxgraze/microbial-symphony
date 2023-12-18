"use client";
import React, { use, useContext, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { fills } from "../lib/styles/fills";
import { voronoiTreemap } from "d3-voronoi-treemap";
import { PlayerContext } from "../page";
import * as Tone from "tone";

interface VoronoiProps {
  data: any[];
  height: number;
  width: number;
  circlePolygon: any;
  key: number;
}
const Voronoi: React.FC<VoronoiProps> = ({ data, key, circlePolygon }) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };

  const { players, setPlayers } = useContext(PlayerContext);
  const [organisms, setOrganisms] = useState([]);

  const playingSynths = useRef([]);

  const stopAllSynths = () => {
    playingSynths.current.forEach((player) => {
      player.stopNoteSequence();
    });
    playingSynths.current.length = 0;
  };
  // const stopAllSynths = () => {
  //   playingSynths.current.forEach((player) => {
  //     player.stopNoteSequence();
  //   });
  //   playingSynths.current.length = 0;
  // };
  const onStartClick = (d) => {
    if (typeof window !== "undefined") {
      console.log(d);
      Tone.start();
      // Tone.Transport.start();
      if (organisms.length === 0) {
        const newOrganisms = d.data.children
          .filter((child) => child.type !== "other")
          .map((child) => child.type.replace(/ /g, "_"));

        setOrganisms(newOrganisms);
        let organismSynths = newOrganisms.map((organism) => {
          return players[organism.replace(/ /g, "_")];
        });
        organismSynths.forEach((synth) => {
          playingSynths.current.push(synth);
          synth.playNoteSequence();
        });
        console.log(organismSynths);
      } else {
        setOrganisms([]);
        stopAllSynths();
      }
    }
  };

  useEffect(() => {
    if (ref.current) {
      // Clear the SVG in case this effect runs multiple times
      d3.select(ref.current).selectAll("*").remove();
      const svg = d3.select(ref.current);
      const { width, height } = svg.node().getBoundingClientRect();
      // console.log(data);
      const voronoi = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
          .attr("href", fills[key])
          .attr("width", imageSize)
          .attr("height", imageSize);
      }

      const voronoiCircles = voronoiTreemap().clip(circlePolygon);

      // const voronoiTreemap = d3.voronoiTreemap().prng(seed).clip(circlePolygon);

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
        .attr("d", (d) => "M" + d.polygon.join("L") + "Z")
        .attr("fill", "ivory");

      const nodes = voronoi
        .selectAll(".foreground-path")
        .data(allNodes)
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
        .on("mouseover", (event, d) => onStartClick(d)) // nodes
        .on("mouseleave", (event, d) => stopAllSynths(d)) // nodes
        //   .on("click", (event, d) => {
        //     return setPlayers(
        //       d.data.children
        //         .filter((child) => child.type !== "other")
        //         .map((child) => child.type.replace(/ /g, "_"))
        //     );
        //   })
        // .on("mouseover", (event, d) => {
        //   // const title = key.charAt(0).toUpperCase() + key.slice(1);
        //   const el = event.currentTarget,
        //     elParent = el.parentNode;
        //   update &&
        //     update({
        //       x: event.x / 2 + 10,
        //       y: event.y / 2 - 100,
        //       data: {
        //         id: d.properties && d.properties.NAME,
        //         text: xFormat(d.data.impressions),
        //         parentId: title,
        //       },
        //     });
        //   d3.select(el)
        //     .attr("class", "selected")
        //     .raise()
        //     .style("stroke-width", 2)
        //     .style("opacity", 0.75);
        //   d3.select(elParent);
        //   d3.selectAll(".unselected").attr("fill", "#ccc");
        // })
        // .on("mouseleave", (event) => {
        //   update && update();
        //   const el = event.currentTarget;
        //   d3.select(el)
        //     .style("stroke", "#FFF")
        //     .attr("class", "unselected")
        //     .style("stroke-width", 0.5)
        //     .style("opacity", 1);
        //   d3.selectAll(".unselected").attr("fill", selectedFill);
        // })
        .transition()
        .duration(1000);
      //   });
    }
  }, [data]);

  return <svg ref={ref} />;
};

export default Voronoi;
