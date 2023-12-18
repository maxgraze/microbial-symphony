import React, { useContext, useEffect, useRef } from "react";
("use client");
import * as d3 from "d3";
import { fills } from "../lib/styles/fills";
import { voronoiTreemap } from "d3-voronoi-treemap";
import { circularPolygon } from "../lib/utils";
import { PlayerContext } from "../page";
interface VoronoiProps {
  data: any[];
  height: number;
  width: number;
}
const Voronoi: React.FC<VoronoiProps> = ({ data, height, width }) => {
  const ref = useRef<SVGSVGElement | null>(null);

  const { player, setPlayer } = React.useContext(PlayerContext);

  useEffect(() => {
    if (ref.current) {
      // Clear the SVG in case this effect runs multiple times
      d3.select(ref.current).selectAll("*").remove();
      const margin = { top: 10, right: 10, bottom: 10, left: 10 };
      const spacing = 10;

      const columns = 12;
      const cellWidth = (width - margin.left - margin.right) / columns;
      const cellHeight = (height - margin.top - margin.bottom) / columns;

      const svg = d3.select(ref.current).style("background-color", "#f9ece3");

      data.forEach((data, i) => {
        const col = i % columns;
        const row = Math.floor(i / columns);

        const group = svg
          .append("g")
          .attr(
            "transform",
            `translate(${col * (cellWidth + spacing)},${
              row * (cellHeight + spacing)
            })`
          );

        const voronoi = group
          .append("g")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          );
        const labels = group
          .append("g")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          );
        const legend = group
          .append("g")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          );

        const imageSize = 50;
        const defs = group.append("defs");

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

        let circlePolygon = circularPolygon(
          [cellWidth / 2, cellHeight / 2],
          Math.min(cellWidth, cellHeight) / 2,
          100
        );

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

        voronoi
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
          .attr("class", "path")
          .attr("stroke-width", (d) => 5 - d.depth * 2)
          .attr("pointer-events", (d) => (d.depth === 1 ? "all" : "none"))
          // .on("mousemove", mouseOver)
          // .on("mouseout", mouseOut)
          .transition()
          .duration(1000);
      });
    }
  }, [data, height, width]);

  return <svg ref={ref} width={width} height={height} />;
};

export default Voronoi;
